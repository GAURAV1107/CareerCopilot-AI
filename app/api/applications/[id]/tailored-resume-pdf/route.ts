import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/services/ai-service";
import { generateTailoredResumePDF } from "@/lib/pdf-generator";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const application = await db.application.findFirst({
      where: { id, userId: user.id },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const tailoredData = await AIService.generateTailoredResumeData({
      userId: user.id,
      jobTitle: application.job.jobTitle,
      companyName: application.job.companyName,
      jobDescription: application.job.description,
    });

    const doc = generateTailoredResumePDF(tailoredData);
    const pdfArrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(pdfArrayBuffer);

    const safeFilename = `${tailoredData.candidateName.replace(/\s+/g, "_")}_Resume_${application.job.companyName.replace(
      /[^a-zA-Z0-9]/g,
      ""
    )}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
