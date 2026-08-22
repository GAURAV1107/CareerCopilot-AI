"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  Table as TableIcon,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
  UserCheck,
  Sparkles,
  ChevronRight,
  Bell,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Link2,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  status: string;
  followUpStatus?: string;
  appliedDate?: string;
  createdAt: string;
  recruiterName?: string;
  recruiterEmail?: string;
  referralDetails?: string;
  salaryOffered?: number;
  notes?: string;
  job: {
    id: string;
    companyName: string;
    companyWebsite?: string;
    jobTitle: string;
    jobUrl?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    workMode?: string;
    source?: string;
  };
  interviews?: {
    id: string;
    type: string;
    date: string;
    time?: string;
    timezone?: string;
    interviewerName?: string;
    status: string;
  }[];
  reminders?: {
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
  }[];
  jobMatches?: {
    overallScore: number;
  }[];
}

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Application Modal Form state
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");
  const [salaryMin, setSalaryMin] = useState("140000");
  const [salaryMax, setSalaryMax] = useState("170000");
  const [description, setDescription] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [referralDetails, setReferralDetails] = useState("");
  const [status, setStatus] = useState("Saved");
  const [followUpStatus, setFollowUpStatus] = useState("No");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchApplications();
    }
  };

  const handleFollowUpChange = async (appId: string, newFollowUpStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, followUpStatus: newFollowUpStatus } : app))
    );

    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpStatus: newFollowUpStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchApplications();
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobTitle,
          jobUrl,
          location,
          salaryMin,
          salaryMax,
          description,
          recruiterName,
          recruiterEmail,
          referralDetails,
          status,
          followUpStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to save job application.");

      setShowAddModal(false);
      setCompanyName("");
      setJobTitle("");
      setJobUrl("");
      setDescription("");
      setRecruiterName("");
      setRecruiterEmail("");
      setReferralDetails("");
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.recruiterName && app.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = selectedStage === "ALL" || app.status === selectedStage;
    return matchesSearch && matchesStage;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null;
    const symbol = currency === "USD" ? "$" : currency;
    if (min && max) return `${symbol}${(min / 1000).toFixed(0)}k - ${symbol}${(max / 1000).toFixed(0)}k`;
    if (min) return `${symbol}${(min / 1000).toFixed(0)}k+`;
    return `Up to ${symbol}${(max! / 1000).toFixed(0)}k`;
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading Job Tracker Pipeline...</div>;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Application Tracker</h1>
          <p className="text-xs text-slate-400">
            Manage your 12-stage application pipeline, interview schedules, recruiter contacts, and follow-up status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "kanban" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> Table
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company, job title, or recruiter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400">Filter Stage:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Pipeline Stages ({applications.length})</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s} ({applications.filter((a) => a.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage);
            return (
              <div
                key={stage}
                className="w-80 shrink-0 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-220px)]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md rounded-t-2xl z-10">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    <h3 className="text-xs font-bold text-white tracking-wide">{stage}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageApps.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl text-[11px] text-slate-500">
                      No applications in {stage}
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const matchScore = app.jobMatches?.[0]?.overallScore;
                      const nextInterview = app.interviews?.find((i) => i.status === "Scheduled");
                      const salaryText = formatSalary(app.job.salaryMin, app.job.salaryMax, app.job.currency);

                      return (
                        <div
                          key={app.id}
                          className="bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 transition shadow-lg space-y-3 group"
                        >
                          {/* Card Top: Title & Score */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/applications/${app.id}`}
                                className="font-bold text-sm text-white hover:text-blue-400 transition line-clamp-1"
                              >
                                {app.job.jobTitle}
                              </Link>
                              <p className="text-xs text-slate-300 font-semibold">{app.job.companyName}</p>
                            </div>
                            {matchScore !== undefined && (
                              <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {matchScore}% Match
                              </span>
                            )}
                          </div>

                          {/* Dates & Salary Badges */}
                          <div className="space-y-1.5 text-[11px] text-slate-400">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-500" /> Added: {formatDate(app.createdAt)}
                              </span>
                              {app.appliedDate ? (
                                <span className="text-emerald-400 font-medium">Applied: {formatDate(app.appliedDate)}</span>
                              ) : (
                                <span className="text-slate-500 italic">Not Applied</span>
                              )}
                            </div>

                            {salaryText && (
                              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                                <DollarSign className="h-3 w-3 text-emerald-400" />
                                <span>{salaryText}</span>
                              </div>
                            )}

                            {/* Job Post URL */}
                            {app.job.jobUrl && (
                              <a
                                href={app.job.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 hover:underline font-medium text-[10px]"
                              >
                                <Link2 className="h-3 w-3" /> View Original Job Post <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>

                          {/* Scheduled Interview Highlight */}
                          {nextInterview && (
                            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] space-y-0.5">
                              <div className="font-bold text-violet-300 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-violet-400" />
                                <span>Upcoming Interview</span>
                              </div>
                              <p className="text-slate-300 font-medium">
                                {nextInterview.type} ({formatDate(nextInterview.date)} at {nextInterview.time || "TBD"})
                              </p>
                            </div>
                          )}

                          {/* HR / Recruiter Details or Referral Details */}
                          {(app.recruiterName || app.recruiterEmail || app.referralDetails) && (
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                                <User className="h-3 w-3 text-blue-400" /> HR & Referral Contact
                              </span>
                              {app.recruiterName && <p className="font-bold text-slate-200">{app.recruiterName}</p>}
                              {app.recruiterEmail && <p className="text-slate-400 text-[10px]">{app.recruiterEmail}</p>}
                              {app.referralDetails && (
                                <p className="text-indigo-400 text-[10px] italic">Ref: {app.referralDetails}</p>
                              )}
                            </div>
                          )}

                          {/* Follow-Up Required Dropdown Badge */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-slate-400">Follow Up?</span>
                            <select
                              value={app.followUpStatus || "No"}
                              onChange={(e) => handleFollowUpChange(app.id, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition ${
                                app.followUpStatus === "Yes"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : app.followUpStatus === "Pending"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}
                            >
                              <option value="No">No Follow Up</option>
                              <option value="Yes">⚠️ Follow Up Required</option>
                              <option value="Pending">⏳ Follow Up Pending</option>
                            </select>
                          </div>

                          {/* Quick Stage Mover */}
                          <div className="flex items-center justify-between pt-1">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 px-2 py-1 focus:outline-none"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Move to {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Company & Job Title</th>
                <th className="p-4">Pipeline Stage</th>
                <th className="p-4">Follow Up Required?</th>
                <th className="p-4">HR / Recruiter Contact</th>
                <th className="p-4">Salary Range</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <Link href={`/applications/${app.id}`} className="font-bold text-white text-sm hover:text-blue-400">
                      {app.job.jobTitle}
                    </Link>
                    <p className="text-slate-400">{app.job.companyName}</p>
                    {app.job.jobUrl && (
                      <a href={app.job.jobUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-[10px] block mt-0.5">
                        View Job Post →
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={app.followUpStatus || "No"}
                      onChange={(e) => handleFollowUpChange(app.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                        app.followUpStatus === "Yes"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : app.followUpStatus === "Pending"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      <option value="No">No Follow Up</option>
                      <option value="Yes">⚠️ Follow Up Required</option>
                      <option value="Pending">⏳ Follow Up Pending</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {app.recruiterName || app.recruiterEmail ? (
                      <div>
                        <p className="font-semibold text-slate-200">{app.recruiterName || "Recruiter"}</p>
                        <p className="text-slate-400 text-[10px]">{app.recruiterEmail}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None logged</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-emerald-400">
                    {formatSalary(app.job.salaryMin, app.job.salaryMax, app.job.currency) || "N/A"}
                  </td>
                  <td className="p-4 text-[11px] text-slate-400">
                    <div>Added: {formatDate(app.createdAt)}</div>
                    {app.appliedDate && <div className="text-emerald-400">Applied: {formatDate(app.appliedDate)}</div>}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <span>Add New Job Opportunity</span>
            </h2>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CloudScale Systems"
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
                    placeholder="e.g. Senior SDET"
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
                  <label className="block font-semibold text-slate-300 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              {/* HR / Recruiter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Recruiter Email</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              {/* Referral details */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Referral / Source Contact Details</label>
                <input
                  type="text"
                  placeholder="e.g. Referred by Marcus Vance (Staff SDET)"
                  value={referralDetails}
                  onChange={(e) => setReferralDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              {/* Pipeline Stage & Follow Up Required */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Pipeline Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Follow Up Required?</label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-semibold"
                  >
                    <option value="No">No Follow Up</option>
                    <option value="Yes">⚠️ Follow Up Required</option>
                    <option value="Pending">⏳ Follow Up Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  placeholder="Paste job description text here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  {submitting ? "Saving Opportunity..." : "Save Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
