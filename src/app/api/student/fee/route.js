import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Fee from "@/models/Fee";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * GET /api/student/fee
 * Fetches the student's current/latest fee verification request
 * by registration number from authenticated session
 */
export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user data
    const user = await User.findById(decoded.id).select("registrationNumber");
    
    if (!user || !user.registrationNumber) {
      return NextResponse.json(
        { error: "User not found or missing registration number" },
        { status: 404 }
      );
    }

    // Fetch latest fee request for this student
    const feeRequest = await Fee.findOne({
      registrationNumber: user.registrationNumber,
    })
      .sort({ submittedAt: -1 })
      .lean();

    if (!feeRequest) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No fee request found"
      });
    }

    // Return fee request details
    return NextResponse.json({
      success: true,
      data: {
        id: feeRequest._id.toString(),
        requestId: feeRequest.requestId,
        status: feeRequest.status,
        statusMessage: feeRequest.statusMessage,
        studentType: feeRequest.studentType,
        studentName: feeRequest.studentName,
        registrationNumber: feeRequest.registrationNumber,
        semesterPaid: feeRequest.semesterPaid,
        semesterYear: feeRequest.semesterYear,
        semesterSeason: feeRequest.semesterSeason,
        feeAmount: feeRequest.feeAmount,
        bankName: feeRequest.bankName,
        voucherNumber: feeRequest.voucherNumber,
        submittedAt: feeRequest.submittedAt,
        processedAt: feeRequest.processedAt,
        degreeProgram: feeRequest.degreeProgram,
      }
    });

  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    if (err.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      );
    }
    console.error("Error fetching fee request:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
