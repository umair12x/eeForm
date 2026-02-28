import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
import User from "@/models/User";
// IMPORT THE MODELS TO REGISTER THEM
import Department from "@/models/Department";
import Degree from "@/models/Degree";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// GET - Fetch forms for manager verification
export async function GET(req) {
  await connectDB();
  try {
    // authenticate manager
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
      }
      throw err;
    }
    const user = await User.findById(decoded.id).select("department role");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    if (user.role !== "manager") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const managerDept = user.department || "";
    if (!managerDept) {
      return NextResponse.json({ success: false, message: "Manager has no department assigned" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {
      departmentName: managerDept
    };

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

    // Calculate statistics (restrict to manager department)
    const pending = await UgForm.countDocuments({ status: "tutor_approved", departmentName: managerDept });
    const approved = await UgForm.countDocuments({ status: "manager_approved", departmentName: managerDept });
    const rejected = await UgForm.countDocuments({ status: "collector_rejected", departmentName: managerDept });
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
    // authenticate manager
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
      }
      throw err;
    }
    const user = await User.findById(decoded.id).select("department role");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    if (user.role !== "manager") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const managerDept = user.department || "";
    if (!managerDept) {
      return NextResponse.json({ success: false, message: "Manager has no department assigned" }, { status: 403 });
    }

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

    // ensure manager only acts on forms in their department
    const formDeptName = form.department?.name || form.departmentName;
    if (formDeptName !== managerDept) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to modify this form",
        },
        { status: 403 }
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