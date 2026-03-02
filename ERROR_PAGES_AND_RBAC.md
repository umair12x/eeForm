# Error Pages & RBAC Implementation Guide

This document explains the new error pages, loading states, and role-based access control (RBAC) system implemented in the EE Form application.

## 📋 Table of Contents

1. [Error Pages](#error-pages)
2. [Loading Pages](#loading-pages)
3. [Role-Based Access Control (RBAC)](#role-based-access-control)
4. [Middleware Configuration](#middleware-configuration)
5. [API Route Protection](#api-route-protection)
6. [Usage Examples](#usage-examples)

---

## 🚨 Error Pages

### Overview

Error pages are strategically placed throughout the application to handle different error scenarios gracefully with beautiful UI and helpful guidance.

### Page Types

#### 1. **Global Error (`src/app/error.jsx`)**
- Catches critical, unrecoverable errors at the root level
- Displays "Critical Error" with system status information
- Provides actions to retry or go home
- **Shows detailed error messages in development mode only**

#### 2. **Protected Area Error (`src/app/(protected)/error.jsx`)**
- Handles errors within protected routes (authenticated pages)
- Allows users to retry or navigate home
- Offers support contact option

#### 3. **Open Area Error (`src/app/(open)/error.jsx`)**
- Handles errors in public-facing pages
- Includes helpful links to guide and contact pages

### Styling

All error pages match the website's color scheme:
- **Protected routes**: Blue & indigo gradients
- **Error states**: Red & orange gradients
- **Responsive design**: Mobile-friendly layouts
- **Dark mode**: Full dark theme support
- **Animations**: Smooth entrance and interactive animations

---

## ⏳ Loading Pages

### Overview

Loading pages provide visual feedback while content is being prepared.

### Types

#### 1. **Protected Area Loading (`src/app/(protected)/loading.jsx`)**
- Shows animated spinner while loading protected routes
- Animated skeleton placeholder bars
- Gradient background matching protected routes

#### 2. **Open Area Loading (`src/app/(open)/loading.jsx`)**
- Loading state for public pages
- Same smooth animations and design language

### Features

- Rotating loader icon
- Pulsing skeleton elements
- Smooth animations with Framer Motion
- Dark mode support

---

## 404 & Unauthorized Pages

### 404 Not Found (`src/app/(protected)/not-found.jsx`, `src/app/(open)/not-found.jsx`)

Displays when users navigate to non-existent routes:
- Large "404" heading with animation
- Helpful suggestions for navigation
- Quick links to common pages
- "Go Back" and "Go Home" buttons

### Unauthorized Access (`src/app/(protected)/unauthorized.jsx`)

Displays when users try to access resources their role doesn't permit:
- Shows user's current role and permissions
- Explains why access was denied
- Suggests next steps (contact admin, etc.)
- Role-specific color coding for visual clarity

---

## 🔐 Role-Based Access Control

### Overview

RBAC restricts access to routes and API endpoints based on user roles. The system includes:
- **6 User Roles**: admin, dg-office, fee-office, manager, tutor, student
- **Middleware Protection**: Enforced at request level
- **API Protection**: Helper utilities for route handlers
- **Audit Logging**: Track access attempts

### Role-to-Route Mapping

```javascript
{
  admin: ["/admin"],
  "dg-office": ["/dg-office"],
  "fee-office": ["/fee-office"],
  manager: ["/manager"],
  tutor: ["/tutor"],
  student: ["/student"]
}
```

### Public Routes (No Auth Required)

```javascript
[
  "/login",
  "/register",
  "/",
  "/about",
  "/contact",
  "/guide",
  "/unauthorized"
]
```

---

## 🛡️ Middleware Configuration

### Location
`src/middleware.js`

### How It Works

1. **Check if route is public** → Allow through
2. **Check for auth token** → Redirect to login if missing
3. **Verify token** → Check JWT signature and expiration
4. **Check user role** → Verify user can access route
5. **Return response** → Allow or redirect

### Key Features

- **Token Verification**: Uses JWT with jose library
- **Role Enforcement**: Redirects unauthorized users to their role's dashboard
- **API Protection**: Returns 403 Forbidden for unauthorized API access
- **Token Expiration**: Handles expired tokens by redirecting to login
- **Error Handling**: Gracefully handles middleware errors

### Configuration Options

```javascript
// Modify role-to-route mapping
const roleRoutes = {
  admin: ["/admin"],
  // Add new roles/routes here
};

// Modify public routes
const publicRoutes = ["/login", "/register", "/"];

// Modify API routes
const protectedApiRoutes = {
  admin: ["/api/admin"],
  // Add API routes here
};
```

---

## 📡 API Route Protection

### RBAC Utility Functions

All functions are in `src/lib/rbac.js`

#### 1. **`protectRoute(request, requiredRoles)`**

The main function for protecting API routes. It will:
- Extract and verify the JWT token
- Check if user has required role(s)
- Return user object or error response

**Usage:**
```javascript
import { protectRoute } from "@/lib/rbac";

export async function GET(request) {
  // Protect route - only admin can access
  const { user, response } = await protectRoute(request, "admin");
  
  if (response) {
    return response; // Returns error response if unauthorized
  }

  // Your logic here - user is verified and has correct role
  return NextResponse.json({ data: "..." });
}
```

#### 2. **`verifyAuth(token)`**

Verify JWT token independently.

```javascript
const { user, error } = await verifyAuth(token);
if (error) {
  // Handle error
}
```

#### 3. **`hasRole(userRole, requiredRoles)`**

Check if user has required role.

```javascript
if (hasRole(user.role, ["admin", "manager"])) {
  // User has one of the required roles
}
```

#### 4. **`canAccessRoute(userRole, pathname)`**

Check if role can access a specific route.

```javascript
if (canAccessRoute(user.role, "/admin")) {
  // User can access /admin
}
```

#### 5. **Response Helpers**

Generate standardized error responses:

```javascript
// Unauthorized (401)
unauthorizedResponse("Authentication required", 401)

// Forbidden (403)
forbiddenResponse("You don't have permission")

// Not Found (404)
notFoundResponse("Resource not found")
```

#### 6. **`logAccessAttempt(userId, action, resource, success, reason)`**

Log access attempts for audit trail. Currently logs to console; implement your own logging service.

```javascript
await logAccessAttempt(
  user.id,
  "DELETE_USER",
  "/admin/users/123",
  false,
  "Insufficient permissions"
);
```

---

## 💡 Usage Examples

### Example 1: Protect an Admin-Only API Route

File: `src/app/api/admin/settings/route.js`

```javascript
import { protectRoute } from "@/lib/rbac";

export async function GET(request) {
  const { user, response } = await protectRoute(request, "admin");

  if (response) return response;

  // Admin-only logic here
  return NextResponse.json({
    systemSettings: { /* ... */ }
  });
}
```

### Example 2: Allow Multiple Roles

```javascript
export async function POST(request) {
  // Manager, admin, and fee-office can access
  const { user, response } = await protectRoute(request, [
    "admin",
    "manager",
    "fee-office"
  ]);

  if (response) return response;

  // Your logic
  return NextResponse.json({ success: true });
}
```

### Example 3: Custom Middleware in Page Components

File: `src/app/(protected)/admin/dashboard/page.jsx`

```javascript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        
        const data = await res.json();
        
        // Check role manually if needed
        if (data.user.role !== "admin") {
          router.push("/unauthorized");
          return;
        }
        
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Admin Dashboard</div>;
}
```

### Example 4: Error Boundary in Layout

The error page is automatically handled by Next.js error boundaries. Pages automatically catch errors and display the error page:

```javascript
"use client"

export default function SomeLayout({ children }) {
  return (
    <div>
      {/* Error page will automatically render when children throw */}
      {children}
    </div>
  );
}
```

---

## 🎨 Customization

### Change Colors

Edit error pages to use your brand colors:

```jsx
// In error.jsx
const bgColor = "gradient-to-br from-purple-600 to-pink-600";
// Change class names to match your Tailwind palette
```

### Add New Roles

1. Update `src/middleware.js`:
```javascript
const roleRoutes = {
  // ... existing roles
  "new-role": ["/new-role"],
};
```

2. Update `src/lib/rbac.js`:
```javascript
const roleRoutes = {
  // ... existing roles
  "new-role": ["/new-role"],
};

const dashboards = {
  // ... existing dashboards
  "new-role": "/new-role",
};
```

3. Create new role layout and pages in `src/app/(protected)/new-role/`

### Change Public Routes

Edit `src/middleware.js` and update the `publicRoutes` array to add/remove public pages.

---

## 🔍 Testing

### Test Unauthorized Access

1. Log in as a `student`
2. Try to access `/admin`
3. Should redirect to `/student` (unauthorized)

### Test Expired Token

1. Wait for token to expire (or manually modify in browser storage)
2. Try to access protected route
3. Should redirect to `/login`

### Test Missing Authentication

1. Clear all cookies
2. Try to access protected route
3. Should redirect to `/login` with callback URL

---

## 📝 Environment Variables

Required in `.env.local`:

```env
JWT_SECRET=your-secret-key-change-in-production
```

---

## 🚀 Best Practices

1. **Always use `protectRoute()` in API routes** - Don't rely on middleware alone
2. **Log access attempts** - Especially for sensitive operations
3. **Use role arrays** - For flexibility in permission management
4. **Clear error messages** - Help users understand what happened
5. **Test role transitions** - Verify users can't escalate privileges
6. **Keep tokens short-lived** - Reduces security risk of token theft
7. **Use HTTPS in production** - Tokens should always travel over encrypted connections

---

## 🐛 Troubleshooting

### User redirects to wrong dashboard

Check `roleRoutes` configuration in middleware and that user role is set correctly.

### Error page infinite loop

Ensure error pages don't throw errors themselves. Check browser console.

### 403 API errors

Verify:
- JWT token is valid
- User role matches required roles
- `protectRoute()` is called with correct role

### Dark mode not working on error pages

Add Tailwind dark class to root element when toggling theme.

---

## 📚 Related Files

- `src/middleware.js` - Main middleware configuration
- `src/lib/rbac.js` - RBAC utility functions
- `src/app/(protected)/error.jsx` - Protected area errors
- `src/app/(open)/error.jsx` - Public area errors
- `src/app/error.jsx` - Global errors
- `src/app/(protected)/unauthorized.jsx` - Unauthorized handler
- `src/app/api/example/protected/route.js` - Example protected API

---

Generated: March 2, 2026
