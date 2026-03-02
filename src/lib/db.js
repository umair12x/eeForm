import mongoose from "mongoose";

const DB_url = process.env.mongodb_url; 

export default async function connectDB()  {
  try {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(DB_url, {
      dbName: "eeformDB", // optional, creates/uses this database
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
