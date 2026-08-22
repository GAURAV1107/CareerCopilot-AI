"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Plus, ExternalLink, Trash2, Clock, MapPin, Building2, User } from "lucide-react";

interface InterviewItem {
  id: string;
  type: string;
  round: number;
  date: string;
  time: string;
  timezone?: string;
  interviewerName?: string;
  meetingLink?: string;
  notes?: string;
  status: string;
  application: {
    job: {
      companyName: string;
      jobTitle: string;
    };
  };
}

export default function InterviewTrackerPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  async function fetchInterviews() {
    try {
      const res = await fetch("/api/interviews");
      const data = await res.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview schedule?")) return;
    try {
      await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      fetchInterviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interview Tracker</h1>
          <p className="text-xs text-slate-400">Track upcoming recruiter screens, technical coding rounds, and system design interviews.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <CalendarCheck className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No interviews scheduled yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((inv) => (
            <div key={inv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {inv.type} (Round {inv.round})
                  </span>
                  <h3 className="font-bold text-base text-white mt-1.5">{inv.application.job.jobTitle}</h3>
                  <p className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{inv.application.job.companyName}</span>
                  </p>
                </div>

                <button onClick={() => handleDelete(inv.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    {new Date(inv.date).toLocaleDateString()} at {inv.time} ({inv.timezone || "PST"})
                  </span>
                  <span className="font-semibold text-emerald-400">{inv.status}</span>
                </div>

                {inv.interviewerName && (
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    Interviewer: {inv.interviewerName}
                  </p>
                )}
              </div>

              {inv.notes && <p className="text-xs text-slate-300 italic">Notes: &ldquo;{inv.notes}&rdquo;</p>}

              {inv.meetingLink && (
                <a
                  href={inv.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:underline pt-2 border-t border-slate-800"
                >
                  <span>Join Video Meeting</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
