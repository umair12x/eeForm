"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Building2,
  GraduationCap,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Fingerprint,
  Phone,
  MapPin,
  BadgeCheck,
  Info
} from "lucide-react"
import ThemeToggle from "@/components/layout/ThemeToggle"

const ROLES = [
  {
    value: "admin",
    label: "System Administrator",
    description: "Full system access with user management and configuration control",
    icon: Shield,
    color: "violet",
    gradient: "from-violet-600 to-purple-600",
    border: "border-violet-200 dark:border-violet-800",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    value: "dg-office",
    label: "Director General Office",
    description: "Oversees academic operations and institutional management",
    icon: Building2,
    color: "blue",
    gradient: "from-blue-600 to-indigo-600",
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    value: "fee-office",
    label: "Fee Management Office",
    description: "Manages fee verification, financial records, and payment processing",
    icon: GraduationCap,
    color: "emerald",
    gradient: "from-emerald-600 to-teal-600",
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cnic: "",
    role: "",
    phone: "",
    department: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [availableRoles, setAvailableRoles] = useState([])
  const [checkingRoles, setCheckingRoles] = useState(true)
  const [step, setStep] = useState(1) // Multi-step form
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    setMounted(true)
    checkAvailableRoles()
  }, [])

  async function checkAvailableRoles() {
    try {
      const availableRoles = []

      for (const role of ROLES) {
        const res = await fetch(`/api/auth/verify-role?role=${role.value}`)
        const data = await res.json()
        if (!data.exists) {
          availableRoles.push(role)
        }
      }

      setAvailableRoles(availableRoles)

      if (availableRoles.length === 1) {
        setFormData((prev) => ({ ...prev, role: availableRoles[0].value }))
      }
    } catch (err) {
      console.error("Error checking roles:", err)
    } finally {
      setCheckingRoles(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError("")

    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/\d/)) strength++
    if (password.match(/[^a-zA-Z\d]/)) strength++
    setPasswordStrength(strength)
  }

  const formatCNIC = (value) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) {
      return numbers
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`
    }
  }

  const handleCNICChange = (e) => {
    const formatted = formatCNIC(e.target.value)
    setFormData({ ...formData, cnic: formatted })
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.role) {
      setError("Please select a role")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.cnic.match(/^\d{5}-\d{7}-\d{1}$/)) {
      setError("Please enter a valid CNIC (format: 12345-1234567-1)")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      setError("")
    }
  }

  const handleBack = () => {
    setStep(1)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          cnic: formData.cnic,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find((r) => r.value === formData.role)

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-slate-200 dark:bg-slate-700"
      case 1:
        return "bg-rose-500"
      case 2:
        return "bg-amber-500"
      case 3:
        return "bg-blue-500"
      case 4:
        return "bg-emerald-500"
      default:
        return "bg-slate-200 dark:bg-slate-700"
    }
  }

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return "Enter password"
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return ""
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (checkingRoles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Verifying system configuration...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  if (availableRoles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">All Positions Filled</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            All administrative positions have been assigned. Please contact the system administrator if you need access.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="w-4 h-4" />
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link href="/login" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">UAF Portal</h2>
                <p className="text-blue-200 text-xs">Administrative Registration</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 leading-tight">
              Create Administrative Account
            </h1>
            <p className="text-blue-100 text-base mb-8 max-w-sm leading-relaxed">
              Register for privileged access to the University of Agriculture Faisalabad's management systems.
            </p>

            {/* Progress Steps */}
            <div className="space-y-4">
              <div className={`flex items-center gap-4 ${step >= 1 ? "opacity-100" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${step >= 1 ? "bg-white text-blue-900" : "bg-white/20 text-white"}`}>
                  1
                </div>
                <div>
                  <p className="font-semibold text-sm">Personal Information</p>
                  <p className="text-xs text-blue-200">Name, email, and role selection</p>
                </div>
              </div>
              <div className="w-0.5 h-8 bg-white/20 ml-5" />
              <div className={`flex items-center gap-4 ${step >= 2 ? "opacity-100" : "opacity-50"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${step >= 2 ? "bg-white text-blue-900" : "bg-white/20 text-white"}`}>
                  2
                </div>
                <div>
                  <p className="font-semibold text-sm">Security Setup</p>
                  <p className="text-xs text-blue-200">CNIC verification and password</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-blue-200">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <span>+92-41-9200161</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Jail Road, Faisalabad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Registration</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">UAF Administrative Portal</p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Security Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Secure Registration
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Secure
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
                  </div>
                  <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  /* Step 1: Personal Info */
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Dr. Muhammad Ahmad"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@uaf.edu.pk"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Use your official UAF email address</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+92-300-1234567"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Select Administrative Role <span className="text-rose-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {availableRoles.map((role) => {
                          const Icon = role.icon
                          const isSelected = formData.role === role.value

                          return (
                            <label
                              key={role.value}
                              className={`relative flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? `${role.border} ${role.bg} shadow-md`
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="role"
                                value={role.value}
                                checked={isSelected}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div
                                className={`p-3 rounded-xl mr-4 ${isSelected ? `bg-gradient-to-br ${role.gradient} text-white` : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`font-semibold ${isSelected ? role.text : "text-slate-700 dark:text-slate-300"}`}
                                  >
                                    {role.label}
                                  </span>
                                  {isSelected && <BadgeCheck className={`w-5 h-5 ${role.text}`} />}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {role.description}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2 group"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  /* Step 2: Security */
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to personal info
                    </button>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        CNIC Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="cnic"
                          value={formData.cnic}
                          onChange={handleCNICChange}
                          placeholder="12345-1234567-1"
                          maxLength="15"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-mono tracking-wide"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Enter your 13-digit CNIC without spaces
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Create Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min 8 characters with mixed case, numbers & symbols"
                          className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Password Strength */}
                      <div className="space-y-2">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? getPasswordStrengthColor() : "bg-slate-200 dark:bg-slate-700"}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-500">Password strength:</span>
                          <span
                            className={`font-medium ${
                              passwordStrength === 4
                                ? "text-emerald-600 dark:text-emerald-400"
                                : passwordStrength >= 2
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-500"
                            }`}
                          >
                            {getPasswordStrengthLabel()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter your password"
                          className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Selected Role Summary */}
                    {selectedRole && (
                      <div className={`p-4 rounded-xl ${selectedRole.bg} ${selectedRole.border} border`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedRole.gradient} text-white`}>
                            <selectedRole.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Selected Role</p>
                            <p className={`font-semibold ${selectedRole.text}`}>{selectedRole.label}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || formData.password !== formData.confirmPassword}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Create Secure Account</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-semibold">Important Notice</p>
                    <p>
                      Administrative accounts require verification by the Directorate of IT. You'll receive an activation
                      email once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} University of Agriculture, Faisalabad
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}