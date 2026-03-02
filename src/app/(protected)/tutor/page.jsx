"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  PenTool,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  User,
  Hash,
  BookOpen,
  CreditCard,
  Building2,
  GraduationCap,
  MoreHorizontal,
  CheckSquare,
  Loader2
} from "lucide-react"

// Custom hook for auto-refresh
function useAutoRefresh(callback, delay = 30000) {
  useEffect(() => {
    const interval = setInterval(callback, delay)
    return () => clearInterval(interval)
  }, [callback, delay])
}

export const metadata = {
  title: "Tutor Dashboard | UAF Digital Enrollment Portal",
  description: "Manage and verify student enrollment forms. Sign approved forms and manage rejections.",
};

export default function TutorDashboard() {
  const [forms, setForms] = useState([])
  const [filteredForms, setFilteredForms] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)
  const [showSignModal, setShowSignModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [tutorSignature, setTutorSignature] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    signed: 0,
    rejected: 0,
    total: 0,
  })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [viewMode, setViewMode] = useState("table") // table, cards
  const [expandedRows, setExpandedRows] = useState([])
  const [notification, setNotification] = useState(null)

  // Fetch forms with loading states
  const fetchForms = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      const response = await fetch(`/api/tutor/sign?status=${statusFilter}`)
      const data = await response.json()

      if (data.success) {
        // Transform data for display
        const transformedForms = data.data.map((form) => ({
          ...form,
          id: form._id,
          submittedAt: form.createdAt,
          avatar: form.studentName
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        }))

        setForms(transformedForms)
        setStats(data.stats)

        // Show notification if new forms arrived
        if (!silent && forms.length > 0 && transformedForms.length > forms.length) {
          showNotification("New forms available", "info")
        }
      } else {
        showNotification(data.message || "Failed to fetch forms", "error")
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      showNotification("Failed to fetch forms", "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [statusFilter, forms.length])

  // Auto-refresh every 30 seconds
  useAutoRefresh(() => fetchForms(true), 30000)

  // Initial load
  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  // Filter and sort forms
  useEffect(() => {
    let result = [...forms]

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (form) =>
          form.studentName?.toLowerCase().includes(searchLower) ||
          form.registeredNo?.toLowerCase().includes(searchLower) ||
          form.formNumber?.toLowerCase().includes(searchLower) ||
          form.degreeName?.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (sortConfig.key === "submittedAt" || sortConfig.key === "tutorSignedAt") {
        aVal = new Date(aVal || 0)
        bVal = new Date(bVal || 0)
      }

      if (sortConfig.direction === "asc") {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    setFilteredForms(result)
  }, [search, forms, sortConfig])

  // Notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleViewForm = (form) => {
    setSelectedForm(form)
    setTutorSignature("")
    setRejectionReason("")
  }

  const handleSignForm = () => {
    if (!tutorSignature.trim()) {
      showNotification("Please enter your signature", "error")
      return
    }
    setShowSignModal(true)
  }

  const confirmSign = async () => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/tutor/sign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm.id,
          action: "sign",
          tutorSignature: tutorSignature,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showNotification("Form signed successfully!", "success")
        setShowSignModal(false)
        setSelectedForm(null)
        await fetchForms()
      } else {
        throw new Error(data.message || "Failed to sign form")
      }
    } catch (error) {
      console.error("Error signing form:", error)
      showNotification(error.message || "Failed to sign form", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showNotification("Please provide a reason for rejection", "error")
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch("/api/tutor/sign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm.id,
          action: "reject",
          rejectionReason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showNotification("Form rejected successfully", "success")
        setShowRejectModal(false)
        setSelectedForm(null)
        await fetchForms()
      } else {
        throw new Error(data.message || "Failed to reject form")
      }
    } catch (error) {
      console.error("Error rejecting form:", error)
      showNotification(error.message || "Failed to reject form", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const generatePDF = (formId, copyType) => {
    window.open(`/api/form/generate-pdf?formId=${formId}&copy=${copyType}`, "_blank")
  }

  const toggleRowExpansion = (formId) => {
    setExpandedRows((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "submitted":
        return {
          icon: Clock,
          label: "Pending Signature",
          color: "amber",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          dot: "bg-amber-500",
        }
      case "tutor_approved":
        return {
          icon: CheckCircle2,
          label: "Signed",
          color: "emerald",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800",
          dot: "bg-emerald-500",
        }
      case "tutor_rejected":
        return {
          icon: XCircle,
          label: "Rejected",
          color: "rose",
          bg: "bg-rose-50 dark:bg-rose-900/20",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-800",
          dot: "bg-rose-500",
        }
      default:
        return {
          icon: FileText,
          label: status,
          color: "slate",
          bg: "bg-slate-50 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          dot: "bg-slate-400",
        }
    }
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  const statCards = [
    {
      key: "pending",
      label: "Pending Signature",
      icon: Clock,
      color: "amber",
      description: "Awaiting your review",
    },
    {
      key: "signed",
      label: "Signed",
      icon: CheckCircle2,
      color: "emerald",
      description: "Approved by you",
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: XCircle,
      color: "rose",
      description: "Needs revision",
    },
    {
      key: "total",
      label: "Total Forms",
      icon: FileText,
      color: "blue",
      description: "All time records",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border animate-in slide-in-from-right-5 ${
              notification.type === "error"
                ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                : notification.type === "info"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
                : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : notification.type === "info" ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <p className="font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <PenTool className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Tutor Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Review and sign student enrollment forms (UG-1)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live updates enabled
              </span>
              <button
                onClick={() => fetchForms(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon, color, description }) => {
            const isActive = statusFilter === key || (key === "total" && statusFilter === "all")
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key === "total" ? "all" : key)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? `bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800 ring-2 ring-${color}-500/20`
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
                    <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      isActive ? `text-${color}-700 dark:text-${color}-400` : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {stats[key]}
                  </span>
                </div>
                <p className={`font-semibold text-sm ${isActive ? `text-${color}-900 dark:text-${color}-300` : "text-slate-900 dark:text-white"}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
              </button>
            )
          })}
        </div>

        {/* Filters & Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, registration, form number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="signed">✓ Signed</option>
                  <option value="rejected">✗ Rejected</option>
                  <option value="all">📋 All Forms</option>
                </select>

                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "table"
                        ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                      <div className="bg-current rounded-sm" />
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "cards"
                        ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <div className="w-5 h-5 flex flex-col gap-0.5 justify-center">
                      <div className="h-1 bg-current rounded-full" />
                      <div className="h-1 bg-current rounded-full" />
                      <div className="h-1 bg-current rounded-full" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading forms...</span>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No forms found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {search ? "Try adjusting your search criteria" : "No forms available in this category"}
                </p>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-10"></th>
                      <th
                        className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white"
                        onClick={() => handleSort("formNumber")}
                      >
                        <div className="flex items-center gap-1">
                          Form #
                          {sortConfig.key === "formNumber" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white"
                        onClick={() => handleSort("studentName")}
                      >
                        <div className="flex items-center gap-1">
                          Student
                          {sortConfig.key === "studentName" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            ))}
                        </div>
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Sem
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredForms.map((form) => {
                      const statusConfig = getStatusConfig(form.status)
                      const StatusIcon = statusConfig.icon
                      const isExpanded = expandedRows.includes(form.id)

                      return (
                        <React.Fragment key={form.id}>
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="p-3">
                              <button
                                onClick={() => toggleRowExpansion(form.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                                {form.formNumber}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                  {form.avatar}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                                    {form.studentName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {form.registeredNo}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {form.degreeShortName || form.degreeName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {form.departmentName}
                              </p>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                                {form.semester}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                                <CreditCard className="w-3 h-3" />
                                {form.totalCreditHours}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(form.submittedAt)}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleViewForm(form)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Review form"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {form.status === "tutor_approved" && (
                                  <button
                                    onClick={() => generatePDF(form.id, "advisor")}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                              <td colSpan={9} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                      Father's Name
                                    </p>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                      {form.fatherName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                      Section
                                    </p>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                      {form.section}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                      Subjects
                                    </p>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                      {form.selectedSubjects?.length || 0} regular
                                      {form.extraSubjects?.length > 0 &&
                                        ` + ${form.extraSubjects.length} extra`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Cards View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredForms.map((form) => {
                  const statusConfig = getStatusConfig(form.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <div
                      key={form.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {form.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                              {form.studentName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {form.registeredNo}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <statusConfig.dot className="w-1.5 h-1.5 rounded-full" />
                          <StatusIcon className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Form #</span>
                          <span className="font-mono font-medium text-slate-900 dark:text-white">
                            {form.formNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Program</span>
                          <span className="text-slate-700 dark:text-slate-300 text-right">
                            {form.degreeShortName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Semester</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {form.semester}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Credits</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                            <CreditCard className="w-3 h-3" />
                            {form.totalCreditHours}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => handleViewForm(form)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        {form.status === "tutor_approved" && (
                          <button
                            onClick={() => generatePDF(form.id, "advisor")}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <p>
                Showing <span className="font-medium text-slate-900 dark:text-white">{filteredForms.length}</span> of{" "}
                <span className="font-medium text-slate-900 dark:text-white">{forms.length}</span> forms
              </p>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Review Modal */}
      {selectedForm && !showSignModal && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Review Form {selectedForm.formNumber}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Submitted {formatDateTime(selectedForm.submittedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">
                    <User className="w-4 h-4" />
                    Student
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedForm.studentName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedForm.fatherName}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">
                    <Hash className="w-4 h-4" />
                    Registration
                  </div>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white">
                    {selectedForm.registeredNo}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Section {selectedForm.section}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Program
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    {selectedForm.degreeName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedForm.departmentName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">
                    <Calendar className="w-4 h-4" />
                    Semester
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-2xl">
                    {selectedForm.semester}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                      {selectedForm.semester === 1
                        ? "st"
                        : selectedForm.semester === 2
                        ? "nd"
                        : selectedForm.semester === 3
                        ? "rd"
                        : "th"}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedForm.totalCreditHours} Credit Hours
                  </p>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Enrolled Subjects
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/30">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Course Title
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Credit Hours
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {selectedForm.selectedSubjects?.map((subject, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                            {subject.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {subject.name}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                              {subject.creditHours}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              Regular
                            </span>
                          </td>
                        </tr>
                      ))}
                      {selectedForm.extraSubjects?.map((subject, idx) => (
                        <tr
                          key={`extra-${idx}`}
                          className="bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-amber-700 dark:text-amber-400 font-medium">
                            {subject.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {subject.name}
                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                              (Extra)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
                              {subject.creditHours}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
                              Extra
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Total Credit Hours:
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 font-bold">
                            {selectedForm.totalCreditHours}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Signatures & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tutor Signature */}
                <div
                  className={`rounded-xl border p-4 ${
                    selectedForm.status === "tutor_approved"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      : selectedForm.status === "tutor_rejected"
                      ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 border-dashed"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <PenTool
                      className={`w-5 h-5 ${
                        selectedForm.status === "tutor_approved"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : selectedForm.status === "tutor_rejected"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    />
                    <h4
                      className={`font-semibold ${
                        selectedForm.status === "tutor_approved"
                          ? "text-emerald-900 dark:text-emerald-300"
                          : selectedForm.status === "tutor_rejected"
                          ? "text-rose-900 dark:text-rose-300"
                          : "text-amber-900 dark:text-amber-300"
                      }`}
                    >
                      Tutor's Signature
                    </h4>
                  </div>

                  {selectedForm.status === "tutor_approved" ? (
                    <div>
                      <p className="font-medium text-emerald-800 dark:text-emerald-300 text-lg">
                        {selectedForm.tutorSignature}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        Signed on {formatDateTime(selectedForm.tutorSignedAt)}
                      </p>
                    </div>
                  ) : selectedForm.status === "tutor_rejected" ? (
                    <div>
                      <p className="font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Form Rejected
                      </p>
                      <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
                        Reason: {selectedForm.rejectionReason}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-amber-700 dark:text-amber-400 font-medium italic">
                        Awaiting your signature...
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                        Please review the form carefully before signing
                      </p>
                    </div>
                  )}
                </div>

                {/* Student Signature */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                      Student's Signature
                    </h4>
                  </div>
                  <p className="font-medium text-blue-800 dark:text-blue-300 text-lg">
                    {selectedForm.studentSignature || selectedForm.studentName}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Digitally signed on {formatDateTime(selectedForm.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                    Fee Information
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Fees Paid Up To
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Rs. {selectedForm.feePaidUpto?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Treasurer Verification
                    </p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                {selectedForm.status === "submitted" && (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors border border-rose-200 dark:border-rose-800"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Form
                    </button>
                    <button
                      onClick={() => setShowSignModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                    >
                      <PenTool className="w-5 h-5" />
                      Sign Form
                    </button>
                  </>
                )}
                {selectedForm.status === "tutor_approved" && (
                  <button
                    onClick={() => generatePDF(selectedForm.id, "advisor")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                  >
                    <Download className="w-5 h-5" />
                    Download Signed PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Confirmation Modal */}
      {showSignModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <PenTool className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                    Sign Form
                  </h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {selectedForm.formNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Student</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedForm.studentName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedForm.registeredNo}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Your Digital Signature (Full Name) *
                </label>
                <input
                  type="text"
                  value={tutorSignature}
                  onChange={(e) => setTutorSignature(e.target.value)}
                  placeholder="Enter your full name as signature"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  By signing, you confirm that you have reviewed all subjects and verify this enrollment.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSignModal(false)
                    setTutorSignature("")
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSign}
                  disabled={actionLoading || !tutorSignature.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Signature
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-900 dark:text-rose-300">
                    Reject Form
                  </h3>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {selectedForm.formNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Student</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedForm.studentName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please specify why this form is being rejected. This will be visible to the student."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason("")
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}