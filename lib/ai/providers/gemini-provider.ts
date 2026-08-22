import { LLMProvider, LLMMessage, LLMOptions } from "../provider-interface";

export class GeminiProvider implements LLMProvider {
  name = "Google Gemini Provider";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.model = model || process.env.LLM_MODEL || "gemini-2.5-flash";
    this.baseUrl = (baseUrl || process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
  }

  async generateText(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error("No API key configured for Google Gemini Provider");
    }

    // Try OpenAI-compatible endpoint first, fallback to native REST API
    try {
      const openAiUrl = `${this.baseUrl.includes("/openai") ? this.baseUrl : "https://generativelanguage.googleapis.com/v1beta/openai"}/chat/completions`;
      const payload: Record<string, unknown> = {
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      };

      if (options?.responseFormatJson) {
        payload.response_format = { type: "json_object" };
      }

      const res = await fetch(openAiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content || "";
      }
    } catch {
      // Ignore and try native Google Generative AI API
    }

    // Native Google Gemini API endpoint
    const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    // Convert LLMMessage format to Gemini contents format
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (options?.responseFormatJson) {
      body.generationConfig = { responseMimeType: "application/json" };
    }

    const nativeRes = await fetch(nativeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!nativeRes.ok) {
      const errText = await nativeRes.text();
      throw new Error(`Google Gemini API HTTP Error (${nativeRes.status}): ${errText}`);
    }

    const json = await nativeRes.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return candidateText;
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
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return schemaValidator(parsed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse Gemini output into schema: ${errorMessage}`);
    }
  }
}
