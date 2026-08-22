import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const notes = (formData.get("notes") as string) || "";
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "docx", "doc", "txt"].includes(ext)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and DOCX files are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mock/Basic parsing abstraction
    let parsedText = `Resume content of ${filename}:\n\n` + buffer.toString("utf-8", 0, Math.min(buffer.length, 1000));
    if (ext === "pdf" || ext === "docx") {
      parsedText = `Extracted Text from ${filename}:\n\nExperienced QA Automation Engineer proficient in Selenium, Playwright, Java, Python, RestAssured API Testing, CI/CD, SQL, and Docker.`;
    }

    const extractedSkills = ["Selenium", "Playwright", "Java", "Python", "RestAssured", "API Testing", "SQL", "Docker", "Jenkins"];

    if (isPrimary) {
      // Clear previous primary
      await db.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
    }

    const newResume = await db.resume.create({
      data: {
        userId: user.id,
        filename,
        originalName: filename,
        fileType: ext,
        fileUrl: `/uploads/${filename}`,
        fileSize: file.size,
        isPrimary,
        notes,
        parsedText,
        extractedSkills: JSON.stringify(extractedSkills),
      },
    });

    return NextResponse.json({ success: true, resume: newResume });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
