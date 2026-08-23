import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const application = await db.application.findFirst({
    where: { id, userId: user.id },
    include: {
      job: true,
      resume: true,
      interviews: { orderBy: { date: "asc" } },
      reminders: { orderBy: { dueDate: "asc" } },
      activities: { orderBy: { createdAt: "desc" } },
      appNotes: { orderBy: { createdAt: "desc" } },
      jobMatches: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  return NextResponse.json({ application });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const {
      status,
      followUpStatus,
      resumeId,
      recruiterName,
      recruiterEmail,
      referralDetails,
      salaryOffered,
      appliedDate,
      notes,
      isArchived,
    } = await req.json();

    const existing = await db.application.findFirst({
      where: { id, userId: user.id },
      include: { job: true },
    });
    if (!existing) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const isStatusChanged = status && status !== existing.status;
    const isFollowUpChanged = followUpStatus && followUpStatus !== existing.followUpStatus;

    // Dynamically set appliedDate if status changes to Applied or later stages and was previously null
    let newAppliedDate = existing.appliedDate;
    if (appliedDate) {
      newAppliedDate = new Date(appliedDate);
    } else if (isStatusChanged && (status === "Applied" || status !== "Saved") && !existing.appliedDate) {
      newAppliedDate = new Date();
    }

    const updated = await db.application.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        followUpStatus: followUpStatus ?? existing.followUpStatus,
        resumeId: resumeId !== undefined ? resumeId : existing.resumeId,
        recruiterName: recruiterName !== undefined ? recruiterName : existing.recruiterName,
        recruiterEmail: recruiterEmail !== undefined ? recruiterEmail : existing.recruiterEmail,
        referralDetails: referralDetails !== undefined ? referralDetails : existing.referralDetails,
        salaryOffered: salaryOffered !== undefined ? Number(salaryOffered) : existing.salaryOffered,
        appliedDate: newAppliedDate,
        notes: notes !== undefined ? notes : existing.notes,
        isArchived: isArchived !== undefined ? isArchived : existing.isArchived,
      },
      include: {
        job: true,
        resume: true,
        interviews: true,
        reminders: true,
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    if (isStatusChanged) {
      const nowStr = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });

      await db.applicationActivity.create({
        data: {
          applicationId: id,
          eventType: "Status Changed",
          description: `Moved stage from "${existing.status}" to "${status}" on ${nowStr}.`,
        },
      });
    }

    if (isFollowUpChanged) {
      await db.applicationActivity.create({
        data: {
          applicationId: id,
          eventType: "Follow-Up Updated",
          description: `Updated follow-up status to "${followUpStatus}".`,
        },
      });
    }

    return NextResponse.json({ success: true, application: updated });
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
    const existing = await db.application.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    await db.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
