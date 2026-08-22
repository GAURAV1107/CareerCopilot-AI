"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Cpu, Save, CheckCircle2, AlertCircle, Zap, ShieldCheck, Mail, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [baseUrl, setBaseUrl] = useState("https://generativelanguage.googleapis.com/v1beta");
  const [notificationEmail, setNotificationEmail] = useState("alex.sdet@careercopilot.ai");
  const [hasApiKey, setHasApiKey] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.config) {
          setProvider(data.config.provider || "gemini");
          setModel(data.config.model || "gemini-2.5-flash");
          setBaseUrl(data.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta");
          setHasApiKey(data.config.hasApiKey);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setTestResult(null);
    if (newProvider === "gemini") {
      setModel("gemini-2.5-flash");
      setBaseUrl("https://generativelanguage.googleapis.com/v1beta");
    } else if (newProvider === "anthropic") {
      setModel("claude-3-5-sonnet-20241022");
      setBaseUrl("https://api.anthropic.com/v1");
    } else if (newProvider === "openai") {
      setModel("gpt-4o");
      setBaseUrl("https://api.openai.com/v1");
    } else if (newProvider === "custom") {
      setModel("mistral-7b");
      setBaseUrl("http://localhost:11434/v1");
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection test failed.");

      setTestResult({
        success: true,
        message: data.message,
        latencyMs: data.latencyMs,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save LLM settings.");

      setMessage("AI Provider & Model configuration saved successfully!");
      setHasApiKey(data.config.hasApiKey);
      setApiKey("");
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-500">Loading configuration...</div>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI & LLM Model Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure Google Gemini, OpenAI, Anthropic Claude, or Custom LLM models with real-time authentication testing.
        </p>
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

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="h-4 w-4 text-blue-400" />
          <span>LLM Provider & Model Authentication</span>
        </h2>

        <div className="space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selected AI Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="gemini">Google Gemini (gemini-2.5-flash, gemini-1.5-pro, gemini-3.7-flash)</option>
              <option value="openai">OpenAI (gpt-4o, gpt-4o-mini, o3-mini)</option>
              <option value="anthropic">Anthropic Claude (claude-3-5-sonnet, claude-3-7-sonnet)</option>
              <option value="custom">Custom Endpoint (Ollama / Local / Custom Proxy)</option>
              <option value="mock">Rule-based Fallback Provider (Offline Mode - No Key Needed)</option>
            </select>
          </div>

          {/* API Key */}
          {provider !== "mock" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {provider.toUpperCase()} API Key
                </label>
                {hasApiKey && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Key Stored & Protected
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={hasApiKey ? "•••••••••••••••• (Leave blank to keep current key)" : "Enter your API Key..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}

          {/* Model Name & Base URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name / Version</label>
              <input
                type="text"
                placeholder="e.g. gemini-2.5-flash or gemini-3.7-flash"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Base Endpoint URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Email Sync */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" /> Realtime Notification & Account Sync Email
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </div>

          {/* Realtime Authentication & Test Connection */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>{testing ? "Testing Realtime Connection..." : "Test API Connection & Authenticate"}</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Configuration..." : "Save Settings"}</span>
            </button>
          </div>

          {/* Realtime Test Result Feedback Card */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                <span>{testResult.success ? "Authentication Successful" : "Authentication Failed"}</span>
              </div>
              <p>{testResult.message}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
