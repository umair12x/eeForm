"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Trash2,
  FileText,
  Upload,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Hash,
  Award,
  Pencil
} from "lucide-react"

export default function DegreeSchemeManager() {
  const [schemes, setSchemes] = useState([])
  const [degrees, setDegrees] = useState([])
  const [filterDegree, setFilterDegree] = useState("")
  const [filterSession, setFilterSession] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid or list

  const [form, setForm] = useState({
    degree: "",
    schemeName: "",
    session: "",
    totalSemesters: 8,
    description: "",
    active: true,
    semesterSchemes: Array.from({ length: 8 }, (_, i) => ({
      semester: i + 1,
      subjects: [],
      totalCreditHours: 0,
    })),
  })

  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState(1)
  const [expandedSchemes, setExpandedSchemes] = useState([])
  const [showForm, setShowForm] = useState(false)

  // Credit hour options
  const creditOptions = [
    { value: "1(1-0)", label: "1(1-0) - Theory", theory: 1, practical: 0, total: 1 },
    { value: "2(2-0)", label: "2(2-0) - Theory", theory: 2, practical: 0, total: 2 },
    { value: "3(3-0)", label: "3(3-0) - Theory", theory: 3, practical: 0, total: 3 },
    { value: "3(2-1)", label: "3(2-1) - Theory + Lab", theory: 2, practical: 1, total: 3 },
    { value: "4(3-1)", label: "4(3-1) - Theory + Lab", theory: 3, practical: 1, total: 4 },
    { value: "4(4-0)", label: "4(4-0) - Theory", theory: 4, practical: 0, total: 4 },
    { value: "0(0-3)", label: "0(0-3) - Lab Only", theory: 0, practical: 3, total: 0 },
    { value: "5(3-2)", label: "5(3-2) - Theory + Lab", theory: 3, practical: 2, total: 5 },
    { value: "6(4-2)", label: "6(4-2) - Theory + Lab", theory: 4, practical: 2, total: 6 },
  ]

  useEffect(() => {
    fetchDegrees()
    fetchSchemes()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => fetchSchemes(), 300)
    return () => clearTimeout(timeout)
  }, [filterDegree, filterSession])

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/admin/degree")
      if (!res.ok) throw new Error("Failed to fetch degrees")
      const data = await res.json()
      setDegrees(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load degrees")
    }
  }

  async function fetchSchemes() {
    try {
      setLoading(true)
      let url = "/api/admin/degree-scheme"
      const params = new URLSearchParams()

      if (filterDegree) params.append("degree", filterDegree)
      if (filterSession) params.append("session", filterSession)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch schemes")
      const data = await res.json()
      setSchemes(data)
      setError("")
    } catch (err) {
      console.error(err)
      setError("Failed to load degree schemes")
    } finally {
      setLoading(false)
    }
  }

  async function saveScheme() {
    if (!validateForm()) return

    try {
      setSaving(true)
      const url = editingId
        ? `/api/admin/degree-scheme/${editingId}`
        : "/api/admin/degree-scheme"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to save scheme")
      }

      if (editingId) {
        setSchemes(schemes.map((s) => (s.id === editingId ? data.scheme : s)))
        setSuccess("Scheme updated successfully")
      } else {
        setSchemes([...schemes, data.scheme])
        setSuccess("Scheme created successfully")
      }

      setTimeout(() => {
        resetForm()
        setShowForm(false)
        setSuccess("")
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteScheme(id) {
    if (!confirm("Are you sure you want to delete this scheme? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/admin/degree-scheme/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete scheme")

      setSchemes(schemes.filter((s) => s.id !== id))
      setSuccess("Scheme deleted successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  function validateForm() {
    if (!form.degree) {
      setError("Please select a degree")
      return false
    }
    if (!form.schemeName.trim()) {
      setError("Scheme name is required")
      return false
    }
    if (!form.session.trim()) {
      setError("Session is required (e.g., 2022-2026)")
      return false
    }
    setError("")
    return true
  }

  function startEdit(scheme) {
    setEditingId(scheme.id)
    setForm({
      degree: scheme.degreeId,
      schemeName: scheme.schemeName,
      session: scheme.session,
      totalSemesters: scheme.totalSemesters,
      description: scheme.description || "",
      active: scheme.active ?? true,
      semesterSchemes: scheme.semesterSchemes.map((sem) => ({
        semester: sem.semester,
        subjects: sem.subjects.map((sub) => ({
          code: sub.code,
          name: sub.name,
          creditHours: sub.creditHours,
        })),
        totalCreditHours: sem.totalCreditHours,
      })),
    })

    setActiveTab(1)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setForm({
      degree: "",
      schemeName: "",
      session: "",
      totalSemesters: 8,
      description: "",
      active: true,
      semesterSchemes: Array.from({ length: 8 }, (_, i) => ({
        semester: i + 1,
        subjects: [],
        totalCreditHours: 0,
      })),
    })
    setEditingId(null)
    setActiveTab(1)
    setError("")
  }

  function addSubjectToSemester(semester) {
    const updatedSemesters = [...form.semesterSchemes]
    const semesterIndex = updatedSemesters.findIndex((s) => s.semester === semester)

    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects.push({
        code: "",
        name: "",
        creditHours: "3(2-1)",
      })

      // Recalculate credits
      updatedSemesters[semesterIndex].totalCreditHours = calculateSemesterCredits(
        updatedSemesters[semesterIndex].subjects
      )

      setForm({ ...form, semesterSchemes: updatedSemesters })
    }
  }

  function removeSubjectFromSemester(semester, subjectIndex) {
    const updatedSemesters = [...form.semesterSchemes]
    const semesterIndex = updatedSemesters.findIndex((s) => s.semester === semester)

    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects.splice(subjectIndex, 1)
      updatedSemesters[semesterIndex].totalCreditHours = calculateSemesterCredits(
        updatedSemesters[semesterIndex].subjects
      )
      setForm({ ...form, semesterSchemes: updatedSemesters })
    }
  }

  function updateSubject(semester, subjectIndex, field, value) {
    const updatedSemesters = [...form.semesterSchemes]
    const semesterIndex = updatedSemesters.findIndex((s) => s.semester === semester)

    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects[subjectIndex][field] = value

      // Recalculate credits if credit hours changed
      if (field === "creditHours") {
        updatedSemesters[semesterIndex].totalCreditHours = calculateSemesterCredits(
          updatedSemesters[semesterIndex].subjects
        )
      }

      setForm({ ...form, semesterSchemes: updatedSemesters })
    }
  }

  function calculateSemesterCredits(subjects) {
    return subjects.reduce((sum, sub) => {
      const match = sub.creditHours.match(/^(\d+)\(/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
  }

  function toggleSchemeExpansion(schemeId) {
    setExpandedSchemes((prev) =>
      prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]
    )
  }

  function getDegreeName(degreeId) {
    return degrees.find((d) => d.id === degreeId)?.name || "Unknown Degree"
  }

  function getTotalSchemeCredits(scheme) {
    return scheme.semesterSchemes.reduce((sum, sem) => sum + sem.totalCreditHours, 0)
  }

  // Calculate stats
  const stats = {
    totalSchemes: schemes.length,
    totalSubjects: schemes.reduce(
      (acc, s) => acc + s.semesterSchemes.reduce((semAcc, sem) => semAcc + sem.subjects.length, 0),
      0
    ),
    avgSubjectsPerScheme: schemes.length
      ? Math.round(
          schemes.reduce(
            (acc, s) =>
              acc + s.semesterSchemes.reduce((semAcc, sem) => semAcc + sem.subjects.length, 0),
            0
          ) / schemes.length
        )
      : 0,
    activeSchemes: schemes.filter((s) => s.active !== false).length,
  }

  const filteredSchemes = schemes.filter((s) => {
    const matchesDegree = filterDegree ? s.degreeId === filterDegree : true
    const matchesSession = filterSession
      ? s.session.toLowerCase().includes(filterSession.toLowerCase())
      : true
    return matchesDegree && matchesSession
  })

  if (loading && !schemes.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Degree Schemes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage curriculum structures and subject schemes
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              showForm
                ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Close Form" : "Create Scheme"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <p className="text-rose-700 dark:text-rose-300">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
          >
            <X className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-emerald-700 dark:text-emerald-300">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Schemes", value: stats.totalSchemes, icon: BookOpen, color: "violet" },
          { label: "Total Subjects", value: stats.totalSubjects, icon: Layers, color: "blue" },
          { label: "Avg/Scheme", value: stats.avgSubjectsPerScheme, icon: Award, color: "amber" },
          { label: "Active Schemes", value: stats.activeSchemes, icon: CheckCircle2, color: "emerald" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 bg-${color}-50 dark:bg-${color}-900/20 rounded-xl`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet-600" />
              {editingId ? "Edit Degree Scheme" : "Create New Degree Scheme"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Degree Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                >
                  <option value="">Select Degree</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Scheme Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., BS CS 2022 Scheme"
                  value={form.schemeName}
                  onChange={(e) => setForm({ ...form, schemeName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Session <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2022-2026"
                  value={form.session}
                  onChange={(e) => setForm({ ...form, session: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Semesters
                </label>
                <select
                  value={form.totalSemesters}
                  onChange={(e) => {
                    const total = parseInt(e.target.value)
                    setForm({
                      ...form,
                      totalSemesters: total,
                      semesterSchemes: Array.from({ length: total }, (_, i) => ({
                        semester: i + 1,
                        subjects: form.semesterSchemes[i]?.subjects || [],
                        totalCreditHours: form.semesterSchemes[i]?.totalCreditHours || 0,
                      })),
                    })
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                >
                  {[4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Semesters
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Optional description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
              />
            </div>

            {/* Semester Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <div className="flex overflow-x-auto scrollbar-hide gap-1">
                {Array.from({ length: form.totalSemesters }, (_, i) => i + 1).map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setActiveTab(sem)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === sem
                        ? "border-violet-600 text-violet-600 dark:text-violet-400"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Semester {sem}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {form.semesterSchemes[sem - 1]?.subjects.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Semester Content */}
            {form.semesterSchemes
              .filter((sem) => sem.semester === activeTab)
              .map((semester) => (
                <div key={semester.semester} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Semester {semester.semester} Curriculum
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {semester.subjects.length} subjects • {semester.totalCreditHours} total credits
                      </p>
                    </div>
                    <button
                      onClick={() => addSubjectToSemester(semester.semester)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subject
                    </button>
                  </div>

                  {semester.subjects.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        No subjects added yet
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Click "Add Subject" to start building the curriculum
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Code
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Subject Name
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Credit Hours
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Type
                              </th>
                              <th className="text-center p-4 text-sm font-semibold text-slate-700 dark:text-slate-300 w-20">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {semester.subjects.map((subject, idx) => {
                              const creditInfo = creditOptions.find(
                                (c) => c.value === subject.creditHours
                              ) || { theory: 0, practical: 0 }

                              return (
                                <tr
                                  key={idx}
                                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  <td className="p-4">
                                    <input
                                      type="text"
                                      placeholder="CS-101"
                                      value={subject.code}
                                      onChange={(e) =>
                                        updateSubject(semester.semester, idx, "code", e.target.value)
                                      }
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                  </td>
                                  <td className="p-4">
                                    <input
                                      type="text"
                                      placeholder="Subject Name"
                                      value={subject.name}
                                      onChange={(e) =>
                                        updateSubject(semester.semester, idx, "name", e.target.value)
                                      }
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                  </td>
                                  <td className="p-4">
                                    <select
                                      value={subject.creditHours}
                                      onChange={(e) =>
                                        updateSubject(
                                          semester.semester,
                                          idx,
                                          "creditHours",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                      {creditOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex gap-2 text-xs">
                                      <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                        Theory: {creditInfo.theory}
                                      </span>
                                      <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                        Lab: {creditInfo.practical}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() =>
                                        removeSubjectFromSemester(semester.semester, idx)
                                      }
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Active Scheme (visible to students)
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveScheme}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? "Update Scheme" : "Create Scheme"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search schemes by name or session..."
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={filterDegree}
          onChange={(e) => setFilterDegree(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[200px]"
        >
          <option value="">All Degrees</option>
          {degrees.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
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
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="w-5 h-5 flex flex-col gap-1 justify-center">
              <div className="h-0.5 bg-current rounded-full" />
              <div className="h-0.5 bg-current rounded-full" />
              <div className="h-0.5 bg-current rounded-full" />
            </div>
          </button>
        </div>
      </div>

      {/* Schemes Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        scheme.active !== false
                          ? "bg-violet-50 dark:bg-violet-900/20"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <BookOpen
                        className={`w-6 h-6 ${
                          scheme.active !== false
                            ? "text-violet-600 dark:text-violet-400"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {scheme.schemeName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getDegreeName(scheme.degreeId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(scheme)}
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteScheme(scheme.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {scheme.totalSemesters}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Semesters</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {scheme.semesterSchemes.reduce((acc, s) => acc + s.subjects.length, 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Subjects</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {getTotalSchemeCredits(scheme)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Credits</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {scheme.session}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      scheme.active !== false
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {scheme.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => toggleSchemeExpansion(scheme.id)}
                  className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>View Curriculum Details</span>
                  {expandedSchemes.includes(scheme.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedSchemes.includes(scheme.id) && (
                  <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2">
                    {scheme.semesterSchemes.map((sem) => (
                      <div key={sem.semester} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                            Semester {sem.semester}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {sem.totalCreditHours} credits • {sem.subjects.length} subjects
                          </span>
                        </div>
                        {sem.subjects.length > 0 ? (
                          <div className="space-y-2">
                            {sem.subjects.map((sub, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 w-16">
                                    {sub.code}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {sub.name}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {sub.creditHours}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No subjects in this semester
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Scheme
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Degree
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Session
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Subjects
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Credits
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSchemes.map((scheme) => (
                  <tr
                    key={scheme.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {scheme.schemeName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {scheme.totalSemesters} semesters
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {getDegreeName(scheme.degreeId)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{scheme.session}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        {scheme.semesterSchemes.reduce((acc, s) => acc + s.subjects.length, 0)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">
                      {getTotalSchemeCredits(scheme)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          scheme.active !== false
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {scheme.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(scheme)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteScheme(scheme.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSchemes.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No schemes found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {filterDegree || filterSession
              ? "Try adjusting your filters to see more results"
              : "Get started by creating your first degree scheme"}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Scheme
            </button>
          )}
        </div>
      )}
    </div>
  )
}