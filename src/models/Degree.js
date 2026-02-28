import mongoose from "mongoose";

const DegreeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    totalSemesters: {
      type: Number,
      required: true,
      min: 3,
    },

    totalSessions: {
      type: Number,
      default: 1,
    },

    totalSections: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate degree names inside same department
DegreeSchema.index(
  { name: 1, department: 1 },
  { unique: true }
);

export default mongoose.models.Degree ||
  mongoose.model("Degree", DegreeSchema);
