import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

// GET - Fetch all fee verification requests
export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { voucherNumber: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Fetch verifications sorted by submission date (newest first)
    const verifications = await Fee.find(query)
      .sort({ submittedAt: -1 })
      .select('-__v -updatedAt')
      .lean();
    
    return NextResponse.json(verifications);
    
  } catch (error) {
    console.error("Error fetching fee verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee verifications" },
      { status: 500 }
    );
  }
}

// PATCH - Update verification status
export async function PATCH(req) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { id, status, statusMessage } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    
    // Find and update the verification
    const verification = await Fee.findById(id);
    
    if (!verification) {
      return NextResponse.json(
        { error: "Fee verification not found" },
        { status: 404 }
      );
    }
    
    // Update verification
    verification.status = status;
    verification.statusMessage = statusMessage || '';
    verification.processedAt = new Date();
    
    await verification.save();
    
    return NextResponse.json({
      success: true,
      message: `Fee verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: {
        id: verification._id,
        status: verification.status,
        studentName: verification.studentName,
      }
    });
    
  } catch (error) {
    console.error("Error updating fee verification:", error);
    return NextResponse.json(
      { error: "Failed to update fee verification" },
      { status: 500 }
    );
  }
}

// PUT - Bulk update status (optional)
export async function PUT(req) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { ids, status, statusMessage } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: "IDs array and status are required" },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    
    // Bulk update
    const result = await Fee.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status,
          statusMessage: statusMessage || '',
          processedAt: new Date(),
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} fee verification(s) to ${status}`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("Error bulk updating fee verifications:", error);
    return NextResponse.json(
      { error: "Failed to update fee verifications" },
      { status: 500 }
    );
  }
}