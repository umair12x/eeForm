import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(req) {
  await connectDB();

  try {
    const { identifier, password } = await req.json();
console.log("Login attempt with identifier:", identifier);
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Identifier and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or registration number
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { registrationNumber: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" + error.massage },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: "Account is deactivated. Contact admin." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token using jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      userType: user.userType,
      email: user.email,
      registrationNumber: user.registrationNumber
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Determine redirect URL based on role
    const redirectUrl = 
      user.role === "admin" ? "/admin" :
      user.role === "dg-office" ? "/dg-office" :
      user.role === "fee-office" ? "/fee-office" :
      user.role === "manager" ? "/manager" :
      user.role === "tutor" ? "/tutor" :
      user.role === "student" ? "/student" : "/";

    // Create response with cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          userType: user.userType,
          email: user.email,
          registrationNumber: user.registrationNumber
        },
        redirect: redirectUrl
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}