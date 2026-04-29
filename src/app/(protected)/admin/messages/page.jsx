 "use client";

import { useEffect, useState } from "react";
import { Mail, Search, RefreshCw, Eye, Trash2 } from "lucide-react";

const STATUS_OPTIONS = ["all", "new", "in-progress", "resolved"];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMessages(false);
  }, [status]);

  async function fetchMessages(silent = true) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const query = new URLSearchParams({ status });
      if (search.trim()) {
        query.set("search", search.trim());
      }

      const res = await fetch(`/api/admin/messages?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      setMessages(data.messages || []);
      setStats(data.stats || { total: 0, unread: 0, resolved: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function markRead(messageId, isRead) {
    const res = await fetch(`/api/admin/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });

    if (res.ok) {
      fetchMessages();
    }
  }

  async function updateStatus(messageId, nextStatus) {
    const res = await fetch(`/api/admin/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      fetchMessages();
    }
  }

  async function removeMessage(messageId) {
    const shouldDelete = confirm("Delete this message permanently?");
    if (!shouldDelete) return;

    const res = await fetch(`/api/admin/messages/${messageId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchMessages();
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-52 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Messages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review contact form messages submitted from the public site.
          </p>
        </div>

        <button
          onClick={() => fetchMessages()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Unread</p>
          <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, subject, message"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchMessages()}
            className="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm"
          >
            Apply
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-70" />
            No messages found.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                      {!item.isRead && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Unread</span>}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.name} ({item.email})
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{item.message}</p>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="new">new</option>
                      <option value="in-progress">in-progress</option>
                      <option value="resolved">resolved</option>
                    </select>

                    <button
                      onClick={() => markRead(item._id, !item.isRead)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      {item.isRead ? "Mark unread" : "Mark read"}
                    </button>

                    <button
                      onClick={() => removeMessage(item._id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-600 text-white text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
