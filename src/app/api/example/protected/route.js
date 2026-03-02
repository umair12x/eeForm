import { NextRequest, NextResponse } from "next/server";
import { protectRoute, forbiddenResponse } from "@/lib/rbac";

/**
 * Example protected API route using RBAC utilities
 * This route can only be accessed by admin users
 * 
 * Try this endpoint: GET /api/example/protected
 */
export async function GET(request) {
  // Protect route - only admin can access
  const { user, response } = await protectRoute(request, "admin");

  if (response) {
    return response;
  }

  try {
    // Your API logic here
    return NextResponse.json(
      {
        success: true,
        message: "You have access to this admin-only resource",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Example route accessible by multiple roles
 */
export async function POST(request) {
  // Protect route - admin, manager, and fee-office can access
  const { user, response } = await protectRoute(request, [
    "admin",
    "manager",
    "fee-office",
  ]);

  if (response) {
    return response;
  }

  try {
    const data = await request.json();

    return NextResponse.json(
      {
        success: true,
        message: "Request processed successfully",
        data: {
          processedBy: user.role,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error:", err);
    return forbiddenResponse("Invalid request");
  }
}
