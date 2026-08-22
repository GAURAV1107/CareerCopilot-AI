import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If not logged in, redirect to login page (unless demo mode auto-creates)
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-medium">Demo Mode Active: QA Automation Engineer Profile</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              Role: <strong className="text-blue-400 font-semibold">{user.role}</strong>
            </span>
            <span className="hidden sm:inline">User: <strong className="text-slate-200">{user.email}</strong></span>
          </div>
        </header>

        {/* Content area */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
