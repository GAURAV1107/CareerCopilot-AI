"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Bell,
  CalendarCheck,
  Download,
  FileCheck2,
  Wand2,
} from "lucide-react";
import { generateTailoredResumePDF } from "@/lib/pdf-generator";

interface ApplicationDetail {
  id: string;
  status: string;
  appliedDate?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  salaryOffered?: number;
  notes?: string;
  job: {
    id: string;
    companyName: string;
    jobTitle: string;
    description: string;
    location?: string;
    workMode?: string;
  };
  resume?: {
    id: string;
    filename: string;
  };
  activities: Array<{
    id: string;
    eventType: string;
    description: string;
    createdAt: string;
  }>;
  interviews: Array<{
    id: string;
    type: string;
    round: number;
    date: string;
    time: string;
    interviewerName?: string;
    status: string;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
  }>;
  jobMatches: Array<{
    overallScore: number;
    explanation: string;
  }>;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Tailored Resume State
  const [tailoring, setTailoring] = useState(false);
  const [tailoredData, setTailoredData] = useState<any>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await fetch(`/api/applications/${id}`);
        const data = await res.json();
        if (data.application) {
          setApp(data.application);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [id]);

  const handleGenerateTailoredResume = async () => {
    setTailoring(true);
    try {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });
      const data = await res.json();
      if (data.tailoredData) {
        setTailoredData(data.tailoredData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTailoring(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (tailoredData) {
      // Client-side PDF generation using jsPDF
      const doc = generateTailoredResumePDF(tailoredData);
      const filename = `${tailoredData.candidateName.replace(/\s+/g, "_")}_Resume_${app?.job.companyName.replace(
        /[^a-zA-Z0-9]/g,
        ""
      )}.pdf`;
      doc.save(filename);
    } else {
      // Direct server-side API stream download
      window.open(`/api/applications/${id}/tailored-resume-pdf`, "_blank");
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-500">Loading application timeline...</div>;
  if (!app) return <div className="p-8 text-xs text-red-400">Application not found.</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tracker Board</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{app.job.jobTitle}</h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {app.status}
              </span>
            </div>
            <p className="text-xs text-blue-400 font-medium flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              <span>{app.job.companyName}</span>
              <span className="text-slate-500">•</span>
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">{app.job.location} ({app.job.workMode})</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Tailored Resume PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEW SECTION: AI-Tailored Resume & PDF Export */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Job-Tailored Resume & PDF Generator</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  New Feature
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically modifies your primary resume to emphasize skills & keywords tailored for {app.job.companyName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateTailoredResume}
              disabled={tailoring}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>{tailoring ? "Modifying Resume..." : tailoredData ? "Regenerate Tailored Resume" : "Generate Tailored Resume"}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Tailored Resume Content Preview */}
        {tailoredData ? (
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-blue-300 block mb-1">Tailored Professional Summary:</span>
              <p className="text-xs text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {tailoredData.summary}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-violet-300 block mb-1.5">Targeted Skills & Competencies:</span>
              <div className="flex flex-wrap gap-1.5">
                {tailoredData.skills?.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-indigo-300 block">Job-Aligned Experience Highlights:</span>
              {tailoredData.experience?.slice(0, 1).map((exp: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{exp.title} — {exp.company}</span>
                    <span className="text-[10px] text-slate-400">{exp.period}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {exp.bullets?.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>
              💡 Primary Resume parsed! Click <strong>&ldquo;Generate Tailored Resume&rdquo;</strong> or <strong>&ldquo;Download PDF&rdquo;</strong> to export your custom resume PDF formatted specifically for {app.job.jobTitle} at {app.job.companyName}.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Info & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application & Recruiter Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-400" />
              <span>Application Details</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Applied Date</span>
                <span className="text-slate-200 font-semibold">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Base Resume Used</span>
                <span className="text-blue-400 font-semibold">{app.resume?.filename || "Primary Resume"}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Recruiter Contact</span>
                <span className="text-slate-200 font-semibold">{app.recruiterName || "Sarah Jenkins"}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Recruiter Email</span>
                <span className="text-slate-400 font-mono text-[11px]">{app.recruiterEmail || "sarah.jenkins@cloudscale.example.com"}</span>
              </div>
            </div>

            {app.notes && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 text-xs block mb-1">Notes:</span>
                <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800">{app.notes}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" />
              <span>Activity Timeline Log</span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {app.activities.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-blue-600 border-4 border-slate-900"></div>
                  <div>
                    <span className="text-xs font-bold text-white">{act.eventType}</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Interviews & Reminders */}
        <div className="space-y-6">
          {/* Scheduled Interviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-violet-400" />
                <span>Interviews</span>
              </h2>
              <Link href="/interviews" className="text-[11px] text-violet-400 hover:underline">
                + Schedule
              </Link>
            </div>

            {app.interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No interview scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {app.interviews.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{inv.type}</span>
                      <span className="text-[10px] text-violet-300">Round {inv.round}</span>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(inv.date).toLocaleDateString()} at {inv.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Reminders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <span>Reminders</span>
            </h2>

            {app.reminders.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No active reminders.</p>
            ) : (
              <div className="space-y-2">
                {app.reminders.map((rem) => (
                  <div key={rem.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{rem.title}</p>
                      <p className="text-[10px] text-slate-500">Due: {new Date(rem.dueDate).toLocaleDateString()}</p>
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
