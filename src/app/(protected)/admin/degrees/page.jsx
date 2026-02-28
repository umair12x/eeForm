"use client";
import { useEffect, useState } from "react";

export default function DegreesPage() {
  const [degrees, setDegrees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    department: "",
    totalSemesters: 8,
    totalSessions: 1,
    totalSections: 1,
  });

  useEffect(() => {
    fetchDegrees();
    fetchDepartments();
  }, []);

  // Fetch all degrees
  async function fetchDegrees() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/degree");
      if (!res.ok) throw new Error("Failed to fetch degrees");
      const data = await res.json();
      setDegrees(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load degrees");
    } finally {
      setLoading(false);
    }
  }

  // Fetch all departments
  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/department");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function addDegree() {
    if (!form.name.trim()) {
      alert("Degree name is required");
      return;
    }
    if (!form.department) {
      alert("Department is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/degree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add degree");
        return;
      }

      setDegrees([...degrees, data.degree]);
      resetForm();
      alert("Degree added successfully");
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(id) {
    if (!form.name.trim() || !form.department) {
      alert("Name and department are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/degree/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update degree");
        return;
      }

      setDegrees(degrees.map((d) => (d.id === id ? data.degree : d)));
      resetForm();
      setEditingId(null);
      alert("Degree updated successfully");
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDegree(id) {
    if (!confirm("Are you sure you want to delete this degree?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/degree/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete degree");
        return;
      }
      
      setDegrees(degrees.filter((d) => d.id !== id));
      alert("Degree deleted successfully");
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(deg) {
    setEditingId(deg.id);
    setForm({
      name: deg.name,
      shortName: deg.shortName || "",
      department: deg.department,
      totalSemesters: deg.totalSemesters || 8,
      totalSessions: deg.totalSessions || 1,
      totalSections: deg.totalSections || 1,
    });
  }

  function resetForm() {
    setForm({
      name: "",
      shortName: "",
      department: "",
      totalSemesters: 8,
      totalSessions: 1,
      totalSections: 1,
    });
    setEditingId(null);
  }

  function cancelEdit() {
    resetForm();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Degrees & Programs</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Degree" : "Add New Degree"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Degree Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Name</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Short Name"
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <select
              className="border p-2 w-full rounded"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Semesters</label>
            <input
              type="number"
              min="1"
              className="border p-2 w-full rounded"
              value={form.totalSemesters}
              onChange={(e) =>
                setForm({ ...form, totalSemesters: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sessions</label>
            <input
              type="number"
              min="1"
              className="border p-2 w-full rounded"
              value={form.totalSessions}
              onChange={(e) =>
                setForm({ ...form, totalSessions: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sections</label>
            <input
              type="number"
              min="1"
              className="border p-2 w-full rounded"
              value={form.totalSections}
              onChange={(e) =>
                setForm({ ...form, totalSections: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={editingId ? () => saveEdit(editingId) : addDegree}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : editingId ? "Update Degree" : "Add Degree"}
          </button>
          
          {editingId && (
            <button
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Short</th>
              <th className="border p-2 text-left">Department</th>
              <th className="border p-2 text-left">Sem</th>
              <th className="border p-2 text-left">Sess</th>
              <th className="border p-2 text-left">Sec</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !degrees.length ? (
              <tr>
                <td colSpan="8" className="border p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : degrees.length === 0 ? (
              <tr>
                <td colSpan="8" className="border p-4 text-center text-gray-500">
                  No degrees found
                </td>
              </tr>
            ) : (
              degrees.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="border p-2">{d.name}</td>
                  <td className="border p-2">{d.shortName || "-"}</td>
                  <td className="border p-2">
                    {d.departmentName || 
                     departments.find((dept) => dept.id === d.department)?.name ||
                     "Unknown"}
                  </td>
                  <td className="border p-2 text-center">{d.totalSemesters}</td>
                  <td className="border p-2 text-center">{d.totalSessions}</td>
                  <td className="border p-2 text-center">{d.totalSections}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${d.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(d)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDegree(d.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}