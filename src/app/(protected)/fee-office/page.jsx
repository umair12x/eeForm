"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  RefreshCw, 
  Filter,
  Download,
  MoreHorizontal,
  Building2,
  GraduationCap,
  Wallet,
  Calendar,
  FileText,
  AlertCircle,
  ChevronDown,
  X,
  Banknote,
  TrendingUp,
  Users,
  Receipt
} from "lucide-react"

// Custom hook for auto-refresh
function useAutoRefresh(callback, interval = 30000) {
  useEffect(() => {
    callback()
    const id = setInterval(callback, interval)
    return () => clearInterval(id)
  }, [callback, interval])
}

export const metadata = {
  title: "Fee Office Dashboard | UAF Digital Enrollment Portal",
  description: "Verify student fee payments and manage verification documents.",
};

export default function FeeSectionDashboard() {
  const [search, setSearch] = useState("")
  const [verifications, setVerifications] = useState([])
  const [filteredVerifications, setFilteredVerifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    todayRevenue: 0
  })

  // Auto-refresh data every 30 seconds
  const fetchVerifications = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/fee/fee-section")
      const data = await response.json()
      
      if (response.ok) {
        setVerifications(data)
        updateStats(data)
      }
    } catch (error) {
      console.error("Error fetching verifications:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useAutoRefresh(fetchVerifications)

  // Update statistics
  const updateStats = (data) => {
    const today = new Date().toDateString()
    const todayRevenue = data
      .filter(v => v.status === 'approved' && new Date(v.verifiedAt).toDateString() === today)
      .reduce((sum, v) => sum + (v.feeAmount || 0), 0)

    setStats({
      total: data.length,
      pending: data.filter(v => v.status === 'pending').length,
      approved: data.filter(v => v.status === 'approved').length,
      rejected: data.filter(v => v.status === 'rejected').length,
      processing: data.filter(v => v.status === 'processing').length,
      todayRevenue
    })
  }

  // Filter logic
  useEffect(() => {
    let filtered = verifications.filter(v => {
      const matchesSearch = 
        v.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        v.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
        v.voucherNumber?.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || v.status === statusFilter
      
      let matchesDate = true
      const vDate = new Date(v.submittedAt)
      const today = new Date()
      
      if (dateFilter === "today") {
        matchesDate = vDate.toDateString() === today.toDateString()
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000)
        matchesDate = vDate >= weekAgo
      } else if (dateFilter === "month") {
        matchesDate = vDate.getMonth() === today.getMonth() && vDate.getFullYear() === today.getFullYear()
      }
      
      return matchesSearch && matchesStatus && matchesDate
    })
    
    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    
    setFilteredVerifications(filtered)
  }, [search, verifications, statusFilter, dateFilter])

  const handleViewVoucher = (verification) => {
    setSelectedVerification(verification)
    setIsModalOpen(true)
  }

  const handleVerify = async (id) => {
    if (!confirm("Are you sure you want to verify this payment?")) return
    
    try {
      // Optimistic update
      setVerifications(prev => prev.map(v => 
        v._id === id ? { ...v, status: 'processing' } : v
      ))
      
      const response = await fetch(`/api/fee/fee-section`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "approved",
          statusMessage: "Payment verified successfully",
          verifiedAt: new Date().toISOString(),
          verifiedBy: "Fee Section Officer"
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setVerifications(prev => prev.map(v => v._id === id ? updated : v))
        showToast("Payment verified successfully", "success")
      } else {
        throw new Error("Failed to verify")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      fetchVerifications() // Revert
      showToast("Failed to verify payment", "error")
    }
  }

  const handleReject = async (id) => {
    const reason = prompt("Please enter reason for rejection:")
    if (!reason) return
    
    try {
      setVerifications(prev => prev.map(v => 
        v._id === id ? { ...v, status: 'processing' } : v
      ))
      
      const response = await fetch(`/api/fee/fee-section`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "rejected",
          statusMessage: reason,
          rejectedAt: new Date().toISOString(),
          rejectedBy: "Fee Section Officer"
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setVerifications(prev => prev.map(v => v._id === id ? updated : v))
        showToast("Payment rejected", "info")
      } else {
        throw new Error("Failed to reject")
      }
    } catch (error) {
      fetchVerifications()
      showToast("Failed to reject payment", "error")
    }
  }

  const showToast = (message, type) => {
    // Simple toast implementation - you can use a toast library
    alert(message)
  }

  const exportData = () => {
    const csv = [
      ["Student Name", "Registration", "Amount", "Status", "Date"].join(","),
      ...filteredVerifications.map(v => [
        v.studentName,
        v.registrationNumber,
        v.feeAmount,
        v.status,
        formatDate(v.submittedAt)
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fee-verifications-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
        label: "Pending Review"
      },
      processing: {
        icon: RefreshCw,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        label: "Processing"
      },
      approved: {
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-700 dark:text-emerald-300",
        label: "Verified"
      },
      rejected: {
        icon: XCircle,
        bg: "bg-rose-50 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
        text: "text-rose-700 dark:text-rose-300",
        label: "Rejected"
      }
    }
    return configs[status] || configs.pending
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, trend, color, onClick }) => {
    const colorClasses = {
      amber: "from-amber-500 to-orange-500",
      emerald: "from-emerald-500 to-teal-500",
      rose: "from-rose-500 to-pink-500",
      blue: "from-blue-500 to-indigo-500",
      violet: "from-violet-500 to-purple-500"
    }

    return (
      <button
        onClick={onClick}
        className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 text-left group ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                <Building2 className="w-4 h-4" />
                <span>University of Agriculture, Faisalabad</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Wallet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                Fee Section Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchVerifications}
                disabled={isRefreshing}
                className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium">
                <Banknote className="w-4 h-4" />
                {formatCurrency(stats.todayRevenue)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={Receipt}
            color="violet"
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            trend="+12%"
            color="amber"
            onClick={() => setStatusFilter("pending")}
          />
          <StatCard
            title="Verified Today"
            value={stats.approved}
            icon={CheckCircle2}
            trend="+8%"
            color="emerald"
            onClick={() => setStatusFilter("approved")}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="rose"
            onClick={() => setStatusFilter("rejected")}
          />
          <StatCard
            title="Processing"
            value={stats.processing}
            icon={RefreshCw}
            color="blue"
            onClick={() => setStatusFilter("processing")}
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, registration number, or voucher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[140px]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {(statusFilter !== "all" || dateFilter !== "all" || search) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("all")} className="hover:text-emerald-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                  Date: {dateFilter}
                  <button onClick={() => setDateFilter("all")} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm">
                  Search: {search}
                  <button onClick={() => setSearch("")} className="hover:text-slate-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-white">{filteredVerifications.length}</span> of{" "}
            <span className="font-medium text-slate-900 dark:text-white">{verifications.length}</span> requests
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live updates enabled
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-500" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">Loading verifications...</p>
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No requests found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {search || statusFilter !== "all" || dateFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "New fee verification requests will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Fee Details
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Payment Info
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredVerifications.map((v) => {
                    const statusConfig = getStatusConfig(v.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <tr 
                        key={v._id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{v.studentName}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">{v.registrationNumber}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{v.degreeProgram}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-slate-500 dark:text-slate-400">Semester:</span> {v.semesterPaid} {v.semesterSeason}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-slate-500 dark:text-slate-400">Type:</span> {v.feeType}
                            </p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                              {formatCurrency(v.feeAmount)}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-700 dark:text-slate-300">
                              <span className="text-slate-500 dark:text-slate-400">Bank:</span> {v.bankName}
                            </p>
                            <p className="text-slate-700 dark:text-slate-300">
                              <span className="text-slate-500 dark:text-slate-400">Voucher:</span> 
                              <span className="font-mono ml-1">{v.voucherNumber}</span>
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                              Submitted: {formatDate(v.submittedAt)}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
                            <StatusIcon className={`w-4 h-4 ${v.status === 'processing' ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">{statusConfig.label}</span>
                          </div>
                          {v.statusMessage && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[200px] line-clamp-2">
                              {v.statusMessage}
                            </p>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewVoucher(v)}
                              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            {v.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerify(v._id)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                  title="Verify payment"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(v._id)}
                                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                  title="Reject payment"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verification Details
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Voucher #{selectedVerification.voucherNumber}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border ${getStatusConfig(selectedVerification.status).bg} ${getStatusConfig(selectedVerification.status).border}`}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getStatusConfig(selectedVerification.status).icon
                    return <Icon className={`w-6 h-6 ${getStatusConfig(selectedVerification.status).text}`} />
                  })()}
                  <div>
                    <p className={`font-semibold ${getStatusConfig(selectedVerification.status).text}`}>
                      {getStatusConfig(selectedVerification.status).label}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Last updated: {formatDate(selectedVerification.updatedAt || selectedVerification.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    Student Information
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration</p>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{selectedVerification.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">CNIC</p>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{selectedVerification.cnic}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Program</p>
                      <p className="text-slate-700 dark:text-slate-300">{selectedVerification.degreeProgram}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    Payment Details
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount Paid</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(selectedVerification.feeAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bank</p>
                      <p className="text-slate-700 dark:text-slate-300">{selectedVerification.bankName} - {selectedVerification.bankBranch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Voucher Number</p>
                      <p className="font-mono text-slate-700 dark:text-slate-300">{selectedVerification.voucherNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Date</p>
                      <p className="text-slate-700 dark:text-slate-300">{formatDate(selectedVerification.paymentDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Fee Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Semester</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.semesterPaid}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Season</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.semesterSeason} {selectedVerification.semesterYear}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Type</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.feeType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Campus</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedVerification.campus}</p>
                  </div>
                </div>
              </div>

              {/* Voucher Image */}
              {selectedVerification.voucherImageUrl && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Voucher Image</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={selectedVerification.voucherImageUrl}
                      alt="Payment Voucher"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23f1f5f9'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8'%3EImage not available%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedVerification.remarks && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Remarks
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200">{selectedVerification.remarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedVerification.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      handleVerify(selectedVerification._id)
                      setIsModalOpen(false)
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Verify Payment
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedVerification._id)
                      setIsModalOpen(false)
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/30 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}