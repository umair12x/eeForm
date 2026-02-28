import { NextResponse } from "next/server";
import Degree from "@/models/Degree";
import Department from "@/models/Department";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();
  try {
    const {
      name,
      shortName,
      department,
      totalSemesters,
      totalSessions,
      totalSections,
    } = await req.json();

    if (!name?.trim())
      return NextResponse.json(
        { message: "Degree name is required" },
        { status: 400 },
      );
    if (!department)
      return NextResponse.json(
        { message: "Department is required" },
        { status: 400 },
      );

    // Check for existing degree with same name in same department
    const existing = await Degree.findOne({
      name: name.trim().toUpperCase(),
      department,
    });

    if (existing)
      return NextResponse.json(
        { message: "Degree already exists in this department" },
        { status: 400 },
      );

    const newDegree = new Degree({
      name: name.trim().toUpperCase(),
      shortName: shortName?.trim().toUpperCase(),
      department,
      totalSemesters: totalSemesters || 8,
      totalSessions: totalSessions || 1,
      totalSections: totalSections || 1,
    });

    await newDegree.save();

    return NextResponse.json({
      message: "Degree created successfully",
      degree: {
        id: newDegree._id.toString(),
        name: newDegree.name,
        shortName: newDegree.shortName,
        department: newDegree.department,
        totalSemesters: newDegree.totalSemesters,
        totalSessions: newDegree.totalSessions,
        totalSections: newDegree.totalSections,
        active: newDegree.isActive,
      },
    });
  } catch (error) {
    console.error("Degree creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const degrees = await Degree.find({}).populate("department", "name");
    return NextResponse.json(
      degrees.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        shortName: d.shortName,
        department: d.department?._id.toString(),
        departmentName: d.department?.name,
        totalSemesters: d.totalSemesters,
        totalSessions: d.totalSessions,
        totalSections: d.totalSections,
        active: d.isActive,
      })),
    );
  } catch (err) {
    console.error("Fetch degrees error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
