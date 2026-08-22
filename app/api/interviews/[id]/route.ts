import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    const existing = await db.interview.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Interview not found." }, { status: 404 });

    const updated = await db.interview.update({
      where: { id },
      data: {
        type: body.type ?? existing.type,
        round: body.round ? Number(body.round) : existing.round,
        date: body.date ? new Date(body.date) : existing.date,
        time: body.time ?? existing.time,
        timezone: body.timezone ?? existing.timezone,
        interviewerName: body.interviewerName ?? existing.interviewerName,
        meetingLink: body.meetingLink ?? existing.meetingLink,
        notes: body.notes ?? existing.notes,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json({ success: true, interview: updated });
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
    const existing = await db.interview.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Interview not found." }, { status: 404 });

    await db.interview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
