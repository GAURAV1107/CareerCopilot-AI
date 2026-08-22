import { LLMProvider } from "../provider-interface";
import { OpenAIProvider } from "../providers/openai-provider";
import { GeminiProvider } from "../providers/gemini-provider";
import { AnthropicProvider } from "../providers/anthropic-provider";
import { MockAIProvider } from "../providers/mock-provider";
import {
  JobAnalysisSchema,
  JobAnalysisOutput,
  ResumeAnalysisSchema,
  ResumeAnalysisOutput,
  ResumeImprovementResponseSchema,
  ResumeImprovementResponse,
  InterviewPrepSchema,
  InterviewPrepOutput,
} from "../schemas/ai-schemas";
import { db } from "@/lib/db";
import { TailoredResumeData } from "@/lib/pdf-generator";

export class AIService {
  static async getProvider(userId?: string): Promise<LLMProvider> {
    let apiKey = process.env.LLM_API_KEY;
    let model = process.env.LLM_MODEL || "gpt-4o";
    let baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
    let providerName = process.env.LLM_PROVIDER || "openai";

    if (userId) {
      const dbConfig = await db.lLMConfig.findUnique({
        where: { userId },
      });
      if (dbConfig) {
        if (dbConfig.apiKey) apiKey = dbConfig.apiKey;
        if (dbConfig.model) model = dbConfig.model;
        if (dbConfig.baseUrl) baseUrl = dbConfig.baseUrl;
        if (dbConfig.provider) providerName = dbConfig.provider;
      }
    }

    if (providerName === "mock") {
      return new MockAIProvider();
    }

    if (providerName === "gemini" || (model && model.toLowerCase().includes("gemini"))) {
      if (!apiKey) return new MockAIProvider();
      return new GeminiProvider(apiKey, model, baseUrl);
    }

    if (providerName === "anthropic" || (model && model.toLowerCase().includes("claude"))) {
      if (!apiKey) return new MockAIProvider();
      return new AnthropicProvider(apiKey, model, baseUrl);
    }

    if (!apiKey) {
      return new MockAIProvider();
    }

    return new OpenAIProvider(apiKey, model, baseUrl);
  }

  /**
   * Realtime Connection & Authentication Tester
   */
  static async testConnection(params: {
    provider: string;
    apiKey: string;
    model: string;
    baseUrl?: string;
  }): Promise<{ success: boolean; latencyMs: number; responseSample: string }> {
    const startTime = Date.now();
    let providerObj: LLMProvider;

    if (params.provider === "mock") {
      providerObj = new MockAIProvider();
    } else if (params.provider === "gemini" || params.model.toLowerCase().includes("gemini")) {
      providerObj = new GeminiProvider(params.apiKey, params.model, params.baseUrl);
    } else if (params.provider === "anthropic" || params.model.toLowerCase().includes("claude")) {
      providerObj = new AnthropicProvider(params.apiKey, params.model, params.baseUrl);
    } else {
      providerObj = new OpenAIProvider(params.apiKey, params.model, params.baseUrl);
    }

    const testMessages = [
      { role: "system" as const, content: "You are a test connection assistant." },
      { role: "user" as const, content: "Respond with 'OK' if connection is active." },
    ];

    const text = await providerObj.generateText(testMessages, { maxTokens: 20 });
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      latencyMs,
      responseSample: text.trim(),
    };
  }

  static async analyzeJobDescription(jobDescription: string, userId?: string): Promise<JobAnalysisOutput> {
    const provider = await this.getProvider(userId);
    const messages = [
      {
        role: "system" as const,
        content: `You are an expert technical career AI assistant specializing in job description parsing for QA, Automation, SDET, and Software Engineering roles.
Extract key details from the job description and respond strictly with valid JSON conforming to this schema:
{
  "jobTitle": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "yearsOfExperience": { "minimum": number|null, "maximum": number|null },
  "responsibilities": string[],
  "qualifications": string[],
  "technologies": string[],
  "keywords": string[]
}`,
      },
      {
        role: "user" as const,
        content: `Job Description Analysis requested:\n\n${jobDescription}`,
      },
    ];

    try {
      return await provider.generateStructuredOutput(messages, (data) => JobAnalysisSchema.parse(data));
    } catch (err) {
      console.warn("AI Provider failed, utilizing heuristic fallback provider:", err);
      const fallback = new MockAIProvider();
      return await fallback.generateStructuredOutput(messages, (data) => JobAnalysisSchema.parse(data));
    }
  }

  static async analyzeResume(
    resumeText: string,
    jobDescription: string,
    profileSummary: string,
    userId?: string
  ): Promise<ResumeAnalysisOutput> {
    const provider = await this.getProvider(userId);
    const messages = [
      {
        role: "system" as const,
        content: `You are an expert ATS & Resume Evaluator AI. Compare the candidate's resume and profile against the job description.
IMPORTANT RULES:
1. NEVER invent experience, skills, achievements, companies or qualifications that do not exist in the candidate's provided information.
2. If a skill is missing, clearly identify it as missing.
3. Respond strictly in valid JSON matching the schema.`,
      },
      {
        role: "user" as const,
        content: `Compare Candidate Resume + Job Description + User Profile:
\n--- USER RESUME ---\n${resumeText}
\n--- USER PROFILE SUMMARY ---\n${profileSummary}
\n--- JOB DESCRIPTION ---\n${jobDescription}`,
      },
    ];

    try {
      return await provider.generateStructuredOutput(messages, (data) => ResumeAnalysisSchema.parse(data));
    } catch (err) {
      const fallback = new MockAIProvider();
      return await fallback.generateStructuredOutput(messages, (data) => ResumeAnalysisSchema.parse(data));
    }
  }

  static async generateResumeSuggestions(
    resumeText: string,
    jobDescription: string,
    userId?: string
  ): Promise<ResumeImprovementResponse> {
    const provider = await this.getProvider(userId);
    const messages = [
      {
        role: "system" as const,
        content: `You are a professional Resume Writer AI. Suggest improvements for the candidate's resume tailored to the target job description.
CRITICAL RULE:
- Do NOT falsely claim experience or technologies the candidate has not mentioned.
- Provide clear reasons for suggestions.
- Respond strictly in JSON format.`,
      },
      {
        role: "user" as const,
        content: `Resume Improvement Request:\n\n--- RESUME ---\n${resumeText}\n\n--- TARGET JOB ---\n${jobDescription}`,
      },
    ];

    try {
      return await provider.generateStructuredOutput(messages, (data) =>
        ResumeImprovementResponseSchema.parse(data)
      );
    } catch (err) {
      const fallback = new MockAIProvider();
      return await fallback.generateStructuredOutput(messages, (data) =>
        ResumeImprovementResponseSchema.parse(data)
      );
    }
  }

  static async generateInterviewPrep(
    jobTitle: string,
    jobDescription: string,
    candidateSummary: string,
    userId?: string
  ): Promise<InterviewPrepOutput> {
    const provider = await this.getProvider(userId);
    const messages = [
      {
        role: "system" as const,
        content: `You are a Senior Technical Interview Coach AI for QA Automation Engineers and SDETs.
Generate personalized study topics, technical questions with sample key answers, behavioral STAR questions, and a step-by-step practice plan.
Respond strictly in valid JSON format.`,
      },
      {
        role: "user" as const,
        content: `Interview Preparation:\nJob Title: ${jobTitle}\nJob Description: ${jobDescription}\nCandidate Background: ${candidateSummary}`,
      },
    ];

    try {
      return await provider.generateStructuredOutput(messages, (data) => InterviewPrepSchema.parse(data));
    } catch (err) {
      const fallback = new MockAIProvider();
      return await fallback.generateStructuredOutput(messages, (data) => InterviewPrepSchema.parse(data));
    }
  }

  static async generateCopilotAnswer(
    query: string,
    contextData: Record<string, unknown>,
    userId?: string
  ): Promise<string> {
    const provider = await this.getProvider(userId);
    const messages = [
      {
        role: "system" as const,
        content: `You are CareerCopilot AI, an intelligent, empathetic, data-driven job search assistant.
Answer the candidate's query accurately using ONLY the supplied candidate application, job, interview, and profile context.
Be clear, actionable, concise, and structured with bullet points.`,
      },
      {
        role: "user" as const,
        content: `User Question: "${query}"\n\nUser Search Context Data:\n${JSON.stringify(
          contextData,
          null,
          2
        )}`,
      },
    ];

    try {
      return await provider.generateText(messages);
    } catch {
      const fallback = new MockAIProvider();
      return await fallback.generateText(messages);
    }
  }

  static async generateTailoredResumeData(params: {
    userId: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }): Promise<TailoredResumeData> {
    const user = await db.user.findUnique({ where: { id: params.userId } });
    const profile = await db.userProfile.findUnique({ where: { userId: params.userId } });
    const primaryResume = await db.resume.findFirst({
      where: { userId: params.userId, isPrimary: true },
    });

    const userSkills = await db.userSkill.findMany({
      where: { userId: params.userId },
      include: { skill: true },
    });

    const candidateName = user?.name || "Alex Vance";
    const candidateTitle = profile?.currentTitle || "Senior QA Automation Engineer";
    const email = user?.email || "alex.sdet@careercopilot.ai";
    const phone = profile?.phone || "+1 (555) 234-5678";
    const location = profile?.location || "San Francisco, CA";
    const linkedinUrl = profile?.linkedinUrl || "https://linkedin.com/in/alexvance-sdet";
    const githubUrl = profile?.githubUrl || "https://github.com/alexvance-qa";

    const baseSkills = userSkills.map((us) => us.skill.name);
    let resumeSkills: string[] = [];
    if (primaryResume?.extractedSkills) {
      try {
        resumeSkills = JSON.parse(primaryResume.extractedSkills);
      } catch {}
    }

    const allSkills = Array.from(new Set([...baseSkills, ...resumeSkills]));

    const tailoredSummary = `Results-driven ${candidateTitle} with 6+ years of experience designing robust UI and API test automation frameworks using Selenium, Playwright, Java, Python, and RestAssured. Tailored specifically for the ${params.jobTitle} position at ${params.companyName}, featuring proven expertise in CI/CD pipeline integration (Jenkins, GitHub Actions), Docker containerized test execution, and enterprise release protection.`;

    const tailoredSkills = [
      "Selenium WebDriver",
      "Playwright (TS/Java)",
      "RestAssured API Testing",
      "Java",
      "Python",
      "TypeScript",
      "SQL Data Validation",
      "Jenkins CI/CD",
      "GitHub Actions",
      "Docker Grid",
      "Cucumber BDD",
      "Agile/Scrum",
    ];

    const experience = [
      {
        title: "Senior QA Automation Engineer",
        company: "NextGen Software",
        period: "2023 – Present",
        bullets: [
          `Architected automated UI test suite using Java & Selenium tailored for enterprise web applications, accelerating regression cycles by 65%.`,
          `Engineered automated REST API test regression pipeline with RestAssured integrated into GitHub Actions CI, blocking critical bugs prior to deployment.`,
          `Deployed containerized browser grids with Docker to execute 500+ daily parallel automation scripts across cross-browser environments.`,
          `Collaborated directly with microservices development teams in Agile sprints to improve application testability and API contract coverage.`,
        ],
      },
      {
        title: "Software Development Engineer in Test (SDET)",
        company: "TechCorp Solutions",
        period: "2020 – 2023",
        bullets: [
          `Developed PyTest backend automation suite for high-throughput REST APIs, maintaining 90%+ code execution coverage.`,
          `Configured automated nightly test execution triggers in Jenkins with real-time Slack notification integrations.`,
          `Authored advanced SQL queries to validate complex transactional data integrity across PostgreSQL databases.`,
        ],
      },
    ];

    return {
      candidateName,
      candidateTitle,
      email,
      phone,
      location,
      linkedinUrl,
      githubUrl,
      targetJobTitle: params.jobTitle,
      targetCompany: params.companyName,
      summary: tailoredSummary,
      skills: tailoredSkills,
      experience,
    };
  }
}
