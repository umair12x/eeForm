import { NextResponse } from "next/server";
import DegreeScheme from "@/models/SubjectScheme";
import Degree from "@/models/Degree";
import connectDB from "@/lib/db";

export async function POST(req) {
  await connectDB();
  try {
    const {
      degree,
      schemeName,
      session,
      totalSemesters,
      semesterSchemes,
      description,
      electives,
    } = await req.json();

    // Validation
    if (!degree) return NextResponse.json({ message: "Degree is required" }, { status: 400 });
    if (!schemeName?.trim()) return NextResponse.json({ message: "Scheme name is required" }, { status: 400 });
    if (!session?.trim()) return NextResponse.json({ message: "Session is required" }, { status: 400 });
    if (!totalSemesters || totalSemesters < 1) return NextResponse.json({ message: "Total semesters is required" }, { status: 400 });

    // Check if degree exists
    const degreeExists = await Degree.findById(degree);
    if (!degreeExists) {
      return NextResponse.json({ message: "Degree not found" }, { status: 404 });
    }

    // Check if scheme already exists for this degree and session
    const existingScheme = await DegreeScheme.findOne({
      degree,
      session: session.trim(),
      schemeName: schemeName.trim(),
    });

    if (existingScheme) {
      return NextResponse.json(
        { message: "Scheme already exists for this degree and session" },
        { status: 400 }
      );
    }

    // Validate and process semester schemes
    let totalDegreeCredits = 0;
    const processedSemesters = [];

    for (let i = 1; i <= totalSemesters; i++) {
      const semesterData = semesterSchemes.find(s => s.semester === i) || { semester: i, subjects: [] };
      
      let semesterCredits = 0;
      const processedSubjects = [];

      // Process subjects for this semester
      for (const subject of semesterData.subjects || []) {
        if (!subject.code?.trim() || !subject.name?.trim()) {
          return NextResponse.json(
            { message: `Subject code and name are required for semester ${i}` },
            { status: 400 }
          );
        }

        // Parse credit hours format
        const creditMatch = subject.creditHours.match(/^(\d+)\((\d+)-(\d+)\)$/);
        if (!creditMatch) {
          return NextResponse.json(
            { message: `Invalid credit hours format for ${subject.code}` },
            { status: 400 }
          );
        }

        const totalCredits = parseInt(creditMatch[1]);
        const theoryHours = parseInt(creditMatch[2]);
        const practicalHours = parseInt(creditMatch[3]);

        if (theoryHours + practicalHours > totalCredits) {
          return NextResponse.json(
            { message: `Theory + Practical hours exceed total credits for ${subject.code}` },
            { status: 400 }
          );
        }

        // Check for duplicate subject codes in this scheme
        const duplicateCode = processedSubjects.find(s => s.code === subject.code.trim().toUpperCase());
        if (duplicateCode) {
          return NextResponse.json(
            { message: `Duplicate subject code ${subject.code} in semester ${i}` },
            { status: 400 }
          );
        }

        processedSubjects.push({
          code: subject.code.trim().toUpperCase(),
          name: subject.name.trim(),
          creditHours: subject.creditHours,
          theoryHours,
          practicalHours,
          totalCredits,
        });

        semesterCredits += totalCredits;
      }

      processedSemesters.push({
        semester: i,
        subjects: processedSubjects,
        totalCreditHours: semesterCredits,
      });

      totalDegreeCredits += semesterCredits;
    }

    // Create new scheme
    const newScheme = new DegreeScheme({
      degree,
      schemeName: schemeName.trim(),
      session: session.trim(),
      totalSemesters,
      semesterSchemes: processedSemesters,
      totalDegreeCredits,
      description: description?.trim(),
      electives: electives || [],
    });

    await newScheme.save();

    // Populate degree info
    const populatedScheme = await DegreeScheme.findById(newScheme._id)
      .populate("degree", "name shortName");

    return NextResponse.json({
      message: "Degree scheme created successfully",
      scheme: {
        id: populatedScheme._id.toString(),
        degreeId: populatedScheme.degree._id.toString(),
        degreeName: populatedScheme.degree.name,
        degreeShortName: populatedScheme.degree.shortName,
        schemeName: populatedScheme.schemeName,
        session: populatedScheme.session,
        totalSemesters: populatedScheme.totalSemesters,
        semesterSchemes: populatedScheme.semesterSchemes,
        totalDegreeCredits: populatedScheme.totalDegreeCredits,
        description: populatedScheme.description,
        electives: populatedScheme.electives,
        isActive: populatedScheme.isActive,
        createdAt: populatedScheme.createdAt,
      },
    });
  } catch (error) {
    console.error("Scheme creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");
    const session = searchParams.get("session");
    const schemeName = searchParams.get("schemeName");

    let query = { isActive: true };
    
    if (degree) {
      query.degree = degree;
    }
    
    if (session) {
      query.session = session;
    }
    
    if (schemeName) {
      query.schemeName = { $regex: schemeName, $options: "i" };
    }

    const schemes = await DegreeScheme.find(query)
      .populate("degree", "name shortName totalSemesters")
      .sort({ session: -1, schemeName: 1 });

    return NextResponse.json(
      schemes.map((scheme) => ({
        id: scheme._id.toString(),
        degreeId: scheme.degree._id.toString(),
        degreeName: scheme.degree.name,
        degreeShortName: scheme.degree.shortName,
        schemeName: scheme.schemeName,
        session: scheme.session,
        totalSemesters: scheme.totalSemesters,
        semesterSchemes: scheme.semesterSchemes,
        totalDegreeCredits: scheme.totalDegreeCredits,
        description: scheme.description,
        electives: scheme.electives,
        isActive: scheme.isActive,
        createdAt: scheme.createdAt,
        updatedAt: scheme.updatedAt,
      }))
    );
  } catch (err) {
    console.error("Fetch schemes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}