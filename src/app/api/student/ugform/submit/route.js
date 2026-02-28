import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
import Department from "@/models/Department";
import Degree from "@/models/Degree";
import DegreeScheme from "@/models/SubjectScheme";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();

    // Log received data for debugging
    console.log("=== FORM SUBMISSION START ===");
    console.log("Received form data:", JSON.stringify(body, null, 2));
    
    // Specifically check tutor data
    console.log("TUTOR DATA RECEIVED:", {
      tutorName: body.tutorName,
      tutorEmail: body.tutorEmail,
      tutorId: body.tutorId,
      typeOfTutorName: typeof body.tutorName,
      typeOfTutorEmail: typeof body.tutorEmail
    });

    // Validate required fields one by one with proper checks
    const requiredFields = [
      { field: "departmentId", message: "Department is required" },
      { field: "degreeId", message: "Degree program is required" },
      { field: "semester", message: "Semester is required" },
      { field: "section", message: "Section is required" },
      { field: "session", message: "Session is required" },
      { field: "admissionTo", message: "Admission term is required" },
      { field: "registeredNo", message: "Registration number is required" },
      { field: "studentName", message: "Student name is required" },
      { field: "fatherName", message: "Father's name is required" },
      { field: "tutorName", message: "Tutor name is required" },
      { field: "tutorEmail", message: "Tutor email is required" },
    ];

    for (const { field, message } of requiredFields) {
      const value = body[field];
      console.log(`Checking field ${field}:`, value);
      if (value === undefined || value === null || value === "") {
        console.log(`Field ${field} failed validation`);
        return NextResponse.json(
          {
            success: false,
            message: message,
          },
          { status: 400 }
        );
      }
    }

    console.log("All required fields validated successfully");

    // Validate selected subjects
    if (!body.selectedSubjects || body.selectedSubjects.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one subject",
        },
        { status: 400 }
      );
    }

    // Validate total credits
    if (body.totalCredits === undefined || body.totalCredits === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Total credits calculation failed",
        },
        { status: 400 }
      );
    }

    // Validate credit hours range
    if (body.totalCredits > 24) {
      return NextResponse.json(
        {
          success: false,
          message: "Total credit hours cannot exceed 24",
        },
        { status: 400 }
      );
    }

    if (body.totalCredits < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one subject",
        },
        { status: 400 }
      );
    }

    // CHECK FOR DUPLICATE FORM
    console.log("Checking for existing form with same registration number and semester...");
    const existingForm = await UgForm.findOne({
      registeredNo: body.registeredNo,
      semester: parseInt(body.semester),
      degree: body.degreeId,
      // You might also want to check by session
      session: body.session,
      // Exclude rejected or completed forms if needed
      status: { $nin: ["rejected", "completed"] }
    });

    if (existingForm) {
      console.log("Duplicate form found:", existingForm._id);
      return NextResponse.json(
        {
          success: false,
          message: `You have already submitted a form for semester ${body.semester}. Form Number: ${existingForm.formNumber}`,
          existingFormId: existingForm._id.toString(),
          existingFormNumber: existingForm.formNumber
        },
        { status: 409 }
      );
    }
    console.log("No duplicate form found, proceeding...");

    // Fetch department and degree details
    console.log("Fetching department and degree...");
    const [department, degree] = await Promise.all([
      Department.findById(body.departmentId),
      Degree.findById(body.degreeId),
    ]);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    if (!degree) {
      return NextResponse.json(
        {
          success: false,
          message: "Degree program not found",
        },
        { status: 404 }
      );
    }

    console.log("Department found:", department.name);
    console.log("Degree found:", degree.name);

    // Fetch degree scheme for the selected session (optional)
    let scheme = null;
    try {
      scheme = await DegreeScheme.findOne({
        degree: body.degreeId,
        session: body.session,
        isActive: true,
      }).sort({ createdAt: -1 });
      console.log("Scheme found:", scheme?.schemeName);
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
        code: sub.code || "",
        name: sub.name || "",
        creditHours: sub.creditHours || "3(2-1)",
        totalCredits: totalCredits || 3,
        theoryHours: sub.theoryHours || 2,
        practicalHours: sub.practicalHours || 1,
        hoursFormat: sub.creditHours || "3(2-1)",
        isExtra: false,
      };
    });

    // Format extra subjects
    const extraSubjects = (body.extraSubjects || []).map((sub) => ({
      code: sub.code || "",
      name: sub.name || "",
      creditHours: sub.creditHours || "3(2-1)",
      totalCredits: sub.totalCredits || 3,
      theoryHours: sub.theoryHours || 2,
      practicalHours: sub.practicalHours || 1,
      hoursFormat: sub.creditHours || "3(2-1)",
      isExtra: true,
    }));

    console.log("Creating UgForm instance...");
    console.log("Tutor data being passed to constructor:", {
      tutorName: body.tutorName,
      tutorEmail: body.tutorEmail
    });

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
      permanentAddress: body.permanentAddress || "",
      phoneCell: body.phoneCell || "",
      email: body.email || "",
      selectedSubjects,
      extraSubjects,
      totalSelectedSubjects: selectedSubjects.length + extraSubjects.length,
      totalCreditHours: body.totalCredits,
      feePaidUpto: body.feePaidUpto || "",
      feePaymentDate: body.feePaymentDate || null,
      studentSignature: body.studentSignature || "",
      studentSignedAt: new Date(),
      // CRITICAL: These lines must be present
      tutorName: body.tutorName,
      tutorEmail: body.tutorEmail,
      formDate: body.formDate || new Date(),
      status: "submitted",
      submittedAt: new Date(),
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    // Check what's in the ugForm object after creation
    console.log("UgForm instance created. Checking tutor fields in instance:");
    console.log("ugForm.tutorName:", ugForm.tutorName);
    console.log("ugForm.tutorEmail:", ugForm.tutorEmail);
    console.log("ugForm._doc.tutorName:", ugForm._doc?.tutorName);
    console.log("ugForm._doc.tutorEmail:", ugForm._doc?.tutorEmail);

    // Generate form number manually before save
    try {
      const year = new Date().getFullYear();
      // Count documents to generate sequential number
      const count = await UgForm.countDocuments();
      ugForm.formNumber = `UG1-${year}-${(count + 1)
        .toString()
        .padStart(5, "0")}`;
      console.log("Generated form number:", ugForm.formNumber);
    } catch (countError) {
      console.warn(
        "Error counting documents, using timestamp fallback:",
        countError
      );
      // Fallback to timestamp-based
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      ugForm.formNumber = `UG1-${new Date().getFullYear()}-${timestamp}${random}`;
    }

    // Validate the form before saving to catch any validation errors
    console.log("Validating form...");
    const validationError = ugForm.validateSync();
    if (validationError) {
      console.error("Validation error:", validationError);
      console.error("Validation error details:", Object.values(validationError.errors).map(err => ({
        path: err.path,
        message: err.message,
        value: err.value
      })));
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(validationError.errors).map(err => err.message),
        },
        { status: 400 }
      );
    }
    console.log("Form validation passed");

    // Save the form
    console.log("Saving form to database...");
    await ugForm.save();
    console.log("Form saved successfully with ID:", ugForm._id);

    // Populate the form before sending response
    const populatedForm = await UgForm.findById(ugForm._id)
      .populate("department", "name")
      .populate("degree", "name shortName");

    // Log the saved form to verify tutor fields are saved
    console.log("=== SAVED FORM DATA ===");
    console.log("Form ID:", populatedForm._id.toString());
    console.log("Form Number:", populatedForm.formNumber);
    console.log("TUTOR DATA IN SAVED FORM:", {
      tutorName: populatedForm.tutorName,
      tutorEmail: populatedForm.tutorEmail,
      tutorNameExists: populatedForm.tutorName !== undefined,
      tutorEmailExists: populatedForm.tutorEmail !== undefined
    });
    
    // Do a direct database query to verify
    const verifyForm = await UgForm.findById(ugForm._id).lean();
    console.log("DIRECT DB QUERY VERIFICATION:", {
      tutorName: verifyForm.tutorName,
      tutorEmail: verifyForm.tutorEmail
    });

    return NextResponse.json(
      {
        success: true,
        message: "Form submitted successfully",
        formId: populatedForm._id.toString(),
        formNumber: populatedForm.formNumber,
        data: {
          ...populatedForm.toObject(),
          tutorName: populatedForm.tutorName,
          tutorEmail: populatedForm.tutorEmail,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== FORM POST ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      console.error("Validation errors:", validationErrors);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      console.error("Duplicate key error:", error.keyValue);
      return NextResponse.json(
        {
          success: false,
          message: "A form with this information already exists",
          error: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form. Please try again.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}