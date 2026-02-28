import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
import Department from "@/models/Department";
import Degree from "@/models/Degree";
import DegreeScheme from "@/models/SubjectScheme";

// GET - Fetch departments, degrees, subjects, and sessions for the form
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const departmentId = searchParams.get("departmentId");
    const degreeId = searchParams.get("degreeId");
    const semester = searchParams.get("semester");

    // Fetch all active departments
    if (type === "departments") {
      const departments = await Department.find({ isActive: true })
        .select("_id name degreesCount")
        .sort({ name: 1 });
      
      return NextResponse.json({
        success: true,
        data: departments.map(d => ({
          _id: d._id.toString(),
          name: d.name,
          degreesCount: d.degreesCount || 0
        }))
      });
    }

    // Fetch degrees by department
    if (type === "degrees" && departmentId) {
      const degrees = await Degree.find({ 
        department: departmentId, 
        isActive: true 
      }).select("_id name shortName totalSemesters totalSections");
      
      return NextResponse.json({
        success: true,
        data: degrees.map(d => ({
          _id: d._id.toString(),
          name: d.name,
          shortName: d.shortName,
          totalSemesters: d.totalSemesters,
          totalSections: d.totalSections || 8
        }))
      });
    }

    // Fetch available sessions for a degree
    if (type === "sessions" && degreeId) {
      const schemes = await DegreeScheme.find({ 
        degree: degreeId,
        isActive: true 
      })
        .select("session schemeName")
        .sort({ session: -1 });
      
      // Get unique sessions
      const uniqueSessions = [];
      const sessionSet = new Set();
      
      schemes.forEach(scheme => {
        if (!sessionSet.has(scheme.session)) {
          sessionSet.add(scheme.session);
          uniqueSessions.push({
            session: scheme.session,
            schemeName: scheme.schemeName,
            schemeId: scheme._id.toString()
          });
        }
      });

      return NextResponse.json({
        success: true,
        data: uniqueSessions
      });
    }

    // Fetch subjects by degree, semester, and session
    if (type === "subjects" && degreeId && semester) {
      const session = searchParams.get("session");
      
      if (!session) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "Please select a session"
        });
      }

      // Find active scheme for this degree and session
      const scheme = await DegreeScheme.findOne({
        degree: degreeId,
        session: session,
        isActive: true
      }).sort({ createdAt: -1 });

      if (!scheme) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "No active scheme found for this degree and session"
        });
      }

      // Find semester in the scheme
      const semesterData = scheme.semesterSchemes.find(
        s => s.semester === parseInt(semester)
      );

      if (!semesterData) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "No subjects found for this semester"
        });
      }

      // Format subjects with proper credit hours parsing
      const subjects = semesterData.subjects.map(sub => {
        // Parse credit hours from format like "3(3-0)" or "3(2-1)"
        const creditMatch = sub.creditHours.match(/^(\d+)\((\d+)-(\d+)\)$/);
        const totalCredits = creditMatch ? parseInt(creditMatch[1]) : 0;
        const theoryHours = creditMatch ? parseInt(creditMatch[2]) : 0;
        const practicalHours = creditMatch ? parseInt(creditMatch[3]) : 0;

        return {
          _id: `${scheme._id.toString()}_sem${semester}_${sub.code}`,
          code: sub.code,
          name: sub.name,
          creditHours: sub.creditHours,
          hoursFormat: sub.creditHours,
          totalCredits: totalCredits,
          theoryHours: theoryHours,
          practicalHours: practicalHours,
          schemeId: scheme._id.toString(),
          semester: parseInt(semester)
        };
      });

      return NextResponse.json({
        success: true,
        data: subjects,
        schemeName: scheme.schemeName,
        session: scheme.session,
        totalSemesterCredits: semesterData.totalCreditHours
      });
    }

    // Fetch form by ID
    if (type === "form" && searchParams.get("formId")) {
      const formId = searchParams.get("formId");
      const form = await UgForm.findById(formId)
        .populate("department", "name")
        .populate("degree", "name shortName");
      
      if (!form) {
        return NextResponse.json({
          success: false,
          message: "Form not found"
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: form
      });
    }

    // Fetch all forms for a student
    if (type === "student-forms" && searchParams.get("registeredNo")) {
      const registeredNo = searchParams.get("registeredNo");
      const forms = await UgForm.find({ registeredNo })
        .populate("department", "name")
        .populate("degree", "name shortName")
        .sort({ submittedAt: -1 });
      
      return NextResponse.json({
        success: true,
        data: forms
      });
    }

    return NextResponse.json({
      success: false,
      message: "Invalid request parameters"
    }, { status: 400 });

  } catch (error) {
    console.error("Form GET Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch data",
      error: error.message
    }, { status: 500 });
  }
}

// POST - Submit new UG-1 form
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    
    // Log received data for debugging
    console.log("Received form data:", JSON.stringify(body, null, 2));

    // Validate required fields one by one with proper checks
    const requiredFields = [
      { field: 'departmentId', message: 'Department is required' },
      { field: 'degreeId', message: 'Degree program is required' },
      { field: 'semester', message: 'Semester is required' },
      { field: 'section', message: 'Section is required' },
      { field: 'session', message: 'Session is required' },
      { field: 'admissionTo', message: 'Admission term is required' },
      { field: 'registeredNo', message: 'Registration number is required' },
      { field: 'studentName', message: 'Student name is required' },
      { field: 'fatherName', message: 'Father\'s name is required' },
    ];

    for (const { field, message } of requiredFields) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        return NextResponse.json({
          success: false,
          message: message
        }, { status: 400 });
      }
    }

    // Validate selected subjects
    if (!body.selectedSubjects || body.selectedSubjects.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Please select at least one subject"
      }, { status: 400 });
    }

    // Validate total credits
    if (body.totalCredits === undefined || body.totalCredits === null) {
      return NextResponse.json({
        success: false,
        message: "Total credits calculation failed"
      }, { status: 400 });
    }

    // Validate credit hours range
    if (body.totalCredits > 24) {
      return NextResponse.json({
        success: false,
        message: "Total credit hours cannot exceed 24"
      }, { status: 400 });
    }

    if (body.totalCredits < 1) {
      return NextResponse.json({
        success: false,
        message: "Please select at least one subject"
      }, { status: 400 });
    }

    // Fetch department and degree details
    const [department, degree] = await Promise.all([
      Department.findById(body.departmentId),
      Degree.findById(body.degreeId)
    ]);

    if (!department) {
      return NextResponse.json({
        success: false,
        message: "Department not found"
      }, { status: 404 });
    }

    if (!degree) {
      return NextResponse.json({
        success: false,
        message: "Degree program not found"
      }, { status: 404 });
    }

    // Fetch degree scheme for the selected session (optional)
    let scheme = null;
    try {
      scheme = await DegreeScheme.findOne({
        degree: body.degreeId,
        session: body.session,
        isActive: true
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.warn("Error fetching degree scheme:", error);
      // Continue without scheme if not found
    }

    // Format selected subjects with proper credit hours
    const selectedSubjects = body.selectedSubjects.map((sub, index) => {
      // Parse credit hours if totalCredits is not provided
      let totalCredits = sub.totalCredits;
      if (!totalCredits && sub.creditHours) {
        const match = sub.creditHours.match(/^(\d+)/);
        totalCredits = match ? parseInt(match[1]) : 3;
      }

      return {
        subjectId: sub.subjectId || `temp_${index}`,
        code: sub.code || '',
        name: sub.name || '',
        creditHours: sub.creditHours || '3(2-1)',
        totalCredits: totalCredits || 3,
        theoryHours: sub.theoryHours || 2,
        practicalHours: sub.practicalHours || 1,
        hoursFormat: sub.creditHours || '3(2-1)',
        isExtra: false
      };
    });

    // Format extra subjects
    const extraSubjects = (body.extraSubjects || []).map(sub => ({
      code: sub.code || '',
      name: sub.name || '',
      creditHours: sub.creditHours || '3(2-1)',
      totalCredits: sub.totalCredits || 3,
      theoryHours: sub.theoryHours || 2,
      practicalHours: sub.practicalHours || 1,
      hoursFormat: sub.creditHours || '3(2-1)',
      isExtra: true
    }));

    // Create new form
  // ... existing code ...

    // Create new form - WITHOUT formNumber (will be generated)
    const ugForm = new UgForm({
      department: department._id,
      departmentName: department.name,
      degree: degree._id,
      degreeName: degree.name,
      degreeShortName: degree.shortName,
      degreeScheme: scheme?._id,
      schemeName: scheme?.schemeName,
      session: body.session,
      semester: parseInt(body.semester),
      section: body.section,
      admissionTo: body.admissionTo,
      dateOfCommencement: body.dateOfCommencement || null,
      dateOfFirstEnrollment: body.dateOfFirstEnrollment || null,
      registeredNo: body.registeredNo,
      studentName: body.studentName,
      fatherName: body.fatherName,
      permanentAddress: body.permanentAddress || '',
      phoneCell: body.phoneCell || '',
      email: body.email || '',
      selectedSubjects,
      extraSubjects,
      totalSelectedSubjects: selectedSubjects.length + extraSubjects.length,
      totalCreditHours: body.totalCredits,
      feePaidUpto: body.feePaidUpto || '',
      feePaymentDate: body.feePaymentDate || null,
      studentSignature: body.studentSignature || '',
      studentSignedAt: new Date(),
      formDate: body.formDate || new Date(),
      status: "submitted",
      submittedAt: new Date(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    // Generate form number manually before save
    try {
      const year = new Date().getFullYear();
      // Count documents to generate sequential number
      const count = await UgForm.countDocuments();
      ugForm.formNumber = `UG1-${year}-${(count + 1).toString().padStart(5, "0")}`;
    } catch (countError) {
      console.warn("Error counting documents, using timestamp fallback:", countError);
      // Fallback to timestamp-based
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      ugForm.formNumber = `UG1-${new Date().getFullYear()}-${timestamp}${random}`;
    }

    // Save the form
    await ugForm.save();

// ... rest of the code ...

    // Populate the form before sending response
    const populatedForm = await UgForm.findById(ugForm._id)
      .populate("department", "name")
      .populate("degree", "name shortName");

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      formId: populatedForm._id.toString(),
      formNumber: populatedForm.formNumber,
      data: populatedForm
    }, { status: 201 });

  } catch (error) {
    console.error("Form POST Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      }, { status: 400 });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "A form with this information already exists",
        error: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to submit form. Please try again.",
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update form status (used by tutor/collector)
export async function PUT(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const body = await req.json();

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required"
      }, { status: 400 });
    }

    const form = await UgForm.findById(formId);
    if (!form) {
      return NextResponse.json({
        success: false,
        message: "Form not found"
      }, { status: 404 });
    }

    switch (body.action) {
      case "tutor_approve":
        form.status = "tutor_approved";
        form.advisorSignature = body.advisorSignature || form.advisorSignature;
        form.advisorSignedAt = new Date();
        form.advisorRemarks = body.remarks || "";
        form.tutorActionAt = new Date();
        break;

      case "tutor_reject":
        form.status = "tutor_rejected";
        form.rejectionReason = body.reason || "No reason provided";
        form.tutorActionAt = new Date();
        break;

      case "collect_fee":
        form.status = "fee_paid";
        form.feeAmount = body.feeAmount;
        form.paymentMode = body.paymentMode;
        form.paymentDate = new Date();
        form.receiptNumber = `REC-${Date.now()}`;
        form.collectorSignature = body.collectorSignature;
        form.collectorSignedAt = new Date();
        form.feePaidAt = new Date();
        break;

      case "complete":
        form.status = "completed";
        form.completedAt = new Date();
        break;

      case "update_pdf":
        if (body.copyType) {
          form.pdfGenerated[body.copyType] = true;
        }
        break;

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid action"
        }, { status: 400 });
    }

    await form.save();

    return NextResponse.json({
      success: true,
      message: "Form updated successfully",
      data: form
    });

  } catch (error) {
    console.error("Form PUT Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update form",
      error: error.message
    }, { status: 500 });
  }
}