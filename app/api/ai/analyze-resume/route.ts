import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/services/ai-service";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { resumeId, jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    let resumeText = "";
    if (resumeId) {
      const resume = await db.resume.findFirst({ where: { id: resumeId, userId: user.id } });
      if (resume) resumeText = resume.parsedText || resume.notes || "";
    } else {
      const primary = await db.resume.findFirst({ where: { userId: user.id, isPrimary: true } });
      if (primary) resumeText = primary.parsedText || primary.notes || "";
    }

    const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
    const profileSummary = profile?.summary || `${user.name} - ${profile?.currentTitle || "Job Seeker"}`;

    const analysis = await AIService.analyzeResume(resumeText, jobDescription, profileSummary, user.id);
    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
