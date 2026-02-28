import { NextResponse } from "next/server"
import  connectDB  from "@/lib/db"
import User from "@/models/User"
import Degree from "@/models/Degree"
import Subject from "@/models/SubjectScheme"

export async function GET() {
  await connectDB()

  try {
    const studentsCount = await User.countDocuments({ registrationNumber: { $exists: true } })
    const degreesCount = await Degree.countDocuments()
    const subjectsCount = await Subject.countDocuments()

    return NextResponse.json({
      students: studentsCount,
      degrees: degreesCount,
      subjects: subjectsCount
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
