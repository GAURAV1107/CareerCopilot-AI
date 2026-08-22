import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await db.application.findMany({
    where: { userId: user.id },
    include: {
      job: true,
      resume: true,
      interviews: true,
      reminders: true,
      activities: { orderBy: { createdAt: "desc" } },
      jobMatches: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { jobId, resumeId, status, appliedDate, recruiterName, recruiterEmail, salaryOffered, notes } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required to create an application." }, { status: 400 });
    }

    const application = await db.application.create({
      data: {
        userId: user.id,
        jobId,
        resumeId,
        status: status || "Saved",
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        recruiterName,
        recruiterEmail,
        salaryOffered: salaryOffered ? Number(salaryOffered) : null,
        notes,
        activities: {
          create: [
            {
              eventType: "Application Created",
              description: `Application created with initial status "${status || "Saved"}".`,
            },
          ],
        },
      },
      include: {
        job: true,
        resume: true,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
