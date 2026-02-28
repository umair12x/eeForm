import mongoose from "mongoose";

const FeeSchema = new mongoose.Schema(
  {
    // Student Information
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    
    studentType: {
      type: String,
      required: true,
      enum: ["undergraduate", "postgraduate"],
    },
    
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    
    fatherName: {
      type: String,
      trim: true,
    },
    
    cnic: {
      type: String,
      required: true,
      trim: true,
      // Removed strict validation for now to make it simpler
    },
    
    degreeProgram: {
      type: String,
      required: true,
    },
    
    degreeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Degree",
    },
    
    campus: {
      type: String,
      required: true,
      enum: ["main", "paras", "toba", "burewala", "depalpur"],
    },
    
    degreeMode: {
      type: String,
      required: true,
      enum: ["morning", "evening"],
    },
    
    // Fee Details
    semesterSeason: {
      type: String,
      required: true,
      enum: ["Spring", "Winter"],
    },
    
    semesterYear: {
      type: String,
      required: true,
    },
    
    semesterPaid: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    
    feeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    feeType: {
      type: String,
      required: true,
      enum: ["regular", "late", "recheck"],
      default: "regular",
    },
    
    boarderStatus: {
      type: String,
      required: true,
      enum: ["boarder", "non-boarder"],
      default: "non-boarder",
    },
    
    isSelf: {
      type: String,
      required: true,
      enum: ["yes", "no"],
      default: "no",
    },
    
    // Payment Details
    bankName: {
      type: String,
      required: true,
      enum: ["ABL", "HBL", "MCB"],
    },
    
    bankBranch: {
      type: String,
      required: true,
      trim: true,
    },
    
    voucherNumber: {
      type: String,
      required: true,
      trim: true,
    },
    
    paymentDate: {
      type: Date,
      required: true,
    },
    
    voucherImageUrl: {
      type: String,
      required: true,
    },
    
    voucherPublicId: {
      type: String,
    },
    
    // Contact & Remarks
    contactNumber: {
      type: String,
      trim: true,
    },
    
    remarks: {
      type: String,
      trim: true,
    },
    
    // Status & Tracking
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing"],
      default: "pending",
    },
    
    statusMessage: {
      type: String,
    },
    
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    
    processedAt: {
      type: Date,
    },
    
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
FeeSchema.index({ registrationNumber: 1, status: 1 });
FeeSchema.index({ submittedAt: -1 });

// Virtual field for campus display name
FeeSchema.virtual('campusName').get(function() {
  const campusMap = {
    'main': 'Main Campus',
    'paras': 'Paras Campus',
    'toba': 'Toba Tek Singh',
    'burewala': 'Burewala (Vehari)',
    'depalpur': 'Depalpur (Okara)'
  };
  return campusMap[this.campus] || this.campus;
});

// Virtual field for isSelf display
FeeSchema.virtual('isSelfDisplay').get(function() {
  return this.isSelf === 'yes' ? 'Yes (Self)' : 'No (Other)';
});

export default mongoose.models.Fee ||
  mongoose.model("Fee", FeeSchema);