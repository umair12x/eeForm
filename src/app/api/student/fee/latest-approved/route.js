import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectDB();
  try {
    // Extract and verify JWT token from cookie
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required", found: false },
        { status: 401 }
      );
    }

    let userId;
    let registrationNumber;

    try {
      const JWT_SECRET =
        process.env.JWT_SECRET || "your-secret-key-change-in-production";
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
      registrationNumber = decoded.registrationNumber;
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { error: "Invalid token", found: false },
        { status: 401 }
      );
    }

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Registration number not found in token", found: false },
        { status: 400 }
      );
    }

    // Find the latest approved fee for this student
    const approvedFee = await Fee.findOne(
      {
        registrationNumber: registrationNumber.toUpperCase(),
        status: "approved",
      },
      {
        requestId: 1,
        feeAmount: 1,
        paymentDate: 1,
        status: 1,
        bankName: 1,
        voucherNumber: 1,
        semesterPaid: 1,
        processedAt: 1,
        studentType: 1,
      }
    )
      .sort({ processedAt: -1 })
      .lean();

    if (!approvedFee) {
      return NextResponse.json(
        {
          success: true,
          found: false,
          data: null,
          message: "No approved fee requests found",
        },
        { status: 200 }
      );
    }

    // Set Cache-Control header for 5 minutes
    const response = NextResponse.json({
      success: true,
      found: true,
      data: {
        requestId: approvedFee.requestId,
        feeAmount: approvedFee.feeAmount,
        paymentDate: approvedFee.paymentDate,
        status: approvedFee.status,
        bankName: approvedFee.bankName,
        voucherNumber: approvedFee.voucherNumber,
        semesterPaid: approvedFee.semesterPaid,
        approvedAt: approvedFee.processedAt,
        studentType: approvedFee.studentType,
      },
    });

    response.headers.set("Cache-Control", "private, max-age=300");
    return response;
  } catch (error) {
    console.error("Error fetching latest approved fee:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch fee data",
        found: false,
      },
      { status: 500 }
    );
  }
}
