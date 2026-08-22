import Link from "next/link";
import { Sparkles, KanbanSquare, FileCheck2, Bot, ArrowRight, ShieldCheck, Zap, LineChart, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              CareerCopilot <span className="text-blue-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition">How It Works</a>
            <a href="#ai-engine" className="hover:text-blue-400 transition">AI Scoring</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <span>Explore Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 to-violet-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            AI-Powered Career Intelligence Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Track smarter. Apply better. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              Get hired faster.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The next-generation job search management system. Tailored for QA Engineers, SDETs, and tech professionals to organize applications, analyze job descriptions with AI, and score job matches deterministically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 text-base"
            >
              <span>Start Tracking Your Career</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition text-base"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Dashboard Preview Section */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-blue-950/40 relative">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
            <span className="text-xs text-slate-500 ml-2 font-mono">careercopilot.ai/dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Applications</span>
              <p className="text-2xl font-bold text-white mt-1">14 Roles</p>
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <span>+3 this week</span>
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Interviews Scheduled</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">2 Upcoming</p>
              <div className="mt-2 text-xs text-slate-400">CloudScale & DataStream</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">AI Job Match Score</span>
              <p className="text-2xl font-bold text-violet-400 mt-1">88% Match</p>
              <div className="mt-2 text-xs text-violet-300">Selenium, Java, Playwright</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Complete Job Search Command Center</h2>
            <p className="text-slate-400">
              Built with precision tools to help software engineers and QA professionals stay organized and stand out to recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <KanbanSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">12-Stage Kanban Board</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Organize applications effortlessly from Saved and Applied to Technical Interviews and HR Offers. Drag, drop, and track timeline logs.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-violet-500/50 transition">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Explainable Hybrid Scoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No black-box AI scores. 40% Skills, 25% Experience, 15% Semantic, 10% Location, 10% Keywords. Clear breakdowns of missing skills.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 transition">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Resume Management & Parser</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Store multiple PDF/DOCX resumes, set primary versions, extract technical skills, and compare directly against job requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How CareerCopilot AI Works</h2>
            <p className="text-slate-400">Streamline your application lifecycle in four seamless steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Build Profile & Upload Resumes", desc: "Add technical skills, preferred locations, and target job titles." },
              { step: "02", title: "Add Job Opportunities", desc: "Paste job descriptions from LinkedIn, Indeed, or company portals." },
              { step: "03", title: "Run AI Analysis & Match", desc: "Extract required skills, identify missing keywords, and get ATS recommendations." },
              { step: "04", title: "Track Kanban & Interviews", desc: "Move applications through stages, schedule interviews, and set follow-up reminders." },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
                <span className="text-3xl font-black text-blue-500/30 mb-2 block">{s.step}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Take Control of Your Career Path Today</h2>
          <p className="text-slate-400 mb-8">
            Join job seekers who optimize their applications and track interviews with CareerCopilot AI.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/30 transition"
          >
            <span>Start Tracking Your Career</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 CareerCopilot AI. Designed for QA Engineers, SDETs, and Tech Professionals.</p>
      </footer>
    </div>
  );
}
