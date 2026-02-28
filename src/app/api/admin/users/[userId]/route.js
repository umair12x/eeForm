import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

// GET single user
export async function GET(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const { userId } = params;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const { userId } = params;
    const { name, email, registrationNumber, role, department, cnic, degree, newPassword } = await req.json();

    // Check role limits if role is being changed
    if (role && ["dg-office", "fee-office"].includes(role)) {
      const user = await User.findById(userId);
      if (user.role !== role) {
        const existingCount = await User.countDocuments({ role, _id: { $ne: userId } });
        if (existingCount >= 1) {
          return NextResponse.json(
            { message: `Only one ${role} can exist` },
            { status: 400 }
          );
        }
      }
    }

    const updateData = { name, email, registrationNumber, role, department, cnic, degree };
    
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectDB();
  try {
    const { userId } = params;
    
    // Prevent deleting the last admin
    const user = await User.findById(userId);
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "Cannot delete the last admin" },
          { status: 400 }
        );
      }
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}