import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.userProfile.findUnique({
    where: { userId: user.id },
  });

  const userSkills = await db.userSkill.findMany({
    where: { userId: user.id },
    include: { skill: true },
  });

  return NextResponse.json({
    user,
    profile,
    skills: userSkills.map((us) => us.skill),
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      currentTitle,
      yearsExperience,
      currentCompany,
      summary,
      expectedSalary,
      noticePeriod,
      preferredTitles,
      preferredLocations,
      remotePreference,
      employmentType,
      skills, // Array of skill names e.g. ['Selenium', 'Playwright', ...]
    } = body;

    // Update User Name
    if (name) {
      await db.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Upsert UserProfile
    const updatedProfile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
        githubUrl,
        currentTitle,
        yearsExperience: Number(yearsExperience) || 0,
        currentCompany,
        summary,
        expectedSalary,
        noticePeriod,
        preferredTitles: Array.isArray(preferredTitles) ? JSON.stringify(preferredTitles) : preferredTitles,
        preferredLocations,
        remotePreference,
        employmentType,
      },
      create: {
        userId: user.id,
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
        githubUrl,
        currentTitle,
        yearsExperience: Number(yearsExperience) || 0,
        currentCompany,
        summary,
        expectedSalary,
        noticePeriod,
        preferredTitles: Array.isArray(preferredTitles) ? JSON.stringify(preferredTitles) : preferredTitles,
        preferredLocations,
        remotePreference,
        employmentType,
      },
    });

    // Update UserSkills if provided
    if (Array.isArray(skills)) {
      // Remove old skills
      await db.userSkill.deleteMany({ where: { userId: user.id } });

      for (const skillName of skills) {
        const skill = await db.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName, category: "Technical" },
        });

        await db.userSkill.create({
          data: {
            userId: user.id,
            skillId: skill.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
