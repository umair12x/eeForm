// app/admin/create-user/page.jsx - Enhanced User Creation
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  UserPlus, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronDown,
  Building2,
  Hash,
  Mail,
  Lock,
  CreditCard
} from "lucide-react"

const initialStudent = {
  name: "",
  registrationNumber: "",
  department: "",
  degree: "",
  role: "student",
  cnic: "",
  password: "",
  userType: "student",
  email: "",
  session: ""
}

const initialStaff = {
  name: "",
  email: "",
  role: "",
  department: "",
  cnic: "",
  password: "",
  userType: "staff",
  phone: "",
  designation: ""
}

export default function CreateUserPage() {
  const router = useRouter()
  const [userType, setUserType] = useState("student")
  const [student, setStudent] = useState(initialStudent)
  const [staff, setStaff] = useState(initialStaff)
  const [departments, setDepartments] = useState([])
  const [degrees, setDegrees] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const data = userType === "student" ? student : staff
  const setData = userType === "student" ? setStudent : setStaff

  useEffect(() => {
    fetchDepartments()
    if (userType === "student") fetchDegrees()
  }, [userType])

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/department")
      const deptData = await res.json()
      setDepartments(deptData)
    } catch (err) {
      console.error("Error fetching departments:", err)
    }
  }

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/admin/degree")
      const degreeData = await res.json()
      setDegrees(degreeData)
    } catch (err) {
      console.error("Error fetching degrees:", err)
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!data.name.trim()) newErrors.name = "Name is required"
    if (!data.cnic.trim()) newErrors.cnic = "CNIC is required"
    if (data.cnic && !/^\d{5}-\d{7}-\d$/.test(data.cnic)) {
      newErrors.cnic = "Invalid CNIC format (XXXXX-XXXXXXX-X)"
    }
    if (!data.password || data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (userType === "student") {
      if (!data.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required"
      if (!data.department) newErrors.department = "Department is required"
    } else {
      if (!data.email.trim()) newErrors.email = "Email is required"
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Invalid email format"
      }
      if (!data.role) newErrors.role = "Role is required"
      if (!data.department) newErrors.department = "Department is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setStudent(initialStudent)
          setStaff(initialStaff)
          router.push("/admin/users")
        }, 1500)
      } else {
        setErrors({ submit: result.message || "Failed to create user" })
      }
    } catch (err) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const staffRoles = [
    { value: "admin", label: "Administrator", description: "Full system access" },
    { value: "dg-office", label: "DG Office", description: "Director General operations" },
    { value: "fee-office", label: "Fee Office", description: "Fee collection & management" },
    { value: "manager", label: "Manager", description: "Department management" },
    { value: "tutor", label: "Tutor", description: "Academic tutoring" },
  ]

  const inputClasses = (error) => `
    w-full bg-white dark:bg-slate-900 border rounded-xl px-4 py-3 pl-11
    transition-all duration-200 outline-none
    ${error 
      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' 
      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
    }
    text-slate-900 dark:text-white placeholder:text-slate-400
  `

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create User</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Add a new student or staff member to the system
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-100">User created successfully!</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Redirecting to users list...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <p className="text-red-900 dark:text-red-100">{errors.submit}</p>
        </div>
      )}

      {/* User Type Toggle */}
      <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl inline-flex mb-8">
        {[
          { type: "student", icon: GraduationCap, label: "Student" },
          { type: "staff", icon: Briefcase, label: "Staff" }
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${userType === type 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Name Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="name"
                  placeholder="Enter full name"
                  value={data.name}
                  onChange={handleChange}
                  className={inputClasses(errors.name)}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* CNIC Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                CNIC <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="cnic"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={data.cnic}
                  onChange={handleChange}
                  className={inputClasses(errors.cnic)}
                />
              </div>
              {errors.cnic && <p className="text-xs text-red-500">{errors.cnic}</p>}
            </div>
          </div>

          {/* Student Specific Fields */}
          {userType === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="registrationNumber"
                    placeholder="e.g., 2022-CS-001"
                    value={student.registrationNumber}
                    onChange={handleChange}
                    className={inputClasses(errors.registrationNumber)}
                  />
                </div>
                {errors.registrationNumber && <p className="text-xs text-red-500">{errors.registrationNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Session
                </label>
                <input
                  name="session"
                  placeholder="e.g., 2022-2026"
                  value={student.session}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="department"
                    value={student.department}
                    onChange={handleChange}
                    className={`${inputClasses(errors.department)} appearance-none`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Degree Program
                </label>
                <select
                  name="degree"
                  value={student.degree}
                  onChange={handleChange}
                  className={`${inputClasses()} appearance-none`}
                >
                  <option value="">Select Degree</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Staff Specific Fields */}
          {userType === "staff" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="user@university.edu.pk"
                    value={staff.email}
                    onChange={handleChange}
                    className={inputClasses(errors.email)}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="role"
                    value={staff.role}
                    onChange={handleChange}
                    className={`${inputClasses(errors.role)} appearance-none`}
                  >
                    <option value="">Select Role</option>
                    {staffRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="department"
                    value={staff.department}
                    onChange={handleChange}
                    className={`${inputClasses(errors.department)} appearance-none`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Designation
                </label>
                <input
                  name="designation"
                  placeholder="e.g., Assistant Professor"
                  value={staff.designation}
                  onChange={handleChange}
                  className={inputClasses()}
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-slate-800">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter secure password"
                value={data.password}
                onChange={handleChange}
                className={`${inputClasses(errors.password)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Must be at least 6 characters long
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : userType === 'student'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating {userType === 'student' ? 'Student' : 'Staff'}...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create {userType === 'student' ? 'Student' : 'Staff'} Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}