import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const dynamic = "force-dynamic";

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

export async function GET(req) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search")?.trim();

    const filter = {};
    if (status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        messages,
        stats: {
          total: messages.length,
          unread: messages.filter((item) => !item.isRead).length,
          resolved: messages.filter((item) => item.status === "resolved").length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin messages fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
