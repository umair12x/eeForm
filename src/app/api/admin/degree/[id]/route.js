import { NextResponse } from "next/server";
import Degree from "@/models/Degree";
import  connectDB  from "@/lib/db";

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const { name, shortName, department, totalSemesters, totalSessions, totalSections, active } = await req.json();

    // Check if degree exists
    const degree = await Degree.findById(id);
    if (!degree) {
      return NextResponse.json({ message: "Degree not found" }, { status: 404 });
    }

    // Check for duplicate name in same department
    if (name && name.trim() !== degree.name) {
      const existing = await Degree.findOne({
        name: name.trim().toUpperCase(),
        department: department || degree.department,
        _id: { $ne: id }
      });
      if (existing) {
        return NextResponse.json({ message: "Degree name already exists in this department" }, { status: 400 });
      }
    }

    // Update degree
    const updatedData = {
      ...(name && { name: name.trim().toUpperCase() }),
      ...(shortName !== undefined && { shortName: shortName?.trim().toUpperCase() }),
      ...(department && { department }),
      ...(totalSemesters !== undefined && { totalSemesters }),
      ...(totalSessions !== undefined && { totalSessions }),
      ...(totalSections !== undefined && { totalSections }),
      ...(active !== undefined && { isActive: active }),
    };

    const updatedDegree = await Degree.findByIdAndUpdate(id, updatedData, { new: true }).populate('department', 'name');

    return NextResponse.json({
      message: "Degree updated successfully",
      degree: {
        id: updatedDegree._id.toString(),
        name: updatedDegree.name,
        shortName: updatedDegree.shortName,
        department: updatedDegree.department?._id.toString(),
        departmentName: updatedDegree.department?.name,
        totalSemesters: updatedDegree.totalSemesters,
        totalSessions: updatedDegree.totalSessions,
        totalSections: updatedDegree.totalSections,
        active: updatedDegree.isActive,
      },
    });
  } catch (error) {
    console.error("Update degree error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const degree = await Degree.findById(id);
    if (!degree) {
      return NextResponse.json({ message: "Degree not found" }, { status: 404 });
    }

    await Degree.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Degree deleted successfully",
    });
  } catch (error) {
    console.error("Delete degree error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}