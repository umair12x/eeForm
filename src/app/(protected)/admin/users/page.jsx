"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Transform data to ensure consistent ID field
      const transformedUsers = (data.users || []).map(user => ({
        ...user,
        id: user._id || user.id
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(user) {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      registrationNumber: user.registrationNumber || "",
      role: user.role || "",
      department: user.department || "",
      degree: user.degree || "",
      cnic: user.cnic || "",
      newPassword: ""
    });
  }

  function handleCancel() {
    setEditingUserId(null);
    setEditForm({});
  }

  async function handleSave(userId) {
    try {
      const payload = { ...editForm };
      if (!payload.newPassword) delete payload.newPassword;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, ...payload } : u)
        );
        handleCancel();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  async function handleDelete(userId, name, role) {
    if (role === "admin") {
      const adminCount = users.filter(u => u.role === "admin").length;
      if (adminCount <= 1) {
        alert("Cannot delete the last admin");
        return;
      }
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  function handleSort(key) {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  }

  const roleColors = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    "dg-office": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "fee-office": "bg-blue-100 text-blue-800 border-blue-200",
    manager: "bg-green-100 text-green-800 border-green-200",
    tutor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    student: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const roleLabels = {
    admin: "Admin",
    "dg-office": "DG Office",
    "fee-office": "Fee Office",
    manager: "Manager",
    tutor: "Tutor",
    student: "Student",
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.registrationNumber?.toLowerCase().includes(searchLower) ||
        user.cnic?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower);
      
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      
      if (sortConfig.direction === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    students: users.filter(u => u.role === "student").length,
    staff: users.filter(u => u.role !== "student" && u.role !== "admin").length,
  };

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error Loading Users</h2>
          <p>{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Total {stats.total} users • {stats.admins} admins • {stats.students} students • {stats.staff} staff
          </p>
        </div>
        <Link
          href="/admin/create-user"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
        >
          <UserPlusIcon className="w-5 h-5" />
          Create User
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, reg no, CNIC, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || roleFilter
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            {roleFilter && (
              <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                1
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="dg-office">DG Office</option>
              <option value="fee-office">Fee Office</option>
              <option value="manager">Manager</option>
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
            </select>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email/Reg No" },
                  { key: "role", label: "Role" },
                  { key: "department", label: "Department" },
                  { key: "degree", label: "Degree" },
                  { key: "cnic", label: "CNIC" },
                  { key: "actions", label: "Actions", sortable: false }
                ].map((column) => (
                  <th
                    key={column.key}
                    className="text-left p-3 text-sm font-semibold text-gray-700"
                  >
                    {column.sortable !== false ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        {column.label}
                        <ChevronUpDownIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600 text-sm">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isEditing = editingUserId === user.id;
                  const roleColor = roleColors[user.role] || "bg-gray-100 text-gray-800";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{user.name}</div>
                        )}
                      </td>

                      <td className="p-3">
                        {isEditing ? (
                          user.userType === "student" ? (
                            <input
                              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editForm.registrationNumber}
                              onChange={(e) =>
                                setEditForm({ ...editForm, registrationNumber: e.target.value })
                              }
                            />
                          ) : (
                            <input
                              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({ ...editForm, email: e.target.value })
                              }
                            />
                          )
                        ) : (
                          <div className="text-sm text-gray-700">
                            {user.email || user.registrationNumber || "-"}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {isEditing ? (
                          <select
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({ ...editForm, role: e.target.value })
                            }
                          >
                            <option value="">Select</option>
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                            <option value="dg-office">DG Office</option>
                            <option value="fee-office">Fee Office</option>
                            <option value="manager">Manager</option>
                            <option value="tutor">Tutor</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${roleColor}`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {isEditing ? (
                          <input
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editForm.department}
                            onChange={(e) =>
                              setEditForm({ ...editForm, department: e.target.value })
                            }
                          />
                        ) : (
                          <div className="text-sm text-gray-700">
                            {user.department || "-"}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {isEditing ? (
                          <input
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editForm.degree}
                            onChange={(e) =>
                              setEditForm({ ...editForm, degree: e.target.value })
                            }
                          />
                        ) : (
                          <div className="text-sm text-gray-700">
                            {user.degree || "-"}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {isEditing ? (
                          <input
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={editForm.cnic}
                            onChange={(e) =>
                              setEditForm({ ...editForm, cnic: e.target.value })
                            }
                          />
                        ) : (
                          <div className="text-sm font-mono text-gray-700">
                            {user.cnic}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(user.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit user"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, user.name, user.role)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}