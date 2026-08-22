"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      className="p-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 dark:border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-400" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
}
