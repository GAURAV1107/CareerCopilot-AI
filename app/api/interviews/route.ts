import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const interviews = await db.interview.findMany({
    where: { userId: user.id },
    include: {
      application: {
        include: {
          job: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ interviews });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { applicationId, type, round, date, time, timezone, interviewerName, meetingLink, notes, status } = body;

    if (!applicationId || !type || !date) {
      return NextResponse.json({ error: "Application, interview type, and date are required." }, { status: 400 });
    }

    const interview = await db.interview.create({
      data: {
        userId: user.id,
        applicationId,
        type,
        round: round ? Number(round) : 1,
        date: new Date(date),
        time: time || "10:00",
        timezone: timezone || "PST",
        interviewerName,
        meetingLink,
        notes,
        status: status || "Scheduled",
      },
      include: {
        application: {
          include: { job: true },
        },
      },
    });

    // Log Activity Event
    await db.applicationActivity.create({
      data: {
        applicationId,
        eventType: "Interview Scheduled",
        description: `${type} (Round ${round || 1}) scheduled for ${new Date(date).toLocaleDateString()}.`,
      },
    });

    return NextResponse.json({ success: true, interview });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
