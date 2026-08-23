"use client";

import { useEffect, useState } from "react";
import { Bot, Send, Sparkles, BookOpen, CheckCircle2, HelpCircle, Briefcase, RefreshCw } from "lucide-react";

interface ApplicationOption {
  id: string;
  status: string;
  job: {
    companyName: string;
    jobTitle: string;
    location?: string;
  };
}

export default function AICopilotPage() {
  const [userName, setUserName] = useState("Gaurav");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Kanban Card Applications list
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");

  // Interview Prep State
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepData, setPrepData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch candidate profile info
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();
        const candidateFirstName = profileData.user?.name ? profileData.user.name.split(" ")[0] : "Gaurav";
        setUserName(candidateFirstName);

        setMessages([
          {
            role: "assistant",
            content: `Hello ${candidateFirstName}! I am your CareerCopilot AI assistant. I have analyzed your 5.5+ years of QA Automation & SDET experience, your stored Kanban applications, and master resume. How can I assist you with your job search or interview prep today?`,
          },
        ]);

        // Fetch applications for Kanban dropdown
        const appRes = await fetch("/api/applications");
        const appData = await appRes.json();
        if (Array.isArray(appData.applications)) {
          setApplications(appData.applications);
          if (appData.applications.length > 0) {
            setSelectedAppId(appData.applications[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const newMsgs = [...messages, { role: "user", content: q }];
    setMessages(newMsgs);
    if (!customQuery) setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMsgs, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPrep = async () => {
    setPrepLoading(true);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedAppId }),
      });
      const data = await res.json();
      if (data.prepData) setPrepData(data.prepData);
    } catch (err) {
      console.error(err);
    } finally {
      setPrepLoading(false);
    }
  };

  const selectedAppObj = applications.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-400" />
          <span>AI Job Search Copilot & Interview Prep</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chat with your configured LLM model (Gemini, Claude, OpenAI) or generate custom technical interview prep for any card in your Kanban board.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[620px] shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>Gaurav&apos;s AI Assistant</span>
            </h2>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Active LLM Connected
            </span>
          </div>

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none leading-relaxed"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs">
                <div className="h-7 w-7 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Bot className="h-4 w-4 animate-pulse" />
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-400 text-xs italic">
                  AI Copilot is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Preset Prompt Pills */}
          <div className="py-3 border-t border-slate-800 flex flex-wrap gap-2">
            <button
              onClick={() => handleSend("Summarize my active job applications and next interview dates.")}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg transition"
            >
              📊 Application Summary
            </button>
            <button
              onClick={() => handleSend("What Playwright and Python framework questions should I review today?")}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg transition"
            >
              🐍 Python & Playwright Questions
            </button>
          </div>

          {/* Input Form */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask anything about your job search, interview topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Technical Interview Prep Module */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[620px] shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>AI Technical Interview Prep Generator</span>
              </h2>
            </div>

            {/* Kanban Card Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-blue-400" /> Select Kanban Card / Target Job:
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.job.jobTitle} at {app.job.companyName} ({app.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {!prepData ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Generate Custom Interview Prep</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select any job card from your Kanban board above. The AI will analyze that specific job description alongside your master profile to create custom technical questions, answer key points, and study topics!
                  </p>
                </div>
                <button
                  onClick={handleFetchPrep}
                  disabled={prepLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition inline-flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${prepLoading ? "animate-spin" : ""}`} />
                  <span>{prepLoading ? "Generating AI Prep..." : `Generate Prep for ${selectedAppObj?.job.companyName || "Selected Job"}`}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-slate-300">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-white">
                    Prep Set for: {selectedAppObj?.job.jobTitle} ({selectedAppObj?.job.companyName})
                  </span>
                  <button
                    onClick={handleFetchPrep}
                    disabled={prepLoading}
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                </div>

                {/* Key Study Topics */}
                {prepData.topicsToReview && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider text-indigo-400">
                      Key Technical Focus Topics:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {prepData.topicsToReview.map((t: string, i: number) => (
                        <span key={i} className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
                          • {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Questions */}
                {prepData.technicalQuestions && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider text-indigo-400">
                      Expected Technical & Code Questions:
                    </h3>
                    {prepData.technicalQuestions.map((q: any, i: number) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                        <p className="font-bold text-white">Q{i + 1}: {q.question}</p>
                        {q.keyAnswerPoints && (
                          <div className="text-slate-400 text-[11px] space-y-0.5">
                            <span className="font-semibold text-emerald-400">Sample Key Points:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {q.keyAnswerPoints.map((pt: string, j: number) => (
                                <li key={j}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
