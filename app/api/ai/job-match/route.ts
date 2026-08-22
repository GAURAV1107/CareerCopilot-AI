import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobMatchEngine } from "@/lib/ai/match-engine";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId, applicationId, resumeId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }

    const job = await db.job.findFirst({ where: { id: jobId, userId: user.id } });
    if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
    const userSkills = await db.userSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
    });

    const skillNames = userSkills.map((us) => us.skill.name);

    let resumeSkills: string[] = [];
    if (resumeId) {
      const resume = await db.resume.findFirst({ where: { id: resumeId, userId: user.id } });
      if (resume?.extractedSkills) {
        try {
          resumeSkills = JSON.parse(resume.extractedSkills);
        } catch {}
      }
    }

    const combinedSkills = Array.from(new Set([...skillNames, ...resumeSkills]));

    const matchResult = JobMatchEngine.calculateOverallScore({
      candidateSkills: combinedSkills,
      yearsExperience: profile?.yearsExperience || 0,
      profileSummary: profile?.summary || "",
      remotePreference: profile?.remotePreference || "Remote",
      candidateLocation: profile?.location || "",
      jobDescription: job.description,
      jobWorkMode: job.workMode || "Remote",
      jobLocation: job.location || "",
    });

    // Save or update JobMatchAnalysis record
    const matchAnalysis = await db.jobMatchAnalysis.create({
      data: {
        applicationId,
        jobId,
        resumeId,
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

    return NextResponse.json({ success: true, matchResult, id: matchAnalysis.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
