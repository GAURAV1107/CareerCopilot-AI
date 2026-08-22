import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const { filename, notes, isPrimary } = await req.json();

    const existing = await db.resume.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

    if (isPrimary) {
      await db.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
    }

    const updated = await db.resume.update({
      where: { id },
      data: {
        filename: filename || existing.filename,
        notes: notes !== undefined ? notes : existing.notes,
        isPrimary: isPrimary !== undefined ? isPrimary : existing.isPrimary,
      },
    });

    return NextResponse.json({ success: true, resume: updated });
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
    const existing = await db.resume.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

    await db.resume.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
