import mongoose from "mongoose";

const SelectedSubjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  creditHours: {
    type: String,
    required: true,
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  theoryHours: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  practicalHours: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  hoursFormat: {
    type: String,
    required: true,
  },
  isExtra: {
    type: Boolean,
    default: false,
  },
});

const ExtraSubjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  creditHours: {
    type: String,
    required: true,
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  theoryHours: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  practicalHours: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },
  hoursFormat: {
    type: String,
    required: true,
  },
  isExtra: {
    type: Boolean,
    default: true,
  },
});

const UgFormSchema = new mongoose.Schema(
  {
    // Form Identification
    formNumber: {
      type: String,
      unique: true,
    },
    formType: {
      type: String,
      default: "UG-1",
    },

    // Department & Degree Information
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },

    degree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Degree",
      required: true,
    },
    degreeName: {
      type: String,
      required: true,
    },
    degreeShortName: {
      type: String,
    },

    // Degree Scheme Reference
    degreeScheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DegreeScheme",
    },
    schemeName: {
      type: String,
    },
    session: {
      type: String,
      required: true,
    },

    // Semester & Section
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
    },

    // Admission Details
    admissionTo: {
      type: String,
      required: true,
    },
    dateOfCommencement: {
      type: Date,
    },
    dateOfFirstEnrollment: {
      type: Date,
    },

    // Student Information
    registeredNo: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    permanentAddress: {
      type: String,
      trim: true,
    },
    phoneCell: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Subjects
    selectedSubjects: [SelectedSubjectSchema],
    extraSubjects: [ExtraSubjectSchema],
    totalSelectedSubjects: {
      type: Number,
      default: 0,
    },
    totalCreditHours: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
    },

    // Fee Information
    feePaidUpto: {
      type: String,
    },
    feePaymentDate:{
      type: Date,
    },
    feeAmount: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "bank", "online", ""],
      default: "",
    },
    paymentDate: {
      type: Date,
    },
    receiptNumber: {
      type: String,
    },

    // Signatures
    studentSignature: {
      type: String,
    },
    studentSignedAt: {
      type: Date,
    },
    tutorSignature: {
      type: String,
    },
    tutorSignedAt: {
      type: Date,
    },
   

    // Form Status
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "pending_tutor",
        "tutor_approved",
        "tutor_rejected",
        "manager_pending",
        "manager_approved",
        "collector_rejected",
        "completed",
      ],
      default: "submitted",
    },
    rejectionReason: {
      type: String,
    },

    // Workflow Timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    tutorActionAt: {
      type: Date,
    },
    feePaidAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // PDF Generation Tracking
    pdfGenerated: {
      student: { type: Boolean, default: false },
      advisor: { type: Boolean, default: false },
      control: { type: Boolean, default: false },
      director: { type: Boolean, default: false },
    },

    // Metadata
    formDate: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);


// Indexes for efficient querying
UgFormSchema.index({ formNumber: 1 });
UgFormSchema.index({ registeredNo: 1 });
UgFormSchema.index({ status: 1 });
UgFormSchema.index({ department: 1, degree: 1, semester: 1 });
UgFormSchema.index({ submittedAt: -1 });

// Check if model exists before creating
const UgForm = mongoose.models.UgForm || mongoose.model("UgForm", UgFormSchema);

export default UgForm;