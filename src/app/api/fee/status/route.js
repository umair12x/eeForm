import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

// GET - retrieve a fee record by requestId
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    if (!requestId) {
      return NextResponse.json(
        { error: "requestId query parameter is required" },
        { status: 400 }
      );
    }

    const fee = await Fee.findOne({ requestId }).lean();
    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    // return minimal fields to avoid exposing sensitive data
    const {
      status,
      statusMessage,
      studentType,
      requestId: rid,
      _id,
    } = fee;

    return NextResponse.json({
      success: true,
      data: { status, statusMessage, studentType, requestId: rid, id: _id },
    });
  } catch (error) {
    console.error("Error fetching fee status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
