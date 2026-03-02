import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to check if user is admin
async function isAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

// GET all users (admin only)
export async function GET(req) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

// POST create user (admin only)
export async function POST(req) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const body = await req.json();
    const { userType, ...userData } = body;

    // Validate based on user type
    if (userType === "student") {
      const { name, registrationNumber, department, degree, cnic, password, role } = userData;
      
      if (!name || !registrationNumber || !password || !cnic || !role) {
        return NextResponse.json(
          { message: "Missing required fields for student" },
          { status: 400 }
        );
      }

      // Check for unique constraints
      const existingUser = await User.findOne({
        $or: [
          { registrationNumber },
          { cnic }
        ]
      });

      if (existingUser) {
        if (existingUser.registrationNumber === registrationNumber) {
          return NextResponse.json(
            { message: "Registration number already exists" },
            { status: 400 }
          );
        }
        if (existingUser.cnic === cnic) {
          return NextResponse.json(
            { message: "CNIC already exists" },
            { status: 400 }
          );
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        userType: "student",
        role,
        registrationNumber,
        department,
        degree,
        cnic,
        password: hashedPassword,
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return NextResponse.json(
        { message: "Student created successfully", user: userResponse },
        { status: 201 }
      );
    } 
    else if (userType === "staff") {
      const { name, email, password, role, department, cnic } = userData;

      if (!name || !email || !password || !role || !department || !cnic) {
        return NextResponse.json(
          { message: "Missing required fields for staff" },
          { status: 400 }
        );
      }

      // Check role limits
      if (["dg-office", "fee-office"].includes(role)) {
        const existingCount = await User.countDocuments({ role });
        if (existingCount >= 1) {
          return NextResponse.json(
            { message: `Only one ${role} can exist` },
            { status: 400 }
          );
        }
      }

      // Check for unique constraints
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { cnic }
        ]
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return NextResponse.json(
            { message: "Email already exists" },
            { status: 400 }
          );
        }
        if (existingUser.cnic === cnic) {
          return NextResponse.json(
            { message: "CNIC already exists" },
            { status: 400 }
          );
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        userType: "staff",
        role,
        email: email.toLowerCase(),
        department,
        cnic,
        password: hashedPassword,
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return NextResponse.json(
        { message: "Staff created successfully", user: userResponse },
        { status: 201 }
      );
    } 
    else {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}