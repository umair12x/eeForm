"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [stats, setStats] = useState({ students: 0, degrees: 0, subjects: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>

  const cards = [
    { label: "Total Students", value: stats.students, bg: "bg-green-500" },
    { label: "Total Degrees", value: stats.degrees, bg: "bg-blue-500" },
    { label: "Total Subjects", value: stats.subjects, bg: "bg-red-500" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.label}
            className={`${card.bg} text-white p-6 rounded shadow hover:scale-105 transform transition-all`}
          >
            <p className="text-sm md:text-base">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
