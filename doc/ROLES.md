# User Roles & Responsibilities

Comprehensive guide to user roles, permissions, responsibilities, and contribution guidelines for the E-Enrollment system.

---

## 👥 User Roles Overview

E-Enrollment operates with **6 specialized roles**, each with distinct responsibilities and login dashboards. This document details each role's capabilities, workflows, and contribution guidelines.

```
┌─────────────────────────────────────────────────────────┐
│              E-ENROLLMENT ROLE HIERARCHY                 │
├─────────────────────────────────────────────────────────┤
│  ADMIN (System Administrator)                           │
│  ↓ Manages users, departments, degrees                  │
│                                                          │
│  DG-OFFICE (Deputy General Office)                      │
│  ↓ Administrative oversight                             │
│                                                          │
│  MANAGER (Enrollment Manager)                           │
│  ↓ Approves forms                                       │
│                                                          │
│  TUTOR (Faculty Review Officer)                         │
│  ↓ Reviews and signs forms                              │
│                                                          │
│  FEE-OFFICE (Fee Verification Officer)                 │
│  ↓ Verifies payments                                    │
│                                                          │
│  STUDENT (Undergraduate Applicant)                      │
│  ↓ Submits enrollment forms                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Role Details & Permissions

### 1. ADMIN - System Administrator

**Access Level**: Full system access to all modules

#### Dashboard
- URL: `/admin`
- Features:
  - User management (create, edit, delete accounts)
  - Department management (add/edit departments)
  - Degree program setup (create degrees and schemes)
  - Subject catalog management
  - System configuration and settings
  - View system statistics and logs

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **User Account Creation** | Create new user accounts for staff and students | As needed |
| **Role Assignment** | Assign appropriate roles (tutor, manager, fee-office) | During account creation |
| **Degree Program Setup** | Configure undergraduate degree programs | Semester start |
| **Subject Management** | Add/update course subjects and credit hours | Semester start |
| **Department Maintenance** | Create and manage departments | Ad-hoc |
| **Access Control** | Grant/revoke user permissions | As needed |
| **System Backups** | Monitor database integrity (if applicable) | Monthly |
| **Troubleshooting** | Resolve system issues and escalate technical problems | As needed |

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Users | ✅ | ✅ | ✅ | ✅ |
| Degrees | ✅ | ✅ | ✅ | ✅ |
| Departments | ✅ | ✅ | ✅ | ✅ |
| Subjects | ✅ | ✅ | ✅ | ✅ |
| All Forms | ❌ | ✅ | ❌ | ❌ |
| All Fees | ❌ | ✅ | ❌ | ❌ |

#### Workflow Example

```
1. New Semester Begins
2. Admin logs in → Navigate to /admin/degrees
3. Create new degree program:
   - Name: "Bachelor of Computer Science"
   - Duration: 4 years
   - Total Credits: 130
4. Add subjects for each semester
5. Activate semester in system
6. Create tutor and manager accounts
7. System ready for student enrollment
```

#### Required Credentials

```json
{
  "name": "Muhammad Ali",
  "email": "admin@university.edu.pk",
  "password": "SecureAdminPass123",
  "role": "admin",
  "userType": "staff"
}
```

---

### 2. DG-OFFICE - Deputy General Office

**Access Level**: Administrative oversight and reporting

#### Dashboard
- URL: `/dg-office`
- Features:
  - View all enrollments and forms
  - Monitor system activity
  - Generate reports
  - View fee collection status
  - Access approval timelines

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **Oversight** | Monitor overall system operations | Daily |
| **Report Generation** | Generate enrollment and fee reports | Weekly/Monthly |
| **Issue Resolution** | Resolve escalated issues | As needed |
| **Compliance Checking** | Ensure proper procedures followed | Weekly |
| **Performance Monitoring** | Track system uptime and performance | Weekly |

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Users | ❌ | ✅ | ❌ | ❌ |
| Forms | ❌ | ✅ | ❌ | ❌ |
| Fees | ❌ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |

---

### 3. MANAGER - Enrollment Manager

**Access Level**: Form approval and enrollment finalization

#### Dashboard
- URL: `/manager`
- Features:
  - View pending forms awaiting approval
  - Review tutor-signed forms
  - Approve/reject enrollments
  - Generate enrollment PDFs
  - View form history and status
  - Download enrollment certificates

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **Form Review** | Review tutor-approved forms | Daily |
| **Final Approval** | Approve or reject enrollments | Daily |
| **PDF Generation** | Generate official enrollment documents | When approving |
| **Feedback** | Provide rejection reasons when needed | As needed |
| **Enrollment Finalization** | Confirm and finalize student enrollments | Daily |
| **Document Archival** | Maintain enrollment records | Continuous |

#### Workflow

```
MANAGER DAILY WORKFLOW:

1. Login to system (/manager)
2. View "Pending Approvals" dashboard
3. For each form:
   a) Review student details
   b) Check tutor signature
   c) Verify all information complete
   d) Decision: Approve or Reject
4. If Approved:
   a) Click "Approve"
   b) System generates PDF
   c) Student receives download link
   d) Form marked as "COMPLETED"
5. If Issues:
   a) Click "Reject with feedback"
   b) Specify reason
   c) Form returned to student
   d) Student can resubmit
```

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Forms | ❌ | ✅ | ✅ | ❌ |
| Approvals | ✅ | ✅ | ✅ | ❌ |
| PDF Generation | ✅ | ✅ | ❌ | ❌ |

#### Approval Criteria Checklist

Before approving, manager should verify:

- [ ] All required form fields completed
- [ ] Tutor digital signature present
- [ ] Student fee verification confirmed
- [ ] Subject selections valid and within credit limits
- [ ] Student name and CNIC match records
- [ ] No duplicate subject selections
- [ ] Semester and degree information correct

---

### 4. TUTOR - Faculty Review Officer

**Access Level**: Form review and digital signing

#### Dashboard
- URL: `/tutor`
- Features:
  - View assigned student forms
  - Review form details and subject selections
  - Digitally sign approved forms
  - Reject forms with feedback
  - Track form status updates

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **Form Review** | Examine submitted student forms | Daily |
| **Academic Validation** | Verify subject selection appropriateness | Per form |
| **Digital Signing** | Sign approved forms with digital signature | Per form |
| **Feedback** | Provide constructive feedback on rejections | As needed |
| **Timeline Compliance** | Approve/review within 2-3 business days | Ongoing |

#### Workflow

```
TUTOR FORM REVIEW PROCESS:

1. Login to system (/tutor)
2. Dashboard shows "Pending Reviews" count
3. Select form from pending list
4. Review form details:
   ├─ Student information
   ├─ Selected subjects
   ├─ Total credit hours
   └─ Any special requests
5. Academic Assessment:
   ├─ Prerequisites met?
   ├─ Subject level appropriate?
   ├─ Credit load reasonable?
   └─ Any conflicts or concerns?
6. Decision:
   a) APPROVE:
      - Click "Approve & Sign"
      - Provide digital signature
      - Form moves to manager
      - System sends notification email
   b) REJECT:
      - Click "Reject Form"
      - Specify detailed reason
      - Student gets feedback notification
      - Form returned for revision
```

#### Approval Criteria

Tutors should consider:

| Criterion | Check |
|-----------|-------|
| **Prerequisites** | Student has completed prerequisite courses |
| **Credit Load** | Total credits within limits (12-18 per semester) |
| **Subject Level** | Courses match student's academic standing |
| **Graduation Track** | Selections align with degree progress |
| **Conflicts** | No schedule conflicts reported |
| **Academic Standing** | Student maintains good academic standing |

#### Digital Signature Process

```javascript
// Tutor signs with:
// - Name and title
// - Date and time
// - Digital signature (stored in database)
// - Cannot be modified after signing

Example stored signature:
{
  tutorId: "507f1f77bcf86cd799439012",
  tutorName: "Dr. Muhammad Ali",
  signature: "digital-signature-hash-12345",
  signedDate: "2024-04-02T11:30:00Z",
  validated: true
}
```

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Forms (assigned) | ❌ | ✅ | ✅ | ❌ |
| Signatures | ✅ | ✅ | ❌ | ❌ |
| Feedback | ✅ | ✅ | ✅ | ❌ |

---

### 5. FEE-OFFICE - Fee Verification Officer

**Access Level**: Fee verification and payment confirmation

#### Dashboard
- URL: `/fee-office`
- Features:
  - View pending fee verifications
  - Upload and verify payment receipts
  - Access fee payment records
  - Mark fees as verified/rejected
  - Track verification timelines
  - Generate fee collection reports

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **Receipt Verification** | Verify student payment receipts | Upon submission |
| **Bank Record Checking** | Cross-check with institutional bank records | Daily |
| **Fee Approval** | Mark fees as verified | Per verification |
| **Rejection Handling** | Request corrections for invalid payments | As needed |
| **Record Keeping** | Maintain accurate payment records | Continuous |
| **Timeline Compliance** | Complete verification within 1-2 business days | Ongoing |

#### Workflow

```
FEE VERIFICATION WORKFLOW:

1. Fee Officer logs in (/fee-office)
2. Dashboard shows:
   ├─ Pending verifications (count)
   ├─ Recent payments (timeline)
   └─ Rejected fees (needing correction)
3. Select pending fee verification
4. Review payment details:
   ├─ Student name and registration #
   ├─ Amount paid
   ├─ Payment method (bank transfer, check)
   ├─ Receipt number
   ├─ Payment date
   └─ Uploaded receipt (image/PDF)
5. Verification process:
   a) Check uploaded receipt
   b) Cross-reference bank records
   c) Verify amount and date match
   d) Confirm receipt authenticity
6. Decision:
   a) VERIFY:
      - Click "Verify Payment"
      - Add remarks (e.g., "Verified with bank statement")
      - Fee marked as VERIFIED
      - Student can now submit forms
      - Automatic notification email
   b) REJECT:
      - Click "Reject Verification"
      - Specify reason
      - Request corrected receipt
      - Student notified with instructions
```

#### Verification Rules

| Scenario | Action |
|----------|--------|
| Amount matches fee | ✅ Verify |
| Amount less than required | ❌ Reject - Ask for full payment |
| Receipt unclear/unreadable | ❌ Reject - Request clearer copy |
| Date outside semester | ⚠️ Query - Check with admin |
| Duplicate payment from same student | ❌ Reject - Inform student |
| Payment from different person | ❌ Reject - Name must match |

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Fees | ❌ | ✅ | ✅ | ❌ |
| Verification | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |

#### Sample Fee Record

```json
{
  "registrationNumber": "BCS-001-001",
  "studentName": "Ahmed Hassan",
  "amount": 25000,
  "paymentMethod": "Bank Transfer",
  "receiptNumber": "TRF-2024-001234",
  "receiptUrl": "https://cloudinary.com/receipt-001.jpg",
  "verificationStatus": "PENDING",
  "submittedDate": "2024-03-28T10:30:00Z",
  "verificationDeadline": "2024-03-30T23:59:59Z"
}
```

---

### 6. STUDENT - Undergraduate Applicant

**Access Level**: Self-service enrollment

#### Dashboard
- URL: `/student`
- Features:
  - Upload fee payment receipt
  - Check fee verification status
  - Submit UG-1 enrollment form
  - Track form status through workflow
  - Download enrollment PDF (when approved)
  - View enrollment history

#### Key Responsibilities

| Task | Description | Frequency |
|------|-------------|-----------|
| **Fee Payment** | Pay semester fee to university account | Once per semester |
| **Document Upload** | Upload fee receipt for verification | Once per semester |
| **Form Submission** | Submit UG-1 form after fee verification | Once per semester |
| **Subject Selection** | Choose appropriate subjects and courses | Once per semester |
| **Form Tracking** | Monitor form status through approval process | Weekly |

#### Complete Enrollment Journey

```
STUDENT ENROLLMENT TIMELINE:

┌─ WEEK 1: FEE PAYMENT & VERIFICATION ─────────────┐
│                                                    │
│ Day 1: Student logs in to system                  │
│        ├─ Views "Fee Payment Required"             │
│        └─ Gets bank account details               │
│                                                    │
│ Day 2-3: Student pays fee at bank                 │
│          └─ Gets receipt/confirmation             │
│                                                    │
│ Day 3: Student uploads receipt                    │
│        ├─ Navigates to /student/fee-verification  │
│        ├─ Uploads receipt image/PDF               │
│        └─ System shows "Pending Verification"     │
│                                                    │
│ Day 4-5: Fee Officer verifies                     │
│          └─ Marks as "VERIFIED"                   │
│          └─ Student receives email confirmation   │
│                                                    │
└────────────────────────────────────────────────────┘

┌─ WEEK 2: FORM SUBMISSION ──────────────────────────┐
│                                                     │
│ Day 6: Student logs in                             │
│        ├─ Sees fee verified ✅                     │
│        └─ New option: "Submit Enrollment Form"    │
│                                                    │
│ Day 6-7: Student completes form                   │
│          ├─ Selects degree program                │
│          ├─ Chooses semester                       │
│          ├─ Selects courses/subjects              │
│          │  (system validates credit hours)       │
│          ├─ Reviews selections                    │
│          └─ Submits form                          │
│                                                    │
│ Day 7: System sends emails                        │
│        ├─ Confirmation to student                 │
│        └─ Review request to assigned tutor        │
│                                                    │
└────────────────────────────────────────────────────┘

┌─ WEEK 3-4: TUTOR REVIEW ─────────────────────────┐
│                                                   │
│ Day 8-11: Tutor reviews form                     │
│           ├─ Checks subject selections           │
│           ├─ Verifies prerequisites met          │
│           └─ Signs (approve) or rejects          │
│                                                   │
│ Day 12: If approved                              │
│         └─ Form moves to manager                 │
│         └─ Student sees: "Awaiting Approval"     │
│                                                   │
│ Day 12: If rejected                              │
│         ├─ Student sees: "Rejected with Feedback"│
│         ├─ New option: "Revise and Resubmit"     │
│         └─ Student goes back to subject selection│
│                                                   │
└────────────────────────────────────────────────────┘

┌─ WEEK 4: MANAGER APPROVAL ─────────────────────────┐
│                                                    │
│ Day 13-15: Manager reviews                        │
│            ├─ Final checks                        │
│            ├─ Approves or rejects                 │
│            └─ If approved: PDF generated          │
│                                                    │
│ Day 15: If approved                               │
│         ├─ Student receives email: "APPROVED" ✅ │
│         ├─ "Download Enrollment Certificate" ready│
│         └─ Form status: "COMPLETED"               │
│                                                    │
│ Day 15: If rejected                               │
│         ├─ Student notified with reason           │
│         └─ Can resubmit entire form               │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Student Dashboard Views

**View 1: Enrollment Status Tab**
```
┌─────────────────────────────────────────┐
│ ENROLLMENT STATUS                       │
├─────────────────────────────────────────┤
│ Fee Verification:      ✅ VERIFIED      │
│ Form Submission:       ✅ SUBMITTED     │
│ Tutor Review:          ⏳ IN PROGRESS  │
│ Manager Approval:      ⌛ PENDING       │
│ Certificate Ready:     ❌ NOT READY     │
│                                         │
│ Estimated Completion:  3-5 business days│
└─────────────────────────────────────────┘
```

**View 2: Form Details**
```
Selected Subjects (Semester Spring 2024):
├─ CS101: Programming          (3 credits)
├─ CS102: Data Structures      (3 credits)
├─ CS103: Discrete Mathematics (3 credits)
│
Total Credits: 9/18 (within limits)
Status: Awaiting Tutor Review
```

#### Workflow Restrictions

- ❌ Cannot submit form without fee verification
- ❌ Cannot modify form after submission
- ❌ Must resubmit if rejected
- ✅ Can view status anytime
- ✅ Can download PDF once approved

#### Permissions Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Form | ✅ | ✅ | ❌ | ❌ |
| Own Fee Record | ✅ | ✅ | ❌ | ❌ |
| Other Students Data | ❌ | ❌ | ❌ | ❌ |
| Own PDF | ❌ | ✅ | ❌ | ❌ |

---

## 📋 Contribution Guidelines

### For Solo Developer (Current Setup)

As a solo developer maintaining this system:

#### Daily Tasks
1. **Monitor System Health**
   - Check error logs in Vercel dashboard
   - Verify MongoDB connection status
   - Review pending form count

2. **Respond to Support Requests**
   - Check for user account creation requests
   - Assist with fee verification issues
   - Handle form submission bugs

3. **Data Maintenance**
   - Backup MongoDB regularly
   - Archive old enrollment data
   - Clean up temporary file uploads

#### Weekly Tasks
1. **Backup & Disaster Recovery**
   - Database backup to external storage
   - Document configuration changes
   - Test backup restoration

2. **Performance Review**
   - Check API response times
   - Monitor database query performance
   - Optimize slow queries if needed

3. **Security Audit**
   - Review authentication logs
   - Check for failed login attempts
   - Verify JWT token expiration settings

#### Monthly Tasks
1. **Feature Updates**
   - Review feature requests from admins
   - Plan improvements
   - Test updates locally before production

2. **Documentation Updates**
   - Keep API documentation current
   - Update role responsibilities if changed
   - Document any configuration changes

3. **Database Maintenance**
   - Analyze collection indexes
   - Remove duplicate records if any
   - Optimize MongoDB queries

### For Future Team Expansion

When adding team members:

#### Code Quality
```
1. Code Review Process
   - All changes via pull requests
   - Minimum 1 approval before merge
   - Automated tests in CI/CD

2. Coding Standards
   - Follow existing code style
   - Use consistent naming conventions
   - Document complex logic
```

#### Git Workflow
```
Main branch: Production-ready code

Branching strategy:
├─ feature/description  (New features)
├─ bugfix/description   (Bug fixes)
├─ docs/description     (Documentation)
└─ hotfix/description   (Production fixes)

Commit message format:
[TYPE] Brief description
- TYPE: feat, fix, docs, style, refactor, test
```

#### Communication
- Daily standup (if team)
- Weekly progress updates
- Monthly planning meetings
- Issue tracking via GitHub

---

## 🔄 Permission Matrix Summary

```
                    Admin  DG-Office  Manager  Tutor  Fee-Off  Student
├─ Create Users      ✅      ❌        ❌       ❌      ❌       ❌
├─ View All Forms    ✅      ✅        ✅       ✅      ❌       ❌
├─ Approve Forms     ❌      ❌        ✅       ✅      ❌       ❌
├─ Sign Forms        ❌      ❌        ❌       ✅      ❌       ❌
├─ Verify Fees       ❌      ❌        ❌       ❌      ✅       ❌
├─ Submit Forms      ❌      ❌        ❌       ❌      ❌       ✅
├─ Download PDFs     ✅      ✅        ✅       ✅      ❌       ✅
├─ View Reports      ✅      ✅        ✅       ❌      ✅       ❌
└─ System Config     ✅      ❌        ❌       ❌      ❌       ❌
```

---

## 📞 Support & Questions

**For Role-Specific Issues:**
- Admin: [See setup.md](./setup.md)
- Student: Contact fee office or admin
- Staff: Refer to [workflow.md](./workflow.md)

**For API Details:**
- Check [api.md](./api.md) for endpoint permissions

---

**Last Updated**: April 2024  
**Total Roles**: 6  
**Development Model**: Solo (currently)
