import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 220,
    },
    message: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

MessageSchema.index({ createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
