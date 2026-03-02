import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Verify JWT token and return user data
 * @param {string} token - JWT token from request
 * @returns {Promise<{user: object | null, error: string | null}>}
 */
export async function verifyAuth(token) {
  try {
    if (!token) {
      return { user: null, error: "No token provided" };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return { user: payload, error: null };
  } catch (err) {
    return { user: null, error: "Invalid or expired token" };
  }
}

/**
 * Check if user has required role(s)
 * @param {string} userRole - User's role
 * @param {string | string[]} requiredRoles - Required role(s)
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}

/**
 * Create unauthorized API response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 403)
 * @returns {NextResponse}
 */
export function unauthorizedResponse(
  message = "Access denied: Insufficient permissions",
  status = 403
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: "UNAUTHORIZED",
    },
    { status }
  );
}

/**
 * Create forbidden API response
 * @param {string} message - Error message
 * @returns {NextResponse}
 */
export function forbiddenResponse(
  message = "Access denied: You don't have permission to access this resource"
) {
  return unauthorizedResponse(message, 403);
}

/**
 * Create not found API response
 * @param {string} message - Error message
 * @returns {NextResponse}
 */
export function notFoundResponse(
  message = "Resource not found"
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: "NOT_FOUND",
    },
    { status: 404 }
  );
}

/**
 * Middleware wrapper for API route protection
 * @param {Request} request - Next.js request object
 * @param {string | string[]} requiredRoles - Required role(s)
 * @returns {Promise<{user: object | null, response: NextResponse | null}>}
 */
export async function protectRoute(request, requiredRoles = null) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return {
        user: null,
        response: unauthorizedResponse("Authentication required", 401),
      };
    }

    const { user, error } = await verifyAuth(token);

    if (error) {
      return {
        user: null,
        response: unauthorizedResponse("Invalid or expired token", 401),
      };
    }

    // Check role if specified
    if (requiredRoles && !hasRole(user.role, requiredRoles)) {
      return {
        user: null,
        response: forbiddenResponse(
          `Access denied. Required role(s): ${Array.isArray(requiredRoles) ? requiredRoles.join(", ") : requiredRoles}`
        ),
      };
    }

    return { user, response: null };
  } catch (err) {
    console.error("Route protection error:", err);
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Internal server error", error: "SERVER_ERROR" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Get user's role dashboard URL
 * @param {string} role - User's role
 * @returns {string}
 */
export function getRoleDashboardUrl(role) {
  const dashboards = {
    admin: "/admin",
    "dg-office": "/dg-office",
    "fee-office": "/fee-office",
    manager: "/manager",
    tutor: "/tutor",
    student: "/student",
  };

  return dashboards[role] || "/";
}

/**
 * Log access attempt (for audit trail)
 * @param {string} userId - User ID
 * @param {string} action - Action attempted
 * @param {string} resource - Resource accessed
 * @param {boolean} success - Whether access was granted
 * @param {string} reason - Reason for access decision
 */
export async function logAccessAttempt(userId, action, resource, success, reason = null) {
  // This is a placeholder - implement your own logging logic
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    success,
    reason,
  };

  // TODO: Send to logging service or database
  if (!success) {
    console.warn("Access attempt denied:", logEntry);
  }
}

/**
 * Check if user can access a specific route based on role
 * @param {string} userRole - User's role
 * @param {string} pathname - Route pathname
 * @returns {boolean}
 */
export function canAccessRoute(userRole, pathname) {
  const roleRoutes = {
    admin: ["/admin"],
    "dg-office": ["/dg-office"],
    "fee-office": ["/fee-office"],
    manager: ["/manager"],
    tutor: ["/tutor"],
    student: ["/student"],
  };

  const allowedRoutes = roleRoutes[userRole] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get all allowed routes for a user role
 * @param {string} userRole - User's role
 * @returns {string[]}
 */
export function getAllowedRoutes(userRole) {
  const roleRoutes = {
    admin: ["/admin", "/api/admin"],
    "dg-office": ["/dg-office", "/api/dg-office"],
    "fee-office": ["/fee-office", "/api/fee"],
    manager: ["/manager", "/api/manager"],
    tutor: ["/tutor", "/api/tutor"],
    student: ["/student", "/api/student"],
  };

  const publicRoutes = ["/", "/login", "/register", "/about", "/contact", "/guide"];

  return [...publicRoutes, ...(roleRoutes[userRole] || [])];
}
