"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ClipboardCheck,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  GraduationCap,
  Hash,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Loader2,
  CheckSquare,
  XSquare,
  FileCheck,
  TrendingUp,
  Users,
  Inbox,
  CheckCheck,
  Ban,
  BookOpen
} from "lucide-react"

export const metadata = {
  title: "Manager Dashboard | UAF Digital Enrollment Portal",
  description: "Review and verify student enrollment forms. Approve or request revisions from tutors.",
};

export default function ManagerDashboard() {
  const [forms, setForms] = useState([])
  const [filteredForms, setFilteredForms] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  })
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [expandedRows, setExpandedRows] = useState([])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchForms()
    const interval = setInterval(() => fetchForms(true), 30000)
    return () => clearInterval(interval)
  }, [statusFilter])

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredForms(forms)
    } else {
      const filtered = forms.filter(
        (form) =>
          form.studentName?.toLowerCase().includes(search.toLowerCase()) ||
          form.registeredNo?.toLowerCase().includes(search.toLowerCase()) ||
          form.formNumber?.toLowerCase().includes(search.toLowerCase()) ||
          form.degreeName?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredForms(filtered)
    }
  }, [search, forms])

  const fetchForms = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      const response = await fetch(`/api/manager/approval?status=${statusFilter}`)
      const data = await response.json()

      if (data.success) {
        setForms(data.data)
        setFilteredForms(data.data)
        setStats(data.stats)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.message || "Failed to fetch forms")
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      if (!silent) alert("Failed to load forms. Please refresh the page.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApproveForm = (form) => {
    setSelectedForm(form)
    setVerificationNotes("")
    setShowApproveModal(true)
  }

  const handleRejectForm = (form) => {
    setSelectedForm(form)
    setRejectionReason("")
    setShowRejectModal(true)
  }

  const handleViewForm = (form) => {
    setSelectedForm(form)
    setShowViewModal(true)
  }

  const closeModal = () => {
    setSelectedForm(null)
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowViewModal(false)
    setVerificationNotes("")
    setRejectionReason("")
  }

  const processApproval = async () => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/manager/approval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm._id,
          action: "approve",
          verificationNotes: verificationNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Optimistic update
        setForms((prev) =>
          prev.map((f) =>
            f._id === selectedForm._id
              ? { ...f, status: "manager_approved", managerApprovedAt: new Date().toISOString(), verificationNotes }
              : f
          )
        )
        closeModal()
        // Refresh to get accurate stats
        fetchForms(true)
      } else {
        throw new Error(data.message || "Approval failed")
      }
    } catch (error) {
      console.error("Error approving form:", error)
      alert("Failed to approve form. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const processRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch("/api/manager/approval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedForm._id,
          action: "reject",
          rejectionReason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Optimistic update
        setForms((prev) =>
          prev.map((f) =>
            f._id === selectedForm._id
              ? { ...f, status: "collector_rejected", collectorRejectedAt: new Date().toISOString(), rejectionReason }
              : f
          )
        )
        closeModal()
        fetchForms(true)
      } else {
        throw new Error(data.message || "Rejection failed")
      }
    } catch (error) {
      console.error("Error rejecting form:", error)
      alert("Failed to reject form. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const generateCompletePDF = async (formId) => {
    setDownloadingPdf(formId)
    try {
      const response = await fetch(`/api/manager/pdf?formId=${formId}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `UG1-COMPLETE-${formId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setDownloadingPdf(null)
    }
  }

  const toggleRowExpansion = (formId) => {
    setExpandedRows((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    )
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "tutor_approved":
        return {
          icon: Clock,
          color: "amber",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-300",
          label: "Pending Verification",
          dot: "bg-amber-500",
        }
      case "manager_approved":
        return {
          icon: CheckCheck,
          color: "emerald",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-300",
          label: "Approved & Enrolled",
          dot: "bg-emerald-500",
        }
      case "collector_rejected":
        return {
          icon: Ban,
          color: "rose",
          bg: "bg-rose-50 dark:bg-rose-900/20",
          border: "border-rose-200 dark:border-rose-800",
          text: "text-rose-700 dark:text-rose-300",
          label: "Rejected",
          dot: "bg-rose-500",
        }
      default:
        return {
          icon: FileText,
          color: "slate",
          bg: "bg-slate-50 dark:bg-slate-800",
          border: "border-slate-200 dark:border-slate-700",
          text: "text-slate-700 dark:text-slate-300",
          label: status,
          dot: "bg-slate-400",
        }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statCards = [
    {
      key: "pending",
      label: "Pending Verification",
      value: stats.pending,
      icon: Inbox,
      color: "amber",
      trend: "+2 today",
    },
    {
      key: "approved",
      label: "Approved & Enrolled",
      value: stats.approved,
      icon: CheckCircle2,
      color: "emerald",
      trend: "+5 this week",
    },
    {
      key: "rejected",
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "rose",
      trend: "0 this week",
    },
    {
      key: "total",
      label: "Total Forms",
      value: stats.total,
      icon: FileText,
      color: "indigo",
      trend: "All time",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <ClipboardCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              Manager Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Verify tutor-signed forms and approve student enrollment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {/* Last updated: {lastUpdated.toLocaleTimeString()} */}
            </span>
            <button
              onClick={() => fetchForms(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, value, icon: Icon, color, trend }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key === "total" ? "all" : key)}
              className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 transition-all text-left ${
                (key === "total" && statusFilter === "all") || statusFilter === key
                  ? `border-${color}-500 shadow-lg shadow-${color}-100 dark:shadow-${color}-900/20`
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className={`text-3xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>
                    {value}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{trend}</p>
                </div>
                <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-xl`}>
                  <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
              </div>
              {(key === "total" && statusFilter === "all") || statusFilter === key ? (
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${color}-500`} />
              ) : null}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, registration, form number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
              >
                <option value="pending">⏳ Pending</option>
                <option value="approved">✓ Approved</option>
                <option value="rejected">✗ Rejected</option>
                <option value="all">📋 All Forms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 w-10"></th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Form Details</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Student</th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">Program</th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">Credits</th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading forms...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Inbox className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">No forms found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((form) => {
                    const statusConfig = getStatusConfig(form.status)
                    const StatusIcon = statusConfig.icon
                    const isExpanded = expandedRows.includes(form._id)

                    return (
                      <React.Fragment key={form._id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="p-4">
                            <button
                              onClick={() => toggleRowExpansion(form._id)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              {form.formNumber}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatDate(form.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {form.studentName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              {form.registeredNo}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                              {form.degreeShortName || form.degreeName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Sem {form.semester} • Sec {form.section}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                              {form.totalCreditHours} cr
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewForm(form)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {form.status === "tutor_approved" && (
                                <>
                                  <button
                                    onClick={() => handleApproveForm(form)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectForm(form)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <XSquare className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {form.status === "manager_approved" && (
                                <button
                                  onClick={() => generateCompletePDF(form._id)}
                                  disabled={downloadingPdf === form._id}
                                  className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors disabled:opacity-50"
                                  title="Download PDF"
                                >
                                  {downloadingPdf === form._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row Details */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td colSpan="7" className="p-0">
                              <div className="p-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                                      Student Info
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="text-slate-900 dark:text-white font-medium">
                                        {form.studentName}
                                      </p>
                                      <p className="text-slate-600 dark:text-slate-400">
                                        Father: {form.fatherName}
                                      </p>
                                      <p className="text-slate-600 dark:text-slate-400">
                                        Phone: {form.phoneCell || "—"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                                      Academic Details
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="text-slate-900 dark:text-white">
                                        {form.degreeName}
                                      </p>
                                      <p className="text-slate-600 dark:text-slate-400">
                                        Dept: {form.departmentName}
                                      </p>
                                      <p className="text-slate-600 dark:text-slate-400">
                                        Admission: {form.admissionTo}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                                      Signatures
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-600 dark:text-slate-400">Tutor:</span>
                                        {form.tutorSignature ? (
                                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Signed
                                          </span>
                                        ) : (
                                          <span className="text-amber-600 dark:text-amber-400">Pending</span>
                                        )}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <span className="text-slate-600 dark:text-slate-400">Student:</span>
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                          {form.studentSignature ? "Signed" : "Pending"}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Subjects Preview */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                      <tr>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">
                                          Course Code
                                        </th>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">
                                          Course Title
                                        </th>
                                        <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">
                                          Credits
                                        </th>
                                        <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">
                                          Type
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                      {form.selectedSubjects?.map((subject, idx) => (
                                        <tr key={idx}>
                                          <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">
                                            {subject.code}
                                          </td>
                                          <td className="p-3 text-slate-900 dark:text-white">
                                            {subject.name}
                                          </td>
                                          <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                                            {subject.creditHours}
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                              Regular
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                      {form.extraSubjects?.map((subject, idx) => (
                                        <tr key={idx} className="bg-amber-50/50 dark:bg-amber-900/10">
                                          <td className="p-3 font-mono text-amber-600 dark:text-amber-400">
                                            {subject.code}
                                          </td>
                                          <td className="p-3 text-slate-900 dark:text-white">
                                            {subject.name}
                                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                              (Extra)
                                            </span>
                                          </td>
                                          <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                                            {subject.creditHours}
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                              Extra
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && filteredForms.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <p>
                Showing <span className="font-medium text-slate-900 dark:text-white">{filteredForms.length}</span> of{" "}
                <span className="font-medium text-slate-900 dark:text-white">{forms.length}</span> forms
              </p>
              <p>Auto-refresh: 30s</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Form Review: {selectedForm.formNumber}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Submitted on {formatDateTime(selectedForm.createdAt)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* University Header */}
              <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  University of Agriculture, Faisalabad
                </h1>
                <h2 className="text-base font-semibold mt-2 text-indigo-700 dark:text-indigo-400">
                  UG-1 Form • {selectedForm.semester}
                  {selectedForm.semester === 1
                    ? "st"
                    : selectedForm.semester === 2
                    ? "nd"
                    : selectedForm.semester === 3
                    ? "rd"
                    : "th"}{" "}
                  Semester
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedForm.departmentName}
                </p>
              </div>

              {/* Student Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Student Name
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                      {selectedForm.studentName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Father's Name
                    </label>
                    <p className="text-slate-900 dark:text-white mt-1">{selectedForm.fatherName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Registration No.
                    </label>
                    <p className="font-mono text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                      {selectedForm.registeredNo}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Degree Program
                    </label>
                    <p className="text-slate-900 dark:text-white mt-1">{selectedForm.degreeName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Section & Semester
                    </label>
                    <p className="text-slate-900 dark:text-white mt-1">
                      Section {selectedForm.section} • Semester {selectedForm.semester}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Total Credit Hours
                    </label>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {selectedForm.totalCreditHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Registered Courses
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">
                          Course Code
                        </th>
                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">
                          Course Title
                        </th>
                        <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">
                          Credits
                        </th>
                        <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {selectedForm.selectedSubjects?.map((subject, idx) => (
                        <tr key={idx} className="bg-white dark:bg-slate-900">
                          <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                            {subject.code}
                          </td>
                          <td className="p-3 text-slate-900 dark:text-white">{subject.name}</td>
                          <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                            {subject.creditHours}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                              Regular
                            </span>
                          </td>
                        </tr>
                      ))}
                      {selectedForm.extraSubjects?.map((subject, idx) => (
                        <tr key={idx} className="bg-amber-50/50 dark:bg-amber-900/10">
                          <td className="p-3 font-mono text-amber-600 dark:text-amber-400 font-medium">
                            {subject.code}
                          </td>
                          <td className="p-3 text-slate-900 dark:text-white">
                            {subject.name}
                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                              (Extra Course)
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                            {subject.creditHours}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                              Extra
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tutor's Signature
                  </h4>
                  {selectedForm.tutorSignature ? (
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">
                        {selectedForm.tutorSignature}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Signed on {formatDateTime(selectedForm.tutorSignedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400">Awaiting signature</p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Student's Signature
                  </h4>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    {selectedForm.studentSignature || selectedForm.studentName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {selectedForm.status === "tutor_approved" && (
                <>
                  <button
                    onClick={() => {
                      closeModal()
                      handleRejectForm(selectedForm)
                    }}
                    className="px-6 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2"
                  >
                    <XSquare className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      closeModal()
                      handleApproveForm(selectedForm)
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Approve & Enroll
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    Approve Enrollment
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Verify and confirm student registration
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedForm.studentName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {selectedForm.registeredNo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedForm.degreeShortName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Sem {selectedForm.semester} • Sec {selectedForm.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedForm.selectedSubjects?.length || 0} courses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedForm.totalCreditHours} credits
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processApproval}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Approval
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-rose-50 dark:bg-rose-900/20 border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100">Reject Form</h3>
                  <p className="text-sm text-rose-700 dark:text-rose-300">
                    This action requires a valid reason
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Form: <span className="font-mono font-medium text-slate-900 dark:text-white">{selectedForm.formNumber}</span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Student: <span className="font-medium text-slate-900 dark:text-white">{selectedForm.studentName}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Specify what is incorrect or missing in the form..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This reason will be visible to the student and tutor.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processRejection}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
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