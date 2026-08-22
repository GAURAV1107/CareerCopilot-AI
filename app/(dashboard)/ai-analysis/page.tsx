"use client";

import { useState } from "react";
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Wand2, ShieldCheck } from "lucide-react";

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<"job" | "resume" | "suggestions">("job");

  // Job analysis state
  const [jobDescriptionInput, setJobDescriptionInput] = useState(
    `We are seeking a Senior QA Automation Engineer to lead quality initiatives. You will design automation frameworks in Java, Selenium, Playwright, and RestAssured. Integrate tests into Jenkins & GitHub Actions. Deploy test grids using Docker.`
  );
  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [jobResult, setJobResult] = useState<any>(null);

  // Resume analysis state
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState<any>(null);

  // Resume improvement state
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<any>(null);

  const handleAnalyzeJob = async () => {
    setAnalyzingJob(true);
    try {
      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: jobDescriptionInput }),
      });
      const data = await res.json();
      if (data.analysis) setJobResult(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleAnalyzeResume = async () => {
    setAnalyzingResume(true);
    try {
      const res = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescriptionInput }),
      });
      const data = await res.json();
      if (data.analysis) setResumeResult(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setGeneratingSuggestions(true);
    try {
      const res = await fetch("/api/ai/resume-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescriptionInput }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestionResult(data.suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Job & Resume Intelligence</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Extract structured skills from job descriptions, analyze resume compatibility, and get ATS improvement suggestions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("job")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "job" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          1. Job Description Parser
        </button>
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "resume" ? "bg-violet-600 text-white shadow-md shadow-violet-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          2. Resume Comparison AI
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "suggestions" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          3. Resume Improvement Diff
        </button>
      </div>

      {/* Input Text Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <label className="block text-xs font-semibold text-slate-300">Target Job Description</label>
        <textarea
          rows={5}
          value={jobDescriptionInput}
          onChange={(e) => setJobDescriptionInput(e.target.value)}
          placeholder="Paste job description..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-blue-500"
        ></textarea>

        {activeTab === "job" && (
          <button
            onClick={handleAnalyzeJob}
            disabled={analyzingJob || !jobDescriptionInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{analyzingJob ? "Parsing & Validating Schema..." : "Extract Structured Job Skills"}</span>
          </button>
        )}

        {activeTab === "resume" && (
          <button
            onClick={handleAnalyzeResume}
            disabled={analyzingResume || !jobDescriptionInput.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            <span>{analyzingResume ? "Comparing Resume against Job..." : "Run Resume Gap Analysis"}</span>
          </button>
        )}

        {activeTab === "suggestions" && (
          <button
            onClick={handleGenerateSuggestions}
            disabled={generatingSuggestions || !jobDescriptionInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{generatingSuggestions ? "Generating ATS Wording..." : "Generate Resume Improvements"}</span>
          </button>
        )}
      </div>

      {/* Result Display Tab 1: Job Analysis */}
      {activeTab === "job" && jobResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Extracted Job Requirements</h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ✓ Validated JSON Schema
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-blue-400 block">Required Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {jobResult.requiredSkills?.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-violet-400 block">Preferred Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {jobResult.preferredSkills?.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Key Responsibilities:</span>
            <ul className="space-y-1.5">
              {jobResult.responsibilities?.map((resp: string, idx: number) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-blue-400">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Result Display Tab 2: Resume Comparison */}
      {activeTab === "resume" && resumeResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Resume vs Job Description Match</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Grounded evaluation (No invented experience)
            </span>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
            {resumeResult.overallExplanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Matching Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resumeResult.matchingSkills?.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Missing Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resumeResult.missingSkills?.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Display Tab 3: Resume Improvement Diff */}
      {activeTab === "suggestions" && suggestionResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Suggested Resume Wording & Bullet Improvements</h3>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              User explicit approval required before saving
            </span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300">Improved Professional Summary:</h4>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              {suggestionResult.improvedSummary}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300">Bullet Point Wording Recommendations:</h4>
            {suggestionResult.bulletPointSuggestions?.map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs text-rose-400 line-through">
                  <strong>Original:</strong> &ldquo;{item.originalContent}&rdquo;
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  <strong>Suggested:</strong> &ldquo;{item.suggestedContent}&rdquo;
                </div>
                <p className="text-[11px] text-slate-400 italic">Reason: {item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
