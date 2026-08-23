import { NextResponse } from "next/server";
import { OpenAIProvider } from "@/lib/ai/providers/openai-provider";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic-provider";
import { GeminiProvider } from "@/lib/ai/providers/gemini-provider";

export async function POST(request: Request) {
  try {
    const { provider, apiKey, model, baseUrl } = await request.json();
    if (!apiKey) return NextResponse.json({ error: "API key is required." }, { status: 400 });
    const client = provider === "anthropic"
      ? new AnthropicProvider(apiKey, model, baseUrl)
      : provider === "gemini"
        ? new GeminiProvider(apiKey, model, baseUrl)
        : new OpenAIProvider(apiKey, model, baseUrl);
    const response = await client.generateText([{ role: "user", content: "Reply with exactly: Connection successful" }], { temperature: 0, maxTokens: 20 });
    return NextResponse.json({ success: true, message: `Authenticated ${model} successfully.`, sampleResponse: response.slice(0, 120) });
  } catch (error) {
    return NextResponse.json({ error: `Authentication failed: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
