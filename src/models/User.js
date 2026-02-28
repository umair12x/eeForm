import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true 
    },
    userType: { 
      type: String, 
      enum: ["student", "staff"], 
      required: true 
    },
    email: { 
      type: String, 
      trim: true,
      lowercase: true,
      sparse: true,
    },
    registrationNumber: { 
      type: String, 
      trim: true,
      sparse: true,
    },
    password: { 
      type: String, 
      required: [true, "Password is required"] 
    },
    role: {
      type: String,
      enum: [
        "student", 
        "admin", 
        "tutor", 
        "dg-office", 
        "manager", 
        "fee-office"
      ],
      required: true,
    },
    department: { 
      type: String, 
      trim: true 
    },
    cnic: { 
      type: String, 
      required: [true, "CNIC is required"], 
      trim: true,
    },
    degree: { 
      type: String, 
      trim: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { 
    timestamps: true,
    // Suppress duplicate index warnings during development
    autoIndex: process.env.NODE_ENV !== 'production'
  }
);

// Pre-save validation
UserSchema.pre("save", async function(next) {
  try {
    if (this.userType === "student") {
      if (!this.registrationNumber) {
        throw new Error("Registration number required for students");
      }
      this.email = undefined;
    }

    if (this.userType === "staff") {
      if (!this.email) {
        throw new Error("Email required for staff members");
      }
      this.registrationNumber = undefined;
    }
    
    // next();
  } catch (error) {
    // next(error);
  }
});

// Define indexes
UserSchema.index(
  { email: 1 },
  { 
    unique: true, 
    partialFilterExpression: { email: { $exists: true, $ne: null } },
    sparse: true,
    background: true // Add background option
  }
);

UserSchema.index(
  { registrationNumber: 1 },
  { 
    unique: true, 
    partialFilterExpression: { registrationNumber: { $exists: true, $ne: null } },
    sparse: true,
    background: true
  }
);

UserSchema.index({ cnic: 1 }, { 
  unique: true,
  background: true 
});

// Check if model exists before creating
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;