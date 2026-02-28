// app/student/page.jsx - Enhanced Student Dashboard
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  ArrowRight,
  Calendar,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  Bell,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const router = useRouter()
  const [feeRequest, setFeeRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [userRes, feeRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/student/fee")
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }

      if (feeRes.ok) {
        const feeData = await feeRes.json()
        setFeeRequest(feeData.data)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  // Auto-redirect when approved
  useEffect(() => {
    if (feeRequest?.status === "approved") {
      const redirectTimeout = setTimeout(() => {
        const formPath = feeRequest.studentType === "undergraduate" 
          ? "/student/form/ug1"
          : "/student/form/gs10"
        router.push(formPath)
      }, 3000)
      return () => clearTimeout(redirectTimeout)
    }
  }, [feeRequest?.status, feeRequest?.studentType, router])

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "amber", icon: Clock, label: "Pending Review" },
      processing: { color: "blue", icon: RefreshCw, label: "Under Processing" },
      tutor: { color: "violet", icon: FileText, label: "Tutor Review" },
      manager: { color: "indigo", icon: Shield, label: "Manager Approval" },
      approved: { color: "emerald", icon: CheckCircle2, label: "Approved" },
      rejected: { color: "rose", icon: AlertCircle, label: "Rejected" }
    }
    return configs[status] || configs.pending
  }

  const StatusTimeline = () => {
    const stages = [
      { key: "pending", label: "Fee Submitted", description: "Application received" },
      { key: "processing", label: "Fee Office", description: "Document verification" },
      { key: "tutor", label: "Tutor Review", description: "Academic advisor check" },
      { key: "manager", label: "Final Approval", description: "Department manager" },
      { key: "approved", label: "Completed", description: "Ready for enrollment" }
    ]

    const currentIndex = stages.findIndex(s => s.key === feeRequest?.status)
    const statusConfig = getStatusConfig(feeRequest?.status)

    return (
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Application Progress</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          <div 
            className="absolute left-4 top-0 w-0.5 bg-emerald-500 transition-all duration-500"
            style={{ height: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
          />

          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const isCompleted = idx <= currentIndex
              const isCurrent = idx === currentIndex
              const StageIcon = isCompleted ? CheckCircle2 : Clock

              return (
                <div key={stage.key} className="relative flex items-start gap-4">
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : isCurrent
                        ? `bg-${statusConfig.color}-500 border-${statusConfig.color}-500 text-white animate-pulse`
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                    }
                  `}>
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-slate-900 dark:text-white' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isCurrent ? statusConfig.label : stage.description}
                    </p>
                    {isCurrent && feeRequest?.statusMessage && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg inline-block">
                        {feeRequest.statusMessage}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Has active fee request
  if (feeRequest) {
    const statusConfig = getStatusConfig(feeRequest.status)

    return (
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0] || "Student"}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-300`}>
              <statusConfig.icon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Approval Alert */}
        {feeRequest.status === "approved" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Fee verification approved!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Redirecting to course registration form...</p>
            </div>
          </div>
        )}

        {/* Main Status Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Current Application</p>
              <h2 className="text-2xl font-bold mt-1">Fee Verification Request</h2>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Request ID</p>
              <p className="font-mono text-sm text-emerald-400">{feeRequest.requestId}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-sm">{new Date(feeRequest.submittedAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Amount</p>
              <p className="text-sm font-semibold">Rs. {feeRequest.feeAmount?.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Semester</p>
              <p className="text-sm">{feeRequest.semesterPaid}th {feeRequest.semesterSeason}</p>
            </div>
          </div>

          <StatusTimeline />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Degree Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Program</span>
                <span className="text-slate-900 dark:text-white font-medium">{feeRequest.degreeProgram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Type</span>
                <span className="text-slate-900 dark:text-white font-medium capitalize">{feeRequest.studentType}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Payment Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bank</span>
                <span className="text-slate-900 dark:text-white font-medium">{feeRequest.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Voucher</span>
                <span className="text-slate-900 dark:text-white font-medium">{feeRequest.voucherNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Timeline</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Processing</span>
                <span className="text-slate-900 dark:text-white font-medium">3-5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Est. Completion</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/fee"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl"
          >
            Submit Another Request
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Empty State - No active request
  return (
    <div className="p-6 md:p-8">
      {/* Welcome Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to Your Student Portal
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Manage your academic journey with ease. Submit fee verifications, track applications, and complete course registrations all in one place.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: TrendingUp,
            title: "Track Applications",
            description: "Monitor your fee verification status in real-time through every approval stage.",
            color: "blue"
          },
          {
            icon: CheckCircle2,
            title: "Fast Processing",
            description: "Get your applications processed within 3-5 working days with automated notifications.",
            color: "emerald"
          },
          {
            icon: Shield,
            title: "Secure & Reliable",
            description: "Your academic records and payment information are protected with enterprise-grade security.",
            color: "violet"
          }
        ].map((feature, idx) => (
          <div key={idx} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 bg-${feature.color}-50 dark:bg-${feature.color}-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
          Submit your fee verification to begin the enrollment process for the upcoming semester.
        </p>
        <Link
          href="/student/fee"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Start Fee Verification
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Required Documents
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            {[
              "Bank fee voucher (clear image/PDF)",
              "Valid CNIC (front & back)",
              "University registration number",
              "Active contact number"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" />
            Process Overview
          </h3>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            {[
              "Submit fee verification form online",
              "Fee office reviews your documents",
              "Tutor verifies academic eligibility",
              "Manager provides final approval"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                  {idx + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="mt-12 bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Need Help?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Contact Fee Section: <strong>feesection@uaf.edu.pk</strong> | <strong>+92-41-9200161 Ext: 3303</strong>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          Office Hours: 9:00 AM - 4:00 PM (Monday to Friday)
        </p>
      </div>
    </div>
  )
}