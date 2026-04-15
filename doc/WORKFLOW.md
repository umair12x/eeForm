# System Architecture & Workflow

Complete technical overview of the E-Enrollment system architecture, data flow, and user workflows.

---

## 🏛️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Browser (React Components + Next.js Pages)                 │
│  - Public Pages (Home, About, Contact)                      │
│  - Auth Pages (Login, Register)                             │
│  - Role-Specific Dashboards (Admin, Student, etc.)          │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/HTTPS + Cookies
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  API & AUTH LAYER                            │
│  Next.js API Routes                                         │
│  - Authentication (JWT in Cookies)                          │
│  - RBAC Middleware                                          │
│  - Request Validation                                       │
│  - Error Handling                                           │
└────────────────┬────────────────────────────────────────────┘
                 │ Mongoose ODM
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  MongoDB                                                     │
│  - Users, Degrees, Departments, Fees, Forms                 │
│  - Collections with Validation Schemas                      │
└─────────────────────────────────────────────────────────────┘

EXTERNAL SERVICES:
┌─────────────────────────────────────────────────────────────┐
│  Cloudinary (File Storage) | jsPDF (Document Generation)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Session-Based Authentication with JWT

```
1. LOGIN REQUEST
   ├─ User enters credentials (email/password)
   └─ POST /api/auth/login → {email, password}

2. SERVER VALIDATION
   ├─ Hash password against stored hash (bcryptjs)
   ├─ Verify user exists and active
   └─ Return {success, user, role}

3. TOKEN GENERATION
   ├─ Create JWT with payload: {userId, email, role, userType}
   ├─ Sign JWT using JWT_SECRET
   └─ return token (stored in cookie with 'token' name)

4. COOKIE STORAGE
   ├─ Browser automatically stores cookie
   ├─ Sent with every subsequent request
   └─ Httponly & Secure flags in production

5. PROTECTED ROUTE ACCESS
   ├─ Middleware extracts token from cookies
   ├─ Verifies JWT signature
   ├─ Checks RBAC permissions
   └─ Allow/Deny request based on role
```

### Authentication Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Login Page` | `app/(auth)/login/page.jsx` | User credentials input |
| `Login API` | `app/api/auth/login/route.js` | Credentials validation |
| `Middleware` | `src/middleware.js` | Route protection & RBAC |
| `RBAC Utils` | `src/lib/rbac.js` | Token verification & role checks |
| `Auth Layout` | `app/(auth)/layout.jsx` | Auth pages container |

---

## 🔄 Enrollment Workflow

### Complete Student Enrollment Process

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: STUDENT REGISTRATION                                   │
├────────────────────────────────────────────────────────────────┤
│ • Student registers with Name, Email, CNIC, Registration #    │
│ • Account created with "student" role (inactive initially)    │
│ • Password secured with bcryptjs hashing                       │
└─────────────────┬──────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────────┐
│ STEP 2: FEE VERIFICATION (Fee Office Officer)                 │
├────────────────────────────────────────────────────────────────┤
│ • Student uploads fee payment receipt/screenshot               │
│ • Fee Office verifies payment against university records       │
│ • Creates Fee record: {studentName, amount, status, receipt}   │
│ • Marks fee record as "VERIFIED"                               │
│ • Student cannot proceed without verification ✓               │
└─────────────────┬──────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────────┐
│ STEP 3: UG-1 FORM SUBMISSION (Student)                       │
├────────────────────────────────────────────────────────────────┤
│ • Student accesses form only after fee verification           │
│ • Selects degree, semester, subjects with credit hours        │
│ • Form validation:                                            │
│   - Credit hours within limits (min/max)                       │
│   - All required fields completed                              │
│   - Duplicate subjects prevented                               │
│ • Form submitted with status: "PENDING_TUTOR"                 │
│ • Email notification sent to assigned tutor                   │
└─────────────────┬──────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────────┐
│ STEP 4: TUTOR REVIEW & SIGNING (Tutor)                        │
├────────────────────────────────────────────────────────────────┤
│ • Tutor views submitted form details                          │
│ • Options:                                                     │
│   A) Approve: Reviews subjects, verifies academic validity    │
│   B) Reject: Requests corrections or denies enrollment        │
│ • If approved: Digitally signs the form                       │
│ • Status updated: "PENDING_MANAGER"                           │
│ • Email notification to manager                               │
│ • Signature stored with timestamp                             │
└─────────────────┬──────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────────┐
│ STEP 5: MANAGER APPROVAL (Manager/DG Office)                 │
├────────────────────────────────────────────────────────────────┤
│ • Manager reviews tutor-signed form                           │
│ • Verifies all signatures and information                     │
│ • Options:                                                     │
│   A) Approve: Final enrollment confirmation                   │
│   B) Reject: Returns to student with feedback                 │
│ • If approved: Status = "APPROVED"                            │
│ • Triggers PDF generation                                     │
│ • Email sent to student with PDF download link                │
└─────────────────┬──────────────────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────────────────┐
│ STEP 6: DOCUMENT GENERATION & DOWNLOAD (System)               │
├────────────────────────────────────────────────────────────────┤
│ • PDF generated in official university format                 │
│ • Includes:                                                    │
│   - Student details (name, CNIC, registration #)              │
│   - Selected subjects with credit hours                       │
│   - Tutor signature (digital)                                 │
│   - Manager approval stamp                                    │
│   - Official university header/footer                         │
│ • PDF stored in Cloudinary                                    │
│ • Download link provided to student                           │
│ • Form status: "COMPLETED"                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Frontend ↔ Backend ↔ Database

```
FRONTEND (React Component)
    │
    ├─ User Action: "Submit Form"
    │
    ▼
AXIOS HTTP REQUEST
    │
    ├─ POST /api/student/ugform/submit
    ├─ Headers: {Authorization: Bearer token}
    ├─ Body: {subjects[], degree, semester}
    │
    ▼
NEXT.JS API ROUTE
    │
    ├─ Middleware: verifyAuth() → Extract JWT from cookies
    ├─ RBAC Check: hasRole(user.role, 'student') → false = reject
    ├─ Validation: validateFormData(formData)
    │
    ▼
MONGOOSE OSM
    │
    ├─ Create Document: UgForm.create({...})
    ├─ Validate Schema Rules
    ├─ Insert into MongoDB
    │
    ▼
MONGODB DATABASE
    │
    └─ Store in eeformDB.ugforms collection
    
RESPONSE FLOW (Back to Frontend)
    │
    ├─ API returns: {success: true, formId: "123", status: "PENDING"}
    │
    ▼
FRONTEND STATE UPDATE
    │
    ├─ setState({form: formData})
    ├─ Show success toast notification
    ├─ Redirect to dashboard
    │
    ▼
USER SEES CONFIRMATION
```

---

## 🗂️ Database Schema Structure

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  userType: "student" | "staff",
  email: String,
  registrationNumber: String,
  password: String (hashed),
  role: "student" | "admin" | "tutor" | "fee-office" | "manager" | "dg-office",
  department: String,
  cnic: String,
  degree: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Fee Collection
```javascript
{
  _id: ObjectId,
  registrationNumber: String,
  studentName: String,
  cnic: String,
  degreeProgram: String,
  campus: "main" | "paras" | "toba" | "burewala" | "depalpur",
  degreeMode: "morning" | "evening",
  semesterSeason: String,  // e.g., "Spring 2024"
  feeAmount: Number,
  paymentMethod: String,    // e.g., "Bank Transfer", "Cheque"
  receiptNumber: String,
  receiptFile: String,      // Cloudinary URL
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED",
  verifiedBy: ObjectId,     // Reference to User (fee-office)
  verifiedDate: Date,
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### UgForm Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,      // Reference to User
  registrationNumber: String,
  studentName: String,
  degreeId: ObjectId,       // Reference to Degree
  semesterId: ObjectId,
  selectedSubjects: [{
    subjectId: String,
    code: String,
    name: String,
    creditHours: Number,
    totalCredits: Number,
    theoryHours: Number,
    practicalHours: Number
  }],
  totalCredits: Number,
  formStatus: "PENDING_TUTOR" | "PENDING_MANAGER" | "APPROVED" | "REJECTED",
  tutorId: ObjectId,        // Assigned tutor
  tutorSignature: String,   // Digital signature
  tutorSignedDate: Date,
  managerId: ObjectId,      // Approving manager
  managerApprovalDate: Date,
  pdfUrl: String,           // Cloudinary URL
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛡️ Role-Based Access Control (RBAC)

### Role Hierarchy & Permissions

| Role | Dashboard | Can Create | Can Approve | Can View |
|------|-----------|-----------|-----------|----------|
| **Admin** | `/admin` | Users, Degrees, Departments | - | All data |
| **Student** | `/student` | Forms, Requests | - | Own records |
| **Fee-Office** | `/fee-office` | Fee Records | Fee Verification | All fees |
| **Tutor** | `/tutor` | Signatures | Forms | Assigned forms |
| **Manager** | `/manager` | Approvals | Forms | All forms |
| **DG-Office** | `/dg-office` | - | System | All data |

### Protected Routes Middleware

```javascript
// middleware.js logic:

roleRoutes = {
  admin: ["/admin", "/admin/"],
  student: ["/student", "/student/"],
  fee-office: ["/fee-office", "/fee-office/"],
  tutor: ["/tutor", "/tutor/"],
  manager: ["/manager", "/manager/"],
  "dg-office": ["/dg-office", "/dg-office/"]
}

// When user accesses route:
// 1. Extract role from JWT token
// 2. Check if role matches route
// 3. If matches: Allow (next)
// 4. If not: Redirect to unauthorized page
```

---

## 🔄 API Communication

### Request/Response Pattern

```
EVERY API CALL:

1. CLIENT SENDS
   POST /api/endpoint
   Headers: {Content-Type: application/json}
   Cookies: {token: jwt_token}
   Body: {data}

2. SERVER PROCESSES
   - Extract token from cookies
   - Verify JWT signature
   - Check user role (RBAC)
   - Validate input data
   - Query/modify database
   - Handle errors

3. SERVER RESPONDS
   Success (200):
   {
     "success": true,
     "data": {...data...},
     "message": "Operation successful"
   }
   
   Error (4xx/5xx):
   {
     "success": false,
     "error": "ERROR_CODE",
     "message": "Human-readable error"
   }

4. CLIENT HANDLES
   - Check success flag
   - Update UI with data
   - Show error toast if failed
```

---

## 📋 State Management

### Frontend State Flow

```
Component Level:
├─ useState for form inputs
├─ useState for loading/error states
└─ useState for user session data

Global Context (if needed):
├─ UserContext: Current logged-in user
├─ NotificationContext: Toast messages
└─ FormContext: Shared form data

Data Fetching:
├─ Axios for API calls
├─ useEffect for side effects
└─ React Query patterns (if implemented)
```

---

## 🔄 Form Submission & Status Tracking

### Form Status Lifecycle

```
PENDING_TUTOR
    ↓ (Tutor approves or rejects)
    ├─→ APPROVED by Tutor → PENDING_MANAGER
    └─→ REJECTED by Tutor → Form returned to student

PENDING_MANAGER
    ↓ (Manager approves or rejects)
    ├─→ APPROVED by Manager → COMPLETED (PDF generated)
    └─→ REJECTED by Manager → Form returned to student

COMPLETED
    ├─ PDF available for download
    └─ Enrollment finalized
```

---

## 📧 Notification System

### Email & In-App Notifications

**Email Events:**
- Student registration confirmation
- Fee verification status
- Form submission acknowledgment
- Tutor review completion
- Manager approval/rejection
- PDF ready for download

**In-App Notifications:**
- Toast messages for actions
- Dashboard badges (pending approvals)
- Status timeline visualization

---

## 🔍 Error Handling Strategy

### API Error Responses

```javascript
// Standard error format:
{
  success: false,
  error: "ERROR_CODE",
  message: "User-friendly message",
  details: {...validation errors if any...}
}

Common error codes:
- UNAUTHORIZED: Not authenticated
- FORBIDDEN: Authenticated but no permission
- NOT_FOUND: Resource doesn't exist
- VALIDATION_ERROR: Invalid input data
- INTERNAL_ERROR: Server error
```

---

## 📈 Scalability Considerations

### Performance Optimizations

- **Database Indexing**: Indexes on frequently queried fields (registrationNumber, email)
- **Caching**: Session data cached in cookies
- **Pagination**: Large datasets paginated (forms list, fee list)
- **Lazy Loading**: Components loaded on demand
- **CDN**: Cloudinary for static assets

### Future Scaling

- Implement server-side caching (Redis)
- Database query optimization
- API rate limiting
- Load balancing on Vercel

---

## 🔐 Security Measures

### Implemented Security

| Layer | Measure |
|-------|---------|
| **Authentication** | JWT tokens, bcryptjs password hashing |
| **Authorization** | Role-based middleware checks |
| **Transport** | HTTPS enforced, secure cookies |
| **Validation** | Input validation on server & client |
| **Secrets** | JWT_SECRET in environment variables |
| **CORS** | Configured for trusted origins |

### Best Practices

- Never store sensitive data in localStorage
- Validate all user inputs server-side
- Sanitize file uploads (Cloudinary)
- Rate limit authentication endpoints
- Log security events

---

## 📚 Related Documentation

- [api.md](./api.md) — Complete API endpoint reference
- [roles.md](./roles.md) — User roles and responsibilities
- [setup.md](./setup.md) — Installation and configuration

---

**Last Updated**: April 2024  
**System Version**: 0.1.0  
**Database**: MongoDB (eeformDB)
