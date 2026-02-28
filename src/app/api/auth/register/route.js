import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

// Allowed roles for registration (only high-level staff)
const ALLOWED_REGISTER_ROLES = ["admin", "dg-office", "fee-office"];

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, cnic, role } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !cnic || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate CNIC format (12345-1234567-1)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      return NextResponse.json(
        { message: "Please enter a valid CNIC (format: 12345-1234567-1)" },
        { status: 400 }
      );
    }

    // Check if role is allowed for registration
    if (!ALLOWED_REGISTER_ROLES.includes(role)) {
      return NextResponse.json(
        { message: "This role cannot be registered directly. Contact admin." },
        { status: 403 }
      );
    }

    // Check if this role already exists (only one allowed per role)
    const existingRole = await User.findOne({ role });
    if (existingRole) {
      return NextResponse.json(
        { message: `A ${role} account already exists. Contact existing ${role} for access.` },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if CNIC already exists
    const existingCNIC = await User.findOne({ cnic });
    if (existingCNIC) {
      return NextResponse.json(
        { message: "CNIC already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set department based on role
    const department = 
      role === "admin" ? "Administration" :
      role === "dg-office" ? "Director General Office" :
      role === "fee-office" ? "Fee Section" : "General";

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cnic,
      userType: "staff",
      role,
      department,
      isActive: true
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { 
        message: `${role === "admin" ? "Admin" : 
                   role === "dg-office" ? "DG Office" : 
                   "Fee Office"} account created successfully. You can now login.`,
        user: userResponse 
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return NextResponse.json(
        { message: messages.join(", ") },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}