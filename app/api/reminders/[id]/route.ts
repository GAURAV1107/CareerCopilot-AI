import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const { isCompleted, snoozedDays, title, description, dueDate, type } = await req.json();

    const existing = await db.reminder.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Reminder not found." }, { status: 404 });

    let newDueDate = existing.dueDate;
    if (snoozedDays) {
      newDueDate = new Date(existing.dueDate.getTime() + Number(snoozedDays) * 24 * 60 * 60 * 1000);
    } else if (dueDate) {
      newDueDate = new Date(dueDate);
    }

    const updated = await db.reminder.update({
      where: { id },
      data: {
        isCompleted: isCompleted !== undefined ? isCompleted : existing.isCompleted,
        title: title ?? existing.title,
        description: description ?? existing.description,
        type: type ?? existing.type,
        dueDate: newDueDate,
      },
    });

    return NextResponse.json({ success: true, reminder: updated });
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
    const existing = await db.reminder.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Reminder not found." }, { status: 404 });

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
