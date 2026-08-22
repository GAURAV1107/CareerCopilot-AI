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
      interviews: true,
    },
  });

  const total = applications.length;

  const statusCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const titleCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};

  let interviewCount = 0;
  let offerCount = 0;
  let rejectionCount = 0;

  applications.forEach((app) => {
    // Status distribution
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

    // Interview check
    const isInterviewStage = [
      "Screening",
      "Technical Interview",
      "Managerial Interview",
      "HR Interview",
      "Offer",
      "Accepted",
    ].includes(app.status) || app.interviews.length > 0;

    if (isInterviewStage) interviewCount++;
    if (app.status === "Offer" || app.status === "Accepted") offerCount++;
    if (app.status === "Rejected") rejectionCount++;

    // Source distribution
    const src = app.job.source || "Other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    // Title distribution
    const title = app.job.jobTitle || "Other";
    titleCounts[title] = (titleCounts[title] || 0) + 1;

    // Monthly distribution
    const date = app.appliedDate || app.createdAt;
    const monthKey = new Date(date).toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
  });

  const appToInterviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
  const interviewToOfferRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejectionCount / total) * 100) : 0;

  const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const sourceDistribution = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
  const titleDistribution = Object.entries(titleCounts).map(([name, value]) => ({ name, value }));
  const monthlyTrend = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    metrics: {
      totalApplications: total,
      interviewCount,
      offerCount,
      rejectionCount,
      appToInterviewRate,
      interviewToOfferRate,
      offerRate,
      rejectionRate,
    },
    statusDistribution,
    sourceDistribution,
    titleDistribution,
    monthlyTrend,
  });
}
