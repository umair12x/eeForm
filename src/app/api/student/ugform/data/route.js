import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import Degree from "@/models/Degree";
import DegreeScheme from "@/models/SubjectScheme";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const departmentId = searchParams.get("departmentId");
    const degreeId = searchParams.get("degreeId");
    const semester = searchParams.get("semester");
    const session = searchParams.get("session");

    // Fetch all active departments
    if (type === "departments") {
      const departments = await Department.find({ isActive: true })
        .select("_id name degreesCount")
        .sort({ name: 1 });

      return NextResponse.json({
        success: true,
        data: departments.map((d) => ({
          id: d._id.toString(),
          name: d.name,
          degreesCount: d.degreesCount || 0,
        })),
      });
    }

    // Fetch degrees by department
    if (type === "degrees" && departmentId) {
      const degrees = await Degree.find({
        department: departmentId,
        isActive: true,
      }).select("_id name shortName totalSemesters totalSections");

      return NextResponse.json({
        success: true,
        data: degrees.map((d) => ({
          id: d._id.toString(),
          name: d.name,
          shortName: d.shortName,
          totalSemesters: d.totalSemesters,
          totalSections: d.totalSections || 8,
        })),
      });
    }

    // Fetch available sessions for a degree
    if (type === "sessions" && degreeId) {
      const schemes = await DegreeScheme.find({
        degree: degreeId,
        isActive: true,
      })
        .select("session schemeName")
        .sort({ session: -1 });

      // Get unique sessions
      const uniqueSessions = [];
      const sessionSet = new Set();

      schemes.forEach((scheme) => {
        if (!sessionSet.has(scheme.session)) {
          sessionSet.add(scheme.session);
          uniqueSessions.push({
            session: scheme.session,
            schemeName: scheme.schemeName,
            schemeId: scheme._id.toString(),
          });
        }
      });

      return NextResponse.json({
        success: true,
        data: uniqueSessions,
      });
    }

    // Fetch subjects by degree, semester, and session
    if (type === "subjects" && degreeId && semester) {
      const session = searchParams.get("session");

      if (!session) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "Please select a session",
        });
      }

      // Find active scheme for this degree and session
      const scheme = await DegreeScheme.findOne({
        degree: degreeId,
        session: session,
        isActive: true,
      }).sort({ createdAt: -1 });

      if (!scheme) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "No active scheme found for this degree and session",
        });
      }

      // Find semester in the scheme
      const semesterData = scheme.semesterSchemes.find(
        (s) => s.semester === parseInt(semester)
      );

      if (!semesterData) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "No subjects found for this semester",
        });
      }

      // Format subjects with proper credit hours parsing
      const subjects = semesterData.subjects.map((sub, index) => {
        // Parse credit hours from format like "3(3-0)" or "3(2-1)"
        const creditMatch = sub.creditHours.match(/^(\d+)\((\d+)-(\d+)\)$/);
        const totalCredits = creditMatch ? parseInt(creditMatch[1]) : 0;
        const theoryHours = creditMatch ? parseInt(creditMatch[2]) : 0;
        const practicalHours = creditMatch ? parseInt(creditMatch[3]) : 0;

        return {
          _id: `${scheme._id.toString()}_sem${semester}_${sub.code}_${index}`,
          id: `${scheme._id.toString()}_sem${semester}_${sub.code}_${index}`,
          code: sub.code,
          name: sub.name,
          creditHours: sub.creditHours,
          hoursFormat: sub.creditHours,
          totalCredits: totalCredits,
          theoryHours: theoryHours,
          practicalHours: practicalHours,
          schemeId: scheme._id.toString(),
          semester: parseInt(semester),
        };
      });

      return NextResponse.json({
        success: true,
        data: subjects,
        schemeName: scheme.schemeName,
        session: scheme.session,
        totalSemesterCredits: semesterData.totalCreditHours,
      });
    }

    // Fetch all tutors
    if (type === "tutor") {
      const tutors = await User.find({ role: "tutor" }).select(
        "_id name email designation department"
      );

      return NextResponse.json({
        success: true,
        data: tutors.map((d) => ({
          id: d._id.toString(),
          name: d.name,
          email: d.email,
          designation: d.designation || "Tutor",
          department: d.department || "",
        })),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Form GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}