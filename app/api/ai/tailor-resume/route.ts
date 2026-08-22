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
    let companyName = "Target Company";
    let jobDescription = "Design and maintain UI/API test automation frameworks using Selenium, Playwright, Java, and RestAssured.";

    if (jobId) {
      const job = await db.job.findFirst({ where: { id: jobId, userId: user.id } });
      if (job) {
        jobTitle = job.jobTitle;
        companyName = job.companyName;
        jobDescription = job.description;
      }
    } else if (applicationId) {
      const app = await db.application.findFirst({
        where: { id: applicationId, userId: user.id },
        include: { job: true },
      });
      if (app) {
        jobTitle = app.job.jobTitle;
        companyName = app.job.companyName;
        jobDescription = app.job.description;
      }
    }

    const tailoredData = await AIService.generateTailoredResumeData({
      userId: user.id,
      jobTitle,
      companyName,
      jobDescription,
    });

    return NextResponse.json({ success: true, tailoredData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
