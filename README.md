# E-Enrollment System

**Digitizing Undergraduate Degree Enrollment for University of Agriculture**

Transform paperless enrollment workflows with an integrated online platform that streamlines the journey from fee verification to official document generation.

---

## 🎯 Overview

E-Enrollment is a purpose-built web application designed to modernize the undergraduate degree enrollment process at the University of Agriculture. The system eliminates hardcopy forms, automates verification workflows, and generates official enrollment documents in minutes rather than days.

**Status**: Active Development  
**Current Version**: 0.1.0

---

## ✨ Key Features

- **Admin Panel**: Centralized management of departments, degrees, degree schemes, and user accounts
- **Fee Verification System**: Dedicated fee-office module for validating student payments before form submission
- **Digital Form Submission**: Students submit UG-1 enrollment forms with real-time validation
- **Multi-Stage Approval Workflow**: Tutor review → manager approval → document generation
- **Digital Signatures**: Tutors digitally sign forms using session-authenticated requests
- **PDF Generation**: Automatic generation of enrollment documents in university-approved format
- **Role-Based Access Control (RBAC)**: Six specialized user roles with granular permissions
- **Session-Based Authentication**: Secure, cookie-based session management

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19.1.0, Next.js App Router | UI framework & server-side rendering |
| **Styling** | Tailwind CSS 4.1.14 | Responsive design & utility-first CSS |
| **Backend** | Next.js 15.5.6 (API Routes) | Server-side logic & API endpoints |
| **Database** | MongoDB 9.1.6 (Mongoose ODM) | Document storage & data modeling |
| **Authentication** | JWT + Session Cookies | Secure user authentication |
| **PDF Generation** | jsPDF, html2canvas | Document rendering & export |
| **File Management** | Cloudinary | Image/file storage & CDN |
| **Utilities** | Axios, Framer Motion, Lodash | HTTP client, animations, utilities |
| **Deployment** | Vercel | Serverless hosting & CDN |

---

## 📋 Project Structure

```
eeForm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login & register pages
│   │   ├── (open)/            # Public pages (home, about, contact)
│   │   ├── (protected)/       # Protected routes with RBAC
│   │   │   ├── admin/         # Admin dashboard & management
│   │   │   ├── fee-office/    # Fee verification panel
│   │   │   ├── student/       # Student enrollment forms
│   │   │   ├── tutor/         # Tutor review & signing
│   │   │   └── manager/       # Manager approval dashboard
│   │   └── api/               # API routes (Next.js)
│   │       ├── admin/         # User & system management
│   │       ├── auth/          # Authentication endpoints
│   │       ├── fee/           # Fee verification endpoints
│   │       └── [role]/        # Role-specific endpoints
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Basic UI components (Button, Card, etc.)
│   │   ├── layout/           # Layout components (Navbar, Sidebar)
│   │   └── [Feature]/        # Feature-specific components
│   ├── lib/
│   │   ├── db.js             # MongoDB connection
│   │   └── rbac.js           # Role-based access control utilities
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Fee.js
│   │   ├── UgForm.js
│   │   └── [others]
│   ├── middleware.js         # Next.js middleware (auth, RBAC)
│   └── styles/
├── doc/                      # Documentation
│   ├── README.md            # This file
│   ├── setup.md             # Installation & setup guide
│   ├── workflow.md          # Architecture & data flow
│   ├── api.md               # API endpoint reference
│   └── roles.md             # User roles & responsibilities
├── package.json
└── next.config.mjs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm/pnpm
- MongoDB connection string (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

```bash
# 1. Clone and navigate
cd eeForm

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
# Create .env.local in project root:
JWT_SECRET=your-secret-key-change-in-production
DB_URL=mongodb://localhost:27017/eeformDB
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key

# 4. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

Deploy to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## 📚 Documentation Overview

- **[setup.md](./doc/setup.md)** — Detailed installation, environment configuration, and troubleshooting
- **[workflow.md](./doc/workflow.md)** — System architecture, data flow, and enrollment workflow
- **[api.md](./doc/api.md)** — Complete API endpoint reference with examples
- **[roles.md](./doc/roles.md)** — User roles, responsibilities, and contribution guidelines

---

## 🔐 User Roles

Six specialized roles power the system:

| Role | Primary Responsibility |
|------|----------------------|
| **Admin** | System administration, user & catalog management |
| **Student** | Enrollment form submission after fee verification |
| **Fee Office** | Payment verification and fee record management |
| **Tutor** | Form review and digital signing |
| **Manager** | Final approval and enrollment confirmation |
| **DG Office** | Deputy General administration oversight |

> See [roles.md](./doc/roles.md) for detailed responsibilities.

---

## 🌐 Live Access

| Environment | URL |
|------------|-----|
| Production | TBD (Vercel deployment) |
| Development | http://localhost:3000 |

**Demo Credentials** (development only):
- Admin: contact@example.com / password123
- Student: student@example.com / password123

---

## 📞 Support & Contribution

**Developer**: Solo Development  
**Questions?** Check [workflow.md](./doc/workflow.md) for system architecture or [api.md](./doc/api.md) for endpoint details.

---

## 📄 License

Internal Use - University of Agriculture © 2024

---

**Last Updated**: April 2024  
**Next.js Version**: 15.5.6  
**MongoDB**: Connected to `eeformDB`
