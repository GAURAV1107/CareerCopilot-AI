import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid JSON payload. Expected a non-empty array of application items." }, { status: 400 });
    }

    let createdCount = 0;

    for (const item of items) {
      const companyName = item.companyName || item.job?.companyName || "Unknown Company";
      const jobTitle = item.jobTitle || item.job?.jobTitle || "Software Position";

      // Create Job
      const job = await db.job.create({
        data: {
          userId: user.id,
          companyName,
          companyWebsite: item.companyWebsite || item.job?.companyWebsite,
          jobTitle,
          description: item.description || item.job?.description || "Imported job opportunity.",
          jobUrl: item.jobUrl || item.job?.jobUrl,
          location: item.location || item.job?.location || "Remote",
          salaryMin: item.salaryMin || item.job?.salaryMin ? Number(item.salaryMin || item.job?.salaryMin) : null,
          salaryMax: item.salaryMax || item.job?.salaryMax ? Number(item.salaryMax || item.job?.salaryMax) : null,
          currency: item.currency || item.job?.currency || "USD",
          employmentType: item.employmentType || item.job?.employmentType || "Full-time",
          workMode: item.workMode || item.job?.workMode || "Remote",
          source: item.source || item.job?.source || "JSON Import",
        },
      });

      // Create Application
      await db.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          status: item.status || "Saved",
          followUpStatus: item.followUpStatus || "No",
          recruiterName: item.recruiterName || null,
          recruiterEmail: item.recruiterEmail || null,
          referralDetails: item.referralDetails || null,
          salaryOffered: item.salaryOffered ? Number(item.salaryOffered) : null,
          appliedDate: item.appliedDate ? new Date(item.appliedDate) : null,
          notes: item.notes || "Imported via JSON export file.",
          activities: {
            create: [
              { eventType: "Job Saved", description: `Imported ${jobTitle} at ${companyName} via JSON import.` },
            ],
          },
        },
      });

      createdCount++;
    }

    return NextResponse.json({ success: true, count: createdCount, message: `Successfully imported ${createdCount} job cards.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Import failed: ${message}` }, { status: 500 });
  }
}
