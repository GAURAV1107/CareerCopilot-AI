"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, CheckCircle2, Clock, Trash2 } from "lucide-react";

interface ReminderItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  application?: {
    job: {
      companyName: string;
      jobTitle: string;
    };
  };
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Follow Up");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, dueDate }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setDescription("");
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Application Reminders</h1>
          <p className="text-xs text-slate-400">Set follow-up reminders, thank you emails, and interview prep deadlines.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">Loading reminders...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
          {reminders.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(r.id, r.isCompleted)}
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center transition ${
                    r.isCompleted ? "bg-emerald-500 text-white" : "border-2 border-slate-600 hover:border-amber-400"
                  }`}
                >
                  {r.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </button>
                <div>
                  <h3 className={`font-semibold text-xs text-white ${r.isCompleted ? "line-through text-slate-500" : ""}`}>
                    {r.title}
                  </h3>
                  {r.description && <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>}
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due: {new Date(r.dueDate).toLocaleDateString()} ({r.type})
                  </p>
                </div>
              </div>

              <button onClick={() => handleDelete(r.id)} className="text-slate-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create New Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up with recruiter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                >
                  <option value="Follow Up">Follow Up</option>
                  <option value="Interview">Interview</option>
                  <option value="Send Thank You Email">Send Thank You Email</option>
                  <option value="Application Deadline">Application Deadline</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="text-right pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
