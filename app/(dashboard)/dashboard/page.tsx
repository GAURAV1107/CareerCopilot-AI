"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  CalendarCheck,
  Award,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

interface DashboardData {
  applications: Array<{
    id: string;
    status: string;
    appliedDate: string;
    createdAt: string;
    job: {
      id: string;
      companyName: string;
      jobTitle: string;
      location: string;
      workMode: string;
    };
    jobMatches: Array<{
      overallScore: number;
    }>;
  }>;
  interviews: Array<{
    id: string;
    type: string;
    round: number;
    date: string;
    time: string;
    interviewerName?: string;
    application: {
      job: {
        companyName: string;
        jobTitle: string;
      };
    };
  }>;
  reminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    type: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [appsRes, intsRes, remsRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/interviews"),
          fetch("/api/reminders"),
        ]);

        const apps = await appsRes.json();
        const ints = await intsRes.json();
        const rems = await remsRes.json();

        setData({
          applications: apps.applications || [],
          interviews: ints.interviews || [],
          reminders: rems.reminders || [],
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl border border-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
        </div>
      </div>
    );
  }

  const apps = data?.applications || [];
  const interviews = data?.interviews || [];
  const reminders = data?.reminders || [];

  // Metrics
  const totalApps = apps.length;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const appsThisWeek = apps.filter((a) => new Date(a.createdAt) >= oneWeekAgo).length;
  const interviewsScheduled = interviews.filter((i) => new Date(i.date) >= new Date()).length;
  const offersReceived = apps.filter((a) => a.status === "Offer" || a.status === "Accepted").length;
  const rejections = apps.filter((a) => a.status === "Rejected").length;
  const pendingApps = apps.filter((a) => !["Accepted", "Rejected", "Withdrawn"].includes(a.status)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400">Welcome back, Manujendra. Here is your QA & SDET job search overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            <KanbanSquare className="h-4 w-4" />
            <span>View Pipeline Board</span>
          </Link>
          <Link
            href="/ai-copilot"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Copilot</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Apps</span>
            <KanbanSquare className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalApps}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active pipeline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">This Week</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">+{appsThisWeek}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">New applications</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Interviews</span>
            <CalendarCheck className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-violet-400">{interviewsScheduled}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Upcoming rounds</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Offers</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{offersReceived}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Offers received</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Rejections</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{rejections}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Archived / Closed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{pendingApps}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting response</span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-violet-950/80 via-slate-900 to-blue-950/80 border border-violet-500/30 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">CareerCopilot AI Insights</h2>
            <p className="text-xs text-slate-400">Smart intelligence derived from your profile and applications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3 text-xs text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">Strongest Match Alignment:</span>
              <p className="text-slate-400 mt-0.5">
                Your profile shows an <strong className="text-white">88% match rate</strong> for Senior QA Automation Engineer and SDET positions requiring Selenium & RestAssured.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3 text-xs text-slate-200">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">Skill Opportunity Identified:</span>
              <p className="text-slate-400 mt-0.5">
                <strong className="text-white">Docker</strong> and <strong className="text-white">Playwright</strong> appear in 70% of saved jobs. Adding containerized grid details will boost ATS rank.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Interviews & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KanbanSquare className="h-4 w-4 text-blue-400" />
              <span>Recent Applications</span>
            </h2>
            <Link href="/applications" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View All Pipeline <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {apps.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
              <FileCheck2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No job applications created yet</p>
              <p className="text-xs text-slate-500 mb-4">Start by adding a job opportunity to track your search.</p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Job</span>
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
              {apps.slice(0, 5).map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                  <div>
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-semibold text-sm text-white hover:text-blue-400 transition"
                    >
                      {app.job.jobTitle}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {app.job.companyName} • <span className="text-slate-500">{app.job.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.jobMatches?.[0]?.overallScore && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {app.jobMatches[0].overallScore}% Match
                      </span>
                    )}
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interviews & Reminders */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-violet-400" />
                <span>Upcoming Interviews</span>
              </h2>
              <Link href="/interviews" className="text-xs text-violet-400 hover:underline">
                Manage
              </Link>
            </div>

            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No interviews scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.application.job.companyName}</span>
                      <span className="text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.application.job.jobTitle}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>{new Date(item.date).toLocaleDateString()} at {item.time}</span>
                      {item.interviewerName && <span>With {item.interviewerName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <span>Pending Reminders</span>
              </h2>
              <Link href="/reminders" className="text-xs text-amber-400 hover:underline">
                View All
              </Link>
            </div>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active reminders.</p>
            ) : (
              <div className="space-y-2.5">
                {reminders.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{r.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Due: {new Date(r.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
