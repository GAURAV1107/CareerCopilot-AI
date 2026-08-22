import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerCopilot AI – AI-Powered Job Application Tracker",
  description: "Track smarter, apply better, and get hired faster with AI-powered resume analysis, job matching, and career coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
