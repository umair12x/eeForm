import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
// IMPORT THE MODELS TO REGISTER THEM
import Department from "@/models/Department";
import Degree from "@/models/Degree";

// GET - Fetch forms for tutor with proper status mapping
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get("status");

    let query = {};
    
    // Map status filters to actual database status
    if (status === "pending") {
      query.status = "submitted"; // Forms waiting for tutor signature
    } else if (status === "signed") {
      query.status = "tutor_approved"; // Forms signed by tutor
    } else if (status === "rejected") {
      query.status = "tutor_rejected"; // Forms rejected by tutor
    } else if (status === "all") {
      query.status = { $in: ["submitted", "tutor_approved", "tutor_rejected"] };
    }

    const forms = await UgForm.find(query)
      .populate("department", "name")
      .populate("degree", "name shortName")
      .sort({ submittedAt: -1 });

    // Calculate statistics
    const pending = await UgForm.countDocuments({ status: "submitted" });
    const signed = await UgForm.countDocuments({ status: "tutor_approved" });
    const rejected = await UgForm.countDocuments({ status: "tutor_rejected" });
    const total = pending + signed + rejected;

    const formattedForms = forms.map((form) => ({
      _id: form._id.toString(),
      formNumber: form.formNumber,
      studentName: form.studentName,
      fatherName: form.fatherName,
      registeredNo: form.registeredNo,
      departmentName: form.department?.name || form.departmentName,
      degreeName: form.degree?.name || form.degreeName,
      degreeShortName: form.degree?.shortName || form.degreeShortName,
      semester: form.semester,
      section: form.section,
      session: form.session,
      admissionTo: form.admissionTo,
      dateOfCommencement: form.dateOfCommencement,
      dateOfFirstEnrollment: form.dateOfFirstEnrollment,
      permanentAddress: form.permanentAddress,
      phoneCell: form.phoneCell,
      totalCreditHours: form.totalCreditHours,
      selectedSubjects: form.selectedSubjects,
      extraSubjects: form.extraSubjects,
      feePaidUpto: form.feePaidUpto,
      studentSignature: form.studentSignature,
      studentSignedAt: form.studentSignedAt,
      status: form.status,
      submittedAt: form.submittedAt,
      rejectionReason: form.rejectionReason,
      tutorSignature: form.tutorSignature,
      tutorSignedAt: form.tutorSignedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedForms,
      stats: {
        pending,
        signed,
        rejected,
        total,
      },
    });
  } catch (error) {
    console.error("Tutor GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch forms",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Sign or reject form
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { formId, action, tutorSignature, rejectionReason } = body;

    if (!formId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Form ID and action are required",
        },
        { status: 400 }
      );
    }

    const form = await UgForm.findById(formId);
    if (!form) {
      return NextResponse.json(
        {
          success: false,
          message: "Form not found",
        },
        { status: 404 }
      );
    }

    // Validate form state
    if (form.status !== "submitted") {
      return NextResponse.json(
        {
          success: false,
          message: `Form cannot be ${action === "sign" ? "signed" : "rejected"} in its current state (${form.status})`,
        },
        { status: 400 }
      );
    }

    switch (action) {
      case "sign":
        if (!tutorSignature) {
          return NextResponse.json(
            {
              success: false,
              message: "Tutor signature is required",
            },
            { status: 400 }
          );
        }

        form.status = "tutor_approved";
        form.tutorSignature = tutorSignature;
        form.tutorSignedAt = new Date();
        form.tutorActionAt = new Date();
        break;

      case "reject":
        if (!rejectionReason) {
          return NextResponse.json(
            {
              success: false,
              message: "Rejection reason is required",
            },
            { status: 400 }
          );
        }

        form.status = "tutor_rejected";
        form.rejectionReason = rejectionReason;
        form.tutorActionAt = new Date();
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Use 'sign' or 'reject'",
          },
          { status: 400 }
        );
    }

    await form.save();

    // Return updated form
    const updatedForm = await UgForm.findById(formId)
      .populate("department", "name")
      .populate("degree", "name shortName");

    return NextResponse.json({
      success: true,
      message: action === "sign" ? "Form signed successfully" : "Form rejected",
      data: {
        _id: updatedForm._id.toString(),
        formNumber: updatedForm.formNumber,
        status: updatedForm.status,
        tutorSignature: updatedForm.tutorSignature,
        tutorSignedAt: updatedForm.tutorSignedAt,
        rejectionReason: updatedForm.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Tutor PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update form",
        error: error.message,
      },
      { status: 500 }
    );
  }
}