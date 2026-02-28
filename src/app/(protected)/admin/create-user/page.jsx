"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const initialStudent = {
  name: "",
  registrationNumber: "",
  department: "",
  degree: "",
  role: "student",
  cnic: "",
  password: "",
  userType: "student"
};

const initialStaff = {
  name: "",
  email: "",
  role: "",
  department: "",
  cnic: "",
  password: "",
  userType: "staff"
};

export default function CreateUserPage() {
  const router = useRouter();
  const [userType, setUserType] = useState("student");
  const [student, setStudent] = useState(initialStudent);
  const [staff, setStaff] = useState(initialStaff);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const data = userType === "student" ? student : staff;
  const setData = userType === "student" ? setStudent : setStaff;

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/department");
      const deptData = await res.json();
      setDepartments(deptData);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    for (const key in data) {
      if (!data[key] && key !== "email" && key !== "degree") {
        alert(`Please fill ${key} field`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setLoading(false);
      
      if (res.ok) {
        alert(`✓ ${result.message}`);
        setStudent(initialStudent);
        setStaff(initialStaff);
        router.push("/admin/users");
      } else {
        alert(`✗ ${result.message || "Failed to create user"}`);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("✗ Network error. Please try again.");
    }
  }

  const staffRoles = [
    { value: "admin", label: "Admin", max: 1 },
    { value: "dg-office", label: "DG Office", max: 1 },
    { value: "fee-office", label: "Fee Office", max: 1 },
    { value: "manager", label: "Manager", max: "∞" },
    { value: "tutor", label: "Tutor", max: "∞" },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
        <p className="text-gray-600 mt-1">Add new student or staff member</p>
      </div>

      {/* User Type Toggle */}
      <div className="mb-6 p-1 bg-gray-100 rounded-lg inline-flex">
        {["student", "staff"].map((type) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              userType === type 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="Enter full name"
              value={data.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {userType === "student" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="registrationNumber"
                  placeholder="e.g., 2022-CS-001"
                  value={student.registrationNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={student.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree Program
                </label>
                <input
                  name="degree"
                  placeholder="e.g., BS Computer Science"
                  value={student.degree}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="user@university.edu.pk"
                  value={staff.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={staff.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select Role</option>
                  {staffRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} {role.max !== "∞" ? `(Max: ${role.max})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={staff.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC <span className="text-red-500">*</span>
            </label>
            <input
              name="cnic"
              placeholder="XXXXX-XXXXXXX-X"
              value={data.cnic}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={data.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : userType === "student"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            `Create ${userType === "student" ? "Student" : "Staff"}`
          )}
        </button>
      </form>
    </div>
  );
}