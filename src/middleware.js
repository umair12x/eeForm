import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Role-based route access - each role can only access their own routes
const roleRoutes = {
  admin: ["/admin"],
  "dg-office": ["/dg-office"],
  "fee-office": ["/fee-office"],
  manager: ["/manager"],
  tutor: ["/tutor"],
  student: ["/student"],
};

// Public routes (no auth required)
const publicRoutes = ["/login", "/register", "/", "/about", "/contact", "/guide"];

// API routes that need protection
const protectedApiRoutes = {
  admin: ["/api/admin"],
  "dg-office": ["/api/dg-office"],
  "fee-office": ["/api/fee"],
  manager: ["/api/manager"],
  tutor: ["/api/tutor"],
  student: ["/api/student"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
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

    // Check if trying to access a protected route
    let isAuthorized = false;
    let redirectPath = null;

    // Check each role's routes
    for (const [role, routes] of Object.entries(roleRoutes)) {
      if (routes.some(route => pathname.startsWith(route))) {
        // If user's role matches the route's role, allow access
        if (userRole === role) {
          isAuthorized = true;
        } else {
          // User is trying to access another role's route - redirect to their own dashboard
          redirectPath = `/${userRole}`;
        }
        break;
      }
    }

    // If it's an API route, check API permissions
    for (const [role, apiRoutes] of Object.entries(protectedApiRoutes)) {
      if (apiRoutes.some(route => pathname.startsWith(route))) {
        if (userRole !== role) {
          return NextResponse.json(
            { message: "Unauthorized: You don't have permission to access this resource" },
            { status: 403 }
          );
        }
        isAuthorized = true;
        break;
      }
    }

    // Handle root path - redirect to role-specific dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }

    // If not authorized and no redirect path set, redirect to login
    if (!isAuthorized) {
      if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    // Token invalid or expired
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