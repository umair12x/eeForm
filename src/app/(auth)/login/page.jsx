"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  GraduationCap,
  Shield,
  Mail,
  Hash,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Phone,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react"
import ThemeToggle from "@/components/layout/ThemeToggle"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ identifier: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("staff")
  const [availableRoles, setAvailableRoles] = useState([])
  const [showRegister, setShowRegister] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAvailableRoles()
  }, [])

  async function checkAvailableRoles() {
    try {
      const res = await fetch("/api/auth/verify-role")
      const data = await res.json()

      const available = []
      if (!data.roles?.admin) available.push("admin")
      if (!data.roles?.["dg-office"]) available.push("dg-office")
      if (!data.roles?.["fee-office"]) available.push("fee-office")

      setAvailableRoles(available)
      setShowRegister(available.length > 0)
    } catch (err) {
      console.error("Error checking roles:", err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setLoginSuccess(true)
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user))
        }
        setTimeout(() => {
          router.push(data.redirect || callbackUrl)
        }, 800)
      } else {
        setError(data.message || "Authentication failed. Please check your credentials.")
      }
    } catch (err) {
      setError("Unable to connect to authentication server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Role configurations with icons and colors
  const roleConfig = {
    admin: { label: "Administrator", color: "violet", icon: Shield },
    "dg-office": { label: "DG Office", color: "blue", icon: Building2 },
    "fee-office": { label: "Fee Office", color: "emerald", icon: Phone },
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">UAF Portal</h2>
                <p className="text-blue-200 text-sm">Digital Enrollment System</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 leading-tight">
              University of Agriculture
              <span className="block text-amber-400">Faisalabad</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
              Secure access to fee management, enrollment services, and administrative tools for students and staff.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Bank-grade security encryption" },
                { icon: Clock, text: "24/7 online fee submission" },
                { icon: CheckCircle2, text: "Real-time enrollment status" },
                { icon: Phone, text: "Dedicated support channels" },
              ].map(({ icon: Icon, text }, idx) => (
                <div key={idx} className="flex items-center gap-3 text-blue-100">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <MapPin className="w-4 h-4" />
              <span>Jail Road, Faisalabad, Pakistan</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <Phone className="w-4 h-4" />
              <span>+92-41-9200161</span>
            </div>
            <p className="text-xs text-blue-300/60 pt-4 border-t border-white/10">
              © {new Date().getFullYear()} University of Agriculture, Faisalabad. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">UAF Portal</h1>
            <p className="text-slate-500 dark:text-slate-400">University of Agriculture, Faisalabad</p>
          </div>

          {/* Main Login Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Security Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Secure Portal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Portal Type Selector */}
              <div className="mb-8">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Select Portal Access
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button
                    onClick={() => {
                      setUserType("staff")
                      setFormData({ ...formData, identifier: "" })
                      setError("")
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      userType === "staff"
                        ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-400 shadow-md ring-1 ring-slate-200 dark:ring-slate-600"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Staff Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserType("student")
                      setFormData({ ...formData, identifier: "" })
                      setError("")
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      userType === "student"
                        ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-400 shadow-md ring-1 ring-slate-200 dark:ring-slate-600"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Portal</span>
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {loginSuccess && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      Authentication Successful
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Redirecting to dashboard...</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Authentication Failed</p>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
                  </div>
                  <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {userType === "student" ? "Registration Number" : "Email Address"}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {userType === "student" ? (
                        <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      ) : (
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <input
                      type={userType === "student" ? "text" : "email"}
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder={userType === "student" ? "2022-AG-1234" : "name@uaf.edu.pk"}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                      required
                    />
                  </div>
                  {userType === "student" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Format: YYYY-DEPT-ROLLNO (e.g., 2022-AG-1234)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-slate-600 dark:text-slate-400 select-none"
                  >
                    Remember this device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || loginSuccess}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center justify-between w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Need help accessing your account?
                  </span>
                  {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHelp && (
                  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">Contact Support</h4>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Fee Section: Ext. 3303
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          DG Office: Ext. 3301
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          support@uaf.edu.pk
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Link */}
              {showRegister && (
                <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 rounded-xl">
                  <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                    New administrative account required?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      Create Account
                    </Link>
                  </p>
                  {availableRoles.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {availableRoles.map((role) => {
                        const config = roleConfig[role]
                        return (
                          <span
                            key={role}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-900/20 text-${config.color}-700 dark:text-${config.color}-300`}
                          >
                            <config.icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">
              Terms of Use
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/security" className="hover:text-slate-700 dark:hover:text-slate-300">
              Security
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}