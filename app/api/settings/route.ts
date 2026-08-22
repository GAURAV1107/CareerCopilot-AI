import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await db.lLMConfig.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    config: config
      ? {
          provider: config.provider,
          model: config.model,
          baseUrl: config.baseUrl,
          hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0),
        }
      : {
          provider: "openai",
          model: "gpt-4o",
          baseUrl: "https://api.openai.com/v1",
          hasApiKey: Boolean(process.env.LLM_API_KEY),
        },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { provider, apiKey, model, baseUrl } = await req.json();

    const config = await db.lLMConfig.upsert({
      where: { userId: user.id },
      update: {
        provider: provider || "openai",
        ...(apiKey !== undefined && apiKey !== "" ? { apiKey } : {}),
        model: model || "gpt-4o",
        baseUrl: baseUrl || "https://api.openai.com/v1",
      },
      create: {
        userId: user.id,
        provider: provider || "openai",
        apiKey,
        model: model || "gpt-4o",
        baseUrl: baseUrl || "https://api.openai.com/v1",
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        hasApiKey: Boolean(config.apiKey),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
