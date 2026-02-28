import { NextResponse } from "next/server";
import Department from "@/models/Department";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();
  try {
    const departments = await Department.find({});
    return NextResponse.json(
      departments.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        count: d.degreesCount,
        active: d.isActive,
      })),
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const { name, degreesCount } = await req.json();

    if (!name || !name.trim())
      return NextResponse.json(
        { message: "Department name is required" },
        { status: 400 },
      );

    if (await Department.findOne({ name: name.trim() }))
      return NextResponse.json(
        { message: "Department already exists" },
        { status: 400 },
      );

    const depart = await new Department({
      name: name.toUpperCase(),
      degreesCount: degreesCount,
    }).save();

    return NextResponse.json({
      message: "Department created successfully",
      department: {
        id: depart._id.toString(),
        name: depart.name,
        count: depart.degreesCount,
        active: depart.isActive,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
