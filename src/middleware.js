import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Role-based route access control
const roleRoutes = {
  admin: ["/admin", "/admin/"],
  "dg-office": ["/dg-office", "/dg-office/"],
  "fee-office": ["/fee-office", "/fee-office/"],
  manager: ["/manager", "/manager/"],
  tutor: ["/tutor", "/tutor/"],
  student: ["/student", "/student/"],
};

// Public routes (no auth required)
const publicRoutes = [
  "/login",
  "/register",
  "/",
  "/about",
  "/contact",
  "/guide",
  "/unauthorized",
];

// Protected API routes by role
const protectedApiRoutes = {
  admin: ["/api/admin"],
  "dg-office": ["/api/dg-office"],
  "fee-office": ["/api/fee"],
  manager: ["/api/manager"],
  tutor: ["/api/tutor"],
  student: ["/api/student"],
  auth: ["/api/auth"], // Auth routes are accessible by everyone
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Check for token
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userRole = payload.role;
    const userType = payload.userType;

    // Get the role dashboard path
    const getRoleDashboard = (role) => {
      const dashboards = {
        admin: "/admin",
        "dg-office": "/dg-office",
        "fee-office": "/fee-office",
        manager: "/manager",
        tutor: "/tutor",
        student: "/student",
      };
      return dashboards[role] || "/";
    };

    // Check if trying to access a protected route
    let isAuthorized = false;
    let unauthorizedPath = null;

    // Check each role's routes
    for (const [role, routes] of Object.entries(roleRoutes)) {
      if (routes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
        // If user's role matches the route's role, allow access
        if (userRole === role) {
          isAuthorized = true;
        } else {
          // User is trying to access another role's route
          unauthorizedPath = getRoleDashboard(userRole);
        }
        break;
      }
    }

    // If it's an API route, check API permissions
    for (const [role, apiRoutes] of Object.entries(protectedApiRoutes)) {
      if (role === "auth") continue; // Auth routes are exception
      if (apiRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== role) {
          return NextResponse.json(
            {
              success: false,
              message: "Access Denied: You don't have permission to access this resource",
            },
            { status: 403 }
          );
        }
        isAuthorized = true;
        break;
      }
    }

    // If not authorized, check if user has valid role
    if (!isAuthorized && !unauthorizedPath) {
      // If the route is in protectedRoutes but user isn't authorized
      const allProtectedRoutes = Object.values(roleRoutes).flat();
      if (allProtectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
        unauthorizedPath = getRoleDashboard(userRole);
      } else {
        // Route is not in any role's path, might be a custom page that needs auth
        // Allow it to proceed (could be error page, etc)
        return NextResponse.next();
      }
    }

    // Redirect if unauthorized
    if (unauthorizedPath) {
      return NextResponse.redirect(new URL(unauthorizedPath, request.url));
    }

    // If everything is good, allow access
    if (isAuthorized) {
      return NextResponse.next();
    }

    // Fallback redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  } catch (err) {
    console.error("Middleware error:", err);
    // Token invalid or expired - redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (authentication endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};