"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, MapPin, DollarSign, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, KanbanSquare } from "lucide-react";

interface JobDetail {
  id: string;
  companyName: string;
  companyWebsite?: string;
  jobTitle: string;
  description: string;
  jobUrl?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  workMode?: string;
  source?: string;
  jobMatchAnalyses: Array<{
    overallScore: number;
    skillMatchScore: number;
    expMatchScore: number;
    semanticScore: number;
    locationScore: number;
    keywordScore: number;
    explanation: string;
    matchingSkills: string;
    missingSkills: string;
  }>;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [matchData, setMatchData] = useState<JobDetail["jobMatchAnalyses"][0] | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (data.job) {
          setJob(data.job);
          if (data.job.jobMatchAnalyses?.[0]) {
            setMatchData(data.job.jobMatchAnalyses[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleCalculateMatch = async () => {
    setCalculating(true);
    try {
      const res = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      const data = await res.json();
      if (data.matchResult) {
        setMatchData({
          overallScore: data.matchResult.overallScore,
          skillMatchScore: data.matchResult.skillMatchScore,
          expMatchScore: data.matchResult.expMatchScore,
          semanticScore: data.matchResult.semanticScore,
          locationScore: data.matchResult.locationScore,
          keywordScore: data.matchResult.keywordScore,
          explanation: data.matchResult.explanation,
          matchingSkills: JSON.stringify(data.matchResult.matchingSkills),
          missingSkills: JSON.stringify(data.matchResult.missingSkills),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleCreateApplication = async () => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id,
          status: "Saved",
          appliedDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.application) {
        router.push(`/applications/${data.application.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-500">Loading job details...</div>;
  if (!job) return <div className="p-8 text-xs text-red-400">Job not found.</div>;

  let matchingSkillsArr: string[] = [];
  let missingSkillsArr: string[] = [];
  if (matchData) {
    try {
      matchingSkillsArr = JSON.parse(matchData.matchingSkills || "[]");
      missingSkillsArr = JSON.parse(matchData.missingSkills || "[]");
    } catch {}
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Jobs</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{job.jobTitle}</h1>
            <p className="text-xs text-blue-400 font-medium flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              <span>{job.companyName}</span>
              <span className="text-slate-500">•</span>
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">{job.location} ({job.workMode})</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculateMatch}
              disabled={calculating}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{calculating ? "Scoring Match..." : "Calculate AI Match"}</span>
            </button>

            <button
              onClick={handleCreateApplication}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <KanbanSquare className="h-4 w-4" />
              <span>Track Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Score Display Card */}
      {matchData && (
        <div className="bg-gradient-to-r from-violet-950/80 via-slate-900 to-blue-950/80 border border-violet-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center text-xl font-black">
                {matchData.overallScore}%
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Explainable Hybrid Match Score</h3>
                <p className="text-xs text-slate-400">40% Skills • 25% Experience • 15% Semantic • 10% Location • 10% Keywords</p>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Skills Match (40%)</span>
              <span className="text-sm font-bold text-blue-400">{matchData.skillMatchScore}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Experience (25%)</span>
              <span className="text-sm font-bold text-indigo-400">{matchData.expMatchScore}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Semantic (15%)</span>
              <span className="text-sm font-bold text-violet-400">{matchData.semanticScore}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Location (10%)</span>
              <span className="text-sm font-bold text-emerald-400">{matchData.locationScore}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Keywords (10%)</span>
              <span className="text-sm font-bold text-amber-400">{matchData.keywordScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            💡 <strong>Score Explanation:</strong> {matchData.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingSkillsArr.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matching Skills Found:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSkillsArr.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingSkillsArr.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-amber-400 block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Missing Skills / Keywords:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkillsArr.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Job Description & Requirements</h2>
        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
          {job.description}
        </div>
      </div>
    </div>
  );
}
