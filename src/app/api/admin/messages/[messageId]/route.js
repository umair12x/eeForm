import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

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

export async function PATCH(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  try {
    const { messageId } = params;
    const body = await req.json();
    const updates = {};

    if (typeof body.isRead === "boolean") {
      updates.isRead = body.isRead;
      updates.readAt = body.isRead ? new Date() : null;
    }

    if (["new", "in-progress", "resolved"].includes(body.status)) {
      updates.status = body.status;
      if (body.status !== "new") {
        updates.isRead = true;
        updates.readAt = new Date();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid update fields provided" },
        { status: 400 }
      );
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $set: updates },
      { new: true }
    );

    if (!updatedMessage) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Message updated successfully", data: updatedMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin message update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  try {
    const { messageId } = params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin message delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
