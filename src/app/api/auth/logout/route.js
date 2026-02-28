import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.delete("token");
  return response;
}

// Also handle GET for simplicity
export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  response.cookies.delete("token");
  return response;
}