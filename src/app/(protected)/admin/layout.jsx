"use client"

import AdminNavbar from "@/components/AdminNavbar";


export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-black">
     <AdminNavbar />
      <main className="p-6">{children}</main>
    </div>
  )
}

