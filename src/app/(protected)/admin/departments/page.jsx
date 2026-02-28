"use client";
import { useState, useEffect } from "react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState({ name: "", degreesCount: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", count: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/department");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function addDepartment() {
    if (!newDept.name.trim()) {
      alert("Please enter department name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDept),
      });
      const data = await res.json();

      if (res.ok && data.department) {
        setDepartments([...departments, data.department]);
        setNewDept({ name: "", degreesCount: 0 });
      } else {
        alert(data.message || "Failed to add department");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(dept) {
    setEditingId(dept.id);
    setEditForm({ name: dept.name, count: dept.count });
  }

  async function saveEdit(id) {
    if (!editForm.name.trim()) {
      alert("Department name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/department/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok && data.department) {
        setDepartments(
          departments.map((d) => (d.id === id ? data.department : d)),
        );
        setEditingId(null);
      } else {
        alert(data.message || "Failed to update department");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDept(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/department/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setDepartments(departments.filter((d) => d.id !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Departments</h1>
        <p className="text-gray-600">Manage academic departments and their degree programs</p>
      </div>

      {/* Add New Department Form */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Department</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              placeholder="e.g., Computer Science"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree Programs
            </label>
            <input
              type="number"
              min="0"
              placeholder="Count"
              value={newDept.degreesCount}
              onChange={(e) =>
                setNewDept({ ...newDept, degreesCount: Number(e.target.value) })
              }
              className="w-full md:w-32 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addDepartment}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Department'}
            </button>
          </div>
        </div>
      </div>

      {/* Departments List */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">All Departments ({departments.length})</h3>
        </div>
        
        {departments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No departments found</p>
            <p className="text-sm mt-1">Add your first department above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Department</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Degree Programs</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      {editingId === dept.id ? (
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      ) : (
                        <div className="font-medium text-gray-800">{dept.name}</div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === dept.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editForm.count}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              count: Number(e.target.value),
                            })
                          }
                          className="w-24 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      ) : (
                        <span className="inline-flex items-center">
                          <span className="font-medium text-gray-700">{dept.count}</span>
                          <span className="ml-2 text-xs text-gray-500">programs</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {editingId === dept.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(dept.id)}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={loading}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(dept)}
                              className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDept(dept.id, dept.name)}
                              className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}