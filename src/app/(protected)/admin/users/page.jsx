"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  GraduationCap,
  Building2,
  Mail,
  Hash,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Clock,
  Phone,
  CreditCard
} from "lucide-react"

export const metadata = {
  title: "User Management | UAF Admin Panel",
  description: "Manage system users, roles, and permissions.",
};

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // View & Sort
  const [viewMode, setViewMode] = useState("table") // table, grid, cards
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Edit Modal
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  // Departments for filter
  const [departments, setDepartments] = useState([])

  // Auto-refresh interval
  useEffect(() => {
    fetchUsers()
    fetchDepartments()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUsers(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  async function fetchUsers(silent = false) {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      setError(null)

      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`)

      const data = await res.json()

      // Transform and enrich data
      const transformedUsers = (data.users || []).map((user) => ({
        ...user,
        id: user._id || user.id,
        lastActive: user.lastActive || user.updatedAt || user.createdAt,
        status: user.status || "active",
        avatar: user.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }))

      setUsers(transformedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      if (!silent) setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/department")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err)
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.registrationNumber?.toLowerCase().includes(searchLower) ||
        user.cnic?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower)

      const matchesRole = roleFilter ? user.role === roleFilter : true
      const matchesStatus = statusFilter ? user.status === statusFilter : true
      const matchesDept = deptFilter ? user.department === deptFilter : true

      return matchesSearch && matchesRole && matchesStatus && matchesDept
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      // Handle dates
      if (sortConfig.key === "createdAt" || sortConfig.key === "lastActive") {
        aVal = new Date(aVal || 0)
        bVal = new Date(bVal || 0)
      }

      if (sortConfig.direction === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  // Stats calculation
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    byRole: {
      admin: users.filter((u) => u.role === "admin").length,
      student: users.filter((u) => u.role === "student").length,
      staff: users.filter((u) => !["admin", "student"].includes(u.role)).length,
    },
    newThisMonth: users.filter((u) => {
      const created = new Date(u.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
  }

  const roleConfig = {
    admin: {
      icon: Shield,
      color: "violet",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-200 dark:border-violet-800",
      label: "Administrator",
    },
    "dg-office": {
      icon: Building2,
      color: "blue",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      label: "DG Office",
    },
    "fee-office": {
      icon: Building2,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      label: "Fee Office",
    },
    manager: {
      icon: Users,
      color: "amber",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      label: "Manager",
    },
    tutor: {
      icon: GraduationCap,
      color: "rose",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-800",
      label: "Tutor",
    },
    student: {
      icon: GraduationCap,
      color: "slate",
      bg: "bg-slate-50 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      label: "Student",
    },
  }

  function handleSort(key) {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  function handleSelectAll() {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
    setSelectAll(!selectAll)
  }

  function handleSelectUser(userId) {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  function openEditModal(user) {
    setEditingUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      registrationNumber: user.registrationNumber || "",
      role: user.role || "",
      department: user.department || "",
      degree: user.degree || "",
      cnic: user.cnic || "",
      phone: user.phone || "",
      status: user.status || "active",
      newPassword: "",
    })
  }

  async function handleSaveEdit() {
    if (!editingUser) return

    try {
      setSaving(true)
      const payload = { ...editForm }
      if (!payload.newPassword) delete payload.newPassword

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...payload } : u)))
        setSuccess("User updated successfully")
        setTimeout(() => setSuccess(""), 3000)
        setEditingUser(null)
      } else {
        throw new Error(data.message || "Update failed")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(userId, name, role) {
    // Prevent deleting last admin
    if (role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length
      if (adminCount <= 1) {
        setError("Cannot delete the last administrator")
        setTimeout(() => setError(""), 5000)
        return
      }
    }

    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")

      setUsers(users.filter((u) => u.id !== userId))
      setSuccess("User deleted successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(""), 5000)
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedUsers.length} selected users?`)) return
    // Implement bulk delete API call
    setSuccess(`Deleted ${selectedUsers.length} users`)
    setSelectedUsers([])
    setSelectAll(false)
  }

  async function handleExport() {
    // CSV export functionality
    const csv = [
      ["Name", "Email", "Role", "Department", "Status", "Created"].join(","),
      ...filteredUsers.map((u) =>
        [u.name, u.email || u.registrationNumber, u.role, u.department, u.status, u.createdAt].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("")
    setStatusFilter("")
    setDeptFilter("")
  }

  const hasActiveFilters = searchTerm || roleFilter || statusFilter || deptFilter

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Users Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/admin/create-user"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <p className="text-rose-700 dark:text-rose-300 text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-700 dark:text-emerald-300 text-sm">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.byRole.student}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newThisMonth}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          {/* Search & Main Actions */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, registration, CNIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  showFilters || hasActiveFilters
                    ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                    {[roleFilter, statusFilter, deptFilter].filter(Boolean).length}
                  </span>
                )}
              </button>

              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {[
                  { id: "table", icon: () => <div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /></div> },
                  { id: "grid", icon: () => <div className="w-4 h-4 grid grid-cols-3 gap-0.5"><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /></div> },
                  { id: "cards", icon: () => <div className="w-4 h-4 flex flex-col gap-0.5"><div className="h-1.5 bg-current rounded-sm" /><div className="h-1.5 bg-current rounded-sm" /><div className="h-1.5 bg-current rounded-sm" /></div> },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setViewMode(id)}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === id
                        ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Roles</option>
                  {Object.entries(roleConfig).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {roleFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs">
                  Role: {roleConfig[roleFilter]?.label}
                  <button onClick={() => setRoleFilter("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-violet-600 hover:text-violet-700 font-medium ml-auto">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="px-4 py-3 bg-violet-50 dark:bg-violet-900/10 border-b border-violet-100 dark:border-violet-800 flex items-center justify-between animate-in slide-in-from-top-1">
            <span className="text-sm text-violet-700 dark:text-violet-300 font-medium">
              {selectedUsers.length} users selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No users found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results"
                  : "Get started by adding your first user to the system"}
              </p>
            </div>
          ) : viewMode === "table" ? (
            // Table View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-slate-900">
                        User {sortConfig.key === "name" && (sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Contact</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Department</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const config = roleConfig[user.role] || roleConfig.student
                    const Icon = config.icon
                    const isSelected = selectedUsers.includes(user.id)

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? "bg-violet-50 dark:bg-violet-900/10" : ""}`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                              {user.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.userType === "student" ? user.registrationNumber : user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {user.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>}
                            {user.phone && <div className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {user.phone}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{user.department || "-"}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                              : user.status === "inactive"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : user.status === "inactive" ? "bg-slate-400" : "bg-amber-500"}`} />
                            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name, user.role)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const config = roleConfig[user.role] || roleConfig.student
                const Icon = config.icon

                return (
                  <div
                    key={user.id}
                    className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name, user.role)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {user.email || user.registrationNumber || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {user.department || "No Department"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        {user.cnic || "-"}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {user.status}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Last active: {new Date(user.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Cards View (Compact)
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const config = roleConfig[user.role] || roleConfig.student
                const Icon = config.icon

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">{user.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} flex-shrink-0`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user.email || user.registrationNumber} • {user.department || "No Dept"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name, user.role)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination/Footer */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <p>
              Showing <span className="font-medium text-slate-900 dark:text-white">{filteredUsers.length}</span> of{" "}
              <span className="font-medium text-slate-900 dark:text-white">{users.length}</span> users
            </p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(roleConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {editingUser.userType === "student" ? "Registration Number" : "Email"}
                </label>
                <input
                  value={editingUser.userType === "student" ? editForm.registrationNumber : editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      [editingUser.userType === "student" ? "registrationNumber" : "email"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}