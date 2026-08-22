"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  List,
  Plus,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MoveRight,
  CheckCircle2,
} from "lucide-react";

const STAGES = [
  "Saved",
  "Interested",
  "Applied",
  "Recruiter Contacted",
  "Screening",
  "Technical Interview",
  "Managerial Interview",
  "HR Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

interface ApplicationItem {
  id: string;
  status: string;
  appliedDate?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  salaryOffered?: number;
  notes?: string;
  isArchived: boolean;
  job: {
    id: string;
    companyName: string;
    jobTitle: string;
    location?: string;
    workMode?: string;
  };
  resume?: {
    id: string;
    filename: string;
  };
  jobMatches?: Array<{
    overallScore: number;
  }>;
}

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [filterStage, setFilterStage] = useState<string>("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filterStage === "All") return !app.isArchived;
    return app.status === filterStage && !app.isArchived;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Application Tracker</h1>
          <p className="text-xs text-slate-400">Manage your complete job application pipeline through 12 stages.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "kanban" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "table" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Track Application</span>
          </Link>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.status === stage && !a.isArchived);

            return (
              <div key={stage} className="w-72 shrink-0 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex flex-col max-h-[75vh]">
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{stage}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {stageApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Body */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="h-24 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-600">
                      No applications
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-blue-500/40 transition shadow-sm group"
                      >
                        <div className="flex items-start justify-between">
                          <Link href={`/applications/${app.id}`} className="font-semibold text-xs text-white hover:text-blue-400">
                            {app.job.jobTitle}
                          </Link>
                          {app.jobMatches?.[0]?.overallScore && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                              {app.jobMatches[0].overallScore}%
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          <span>{app.job.companyName}</span>
                        </p>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                          {/* Quick Stage Selector dropdown */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                Move to {s}
                              </option>
                            ))}
                          </select>

                          <Link href={`/applications/${app.id}`} className="text-slate-500 hover:text-blue-400">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Job Title & Company</th>
                <th className="p-4">Status Stage</th>
                <th className="p-4">Match Score</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <Link href={`/applications/${app.id}`} className="font-semibold text-white hover:text-blue-400">
                      {app.job.jobTitle}
                    </Link>
                    <p className="text-slate-400 text-[11px] mt-0.5">{app.job.companyName}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-blue-300 rounded-lg px-2.5 py-1"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    {app.jobMatches?.[0]?.overallScore ? (
                      <span className="font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                        {app.jobMatches[0].overallScore}%
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/applications/${app.id}`} className="text-blue-400 font-semibold hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
