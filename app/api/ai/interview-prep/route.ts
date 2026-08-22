import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/services/ai-service";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId, applicationId } = await req.json();

    let jobTitle = "Senior QA Automation Engineer";
    let jobDescription = "Design and maintain test automation frameworks using Selenium, Playwright, Java, and RestAssured.";

    if (jobId) {
      const job = await db.job.findFirst({ where: { id: jobId, userId: user.id } });
      if (job) {
        jobTitle = job.jobTitle;
        jobDescription = job.description;
      }
    } else if (applicationId) {
      const app = await db.application.findFirst({
        where: { id: applicationId, userId: user.id },
        include: { job: true },
      });
      if (app) {
        jobTitle = app.job.jobTitle;
        jobDescription = app.job.description;
      }
    }

    const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
    const candidateSummary = profile?.summary || `${user.name} (${user.email}) with ${profile?.yearsExperience || 6} years of experience`;

    // Uses configured LLM model (Gemini, Claude, OpenAI, Custom, or Mock)
    const prepData = await AIService.generateInterviewPrep(jobTitle, jobDescription, candidateSummary, user.id);
    return NextResponse.json({ success: true, prepData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
