import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/services/ai-service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { provider, apiKey, model, baseUrl } = await req.json();

    if (provider !== "mock" && !apiKey) {
      return NextResponse.json({ error: "API Key is required to authenticate." }, { status: 400 });
    }

    const testResult = await AIService.testConnection({
      provider: provider || "gemini",
      apiKey: apiKey || "",
      model: model || "gemini-2.5-flash",
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      provider,
      model,
      latencyMs: testResult.latencyMs,
      message: `Authenticated model '${model}' successfully! API latency: ${testResult.latencyMs}ms.`,
      sampleResponse: testResult.responseSample,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Authentication Failed: ${message}` }, { status: 500 });
  }
}
