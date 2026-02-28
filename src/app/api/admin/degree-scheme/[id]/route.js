import { NextResponse } from "next/server";
import DegreeScheme from "@/models/SubjectScheme";
import connectDB from "@/lib/db";

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const updateData = await req.json();

    // Check if scheme exists
    const scheme = await DegreeScheme.findById(id);
    if (!scheme) {
      return NextResponse.json({ message: "Scheme not found" }, { status: 404 });
    }

    // Update scheme
    const updatedScheme = await DegreeScheme.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("degree", "name shortName");

    return NextResponse.json({
      message: "Scheme updated successfully",
      scheme: {
        id: updatedScheme._id.toString(),
        degreeId: updatedScheme.degree._id.toString(),
        degreeName: updatedScheme.degree.name,
        degreeShortName: updatedScheme.degree.shortName,
        schemeName: updatedScheme.schemeName,
        session: updatedScheme.session,
        totalSemesters: updatedScheme.totalSemesters,
        semesterSchemes: updatedScheme.semesterSchemes,
        totalDegreeCredits: updatedScheme.totalDegreeCredits,
        description: updatedScheme.description,
        electives: updatedScheme.electives,
        isActive: updatedScheme.isActive,
      },
    });
  } catch (error) {
    console.error("Update scheme error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const scheme = await DegreeScheme.findById(id);
    if (!scheme) {
      return NextResponse.json({ message: "Scheme not found" }, { status: 404 });
    }

    // Soft delete (mark as inactive)
    scheme.isActive = false;
    await scheme.save();

    return NextResponse.json({
      message: "Scheme deactivated successfully",
    });
  } catch (error) {
    console.error("Delete scheme error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}