import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/services/ai-service";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query string is required." }, { status: 400 });
    }

    // Fetch actual logged-in user context data
    const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
    const userSkills = await db.userSkill.findMany({ where: { userId: user.id }, include: { skill: true } });
    const applications = await db.application.findMany({
      where: { userId: user.id },
      include: { job: true, interviews: true, reminders: true },
      take: 10,
    });

    const contextData = {
      userProfile: {
        name: user.name,
        email: user.email,
        title: profile?.currentTitle || "Job Seeker",
        yearsExp: profile?.yearsExperience || 0,
        skills: userSkills.map((us) => us.skill.name),
        summary: profile?.summary,
      },
      applications: applications.map((a) => ({
        company: a.job.companyName,
        title: a.job.jobTitle,
        status: a.status,
        appliedDate: a.appliedDate,
        interviews: a.interviews.map((i) => ({ type: i.type, date: i.date, status: i.status })),
        reminders: a.reminders.map((r) => ({ title: r.title, dueDate: r.dueDate, completed: r.isCompleted })),
      })),
    };

    // Use configured LLM provider (Gemini, Claude, OpenAI, Custom, or Mock)
    const reply = await AIService.generateCopilotAnswer(query, contextData, user.id);

    return NextResponse.json({ success: true, reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
