import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/services/ai-service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { description } = await req.json();
    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required for analysis." }, { status: 400 });
    }

    const analysis = await AIService.analyzeJobDescription(description, user.id);
    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
