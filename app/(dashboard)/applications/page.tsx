"use client";

import { useEffect, useState, useRef } from "react";
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
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Link2,
  Edit,
  Trash2,
  Download,
  Upload,
  X,
  AlertTriangle,
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
    description: string;
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
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "score">("newest");

  // Modal Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [deletingApp, setDeletingApp] = useState<ApplicationItem | null>(null);
  const [importConfirmItems, setImportConfirmItems] = useState<unknown[] | null>(null);

  // Form Fields (Used for Create & Edit)
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
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Populate Edit Modal
  const handleOpenEdit = (app: ApplicationItem) => {
    setEditingApp(app);
    setCompanyName(app.job.companyName);
    setJobTitle(app.job.jobTitle);
    setJobUrl(app.job.jobUrl || "");
    setLocation(app.job.location || "San Francisco, CA");
    setSalaryMin(app.job.salaryMin ? String(app.job.salaryMin) : "");
    setSalaryMax(app.job.salaryMax ? String(app.job.salaryMax) : "");
    setDescription(app.job.description || "");
    setRecruiterName(app.recruiterName || "");
    setRecruiterEmail(app.recruiterEmail || "");
    setReferralDetails(app.referralDetails || "");
    setStatus(app.status);
    setFollowUpStatus(app.followUpStatus || "No");
  };

  // Save / Edit Application
  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingApp) {
        // Update existing application
        const res = await fetch(`/api/applications/${editingApp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            followUpStatus,
            recruiterName,
            recruiterEmail,
            referralDetails,
          }),
        });

        if (!res.ok) throw new Error("Failed to update application.");
        setMessage("Application card updated successfully!");
        setEditingApp(null);
      } else {
        // Create new application
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

        if (!res.ok) throw new Error("Failed to create application.");
        setMessage("New job opportunity card added!");
        setShowAddModal(false);
      }

      fetchApplications();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Application after confirmation
  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${deletingApp.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application.");

      setMessage("Application card deleted successfully.");
      setDeletingApp(null);
      fetchApplications();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

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

  // EXPORT CARDS TO JSON
  const handleExportJSON = () => {
    const exportData = applications.map((app) => ({
      id: app.id,
      companyName: app.job.companyName,
      jobTitle: app.job.jobTitle,
      jobUrl: app.job.jobUrl,
      location: app.job.location,
      salaryMin: app.job.salaryMin,
      salaryMax: app.job.salaryMax,
      currency: app.job.currency,
      workMode: app.job.workMode,
      status: app.status,
      followUpStatus: app.followUpStatus || "No",
      recruiterName: app.recruiterName,
      recruiterEmail: app.recruiterEmail,
      referralDetails: app.referralDetails,
      appliedDate: app.appliedDate,
      createdAt: app.createdAt,
      description: app.job.description,
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `CareerCopilot_Job_Cards_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // TRIGGER FILE INPUT FOR IMPORT JSON
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  // PARSE IMPORTED JSON FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("JSON file must contain an array of job card objects.");
        setImportConfirmItems(parsed);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setMessage(`Import Error: ${errorMessage}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // CONFIRM BULK IMPORT
  const handleConfirmImport = async () => {
    if (!importConfirmItems) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: importConfirmItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");

      setMessage(data.message || `Successfully imported ${data.count} job cards!`);
      setImportConfirmItems(null);
      fetchApplications();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Import Failed: ${errorMessage}`);
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
      {/* Hidden File Input for JSON Import */}
      <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileChange} className="hidden" />

      {/* Header Bar with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Application Tracker</h1>
          <p className="text-xs text-slate-400">
            Manage your 12-stage application pipeline with full CRUD operations, JSON import/export, and recruiter tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* JSON Export Button */}
          <button
            onClick={handleExportJSON}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            title="Export all cards to JSON"
          >
            <Download className="h-4 w-4 text-emerald-400" /> Export JSON
          </button>

          {/* JSON Import Button */}
          <button
            onClick={handleImportJSONClick}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            title="Import cards from JSON file"
          >
            <Upload className="h-4 w-4 text-indigo-400" /> Import JSON
          </button>

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
            onClick={() => {
              setEditingApp(null);
              setCompanyName("");
              setJobTitle("");
              setJobUrl("");
              setDescription("");
              setRecruiterName("");
              setRecruiterEmail("");
              setReferralDetails("");
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            message.startsWith("Error") || message.startsWith("Import Failed")
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.startsWith("Error") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Sort Column Cards:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "score")}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="newest">📅 Date: Newest First</option>
              <option value="oldest">⌛ Date: Oldest First</option>
              <option value="score">🎯 Highest Match Score</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
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
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {STAGES.map((stage) => {
            const stageApps = filteredApps
              .filter((a) => a.status === stage)
              .sort((a, b) => {
                if (sortBy === "oldest") {
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                if (sortBy === "score") {
                  const scoreA = a.jobMatches?.[0]?.overallScore || 0;
                  const scoreB = b.jobMatches?.[0]?.overallScore || 0;
                  return scoreB - scoreA;
                }
                // Default: Newest First
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
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
                          className="bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 rounded-xl p-4 transition shadow-lg space-y-3 group relative"
                        >
                          {/* Card Header & CRUD Action Buttons */}
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

                            {/* Card CRUD Actions */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                              <button
                                onClick={() => handleOpenEdit(app)}
                                title="Edit Opportunity Card"
                                className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-900 rounded-md transition"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingApp(app)}
                                title="Delete Opportunity Card"
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-md transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          {matchScore !== undefined && (
                            <div className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {matchScore}% Match Score
                            </div>
                          )}

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
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(app)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 inline-flex items-center gap-1 text-xs"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingApp(app)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 inline-flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT APPLICATION MODAL */}
      {(showAddModal || editingApp) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingApp ? <Edit className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-blue-400" />}
                <span>{editingApp ? "Edit Opportunity Card" : "Add New Job Opportunity"}</span>
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingApp(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingApp}
                    placeholder="e.g. CloudScale Systems"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingApp}
                    placeholder="e.g. Senior SDET"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
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
                  <label className="block font-semibold text-slate-300 mb-1">Pipeline Stage</label>
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

              {!editingApp && (
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
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  {submitting ? "Saving..." : editingApp ? "Update Card" : "Save Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP FOR DELETE APPLICATION */}
      {deletingApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h2 className="text-base font-bold text-white">Confirm Card Deletion</h2>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deletingApp.job.jobTitle}</strong> at{" "}
              <strong className="text-white">{deletingApp.job.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                {submitting ? "Deleting..." : "Yes, Delete Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP FOR JSON BULK IMPORT */}
      {importConfirmItems && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400">
              <Upload className="h-6 w-6 shrink-0" />
              <h2 className="text-base font-bold text-white">Confirm JSON Bulk Import</h2>
            </div>
            <p className="text-xs text-slate-300">
              Found <strong className="text-indigo-300 font-bold">{importConfirmItems.length} job cards</strong> in the JSON file.
              Do you want to import all of them into your job application tracker pipeline?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImportConfirmItems(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                {submitting ? "Importing..." : `Import ${importConfirmItems.length} Cards`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
