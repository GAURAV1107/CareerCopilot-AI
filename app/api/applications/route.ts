import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobMatchEngine } from "@/lib/ai/match-engine";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await db.application.findMany({
    where: { userId: user.id },
    include: {
      job: true,
      resume: true,
      interviews: { orderBy: { date: "asc" } },
      reminders: { orderBy: { dueDate: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 3 },
      jobMatches: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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
      status,
      followUpStatus,
      recruiterName,
      recruiterEmail,
      referralDetails,
      salaryOffered,
      appliedDate,
      resumeId,
      notes,
    } = await req.json();

    if (!companyName || !jobTitle) {
      return NextResponse.json({ error: "Company name and job title are required." }, { status: 400 });
    }

    // 1. Create Job record
    const job = await db.job.create({
      data: {
        userId: user.id,
        companyName,
        companyWebsite,
        jobTitle,
        description: description || "No detailed description provided.",
        jobUrl,
        location: location || "Remote",
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        currency: currency || "USD",
        employmentType: employmentType || "Full-time",
        workMode: workMode || "Remote",
        source: source || "LinkedIn",
      },
    });

    // Extract recruiter details heuristically or from description if not manually provided
    let finalRecruiterName = recruiterName;
    let finalRecruiterEmail = recruiterEmail;

    if (!finalRecruiterName && description) {
      const emailMatch = description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (emailMatch) {
        finalRecruiterEmail = emailMatch[1];
      }
      const recruiterNameMatch = description.match(/(?:Recruiter|Contact|Hiring Manager|Referral):\s*([A-Za-z\s]+)/i);
      if (recruiterNameMatch) {
        finalRecruiterName = recruiterNameMatch[1].trim();
      }
    }

    // 2. Create Application record
    const application = await db.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        resumeId: resumeId || null,
        status: status || "Saved",
        followUpStatus: followUpStatus || "No",
        recruiterName: finalRecruiterName || null,
        recruiterEmail: finalRecruiterEmail || null,
        referralDetails: referralDetails || null,
        salaryOffered: salaryOffered ? Number(salaryOffered) : null,
        appliedDate: appliedDate ? new Date(appliedDate) : status === "Applied" ? new Date() : null,
        notes,
        activities: {
          create: [
            { eventType: "Job Saved", description: `Added ${jobTitle} at ${companyName} to job tracker.` },
            ...(status === "Applied"
              ? [{ eventType: "Application Submitted", description: `Marked application status as Applied.` }]
              : []),
          ],
        },
      },
      include: {
        job: true,
        resume: true,
        interviews: true,
        reminders: true,
        activities: true,
        jobMatches: true,
      },
    });

    // 3. Compute Job Match Score automatically if primary resume exists
    const primaryResume = await db.resume.findFirst({
      where: { userId: user.id, isPrimary: true },
    });

    if (primaryResume && description) {
      const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
      const userSkills = await db.userSkill.findMany({ where: { userId: user.id }, include: { skill: true } });

      const matchResult = JobMatchEngine.calculateOverallScore({
        candidateSkills: userSkills.map((us) => us.skill.name),
        yearsExperience: profile?.yearsExperience || 6,
        profileSummary: profile?.summary || "",
        remotePreference: profile?.remotePreference || "Remote",
        candidateLocation: profile?.location || "San Francisco, CA",
        jobDescription: job.description,
        jobWorkMode: job.workMode || "Remote",
        jobLocation: job.location || "San Francisco, CA",
      });

      await db.jobMatchAnalysis.create({
        data: {
          applicationId: application.id,
          jobId: job.id,
          resumeId: primaryResume.id,
          overallScore: matchResult.overallScore,
          skillMatchScore: matchResult.skillMatchScore,
          expMatchScore: matchResult.expMatchScore,
          semanticScore: matchResult.semanticScore,
          locationScore: matchResult.locationScore,
          keywordScore: matchResult.keywordScore,
          explanation: matchResult.explanation,
          matchingSkills: JSON.stringify(matchResult.matchingSkills),
          missingSkills: JSON.stringify(matchResult.missingSkills),
        },
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
