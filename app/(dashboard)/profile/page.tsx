"use client";

import { useEffect, useState } from "react";
import { User, Briefcase, Code2, Save, CheckCircle2, AlertCircle, Plus, X, ShieldCheck, Mail, Globe } from "lucide-react";

const QA_SKILL_SUGGESTIONS = [
  "Selenium",
  "Playwright",
  "Cypress",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "RestAssured",
  "Postman",
  "API Testing",
  "SQL",
  "Jenkins",
  "GitHub Actions",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "JMeter",
  "k6",
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [currentTitle, setCurrentTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | string>(0);
  const [currentCompany, setCurrentCompany] = useState("");
  const [summary, setSummary] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  const [preferredTitles, setPreferredTitles] = useState("");
  const [preferredLocations, setPreferredLocations] = useState("");
  const [remotePreference, setRemotePreference] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");

  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Social OAuth Linked state
  const [googleLinked, setGoogleLinked] = useState(true);
  const [appleLinked, setAppleLinked] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }

        if (data.profile) {
          setPhone(data.profile.phone || "");
          setLocation(data.profile.location || "");
          setLinkedinUrl(data.profile.linkedinUrl || "");
          setPortfolioUrl(data.profile.portfolioUrl || "");
          setGithubUrl(data.profile.githubUrl || "");

          setCurrentTitle(data.profile.currentTitle || "");
          setYearsExperience(data.profile.yearsExperience || 0);
          setCurrentCompany(data.profile.currentCompany || "");
          setSummary(data.profile.summary || "");
          setExpectedSalary(data.profile.expectedSalary || "");
          setNoticePeriod(data.profile.noticePeriod || "");

          try {
            const parsedTitles = JSON.parse(data.profile.preferredTitles || "[]");
            setPreferredTitles(Array.isArray(parsedTitles) ? parsedTitles.join(", ") : data.profile.preferredTitles || "");
          } catch {
            setPreferredTitles(data.profile.preferredTitles || "");
          }

          setPreferredLocations(data.profile.preferredLocations || "");
          setRemotePreference(data.profile.remotePreference || "Remote");
          setEmploymentType(data.profile.employmentType || "Full-time");
        }

        if (Array.isArray(data.skills)) {
          setSkills(data.skills.map((s: { name: string }) => s.name));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const parsedPrefTitles = preferredTitles
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          location,
          linkedinUrl,
          portfolioUrl,
          githubUrl,
          currentTitle,
          yearsExperience,
          currentCompany,
          summary,
          expectedSalary,
          noticePeriod,
          preferredTitles: parsedPrefTitles,
          preferredLocations,
          remotePreference,
          employmentType,
          skills,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile.");

      setMessage("Profile saved successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skillName: string) => {
    if (!skills.includes(skillName)) {
      setSkills([...skills, skillName]);
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s !== skillName));
  };

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim()) {
      addSkill(customSkillInput.trim());
      setCustomSkillInput("");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading candidate profile...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Profile & Account Configuration</h1>
          <p className="text-xs text-slate-400">Manage your logged-in credentials ({email}), social login links, and technical skill set.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save Profile"}</span>
        </button>
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

      {/* Account & OAuth Connections */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Logged In Account & Social OAuth Authentication</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-blue-400" /> Active Logged In Email
            </span>
            <p className="font-bold text-white text-sm">{email}</p>
            <span className="text-[10px] text-emerald-400 block pt-1">✓ Session Authenticated via JWT</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-slate-400 font-semibold block">Social OAuth Connections</span>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                Google Account
              </span>
              <button
                type="button"
                onClick={() => setGoogleLinked(!googleLinked)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  googleLinked
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {googleLinked ? "✓ Linked" : "Connect Google"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                Apple ID
              </span>
              <button
                type="button"
                onClick={() => setAppleLinked(!appleLinked)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  appleLinked
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {appleLinked ? "✓ Linked" : "Connect Apple ID"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="h-4 w-4 text-blue-400" />
          <span>Personal & Contact Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Professional Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Briefcase className="h-4 w-4 text-indigo-400" />
          <span>Professional Background</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Job Title</label>
            <input
              type="text"
              placeholder="Senior QA Automation Engineer"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Company</label>
            <input
              type="text"
              placeholder="Company Name"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Summary</label>
          <textarea
            rows={4}
            placeholder="Write a concise overview of your test automation experience..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          ></textarea>
        </div>
      </div>

      {/* Skills Picker Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code2 className="h-4 w-4 text-violet-400" />
          <span>Technical Skills & Frameworks</span>
        </h2>

        {/* Selected Skill Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Active Candidate Skills ({skills.length}):</label>
          <div className="flex flex-wrap gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl min-h-[52px]">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold"
              >
                <span>{s}</span>
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Quick QA Suggestions */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Quick Add QA Automation Skills:</label>
          <div className="flex flex-wrap gap-1.5">
            {QA_SKILL_SUGGESTIONS.map((skillName) => {
              const isSelected = skills.includes(skillName);
              return (
                <button
                  key={skillName}
                  type="button"
                  onClick={() => (isSelected ? removeSkill(skillName) : addSkill(skillName))}
                  className={`text-xs px-2.5 py-1 rounded-md transition ${
                    isSelected
                      ? "bg-violet-600 text-white font-medium"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isSelected ? `✓ ${skillName}` : `+ ${skillName}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom tool or language..."
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700"
          >
            Add Skill
          </button>
        </div>
      </div>
    </form>
  );
}
