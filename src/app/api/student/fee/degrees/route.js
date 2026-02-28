import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Degree from "@/models/Degree";

export async function GET() {
  await connectDB();
  
  try {
    const degrees = await Degree.find({ isActive: true })
      .select("_id name totalSemesters");

    const degreesData = degrees.map((degree) => ({
      id: degree._id.toString(),
      name: degree.name,
      totalSemesters: degree.totalSemesters,
    }));

    return NextResponse.json(degreesData);
  } catch (error) {
    console.error("Error fetching degrees:", error);
    return NextResponse.json(
      { error: "Failed to fetch degrees data" },
      { status: 500 }
    );
  }
}