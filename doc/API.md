# API Documentation

Complete reference for E-Enrollment system API endpoints, authentication, and request/response formats.

---

## 🌐 API Overview

### Base Information

| Property | Value |
|----------|-------|
| **Base URL** | `http://localhost:3000` (dev) |
| **Production URL** | `https://eeform.vercel.app` |
| **API Version** | v1.0 |
| **Authentication** | JWT (Cookies) |
| **Content-Type** | `application/json` |
| **Response Format** | JSON |

### Authentication

All protected endpoints require a valid JWT token in cookies:

```javascript
// Token automatically sent by browser in cookies
// Cookie name: "token"
```

**Unprotected Routes:**
- POST `/api/auth/login`
- POST `/api/auth/register`
- All public routes

---

## 🔑 Authentication Endpoints

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Purpose**: Authenticate user and create session

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@example.com",
    "name": "Ahmed Hassan",
    "role": "student",
    "userType": "student"
  },
  "message": "Login successful"
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

**Error Scenarios**:
| Status | Error | Cause |
|--------|-------|-------|
| 400 | VALIDATION_ERROR | Missing email or password |
| 401 | UNAUTHORIZED | Invalid email/password |
| 404 | NOT_FOUND | User account doesn't exist |

---

### 2. Register

**Endpoint**: `POST /api/auth/register`

**Purpose**: Create new user account

**Request Body**:
```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "securePass123",
  "userType": "student",
  "registrationNumber": "BCS-001-001",
  "cnic": "12345-1234567-1"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "ahmed@example.com",
    "name": "Ahmed Hassan",
    "role": "student"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email already registered"
}
```

**Required Fields**:
- `name`: Full name (string, required)
- `email`: Valid email (string, required, unique)
- `password`: Min 6 characters (string, required)
- `userType`: "student" or "staff" (enum, required)
- `cnic`: CNIC number (string, required)
- `registrationNumber`: Student ID (string, optional for staff)

---

### 3. Logout

**Endpoint**: `POST /api/auth/logout`

**Purpose**: Clear session and remove JWT token

**Request Body**: Empty

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Verify Role

**Endpoint**: `GET /api/auth/verify-role`

**Purpose**: Verify current user's role and permissions

**Request**: No body required

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@example.com",
    "name": "Ahmed Hassan",
    "role": "student",
    "userType": "student",
    "department": "Computer Science",
    "isActive": true
  },
  "permissions": ["view_own_forms", "submit_forms"],
  "message": "User verified"
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Not authenticated"
}
```

---

## 👤 User Management Endpoints (Admin Only)

### 1. Create User

**Endpoint**: `POST /api/admin/users`

**Purpose**: Admin creates new user account

**Access**: Admin only

**Request Body**:
```json
{
  "name": "Dr. Muhammad Ali",
  "email": "dr.ali@university.edu",
  "password": "tempPassword123",
  "userType": "staff",
  "role": "tutor",
  "department": "Computer Science",
  "cnic": "12345-1234567-1"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Dr. Muhammad Ali",
    "email": "dr.ali@university.edu",
    "role": "tutor"
  }
}
```

---

### 2. Get All Users

**Endpoint**: `GET /api/admin/users?role=tutor&department=CS&page=1&limit=20`

**Purpose**: List all system users with filters

**Access**: Admin only

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role (student, admin, tutor, etc.) |
| `department` | string | Filter by department |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search by name or email |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "role": "student",
      "department": "Computer Science",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 3. Update User

**Endpoint**: `PATCH /api/admin/users/:userId`

**Purpose**: Update user information

**Access**: Admin only

**Request Body**:
```json
{
  "name": "Ahmed Hassan Updated",
  "isActive": true,
  "department": "Data Science"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Hassan Updated",
    "department": "Data Science"
  }
}
```

---

### 4. Delete User

**Endpoint**: `DELETE /api/admin/users/:userId`

**Purpose**: Delete user account

**Access**: Admin only

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 💰 Fee Verification Endpoints

### 1. Upload Fee Receipt

**Endpoint**: `POST /api/fee/upload`

**Purpose**: Student uploads fee payment receipt

**Access**: Student role

**Request** (multipart/form-data):
```
FormData:
  - file: (binary) Receipt image/PDF
  - registrationNumber: "BCS-001-001"
  - amount: 25000
  - paymentMethod: "Bank Transfer"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Receipt uploaded successfully",
  "fee": {
    "id": "507f1f77bcf86cd799439013",
    "registrationNumber": "BCS-001-001",
    "receiptUrl": "https://cloudinary.com/...",
    "verificationStatus": "PENDING",
    "createdAt": "2024-04-01T10:30:00Z"
  }
}
```

---

### 2. Verify Fee Payment

**Endpoint**: `PATCH /api/fee/verification/:feeId`

**Purpose**: Fee officer verifies student payment

**Access**: Fee-office role

**Request Body**:
```json
{
  "verificationStatus": "VERIFIED",
  "remarks": "Payment verified from bank statement"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Fee verified successfully",
  "fee": {
    "id": "507f1f77bcf86cd799439013",
    "verificationStatus": "VERIFIED",
    "verifiedBy": "507f1f77bcf86cd799439012",
    "verifiedDate": "2024-04-02T09:15:00Z"
  }
}
```

---

### 3. Get Fee Status

**Endpoint**: `GET /api/fee/status/:registrationNumber`

**Purpose**: Check if student fee is verified

**Access**: Student, Fee-office

**Response (200 OK)**:
```json
{
  "success": true,
  "feeVerified": true,
  "verification": {
    "verificationStatus": "VERIFIED",
    "verifiedDate": "2024-04-02T09:15:00Z",
    "amount": 25000,
    "receiptUrl": "https://cloudinary.com/..."
  }
}
```

**Response (200 OK - Not Verified)**:
```json
{
  "success": true,
  "feeVerified": false,
  "message": "Fee not verified yet"
}
```

---

### 4. List All Fees (Fee-Office)

**Endpoint**: `GET /api/fee?status=PENDING&page=1&limit=20`

**Purpose**: Fetch fees needing verification

**Access**: Fee-office role

**Query Parameters**:
| Parameter | Description |
|-----------|-------------|
| `status` | PENDING, VERIFIED, REJECTED |
| `page` | Pagination page |
| `limit` | Items per page |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "registrationNumber": "BCS-001-001",
      "studentName": "Ahmed Hassan",
      "amount": 25000,
      "verificationStatus": "PENDING",
      "createdAt": "2024-04-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

---

## 📋 Form (UG-1) Endpoints

### 1. Submit Form

**Endpoint**: `POST /api/student/ugform/submit`

**Purpose**: Student submits UG-1 enrollment form

**Access**: Student role (must have verified fee)

**Request Body**:
```json
{
  "registrationNumber": "BCS-001-001",
  "degreeId": "507f1f77bcf86cd799439020",
  "semester": "Spring 2024",
  "selectedSubjects": [
    {
      "subjectId": "507f1f77bcf86cd799439021",
      "code": "CS101",
      "name": "Introduction to Programming",
      "creditHours": 3,
      "totalCredits": 3,
      "theoryHours": 3,
      "practicalHours": 0
    },
    {
      "subjectId": "507f1f77bcf86cd799439022",
      "code": "CS102",
      "name": "Data Structures",
      "creditHours": 3,
      "totalCredits": 3,
      "theoryHours": 2,
      "practicalHours": 3
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "form": {
    "id": "507f1f77bcf86cd799439030",
    "studentId": "507f1f77bcf86cd799439011",
    "formStatus": "PENDING_TUTOR",
    "totalCredits": 6,
    "createdAt": "2024-04-01T10:30:00Z"
  }
}
```

**Error (402 Payment Required)**:
```json
{
  "success": false,
  "error": "PAYMENT_NOT_VERIFIED",
  "message": "Fee must be verified before submitting form"
}
```

---

### 2. Get Form Status

**Endpoint**: `GET /api/student/ugform/:formId`

**Purpose**: Fetch form details and current status

**Access**: Student (own form), Tutor, Manager

**Response (200 OK)**:
```json
{
  "success": true,
  "form": {
    "id": "507f1f77bcf86cd799439030",
    "studentName": "Ahmed Hassan",
    "registrationNumber": "BCS-001-001",
    "formStatus": "PENDING_TUTOR",
    "totalCredits": 6,
    "selectedSubjects": [
      {
        "code": "CS101",
        "name": "Introduction to Programming",
        "creditHours": 3
      }
    ],
    "createdAt": "2024-04-01T10:30:00Z",
    "assignedTutor": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Dr. Muhammad Ali"
    }
  }
}
```

---

### 3. Tutor Sign Form

**Endpoint**: `PATCH /api/tutor/sign/:formId`

**Purpose**: Tutor reviews and digitally signs form

**Access**: Tutor role

**Request Body**:
```json
{
  "approval": true,
  "signature": "digital-signature-data-base64",
  "remarks": "Form reviewed and approved"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Form signed successfully",
  "form": {
    "id": "507f1f77bcf86cd799439030",
    "formStatus": "PENDING_MANAGER",
    "tutorSignature": "signature-proof",
    "tutorSignedDate": "2024-04-02T11:00:00Z"
  }
}
```

**Response (Rejection)**:
```json
{
  "success": true,
  "message": "Form rejected",
  "form": {
    "id": "507f1f77bcf86cd799439030",
    "formStatus": "REJECTED",
    "remarks": "Subject selection exceeds credit limit"
  }
}
```

---

### 4. Manager Approve Form

**Endpoint**: `PATCH /api/manager/approval/:formId`

**Purpose**: Manager reviews and approves final enrollment

**Access**: Manager role

**Request Body**:
```json
{
  "approval": true,
  "remarks": "Enrollment approved"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Form approved successfully",
  "form": {
    "id": "507f1f77bcf86cd799439030",
    "formStatus": "APPROVED",
    "pdfUrl": "https://cloudinary.com/ug-form-001.pdf",
    "managerApprovalDate": "2024-04-02T14:30:00Z"
  }
}
```

---

### 5. Download PDF

**Endpoint**: `GET /api/manager/pdf/:formId`

**Purpose**: Generate and download enrollment PDF

**Access**: Student (own form), Manager, Tutor

**Response (200 OK)**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="enrollment-BCS-001-001.pdf"

[PDF Binary Data]
```

---

## 📚 Degree & Subject Endpoints (Admin Only)

### 1. Create Degree

**Endpoint**: `POST /api/admin/degree`

**Purpose**: Admin creates new degree program

**Access**: Admin role

**Request Body**:
```json
{
  "name": "Bachelor of Computer Science",
  "code": "BCS",
  "duration": 4,
  "totalCredits": 130,
  "department": "Computer Science"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "degree": {
    "id": "507f1f77bcf86cd799439040",
    "name": "Bachelor of Computer Science",
    "code": "BCS"
  }
}
```

---

### 2. Create Subjects

**Endpoint**: `POST /api/admin/subject`

**Purpose**: Admin adds subjects to degree scheme

**Access**: Admin role

**Request Body**:
```json
{
  "code": "CS101",
  "name": "Introduction to Programming",
  "creditHours": 3,
  "theoryHours": 2,
  "practicalHours": 1,
  "semester": 1,
  "degreeId": "507f1f77bcf86cd799439040"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "subject": {
    "id": "507f1f77bcf86cd799439041",
    "code": "CS101",
    "name": "Introduction to Programming"
  }
}
```

---

## 🏢 Department Endpoints (Admin Only)

### 1. Create Department

**Endpoint**: `POST /api/admin/department`

**Purpose**: Add new department to system

**Access**: Admin role

**Request Body**:
```json
{
  "name": "Computer Science",
  "code": "CS",
  "hod": "Dr. Hassan Ahmad"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "department": {
    "id": "507f1f77bcf86cd799439042",
    "name": "Computer Science",
    "code": "CS"
  }
}
```

---

## ⚠️ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": ["Error for this field"]
  }
}
```

### Common Error Codes & Status Codes

| Status | Error Code | Meaning |
|--------|-----------|---------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | No valid authentication |
| 403 | FORBIDDEN | Authenticated but no permission |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Validation failed |
| 500 | INTERNAL_ERROR | Server error |

### Example Error Response

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

---

## 📊 Status Codes Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Valid token but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Validation failed |
| 500 | Server Error | Unexpected server error |

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'

# Get verified role
curl -X GET http://localhost:3000/api/auth/verify-role \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Submit form
curl -X POST http://localhost:3000/api/student/ugform/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"registrationNumber":"BCS-001-001","degreeId":"...","selectedSubjects":[...]}'
```

### Using Postman

1. Create environment variable `$jwt_token`
2. After login, add to Tests:
   ```javascript
   pm.environment.set("jwt_token", pm.response.json().token);
   ```
3. Use `{{jwt_token}}` in Authorization header

---

## 📚 Related Documentation

- [workflow.md](./workflow.md) — System architecture and data flow
- [roles.md](./roles.md) — User roles and permissions
- [setup.md](./setup.md) — Installation and configuration

---

**Last Updated**: April 2024  
**API Version**: 1.0  
**Authentication**: JWT (Cookies)
