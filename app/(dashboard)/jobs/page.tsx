"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Search, ExternalLink, Trash2, Edit, Sparkles, Building2, MapPin, IndianRupee, Link2 } from "lucide-react";

interface JobItem {
  id: string;
  companyName: string;
  companyWebsite?: string;
  jobTitle: string;
  description: string;
  jobUrl?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  employmentType?: string;
  workMode?: string;
  source?: string;
  createdAt: string;
}

const WORK_MODES = ["Remote", "Hybrid", "Onsite"];
const JOB_SOURCES = [
  "LinkedIn",
  "Indeed",
  "Naukri",
  "Glassdoor",
  "Company Website",
  "Recruiter Reachout",
  "Employee Referral",
  "Other",
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("Bengaluru, India");
  const [salaryMin, setSalaryMin] = useState("2400000");
  const [salaryMax, setSalaryMax] = useState("3000000");
  const [currency, setCurrency] = useState("INR");
  const [workMode, setWorkMode] = useState("Remote");
  const [source, setSource] = useState("LinkedIn");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyWebsite,
          jobTitle,
          description,
          jobUrl,
          location,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          currency,
          workMode,
          source,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save job opportunity.");

      setShowModal(false);
      setCompanyName("");
      setCompanyWebsite("");
      setJobTitle("");
      setDescription("");
      setJobUrl("");
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.location && j.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatSalary = (min?: number, max?: number, curr = "INR") => {
    if (!min && !max) return null;
    const formatVal = (val: number) => {
      if (val >= 100000) {
        const lpa = (val / 100000).toFixed(1).replace(/\.0$/, "");
        return `₹${lpa} LPA`;
      }
      return `₹${val.toLocaleString("en-IN")}`;
    };

    if (min && max) return `${formatVal(min)} - ${formatVal(max)}`;
    if (min) return `${formatVal(min)}+`;
    return `Up to ${formatVal(max!)}`;
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading Job Opportunities...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Saved Job Opportunities</h1>
          <p className="text-xs text-slate-400">
            Browse and manage target positions, Work Modes (Remote/Hybrid), Job Sources, and INR (₹) salary ranges.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Opportunity
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company, job title, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No saved jobs found. Click &quot;Add Opportunity&quot; to save a target job.
          </div>
        ) : (
          filteredJobs.map((job) => {
            const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.currency);
            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition shadow-xl flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="font-bold text-white text-base hover:text-blue-400 line-clamp-1">
                        {job.jobTitle}
                      </Link>
                      <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-blue-400" /> {job.companyName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Work Mode & Source Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {job.workMode && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        💻 {job.workMode}
                      </span>
                    )}
                    {job.source && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        🌐 {job.source}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" /> {job.location || "Remote"}
                    </p>
                    {salaryText && (
                      <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span>{salaryText}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View Details & AI Match →
                  </Link>

                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="Open Job Posting"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <span>Add Target Job Opportunity</span>
            </h2>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DataArt Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior QA Automation Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Job Post URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5 text-blue-400" /> Job Post URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              {/* Work Mode & Job Source Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Work Mode Dropdown *</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {WORK_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Source Dropdown *</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {JOB_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Salary in INR (₹) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Salary (INR ₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2400000 (24 LPA)"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Salary (INR ₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3000000 (30 LPA)"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Description *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste job description requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  {submitting ? "Saving..." : "Save Job Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
