// app/admin/departments/page.jsx - Enhanced Departments
"use client"

import { useState, useEffect } from "react"
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  GraduationCap,
  Users,
  MoreVertical,
  Search,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export const metadata = {
  title: "Manage Departments | Admin Portal - UAF",
  description: "Create, edit, and manage academic departments.",
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [degrees, setDegrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    head: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [deptsRes, degreesRes] = await Promise.all([
        fetch("/api/admin/department"),
        fetch("/api/admin/degree")
      ])
      
      const deptsData = await deptsRes.json()
      const degreesData = await degreesRes.json()
      
      // Calculate degree counts
      const deptsWithCounts = deptsData.map(dept => ({
        ...dept,
        degreeCount: degreesData.filter(d => d.department === dept.id).length
      }))
      
      setDepartments(deptsWithCounts)
      setDegrees(degreesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/admin/department/${editingId}` : "/api/admin/department"
      const method = editingId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      fetchData() // Refresh to get updated counts
      resetForm()
      setShowModal(false)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDelete(id) {
    const dept = departments.find(d => d.id === id)
    if (dept.degreeCount > 0) {
      alert(`Cannot delete ${dept.name}. It has ${dept.degreeCount} degree programs assigned.`)
      return
    }
    
    if (!confirm("Are you sure you want to delete this department?")) return
    
    try {
      const res = await fetch(`/api/admin/department/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDepartments(departments.filter(d => d.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  function startEdit(dept) {
    setEditingId(dept.id)
    setForm({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      head: dept.head || ""
    })
    setShowModal(true)
  }

  function resetForm() {
    setForm({ name: "", code: "", description: "", head: "" })
    setEditingId(null)
  }

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage academic departments and their structure
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div 
            key={dept.id} 
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(dept)}
                  className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{dept.name}</h3>
            {dept.code && (
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-3">{dept.code}</p>
            )}
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <GraduationCap className="w-4 h-4" />
                <span>{dept.degreeCount} degrees</span>
              </div>
              {dept.head && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="truncate">{dept.head}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepts.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No departments found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm ? "Try adjusting your search" : "Get started by adding your first department"}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Department" : "Add Department"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({...form, code: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., CS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department Head</label>
                <input
                  value={form.head}
                  onChange={(e) => setForm({...form, head: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
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