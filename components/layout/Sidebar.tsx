"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Briefcase,
  FileText,
  CalendarCheck,
  Bell,
  BarChart3,
  Sparkles,
  User,
  Settings,
  Bot,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState("Manujendra Gaurav");
  const [userEmail, setUserEmail] = useState("manujendragaurav@gmail.com");
  const [userTitle, setUserTitle] = useState("Senior SDET Profile");

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.user) {
          setUserName(data.user.name || "User Account");
          setUserEmail(data.user.email || "");
        }
        if (data.profile?.currentTitle) {
          setUserTitle(data.profile.currentTitle);
        }
      } catch (err) {
        console.error("Error fetching sidebar user info:", err);
      }
    }
    fetchUserInfo();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Applications", href: "/applications", icon: KanbanSquare },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "Resumes", href: "/resumes", icon: FileText },
    { label: "AI Job Analyzer", href: "/ai-analysis", icon: Sparkles, badge: "AI" },
    { label: "AI Copilot & Prep", href: "/ai-copilot", icon: Bot, badge: "AI" },
    { label: "Interviews", href: "/interviews", icon: CalendarCheck },
    { label: "Reminders", href: "/reminders", icon: Bell },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900/95 dark:bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">
            CareerCopilot <span className="text-blue-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span>
          </h1>
          <p className="text-xs text-slate-400">QA & Career Assistant</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="h-3.5 w-3.5 text-white/70" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Active User Profile Badge & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-500/30 shrink-0">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
