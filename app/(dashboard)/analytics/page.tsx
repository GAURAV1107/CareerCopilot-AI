"use client";

import { useEffect, useState } from "react";
import { BarChart3, PieChart, TrendingUp, Award, KanbanSquare, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-xs text-slate-500">Calculating job search metrics...</div>;
  if (!data) return <div className="p-8 text-xs text-red-400">Failed to load analytics data.</div>;

  const m = data.metrics;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Job Search Analytics & Conversion Rates</h1>
        <p className="text-xs text-slate-400">Data-driven performance metrics tracking your application-to-interview conversion funnel.</p>
      </div>

      {/* Conversion Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">App-to-Interview Rate</span>
          <p className="text-3xl font-black text-blue-400">{m.appToInterviewRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{m.interviewCount} of {m.totalApplications} converted</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Interview-to-Offer Rate</span>
          <p className="text-3xl font-black text-violet-400">{m.interviewToOfferRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{m.offerCount} offer from {m.interviewCount} interviews</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Overall Offer Conversion</span>
          <p className="text-3xl font-black text-emerald-400">{m.offerRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{m.offerCount} total offer extended</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Rejection Rate</span>
          <p className="text-3xl font-black text-rose-400">{m.rejectionRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{m.rejectionCount} roles closed</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <PieChart className="h-4 w-4 text-blue-400" />
            <span>Pipeline Status Breakdown</span>
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#3b82f6"
                  label
                >
                  {data.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "12px" }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <span>Applications by Job Source</span>
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sourceDistribution}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "12px" }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
