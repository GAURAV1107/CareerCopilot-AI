"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, Star, Trash2, CheckCircle2, AlertCircle, FileCode, Edit3, Eye } from "lucide-react";
import { extractResumeText, inferResumeSkills } from "@/lib/resume-files";

interface ResumeItem {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  isPrimary: boolean;
  notes?: string;
  parsedText?: string;
  extractedSkills?: string;
  createdAt: string;
}

export default function ResumeManagementPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isPrimaryInput, setIsPrimaryInput] = useState(false);
  const [previewResume, setPreviewResume] = useState<ResumeItem | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage("");

    try {
      let parsedText: string;
      try {
        parsedText = await extractResumeText(selectedFile);
      } catch (error) {
        throw new Error(`Could not read ${selectedFile.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (parsedText.length < 80) throw new Error("Very little text was found. Please use a text-based PDF or DOCX file.");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("notes", notesInput);
      formData.append("isPrimary", String(isPrimaryInput));
      formData.append("parsedText", parsedText);
      formData.append("extractedSkills", JSON.stringify(inferResumeSkills(parsedText)));

      let res: Response;
      try {
        res = await fetch("/api/resumes", { method: "POST", body: formData });
      } catch (error) {
        throw new Error(`Resume text was extracted but could not be saved locally: ${error instanceof Error ? error.message : String(error)}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setMessage("Resume uploaded and parsed successfully!");
      setSelectedFile(null);
      setNotesInput("");
      fetchResumes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      fetchResumes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      fetchResumes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume Management</h1>
        <p className="text-xs text-slate-400">Upload multiple PDF/DOCX resumes, select a primary resume, and view AI-parsed technical skills.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.startsWith("Error")
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {message.startsWith("Error") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>{message}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Upload className="h-4 w-4 text-blue-400" />
          <span>Upload New Resume</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select PDF or DOCX File</label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Resume Notes / Version Tag</label>
            <input
              type="text"
              placeholder="e.g. Tailored for Playwright & SDET roles"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimaryInput}
              onChange={(e) => setIsPrimaryInput(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
            />
            <span>Set as Primary Resume for AI Job Matching</span>
          </label>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{uploading ? "Parsing & Uploading..." : "Upload Resume"}</span>
          </button>
        </div>
      </form>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Your Stored Resumes ({resumes.length})</h2>

        {loading ? (
          <div className="text-xs text-slate-500 p-4">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {resumes.map((res) => {
              let extracted: string[] = [];
              if (res.extractedSkills) {
                try {
                  extracted = JSON.parse(res.extractedSkills);
                } catch {}
              }

              return (
                <div
                  key={res.id}
                  className={`bg-slate-900 border p-5 rounded-2xl transition space-y-3 ${
                    res.isPrimary ? "border-blue-500/50 bg-slate-900/90 shadow-lg shadow-blue-500/5" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-white">{res.filename}</h3>
                          {res.isPrimary && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-blue-400" /> Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Uploaded: {new Date(res.createdAt).toLocaleDateString()} • Type: {res.fileType.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!res.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(res.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-blue-400 bg-slate-800 px-3 py-1.5 rounded-lg transition"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewResume(res)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                        title="View Parsed Content"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg transition"
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {res.notes && <p className="text-xs text-slate-300 italic">Notes: &ldquo;{res.notes}&rdquo;</p>}

                  {/* Extracted Skills Chips */}
                  {extracted.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Extracted Tech Stack:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {extracted.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-blue-300 border border-slate-800 font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resume Content Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileCode className="h-4 w-4 text-blue-400" />
                Parsed Text: {previewResume.filename}
              </h3>
              <button onClick={() => setPreviewResume(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
              {previewResume.parsedText || "No parsed text available."}
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewResume(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
