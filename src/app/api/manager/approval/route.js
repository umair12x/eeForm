import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
// IMPORT THE MODELS TO REGISTER THEM
import Department from "@/models/Department";
import Degree from "@/models/Degree";

// GET - Fetch forms for manager verification
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {};

    if (status === "pending") {
      query.status = "tutor_approved"; // Forms ready for manager verification
    } else if (status === "approved") {
      query.status = "manager_approved"; // Forms approved by manager
    } else if (status === "rejected") {
      query.status = "collector_rejected"; // Forms rejected by manager
    } else if (status === "all") {
      query.status = { $in: ["tutor_approved", "manager_approved", "collector_rejected"] };
    }

    const forms = await UgForm.find(query)
      .populate("department", "name")
      .populate("degree", "name shortName")
      .sort({ 
        ...(status === "approved" ? { managerApprovedAt: -1 } : { tutorActionAt: -1 })
      });

    // Calculate statistics
    const pending = await UgForm.countDocuments({ status: "tutor_approved" });
    const approved = await UgForm.countDocuments({ status: "manager_approved" });
    const rejected = await UgForm.countDocuments({ status: "collector_rejected" });
    const total = pending + approved + rejected;

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
      status: form.status,
      submittedAt: form.submittedAt,
      tutorSignature: form.tutorSignature,
      tutorSignedAt: form.tutorSignedAt,
      managerApprovedAt: form.managerApprovedAt,
      collectorRejectedAt: form.collectorRejectedAt,
      rejectionReason: form.rejectionReason,
      verificationNotes: form.verificationNotes,
    }));

    return NextResponse.json({
      success: true,
      data: formattedForms,
      stats: {
        pending,
        approved,
        rejected,
        total,
      },
    });
  } catch (error) {
    console.error("Manager GET Error:", error);
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

// PUT - Approve or reject forms (verification only, no signature required)
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { formId, action, verificationNotes, rejectionReason } = body;

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

    // Validate form state - must be tutor_approved
    if (form.status !== "tutor_approved") {
      return NextResponse.json(
        {
          success: false,
          message: `Form cannot be ${action === "approve" ? "approved" : "rejected"} in its current state (${form.status})`,
        },
        { status: 400 }
      );
    }

    switch (action) {
      case "approve":
        form.status = "manager_approved";
        form.verificationNotes = verificationNotes || "";
        form.managerApprovedAt = new Date();
        form.completedAt = new Date(); // Enrollment completed
        
        // Mark PDFs as available for generation
        form.pdfGenerated = {
          student: false,
          advisor: false,
          control: false,
          director: false,
        };
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

        form.status = "collector_rejected";
        form.rejectionReason = rejectionReason;
        form.collectorRejectedAt = new Date();
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Use 'approve' or 'reject'",
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
      message: action === "approve" ? "Form approved successfully. Student enrolled." : "Form rejected",
      data: {
        _id: updatedForm._id.toString(),
        formNumber: updatedForm.formNumber,
        status: updatedForm.status,
        managerApprovedAt: updatedForm.managerApprovedAt,
        rejectionReason: updatedForm.rejectionReason,
        verificationNotes: updatedForm.verificationNotes,
      },
    });
  } catch (error) {
    console.error("Manager PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process form verification",
        error: error.message,
      },
      { status: 500 }
    );
  }
}