import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    creditHours: {
      type: String,
      required: true,
      match: /^\d+\(\d+-\d+\)$/,
    },

    theoryHours: {
      type: Number,
      required: true,
      min: 0,
    },

    practicalHours: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCredits: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const SemesterSchemeSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    subjects: [SubjectSchema],

    totalCreditHours: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const DegreeSchemeSchema = new mongoose.Schema(
  {
    degree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Degree",
      required: true,
    },

    schemeName: {
      type: String,
      required: true,
      trim: true,
    },

    session: {
      type: String,
      required: true,
      trim: true,
    },

    totalSemesters: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    semesterSchemes: [SemesterSchemeSchema],

    totalDegreeCredits: {
      type: Number,
      required: true,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
    },

    electives: [
      {
        electiveType: String, // e.g., "ELECTIVE-I", "ELECTIVE-II"
        subjects: [SubjectSchema],
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient querying
DegreeSchemeSchema.index({ degree: 1, session: 1, isActive: 1 });
DegreeSchemeSchema.index({ degree: 1, isActive: 1 });

export default mongoose.models.DegreeScheme ||
  mongoose.model("DegreeScheme", DegreeSchemeSchema);