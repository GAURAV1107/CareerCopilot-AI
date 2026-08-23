import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = { email: "Local workspace", name: "Local User" };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/90 dark:bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">
              Storage mode: <strong className="text-white">Local browser only</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Profile Header Link */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition"
            >
              <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "MG"}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline pr-1">
                {user?.name || "Manujendra Gaurav"}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
