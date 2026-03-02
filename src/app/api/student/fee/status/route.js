import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const feeRequest = await Fee.findOne({ requestId })
      .populate("processedBy", "name")
      .lean();

    if (!feeRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Get timeline events
    const timeline = [
      {
        status: "submitted",
        label: "Request Submitted",
        date: feeRequest.submittedAt,
        completed: true,
      },
      {
        status: "processing",
        label: "Under Review",
        date: feeRequest.processedAt,
        completed: ["processing", "approved", "rejected"].includes(feeRequest.status),
      },
      {
        status: feeRequest.status === "rejected" ? "rejected" : "completed",
        label: feeRequest.status === "rejected" ? "Rejected" : "Completed",
        date: feeRequest.processedAt,
        completed: ["approved", "rejected"].includes(feeRequest.status),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        ...feeRequest,
        timeline,
      },
    });
  } catch (error) {
    console.error("Error fetching fee status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
