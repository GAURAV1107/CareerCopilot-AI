import { LLMProvider, LLMMessage, LLMOptions } from "../provider-interface";

export class OpenAIProvider implements LLMProvider {
  name = "OpenAI Provider";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.model = model || process.env.LLM_MODEL || "gpt-4o";
    this.baseUrl = (baseUrl || process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  }

  async generateText(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error("No API key configured for OpenAI Provider");
    }

    const payload: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    };

    if (options?.responseFormatJson) {
      payload.response_format = { type: "json_object" };
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Provider HTTP Error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content || "";
  }

  async generateStructuredOutput<T>(
    messages: LLMMessage[],
    schemaValidator: (data: unknown) => T,
    options?: LLMOptions
  ): Promise<T> {
    const rawText = await this.generateText(messages, {
      ...options,
      responseFormatJson: true,
    });

    try {
      // Clean potential markdown wrap ```json ... ```
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return schemaValidator(parsed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse AI output into required schema: ${errorMessage}`);
    }
  }
}
