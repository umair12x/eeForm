import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const subject = body?.subject?.trim();
    const message = body?.message?.trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const createdMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: {
          id: createdMessage._id,
          createdAt: createdMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact message create error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
