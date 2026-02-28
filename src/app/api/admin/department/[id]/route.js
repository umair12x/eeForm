import { NextResponse } from "next/server";
import Department from "@/models/Department";
import  connectDB  from "@/lib/db";

export async function DELETE(_, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) return NextResponse.json({ message: "Department not found" }, { status: 404 });
    return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = await params;
    const updates = await req.json();
    const department = await Department.findByIdAndUpdate(
      id,
      { name: updates.name, degreesCount: updates.count },
      { new: true }
    );
    if (!department) return NextResponse.json({ message: "Department not found" }, { status: 404 });
    const formattedDept = { id: department._id.toString(), name: department.name, count: department.degreesCount, active: department.isActive };
    return NextResponse.json({ department: formattedDept }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
