import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Fee from "@/models/Fee";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * GET /api/student/fee/approved-for-autofill
 * Checks if the student has an approved fee verification that can be used to auto-fill forms
 */
export async function GET(req) {
  await connectDB();

  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user data
    const user = await User.findById(decoded.id).select("registrationNumber");

    if (!user || !user.registrationNumber) {
      return NextResponse.json(
        { error: "User not found or missing registration number" },
        { status: 404 },
      );
    }

    // Check for approved fee verification in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const approvedFee = await Fee.findOne({
      registrationNumber: user.registrationNumber,
      status: "approved",
      submittedAt: { $gte: sixMonthsAgo },
    })
      .sort({ submittedAt: -1 })
      .lean();

    if (!approvedFee) {
      return NextResponse.json({
        hasApprovedFee: false,
        message: "No approved fee verification found",
      });
    }

    // Return relevant data for auto-fill
    return NextResponse.json({
      hasApprovedFee: true,
      feeData: {
        registrationNumber: approvedFee.registrationNumber,
        studentName: approvedFee.studentName,
        fatherName: approvedFee.fatherName,
        cnic: approvedFee.cnic,
        degreeProgram: approvedFee.degreeProgram,
        degreeId: approvedFee.degreeId,
        campus: approvedFee.campus,
        degreeMode: approvedFee.degreeMode,
        contactNumber: approvedFee.contactNumber,
        studentType: approvedFee.studentType,
        feePaidUpto: approvedFee.feeAmount,
        feePaymentDate: approvedFee.paymentDate,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }
    console.error("Error checking approved fee:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
