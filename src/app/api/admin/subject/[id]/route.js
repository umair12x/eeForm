import { NextResponse } from "next/server";
import Subject from "@/models/SubjectScheme";
import Degree from "@/models/Degree";
import  connectDB  from "@/lib/db";

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const { code, name, degree, semester, creditHours, theoryHours, practicalHours, active } = await req.json();

    // Check if subject exists
    const subject = await Subject.findById(id);
    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // If degree is being changed, verify new degree exists
    if (degree && degree !== subject.degree.toString()) {
      const degreeExists = await Degree.findById(degree);
      if (!degreeExists) {
        return NextResponse.json({ message: "Degree not found" }, { status: 404 });
      }
    }

    // Check semester validation if changing
    if (semester) {
      const degreeId = degree || subject.degree;
      const degreeDoc = await Degree.findById(degreeId);
      if (semester > degreeDoc.totalSemesters) {
        return NextResponse.json({ 
          message: `Semester ${semester} exceeds maximum semesters (${degreeDoc.totalSemesters}) for this degree` 
        }, { status: 400 });
      }
    }

    // Check for duplicate subject code if changing
    if (code && code.trim().toUpperCase() !== subject.code) {
      const existing = await Subject.findOne({
        code: code.trim().toUpperCase(),
        degree: degree || subject.degree,
        _id: { $ne: id }
      });
      if (existing) {
        return NextResponse.json({ 
          message: "Subject code already exists in this degree" 
        }, { status: 400 });
      }
    }

    // Validate hours if changing
    if (creditHours !== undefined || theoryHours !== undefined || practicalHours !== undefined) {
      const newCreditHours = creditHours !== undefined ? Number(creditHours) : subject.creditHours;
      const newTheoryHours = theoryHours !== undefined ? Number(theoryHours) : subject.theoryHours;
      const newPracticalHours = practicalHours !== undefined ? Number(practicalHours) : subject.practicalHours;
      
      const totalHours = newTheoryHours + newPracticalHours;
      if (totalHours > newCreditHours) {
        return NextResponse.json({ 
          message: "Theory + Practical hours cannot exceed total credit hours" 
        }, { status: 400 });
      }
    }

    // Update subject
    const updatedData = {
      ...(code && { code: code.trim().toUpperCase() }),
      ...(name && { name: name.trim() }),
      ...(degree && { degree }),
      ...(semester !== undefined && { semester: Number(semester) }),
      ...(creditHours !== undefined && { creditHours: Number(creditHours) }),
      ...(theoryHours !== undefined && { theoryHours: Number(theoryHours) }),
      ...(practicalHours !== undefined && { practicalHours: Number(practicalHours) }),
      ...(active !== undefined && { isActive: active }),
    };

    const updatedSubject = await Subject.findByIdAndUpdate(id, updatedData, { new: true })
      .populate("degree", "name shortName");

    return NextResponse.json({
      message: "Subject updated successfully",
      subject: {
        id: updatedSubject._id.toString(),
        code: updatedSubject.code,
        name: updatedSubject.name,
        degree: updatedSubject.degree._id.toString(),
        degreeName: updatedSubject.degree.name,
        degreeShortName: updatedSubject.degree.shortName,
        semester: updatedSubject.semester,
        creditHours: updatedSubject.creditHours,
        theoryHours: updatedSubject.theoryHours,
        practicalHours: updatedSubject.practicalHours,
        hoursFormat: `${updatedSubject.creditHours}(${updatedSubject.theoryHours}-${updatedSubject.practicalHours})`,
        active: updatedSubject.isActive,
      },
    });
  } catch (error) {
    console.error("Update subject error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const subject = await Subject.findById(id);
    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    await Subject.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}