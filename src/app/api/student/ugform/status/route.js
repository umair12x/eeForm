import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";

export async function GET(req) {
  await connectDB();

  try {
    const searchParams = new URL(req.url).searchParams;
    const registeredNo = searchParams.get("registeredNo");
    const formNumber = searchParams.get("formNumber");

    if (!registeredNo && !formNumber) {
      return NextResponse.json(
        { success: false, message: "registeredNo or formNumber is required" },
        { status: 400 }
      );
    }

    const query = formNumber
      ? { formNumber: formNumber.trim().toUpperCase() }
      : { registeredNo: registeredNo.trim() };

    const form = await UgForm.findOne(query).sort({ submittedAt: -1 });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    // Determine progress stage flags
    const status = form.status || "submitted";
    const stageMeta = {
      draft: 1,
      submitted: 2,
      tutor_pending: 3,
      tutor_approved: 4,
      tutor_rejected: 4,
      manager_pending: 5,
      manager_approved: 6,
      collector_rejected: 6,
      completed: 7,
    };

    const stageLabels = {
      draft: "Draft",
      submitted: "Submitted",
      tutor_pending: "Tutor Review",
      tutor_approved: "Tutor Approved",
      tutor_rejected: "Tutor Rejected",
      manager_pending: "Manager Review",
      manager_approved: "Manager Approved",
      collector_rejected: "Manager Rejected",
      completed: "Completed",
    };

    return NextResponse.json({
      success: true,
      data: {
        formId: form._id.toString(),
        formNumber: form.formNumber,
        registeredNo: form.registeredNo,
        status,
        stage: stageMeta[status] || 2,
        stageLabel: stageLabels[status] || "Submitted",
        statusTimeline: [
          { step: 1, title: "Draft", done: stageMeta[status] >= 1 },
          { step: 2, title: "Submitted", done: stageMeta[status] >= 2 },
          { step: 3, title: "Tutor Review", done: stageMeta[status] >= 3 },
          { step: 4, title: "Tutor Decision", done: stageMeta[status] >= 4 },
          { step: 5, title: "Manager Review", done: stageMeta[status] >= 5 },
          { step: 6, title: "Manager Decision", done: stageMeta[status] >= 6 },
          { step: 7, title: "Completed", done: stageMeta[status] >= 7 },
        ],
        timestamps: {
          submittedAt: form.submittedAt,
          tutorActionAt: form.tutorActionAt,
          feePaidAt: form.feePaidAt,
          completedAt: form.completedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching UG form status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch status", error: error.message },
      { status: 500 }
    );
  }
}
