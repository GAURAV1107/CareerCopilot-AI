export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface LLMProvider {
  name: string;
  generateText(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
  generateStructuredOutput<T>(
    messages: LLMMessage[],
    schemaValidator: (data: unknown) => T,
    options?: LLMOptions
  ): Promise<T>;
}
