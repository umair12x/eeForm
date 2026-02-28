"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminNavbar() {
  const pathname = usePathname()

  const links = [
    { name: "Dashboard", href: "/admin/" },
    { name: "Departments", href: "/admin/departments" },
    { name: "Degrees", href: "/admin/degrees" },
    { name: "Subjects", href: "/admin/subjects" },
    { name: "Users", href: "/admin/users" },
    { name: "Create User", href: "/admin/create-user" },
  ]

  return (
    <nav className="bg-black text-white p-4 flex flex-wrap gap-2 md:gap-4">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded transition-colors text-sm md:text-base ${
            pathname === link.href
              ? "bg-green-500 font-semibold"
              : "hover:bg-gray-700"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  )
}
