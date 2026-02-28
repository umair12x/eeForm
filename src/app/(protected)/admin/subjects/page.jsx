"use client";
import { useState, useEffect } from "react";

export default function DegreeSchemeManager() {
  const [schemes, setSchemes] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [filterDegree, setFilterDegree] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    degree: "",
    schemeName: "",
    session: "",
    totalSemesters: 8,
    description: "",
    semesterSchemes: Array.from({ length: 8 }, (_, i) => ({
      semester: i + 1,
      subjects: [],
      totalCreditHours: 0,
    })),
  });

  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [expandedSemesters, setExpandedSemesters] = useState([]);

  useEffect(() => {
    fetchDegrees();
    fetchSchemes();
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [filterDegree, filterSession]);

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/admin/degree");
      if (!res.ok) throw new Error("Failed to fetch degrees");
      const data = await res.json();
      setDegrees(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load degrees");
    }
  }

  async function fetchSchemes() {
    try {
      setLoading(true);
      let url = "/api/admin/degree-scheme";
      const params = new URLSearchParams();
      
      if (filterDegree) params.append("degree", filterDegree);
      if (filterSession) params.append("session", filterSession);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch schemes");
      const data = await res.json();
      setSchemes(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load degree schemes");
    } finally {
      setLoading(false);
    }
  }

  async function saveScheme() {
    if (!form.degree) {
      alert("Please select a degree");
      return;
    }
    if (!form.schemeName.trim()) {
      alert("Scheme name is required");
      return;
    }
    if (!form.session.trim()) {
      alert("Session is required (e.g., 2022-2026)");
      return;
    }

    try {
      setLoading(true);
      const url = editingId 
        ? `/api/admin/degree-scheme/${editingId}`
        : "/api/admin/degree-scheme";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save scheme");
        return;
      }

      if (editingId) {
        setSchemes(schemes.map(s => s.id === editingId ? data.scheme : s));
        alert("Scheme updated successfully");
      } else {
        setSchemes([...schemes, data.scheme]);
        alert("Scheme created successfully");
      }
      
      resetForm();
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(scheme) {
    setEditingId(scheme.id);
    setForm({
      degree: scheme.degreeId,
      schemeName: scheme.schemeName,
      session: scheme.session,
      totalSemesters: scheme.totalSemesters,
      description: scheme.description || "",
      semesterSchemes: scheme.semesterSchemes.map(sem => ({
        semester: sem.semester,
        subjects: sem.subjects.map(sub => ({
          code: sub.code,
          name: sub.name,
          creditHours: sub.creditHours,
        })),
        totalCreditHours: sem.totalCreditHours,
      })),
    });
    
    // Expand all semesters when editing
    setExpandedSemesters(Array.from({ length: scheme.totalSemesters }, (_, i) => i + 1));
  }

  function resetForm() {
    setForm({
      degree: filterDegree || "",
      schemeName: "",
      session: "",
      totalSemesters: 8,
      description: "",
      semesterSchemes: Array.from({ length: 8 }, (_, i) => ({
        semester: i + 1,
        subjects: [],
        totalCreditHours: 0,
      })),
    });
    setEditingId(null);
    setActiveTab(1);
    setExpandedSemesters([]);
  }

  function addSubjectToSemester(semester) {
    const updatedSemesters = [...form.semesterSchemes];
    const semesterIndex = updatedSemesters.findIndex(s => s.semester === semester);
    
    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects.push({
        code: "",
        name: "",
        creditHours: "3(2-1)",
      });
      
      setForm({ ...form, semesterSchemes: updatedSemesters });
    }
  }

  function removeSubjectFromSemester(semester, subjectIndex) {
    const updatedSemesters = [...form.semesterSchemes];
    const semesterIndex = updatedSemesters.findIndex(s => s.semester === semester);
    
    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects.splice(subjectIndex, 1);
      setForm({ ...form, semesterSchemes: updatedSemesters });
    }
  }

  function updateSubject(semester, subjectIndex, field, value) {
    const updatedSemesters = [...form.semesterSchemes];
    const semesterIndex = updatedSemesters.findIndex(s => s.semester === semester);
    
    if (semesterIndex !== -1) {
      updatedSemesters[semesterIndex].subjects[subjectIndex][field] = value;
      
      // Recalculate semester credits if credit hours changed
      if (field === "creditHours") {
        const creditMatch = value.match(/^(\d+)\((\d+)-(\d+)\)$/);
        if (creditMatch) {
          const totalCredits = parseInt(creditMatch[1]);
          updatedSemesters[semesterIndex].totalCreditHours = 
            updatedSemesters[semesterIndex].subjects.reduce((sum, sub) => {
              const match = sub.creditHours.match(/^(\d+)\(/);
              return sum + (match ? parseInt(match[1]) : 0);
            }, 0);
        }
      }
      
      setForm({ ...form, semesterSchemes: updatedSemesters });
    }
  }

  function toggleSemesterExpansion(semester) {
    setExpandedSemesters(prev => 
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  }

  function importFromPDF() {
    // This would be implemented to parse PDF like the one you uploaded
    alert("PDF import feature would be implemented here");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Degree Scheme Management</h1>
        <button
          onClick={importFromPDF}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Import from PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Filter Schemes</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Degree</label>
            <select
              className="border p-2 rounded min-w-[200px]"
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
            >
              <option value="">All Degrees</option>
              {degrees.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Filter by Session</label>
            <input
              type="text"
              className="border p-2 rounded min-w-[150px]"
              placeholder="e.g., 2022-2026"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDegree("");
                setFilterSession("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Scheme Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Degree Scheme" : "Create New Degree Scheme"}
        </h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Degree *</label>
              <select
                className="border p-2 w-full rounded"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
              >
                <option value="">Select Degree</option>
                {degrees.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Scheme Name *</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                placeholder="e.g., BS Computer Science 2022 Scheme"
                value={form.schemeName}
                onChange={(e) => setForm({ ...form, schemeName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Session *</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                placeholder="e.g., 2022 to onward"
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Semesters</label>
              <select
                className="border p-2 w-full rounded"
                value={form.totalSemesters}
                onChange={(e) => {
                  const total = parseInt(e.target.value);
                  setForm({
                    ...form,
                    totalSemesters: total,
                    semesterSchemes: Array.from({ length: total }, (_, i) => ({
                      semester: i + 1,
                      subjects: form.semesterSchemes[i]?.subjects || [],
                      totalCreditHours: form.semesterSchemes[i]?.totalCreditHours || 0,
                    })),
                  });
                }}
              >
                {[4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} Semesters</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="border p-2 w-full rounded"
              rows="2"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* Semester Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            {Array.from({ length: form.totalSemesters }, (_, i) => i + 1).map((sem) => (
              <button
                key={sem}
                className={`px-4 py-2 font-medium ${activeTab === sem ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab(sem)}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Semester Content */}
        {form.semesterSchemes
          .filter(sem => sem.semester === activeTab)
          .map((semester) => (
            <div key={semester.semester} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Semester {semester.semester} - {semester.subjects.length} subjects
                  <span className="ml-4 text-sm font-normal text-gray-600">
                    Total Credits: {semester.totalCreditHours}
                  </span>
                </h3>
                <button
                  onClick={() => addSubjectToSemester(semester.semester)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  + Add Subject
                </button>
              </div>

              {semester.subjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded">
                  No subjects added for this semester. Click "Add Subject" to start.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Code</th>
                        <th className="border p-2 text-left">Subject Name</th>
                        <th className="border p-2 text-left">Credit Hours</th>
                        <th className="border p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.subjects.map((subject, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">
                            <input
                              type="text"
                              className="border p-1 w-full rounded"
                              placeholder="e.g., CS-305"
                              value={subject.code}
                              onChange={(e) => updateSubject(semester.semester, idx, "code", e.target.value)}
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              className="border p-1 w-full rounded"
                              placeholder="e.g., Introduction to ICT"
                              value={subject.name}
                              onChange={(e) => updateSubject(semester.semester, idx, "name", e.target.value)}
                            />
                          </td>
                          <td className="border p-2">
                            <select
                              className="border p-1 w-full rounded"
                              value={subject.creditHours}
                              onChange={(e) => updateSubject(semester.semester, idx, "creditHours", e.target.value)}
                            >
                              <option value="1(1-0)">1(1-0)</option>
                              <option value="2(2-0)">2(2-0)</option>
                              <option value="3(3-0)">3(3-0)</option>
                              <option value="3(2-1)">3(2-1)</option>
                              <option value="4(3-1)">4(3-1)</option>
                              <option value="4(4-0)">4(4-0)</option>
                              <option value="0(0-3)">0(0-3) - Lab only</option>
                            </select>
                          </td>
                          <td className="border p-2">
                            <button
                              onClick={() => removeSubjectFromSemester(semester.semester, idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

        {/* Form Actions */}
        <div className="flex gap-2 mt-6 pt-6 border-t">
          <button
            onClick={saveScheme}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : editingId ? "Update Scheme" : "Create Scheme"}
          </button>
          
          <button
            onClick={resetForm}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            {editingId ? "Cancel Edit" : "Clear Form"}
          </button>
        </div>
      </div>

      {/* Schemes List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Existing Degree Schemes</h2>
          <div className="text-sm text-gray-600">
            Showing {schemes.length} scheme{schemes.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading schemes...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No schemes found. {filterDegree || filterSession ? "Try changing your filters." : "Create your first scheme!"}
          </div>
        ) : (
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{scheme.schemeName}</h3>
                    <div className="text-sm text-gray-600">
                      {scheme.degreeName} • Session: {scheme.session} • {scheme.totalSemesters} Semesters
                      • Total Credits: {scheme.totalDegreeCredits}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(scheme)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleSemesterExpansion(scheme.id)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      {expandedSemesters.includes(scheme.id) ? "Collapse" : "View Details"}
                    </button>
                  </div>
                </div>

                {expandedSemesters.includes(scheme.id) && (
                  <div className="p-4 border-t">
                    {scheme.semesterSchemes.map((sem) => (
                      <div key={sem.semester} className="mb-4 last:mb-0">
                        <h4 className="font-semibold mb-2">
                          Semester {sem.semester} ({sem.totalCreditHours} credits)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2 text-left">Code</th>
                                <th className="p-2 text-left">Subject</th>
                                <th className="p-2 text-left">Credit Hours</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sem.subjects.map((subject, idx) => (
                                <tr key={idx} className="border-b last:border-b-0">
                                  <td className="p-2 font-mono">{subject.code}</td>
                                  <td className="p-2">{subject.name}</td>
                                  <td className="p-2">{subject.creditHours}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}