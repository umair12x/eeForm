import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(req) {
  await connectDB();
  
  try {
    const formData = await req.formData();
    
    // Get authenticated user
    const token = req.cookies.get("token")?.value;
    let currentUser = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        currentUser = await User.findById(decoded.id).select("registrationNumber name email");
      } catch (err) {
        // Token decode failed, continue without auth
      }
    }
    
    // Extract all fields
    const registrationNumber = formData.get("registrationNumber")?.toString() || "";
    const studentType = formData.get("studentType")?.toString() || "";
    const studentName = formData.get("studentName")?.toString() || "";
    const fatherName = formData.get("fatherName")?.toString() || "";
    const cnic = formData.get("cnic")?.toString() || "";
    const degreeProgram = formData.get("degreeProgram")?.toString() || "";
    const degreeId = formData.get("degreeId")?.toString() || "";
    const campus = formData.get("campus")?.toString() || "";
    const degreeMode = formData.get("degreeMode")?.toString() || "";
    const semesterSeason = formData.get("semesterSeason")?.toString() || "";
    const semesterYear = formData.get("semesterYear")?.toString() || "";
    const semesterPaid = formData.get("semesterPaid")?.toString() || "";
    const feeAmount = formData.get("feeAmount")?.toString() || "";
    const feeType = formData.get("feeType")?.toString() || "regular";
    const boarderStatus = formData.get("boarderStatus")?.toString() || "non-boarder";
    const isSelf = formData.get("isSelf")?.toString() || "yes";
    const bankName = formData.get("bankName")?.toString() || "";
    const bankBranch = formData.get("bankBranch")?.toString() || "";
    const voucherNumber = formData.get("voucherNumber")?.toString() || "";
    const paymentDate = formData.get("paymentDate")?.toString() || "";
    const contactNumber = formData.get("contactNumber")?.toString() || "";
    const remarks = formData.get("remarks")?.toString() || "";

    // Validate required fields
    const requiredFields = [
      "registrationNumber", "studentType", "studentName", "cnic",
      "degreeProgram", "campus", "degreeMode", "semesterSeason",
      "semesterYear", "semesterPaid", "feeAmount", "isSelf",
      "bankName", "bankBranch", "voucherNumber", "paymentDate"
    ];

    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check for existing pending requests
    const existingRequest = await Fee.findOne({
      registrationNumber,
      status: { $in: ["pending", "processing"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: "You already have a pending fee verification request",
          requestId: existingRequest.requestId,
        },
        { status: 400 }
      );
    }

    // Process voucher image - upload to Cloudinary
    const file = formData.get("voucherImage");
    let voucherImageUrl = "";
    let voucherPublicId = "";

    if (file && file.name) {
      try {
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          return NextResponse.json(
            { error: "Invalid file type. Please upload JPEG, PNG, or WebP image." },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "fee-vouchers",
              public_id: `fee_${registrationNumber}_${Date.now()}`,
              resource_type: "image",
              format: "jpg",
              transformation: [
                { width: 1000, crop: "limit" },
                { quality: "auto:good" }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        const result = await uploadPromise;
        voucherImageUrl = result.secure_url;
        voucherPublicId = result.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload voucher image" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Voucher image is required" },
        { status: 400 }
      );
    }

    // Generate unique request ID
    const requestId = `UAF-FV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Only allow if registrationNumber matches authenticated user (if auth data available)
    if (currentUser && currentUser.registrationNumber && registrationNumber !== currentUser.registrationNumber) {
      return NextResponse.json(
        { error: "Registration number does not match authenticated user" },
        { status: 403 }
      );
    }

    // Create verification record
    const verification = new Fee({
      registrationNumber,
      studentType,
      studentName,
      fatherName,
      cnic,
      degreeProgram,
      degreeId,
      campus,
      degreeMode,
      semesterSeason,
      semesterYear,
      semesterPaid: parseInt(semesterPaid),
      feeAmount: parseFloat(feeAmount),
      feeType,
      boarderStatus,
      isSelf,
      bankName,
      bankBranch,
      voucherNumber,
      paymentDate: new Date(paymentDate),
      contactNumber,
      remarks,
      voucherImageUrl,
      voucherPublicId,
      requestId,
      status: "pending",
      submittedAt: new Date(),
      submittedBy: currentUser?._id,
    });

    await verification.save();

    return NextResponse.json({
      success: true,
      message: "Fee verification request submitted successfully",
      requestId,
      status: verification.status,
      data: {
        id: verification._id.toString(),
        studentName: verification.studentName,
        registrationNumber: verification.registrationNumber,
        semesterPaid: verification.semesterPaid,
        feeAmount: verification.feeAmount,
      },
    });
    
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}