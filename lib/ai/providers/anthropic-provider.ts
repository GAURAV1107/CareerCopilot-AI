import { LLMProvider, LLMMessage, LLMOptions } from "../provider-interface";

export class AnthropicProvider implements LLMProvider {
  name = "Anthropic Claude Provider";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.model = model || process.env.LLM_MODEL || "claude-3-5-sonnet-20241022";
    this.baseUrl = (baseUrl || process.env.LLM_BASE_URL || "https://api.anthropic.com/v1").replace(/\/$/, "");
  }

  async generateText(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error("No API key configured for Anthropic Claude Provider");
    }

    const systemMsg = messages.find((m) => m.role === "system")?.content || "";
    const userMsgs = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        system: systemMsg,
        messages: userMsgs,
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic Claude API HTTP Error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    return json.content?.[0]?.text || "";
  }

  async generateStructuredOutput<T>(
    messages: LLMMessage[],
    schemaValidator: (data: unknown) => T,
    options?: LLMOptions
  ): Promise<T> {
    const rawText = await this.generateText(messages, options);
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return schemaValidator(parsed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse Claude output into schema: ${errorMessage}`);
    }
  }
}
