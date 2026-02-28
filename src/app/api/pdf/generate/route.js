import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UgForm from "@/models/UgForm";
import Department from "@/models/Department";
import Degree from "@/models/Degree";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

// ---------- Helpers ----------

const formatDate = (date) => {
  if (!date) return "______________";
  const d = new Date(date);
  return d
    .toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
};

const getSemesterText = (sem) => {
  if (!sem) return "";
  if (sem === 1) return "1st";
  if (sem === 2) return "2nd";
  if (sem === 3) return "3rd";
  return `${sem}th`;
};

const getAdmissionTerm = (admissionTo) => {
  const text = admissionTo?.toLowerCase() || "";
  if (text.includes("spring")) return "Spring";
  if (text.includes("fall")) return "Fall";
  if (text.includes("winter")) return "Winter";
  if (text.includes("summer")) return "Summer";
  return "Spring";
};

// ---------- ROUTE ----------

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("formId");

  if (!formId)
    return NextResponse.json(
      { success: false, message: "Form ID required" },
      { status: 400 },
    );

  const form = await UgForm.findById(formId)
    .populate("department", "name")
    .populate("degree", "name");

  // if (!form) {
  //   return NextResponse.json(
  //     { success: false, message: "Form not found" },
  //     { status: 404 },
  //   );
  // }

  const doc = new jsPDF("p", "mm", "a4");

  // Generate all 4 copies as separate pages in one PDF
  generateCopy(doc, form, "control", "CONTROLLER'S COPY - I");
  doc.addPage();
  generateCopy(doc, form, "advisor", "ADVISOR'S COPY - II");
  doc.addPage();
  generateCopy(doc, form, "director", "DIRECTOR'S COPY - III");
  doc.addPage();
  generateCopy(doc, form, "student", "STUDENT'S COPY - IV");

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="UG1-COMPLETE-${form.registeredNo || formId}.pdf"`,
    },
  });
}

// ---------- PDF GENERATION FUNCTION ----------

function generateCopy(doc, form, copyType, copyText) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Use Times for that official university look
  doc.setFont("times", "normal");

  // ===== 1. UG-1 DESIGNATION BOX =====
  // doc.setLineWidth(0.4);
  // doc.rect(margin, margin, 15, 8);

  // ===== 2. LOGO =====
  try {
    const logoPath = path.join(process.cwd(), "public/logo-uaf.jpg");
    if (fs.existsSync(logoPath)) {
      const logo = fs.readFileSync(logoPath).toString("base64");
      doc.addImage(
        `data:image/jpeg;base64,${logo}`,
        "JPEG",
        margin + 2,
        20,
        18,
        18,
      );
      doc.text("UG-1", margin + 7.5, margin + 5.5, { align: "center" });
      doc.setFont("times", "bold");
      doc.setFontSize(10);
    } else {
      doc.setLineWidth(0.2);
      doc.circle(margin + 11, 28, 9);
      doc.setFontSize(7);
      doc.text("UAF LOGO", margin + 11, 28.5, { align: "center" });
    }
  } catch (e) {
    /* silent fallback */
  }

  // ===== 3. COPY TYPE =====
  doc.setFontSize(9);
  doc.text(copyText, pageWidth - margin, margin + 5, { align: "right" });

  // ===== 4. HEADER TITLES =====
  doc.setFontSize(14);
  doc.text(
    "UNIVERSITY OF AGRICULTURE, FAISALABAD, PAKISTAN",
    pageWidth / 2 + 10,
    20,
    { align: "center" },
  );

  // Official form horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin + 25, 22, pageWidth - margin, 22);

  doc.setFontSize(11);
  const semesterText = getSemesterText(form.semester);
  const sessionText = form.session || `2025-2026`;
  doc.text(
    `Form for listing courses to be taken in ${semesterText} Semester, ${sessionText}`,
    pageWidth / 2 + 10,
    28,
    { align: "center" },
  );

  doc.setFontSize(10);
  const facultyName =
    form.department?.name || form.departmentName || "Faculty of Sciences";
  doc.text(facultyName.toUpperCase(), pageWidth / 2 + 10, 34, {
    align: "center",
  });

  // ===== 5. STUDENT INFO FIELDS =====
  let y = 44;
  const field = (label, value, x, y, width, isBoldValue = false) => {
    doc.setFont("times", "bold");
    doc.text(label, x, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("times", isBoldValue ? "bold" : "normal");
    if (value) doc.text(String(value), x + labelWidth + 2, y);
    doc.setLineWidth(0.1);
    doc.line(x + labelWidth + 1, y + 1, x + width, y + 1);
  };

  // Row 1: Degree
  field(
    "Degree:",
    form.degree?.name || "Computer Science",
    margin,
    y,
    pageWidth - margin,
    true,
  );

  y += 7;
  // Row 2: Admission & Semester Commencing
  const term = getAdmissionTerm(form.admissionTo);
  field("ADMISSION TO:", `${term} Semester, ${sessionText}`, margin, y, 100);
  field(
    "DATE OF COMMENCEMENT:",
    formatDate(form.dateOfCommencement),
    110,
    y,
    pageWidth - margin,
  );

  y += 7;
  // Row 3: Enrolment, Reg No, Section
  field(
    "Date of First Enrolment:",
    formatDate(form.dateOfFirstEnrollment),
    margin,
    y,
    75,
  );
  field("Registered No.", form.registeredNo, 80, y, 150);
  field("Section:", form.section || "A", 155, y, pageWidth - margin);

  y += 7;
  // Row 4: Names
  field(
    "Name of the Student:",
    (form.studentName || "").toUpperCase(),
    margin,
    y,
    105,
  );
  field(
    "Father's Name:",
    (form.fatherName || "").toUpperCase(),
    110,
    y,
    pageWidth - margin,
  );

  y += 7;
  // Row 5: Address & Phone
  field("Permanent Address:", form.permanentAddress, margin, y, 145);
  field("Ph./Cell No.", form.phoneCell, 150, y, pageWidth - margin);

  y += 10;

  // ===== 6. CREDIT COMPLETED GRID (AUTHENTIC LOOK) =====
  doc.setFont("times", "bold");
  doc.text("Credit Completed", margin, y);
  y += 2;

  // Manual grid for "Credit Completed" to match the photo
  const gridWidth = (pageWidth - margin * 2) / 13;
  const labels = [
    "",
    "I",
    "II",
    "S",
    "III",
    "IV",
    "S",
    "V",
    "VI",
    "S",
    "VII",
    "VIII",
    "S",
  ];

  doc.setLineWidth(0.2);
  // Header row
  labels.forEach((label, i) => {
    doc.rect(margin + i * gridWidth, y, gridWidth, 6);
    doc.setFontSize(8);
    doc.text(label, margin + i * gridWidth + gridWidth / 2, y + 4.5, {
      align: "center",
    });
  });
  // Data row (empty boxes for the "handwritten" feel)
  y += 6;
  labels.forEach((_, i) => {
    doc.rect(margin + i * gridWidth, y, gridWidth, 8);
  });
  // Label on the far left of the grid
  doc.setFontSize(7);
  doc.text("Semesterwise", margin + 1, y - 2);

  y += 15;

  // ===== 7. COURSES TABLE =====
  doc.setFontSize(10);
  doc.setFont("times", "bold");
  doc.text("Courses to be taken during the Semester", margin, y);

  const courseData = [];
  form.selectedSubjects?.forEach((s) => {
    courseData.push([
      s.code,
      s.name.toUpperCase(),
      s.creditHours,
      "",
      "",
      "",
      "",
      "",
      
    ]);
  });
  // Fill empty rows
  while (courseData.length < 8)
    courseData.push(["", "", "", "", "", "", "", ""]);

  // Total row
  courseData.push([
    "",
    { content: "Total", styles: { halign: "right", fontStyle: "bold" } },
    { content: form.totalCreditHours, styles: { fontStyle: "bold" } },
    "",
    "",
    "",
    "",
    "",
  ]);

  autoTable(doc, {
    startY: y + 2,
    head: [
      [
        "Course Number",
        "Title of the Courses",
        "Credit Hours",
        "Total Marks",
        "Marks \n Obtained",
        "Grade",
        "Quality \n Points",
        "Remarks",
      ],
    ],
    body: courseData,
    theme: "grid",
    styles: {
      font: "times",
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 65 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 15, halign: "center" },
    },
    margin: { left: margin, right: margin },
  });

  // ===== 8. SIGNATURES & FOOTER =====
  let footerY = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(10);
  doc.line(margin, footerY, margin + 50, footerY);
  doc.text("Signature of Tutor", margin + 5, footerY + 5);

  doc.line(pageWidth - 60, footerY, pageWidth - margin, footerY);
  doc.text("Signature of Student", pageWidth - 55, footerY + 5);

  // Digital Signatures
  doc.setFont("times", "italic");
  if (form.tutorSignature)
    doc.text(form.tutorSignature, margin + 5, footerY - 2);
  if (form.tutorSignedAt) {
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.text(`Signed: ${formatDate(form.tutorSignedAt)}`, margin, footerY - 5);
  }
  if (form.studentSignature)
    doc.text(form.studentSignature, pageWidth - 55, footerY - 2);
  if (form.studentSignedAt) {
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.text(
      `Signed: ${formatDate(form.studentSignedAt)}`,
      pageWidth - 68,
      footerY - 5,
    );
  }

  footerY += 15;
  doc.setFont("times", "normal");
  doc.text(
    `Fee paid upto: ${form.feePaidUpto || "__________"}`,
    margin,
    footerY,
  );
  doc.text("Treasurer", pageWidth / 2 + 10, footerY);

  footerY += 10;
  doc.setFont("times", "bold");
  doc.text("DIRECTOR / DEAN", pageWidth - margin, footerY, { align: "right" });
  doc.setFont("times", "normal");
  doc.text(facultyName, pageWidth - margin, footerY + 5, { align: "right" });
  doc.text(`Dated: ${formatDate(new Date())}`, margin, footerY + 5);

  // ===== 9. OUTER PAGE BORDER =====
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
}
