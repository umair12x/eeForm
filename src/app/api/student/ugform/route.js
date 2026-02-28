// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import UgForm from "@/models/UgForm";
// import Department from "@/models/Department";
// import Degree from "@/models/Degree";
// import DegreeScheme from "@/models/SubjectScheme";

// // GET - Fetch departments, degrees, subjects, and sessions for the form


// // POST - Submit new UG-1 form

// // PUT - Update form status (used by tutor/collector)
// export async function PUT(req) {
//   await connectDB();
//   try {
//     const { searchParams } = new URL(req.url);
//     const formId = searchParams.get("formId");
//     const body = await req.json();

//     if (!formId) {
//       return NextResponse.json({
//         success: false,
//         message: "Form ID is required"
//       }, { status: 400 });
//     }

//     const form = await UgForm.findById(formId);
//     if (!form) {
//       return NextResponse.json({
//         success: false,
//         message: "Form not found"
//       }, { status: 404 });
//     }

//     switch (body.action) {
//       case "tutor_approve":
//         form.status = "tutor_approved";
//         form.advisorSignature = body.advisorSignature || form.advisorSignature;
//         form.advisorSignedAt = new Date();
//         form.advisorRemarks = body.remarks || "";
//         form.tutorActionAt = new Date();
//         break;

//       case "tutor_reject":
//         form.status = "tutor_rejected";
//         form.rejectionReason = body.reason || "No reason provided";
//         form.tutorActionAt = new Date();
//         break;

//       case "collect_fee":
//         form.status = "fee_paid";
//         form.feeAmount = body.feeAmount;
//         form.paymentMode = body.paymentMode;
//         form.paymentDate = new Date();
//         form.receiptNumber = `REC-${Date.now()}`;
//         form.collectorSignature = body.collectorSignature;
//         form.collectorSignedAt = new Date();
//         form.feePaidAt = new Date();
//         break;

//       case "complete":
//         form.status = "completed";
//         form.completedAt = new Date();
//         break;

//       case "update_pdf":
//         if (body.copyType) {
//           form.pdfGenerated[body.copyType] = true;
//         }
//         break;

//       default:
//         return NextResponse.json({
//           success: false,
//           message: "Invalid action"
//         }, { status: 400 });
//     }

//     await form.save();

//     return NextResponse.json({
//       success: true,
//       message: "Form updated successfully",
//       data: form
//     });

//   } catch (error) {
//     console.error("Form PUT Error:", error);
//     return NextResponse.json({
//       success: false,
//       message: "Failed to update form",
//       error: error.message
//     }, { status: 500 });
//   }
// }