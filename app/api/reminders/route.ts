import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await db.reminder.findMany({
    where: { userId: user.id },
    include: {
      application: {
        include: { job: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ reminders });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { applicationId, type, title, description, dueDate } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and due date are required." }, { status: 400 });
    }

    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        applicationId,
        type: type || "Custom",
        title,
        description,
        dueDate: new Date(dueDate),
        isCompleted: false,
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
