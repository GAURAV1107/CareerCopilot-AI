import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await db.job.findFirst({
    where: { id, userId: user.id },
    include: {
      applications: {
        include: {
          resume: true,
          interviews: true,
          reminders: true,
          activities: { orderBy: { createdAt: "desc" } },
        },
      },
      jobMatchAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    const existing = await db.job.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const updated = await db.job.update({
      where: { id },
      data: {
        companyName: body.companyName ?? existing.companyName,
        companyWebsite: body.companyWebsite ?? existing.companyWebsite,
        jobTitle: body.jobTitle ?? existing.jobTitle,
        description: body.description ?? existing.description,
        jobUrl: body.jobUrl ?? existing.jobUrl,
        location: body.location ?? existing.location,
        salaryMin: body.salaryMin !== undefined ? Number(body.salaryMin) : existing.salaryMin,
        salaryMax: body.salaryMax !== undefined ? Number(body.salaryMax) : existing.salaryMax,
        currency: body.currency ?? existing.currency,
        employmentType: body.employmentType ?? existing.employmentType,
        workMode: body.workMode ?? existing.workMode,
        source: body.source ?? existing.source,
        notes: body.notes ?? existing.notes,
      },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const existing = await db.job.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    await db.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
