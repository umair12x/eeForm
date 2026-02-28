// app/admin/degrees/page.jsx - Enhanced Degrees Management
"use client"

import { useEffect, useState } from "react"
import { 
  GraduationCap, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react"

export default function DegreesPage() {
  const [degrees, setDegrees] = useState([])
  const [departments, setDepartments] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    department: "",
    totalSemesters: 8,
    totalSessions: 1,
    totalSections: 1,
    description: "",
    active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [degreesRes, deptsRes] = await Promise.all([
        fetch("/api/admin/degree"),
        fetch("/api/admin/department")
      ])
      
      if (!degreesRes.ok || !deptsRes.ok) throw new Error("Failed to fetch data")
      
      const degreesData = await degreesRes.json()
      const deptsData = await deptsRes.json()
      
      setDegrees(degreesData)
      setDepartments(deptsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/admin/degree/${editingId}` : "/api/admin/degree"
      const method = editingId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      if (editingId) {
        setDegrees(degrees.map(d => d.id === editingId ? data.degree : d))
      } else {
        setDegrees([...degrees, data.degree])
      }
      
      resetForm()
      setShowAddModal(false)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this degree program?")) return
    
    try {
      const res = await fetch(`/api/admin/degree/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDegrees(degrees.filter(d => d.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  function startEdit(degree) {
    setEditingId(degree.id)
    setForm({
      name: degree.name,
      shortName: degree.shortName || "",
      department: degree.department,
      totalSemesters: degree.totalSemesters,
      totalSessions: degree.totalSessions,
      totalSections: degree.totalSections,
      description: degree.description || "",
      active: degree.active
    })
    setShowAddModal(true)
  }

  function resetForm() {
    setForm({
      name: "",
      shortName: "",
      department: "",
      totalSemesters: 8,
      totalSessions: 1,
      totalSections: 1,
      description: "",
      active: true
    })
    setEditingId(null)
  }

  const filteredDegrees = degrees.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.shortName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDept ? d.department === filterDept : true
    return matchesSearch && matchesDept
  })

  const stats = {
    total: degrees.length,
    active: degrees.filter(d => d.active).length,
    byDept: departments.map(d => ({
      name: d.name,
      count: degrees.filter(deg => deg.department === d.id).length
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Degree Programs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage academic degree programs and their configurations
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Degree
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Programs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Programs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{departments.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search degrees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Degrees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDegrees.map((degree) => (
          <div 
            key={degree.id} 
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${degree.active ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <GraduationCap className={`w-6 h-6 ${degree.active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{degree.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{degree.shortName}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(degree)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(degree.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{degree.totalSemesters}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Semesters</p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{degree.totalSessions}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sessions</p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{degree.totalSections}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sections</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {departments.find(d => d.id === degree.department)?.name || "Unknown Dept"}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                degree.active 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {degree.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Degree" : "Add New Degree"}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Degree Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Short Name</label>
                  <input
                    value={form.shortName}
                    onChange={(e) => setForm({...form, shortName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BS"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({...form, department: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={form.totalSemesters}
                    onChange={(e) => setForm({...form, totalSemesters: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sessions</label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalSessions}
                    onChange={(e) => setForm({...form, totalSessions: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sections</label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalSections}
                    onChange={(e) => setForm({...form, totalSections: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({...form, active: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active Program
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
                >
                  {editingId ? "Update Degree" : "Create Degree"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}