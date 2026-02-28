import { NextResponse } from "next/server";
import Subject from "@/models/SubjectScheme";
import Degree from "@/models/Degree";
import  connectDB  from "@/lib/db";

export async function POST(req) {
  await dbConnect();
  try {
    const { code, name, degree, semester, creditHours, theoryHours, practicalHours } = await req.json();

    // Validation
    if (!code?.trim()) return NextResponse.json({ message: "Subject code is required" }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ message: "Subject name is required" }, { status: 400 });
    if (!degree) return NextResponse.json({ message: "Degree is required" }, { status: 400 });
    if (!semester || semester < 1) return NextResponse.json({ message: "Valid semester is required" }, { status: 400 });
    if (!creditHours || creditHours < 1) return NextResponse.json({ message: "Credit hours are required" }, { status: 400 });

    // Check if degree exists
    const degreeExists = await Degree.findById(degree);
    if (!degreeExists) {
      return NextResponse.json({ message: "Degree not found" }, { status: 404 });
    }

    // Check semester is within degree's total semesters
    if (semester > degreeExists.totalSemesters) {
      return NextResponse.json({ 
        message: `Semester ${semester} exceeds maximum semesters (${degreeExists.totalSemesters}) for this degree` 
      }, { status: 400 });
    }

    // Check for duplicate subject code in same degree
    const existing = await Subject.findOne({ 
      code: code.trim().toUpperCase(), 
      degree 
    });
    
    if (existing) return NextResponse.json({ 
      message: "Subject code already exists in this degree" 
    }, { status: 400 });

    // Calculate total hours validation
    const totalHours = (theoryHours || 0) + (practicalHours || 0);
    if (totalHours > creditHours) {
      return NextResponse.json({ 
        message: "Theory + Practical hours cannot exceed total credit hours" 
      }, { status: 400 });
    }

    const newSubject = new Subject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      degree,
      semester: Number(semester),
      creditHours: Number(creditHours),
      theoryHours: Number(theoryHours || 0),
      practicalHours: Number(practicalHours || 0),
    });

    await newSubject.save();

    // Populate degree info
    const populatedSubject = await Subject.findById(newSubject._id)
      .populate("degree", "name shortName");

    return NextResponse.json({
      message: "Subject created successfully",
      subject: {
        id: populatedSubject._id.toString(),
        code: populatedSubject.code,
        name: populatedSubject.name,
        degree: populatedSubject.degree._id.toString(),
        degreeName: populatedSubject.degree.name,
        degreeShortName: populatedSubject.degree.shortName,
        semester: populatedSubject.semester,
        creditHours: populatedSubject.creditHours,
        theoryHours: populatedSubject.theoryHours,
        practicalHours: populatedSubject.practicalHours,
        hoursFormat: `${populatedSubject.creditHours}(${populatedSubject.theoryHours}-${populatedSubject.practicalHours})`,
        active: populatedSubject.isActive,
      },
    });
  } catch (error) {
    console.error("Subject creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");
    const semester = searchParams.get("semester");

    let query = {};
    
    if (degree) {
      query.degree = degree;
    }
    
    if (semester) {
      query.semester = Number(semester);
    }

    const subjects = await Subject.find(query)
      .populate("degree", "name shortName totalSemesters")
      .sort({ semester: 1, code: 1 });

    return NextResponse.json(
      subjects.map((s) => ({
        id: s._id.toString(),
        code: s.code,
        name: s.name,
        degree: s.degree._id.toString(),
        degreeName: s.degree.name,
        degreeShortName: s.degree.shortName,
        semester: s.semester,
        creditHours: s.creditHours,
        theoryHours: s.theoryHours,
        practicalHours: s.practicalHours,
        hoursFormat: `${s.creditHours}(${s.theoryHours}-${s.practicalHours})`,
        active: s.isActive,
      }))
    );
  } catch (err) {
    console.error("Fetch subjects error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}