import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await db.job.findMany({
    where: { userId: user.id },
    include: {
      applications: true,
      jobMatchAnalyses: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      companyName,
      companyWebsite,
      jobTitle,
      description,
      jobUrl,
      location,
      salaryMin,
      salaryMax,
      currency,
      employmentType,
      workMode,
      source,
      notes,
    } = body;

    if (!companyName || !jobTitle || !description) {
      return NextResponse.json({ error: "Company name, job title, and description are required." }, { status: 400 });
    }

    const job = await db.job.create({
      data: {
        userId: user.id,
        companyName,
        companyWebsite,
        jobTitle,
        description,
        jobUrl,
        location,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        currency: currency || "USD",
        employmentType: employmentType || "Full-time",
        workMode: workMode || "Remote",
        source: source || "LinkedIn",
        notes,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
