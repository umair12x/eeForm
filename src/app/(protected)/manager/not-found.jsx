import Link from "next/link";
import { 
  FaTachometerAlt, 
  FaUserTie, 
  FaChalkboardTeacher, 
  FaBuilding, 
  FaUniversity, 
  FaMoneyBillWave,
  FaUserGraduate,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSearch
} from "react-icons/fa";

export default function AdminNotFound() {
  const adminPages = [
    { name: "Dashboard", href: "/admin", icon: <FaTachometerAlt />, color: "text-blue-600", bgColor: "bg-blue-100" },
    { name: "Manager", href: "/admin/manager", icon: <FaUserTie />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { name: "Advisor", href: "/admin/advisor", icon: <FaChalkboardTeacher />, color: "text-green-600", bgColor: "bg-green-100" },
    { name: "Director", href: "/admin/director", icon: <FaBuilding />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    { name: "Controller", href: "/admin/controller", icon: <FaUniversity />, color: "text-red-600", bgColor: "bg-red-100" },
    { name: "Fee Section", href: "/admin/fee-section", icon: <FaMoneyBillWave />, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { name: "Students", href: "/admin/students", icon: <FaUserGraduate />, color: "text-teal-600", bgColor: "bg-teal-100" },
    { name: "Forms", href: "/admin/forms", icon: <FaFileAlt />, color: "text-pink-600", bgColor: "bg-pink-100" },
    { name: "Reports", href: "/admin/reports", icon: <FaChartBar />, color: "text-orange-600", bgColor: "bg-orange-100" },
    { name: "Settings", href: "/admin/settings", icon: <FaCog />, color: "text-gray-600", bgColor: "bg-gray-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gray-800 rounded-lg text-white">
                <FaUniversity />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  UAF Admin Panel
                </h1>
                <p className="text-gray-600">University Management System</p>
              </div>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                      <FaExclamationTriangle className="text-3xl text-red-500" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-white">404</h1>
                      <p className="text-gray-300 text-lg">Admin Page Not Found</p>
                    </div>
                  </div>
                  <p className="text-gray-300 max-w-xl">
                    The administrative page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href="/admin"
                    className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <FaTachometerAlt /> Dashboard
                  </Link>
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <FaArrowLeft /> Go Back
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Quick Navigation */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaSearch className="text-blue-600" /> Quick Navigation
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {adminPages.slice(0, 5).map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className={`p-3 rounded-lg ${page.bgColor} ${page.color} mb-3 group-hover:scale-110 transition-transform`}>
                        {page.icon}
                      </div>
                      <div className="font-medium text-gray-800 group-hover:text-blue-600">
                        {page.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* All Admin Pages */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">All Admin Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminPages.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="group flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className={`p-3 rounded-lg mr-4 ${page.bgColor} ${page.color} group-hover:scale-110 transition-transform`}>
                        {page.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 group-hover:text-blue-600">
                          {page.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Administrative section
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t p-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Need Assistance?</h3>
                  <p className="text-gray-600 mb-4">
                    If you believe you should have access to this page or are experiencing technical difficulties, 
                    please contact the system administrator.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Contact Admin
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                      View Access Logs
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Admin System</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">User Authentication</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 mt-1" />
              <div>
                <h4 className="font-bold text-yellow-800 mb-2">Security Notice</h4>
                <p className="text-yellow-700 text-sm">
                  This is a restricted administrative area. Unauthorized access is prohibited. 
                  All activities are logged and monitored. Please ensure you log out after completing your tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}