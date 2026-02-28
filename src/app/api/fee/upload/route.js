import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getAuthenticatedUser(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const user = await User.findById(payload.id).lean();
    return user;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();

    // Check authentication
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    // Only students can upload
    if (user.role !== "student") {
      return NextResponse.json(
        { 
          success: false,
          message: "Only students can upload voucher images" 
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const feeId = formData.get("feeId")?.toString();

    if (!feeId) {
      return NextResponse.json(
        { 
          success: false,
          message: "Fee ID is required" 
        },
        { status: 400 }
      );
    }

    // Find the fee record
    const fee = await Fee.findOne({
      _id: feeId,
      student: user._id,
      status: "pending"
    });

    if (!fee) {
      return NextResponse.json(
        { 
          success: false,
          message: "Fee record not found or cannot be modified" 
        },
        { status: 404 }
      );
    }

    if (!file || !file.name) {
      return NextResponse.json(
        { 
          success: false,
          message: "No file uploaded" 
        },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid file type. Please upload JPEG, PNG, or WebP image" 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false,
          message: "File too large. Maximum size is 5MB" 
        },
        { status: 400 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "fee-vouchers",
          public_id: `fee_${fee.requestId}_${Date.now()}`,
          resource_type: "image",
          format: "jpg",
          transformation: [
            { width: 1000, crop: "limit" }, // Resize if too large
            { quality: "auto:good" } // Optimize quality
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
    console.log("✓ Upload successful:", result.public_id);

    // Update fee record with image URL
    fee.voucherImageUrl = result.secure_url;
    fee.voucherPublicId = result.public_id;
    await fee.save();

    return NextResponse.json({
      success: true,
      message: "Voucher uploaded successfully",
      data: {
        feeId: fee._id.toString(),
        requestId: fee.requestId,
        url: result.secure_url,
        publicId: result.public_id,
        status: fee.status
      }
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Upload failed",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove uploaded image (if needed)
export async function DELETE(req) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const feeId = searchParams.get("feeId");

    if (!feeId) {
      return NextResponse.json(
        { 
          success: false,
          message: "Fee ID is required" 
        },
        { status: 400 }
      );
    }

    const fee = await Fee.findOne({
      _id: feeId,
      student: user._id,
      status: "pending"
    });

    if (!fee || !fee.voucherPublicId) {
      return NextResponse.json(
        { 
          success: false,
          message: "No image to delete" 
        },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(fee.voucherPublicId);

    // Clear from database
    fee.voucherImageUrl = null;
    fee.voucherPublicId = null;
    await fee.save();

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Delete failed" 
      },
      { status: 500 }
    );
  }
}