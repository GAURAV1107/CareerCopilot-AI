"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, BookOpen, CheckCircle2, HelpCircle } from "lucide-react";

export default function AICopilotPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content:
        "Hello Alex! I am your CareerCopilot AI assistant. I have analyzed your 6 years of SDET experience, your stored applications, and upcoming CloudScale technical interview. How can I assist you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Interview Prep State
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepData, setPrepData] = useState<any>(null);

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
      const res = await fetch("/api/ai/interview-prep", { method: "POST" });
      const data = await res.json();
      if (data.prepData) setPrepData(data.prepData);
    } catch (err) {
      console.error(err);
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Job Search Copilot & Interview Prep</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Ask questions grounded in your actual application data and generate personalized technical interview prep sets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Copilot Chat */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              CareerCopilot Assistant
            </span>
            <span className="text-[10px] text-slate-400">Grounded in Alex Vance Profile</span>
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex gap-2 overflow-x-auto">
            {[
              "Which applications need follow-up?",
              "Which job should I prioritize?",
              "Prepare me for CloudScale interview",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition border border-slate-700"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-md whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-slate-950 border border-slate-800 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 flex items-center gap-2 p-2">
                <Bot className="h-4 w-4 animate-spin text-blue-400" />
                <span>Thinking & analyzing candidate records...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask CareerCopilot AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Col: AI Interview Prep Generator */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-400" />
                <span>AI Technical Interview Prep</span>
              </h2>
            </div>

            <button
              onClick={handleFetchPrep}
              disabled={prepLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{prepLoading ? "Generating Questions..." : "Generate Technical Practice Set"}</span>
            </button>

            {prepData && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-violet-300 block">Recommended Focus Topics:</span>
                  <ul className="space-y-1">
                    {prepData.studyTopics?.map((t: string, idx: number) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-blue-300 block">Sample Technical Questions:</span>
                  {prepData.technicalQuestions?.map((q: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <p className="font-semibold text-white">Q: {q.question}</p>
                      <p className="text-slate-400 italic">Key points: {q.sampleAnswerKeyPoints?.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
