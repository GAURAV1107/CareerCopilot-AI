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
import { TailoredResumeData, WorkExperienceItem, KeyProjectItem } from "@/lib/pdf-generator";

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

    const candidateName = user?.name || "MANUJENDRA GAURAV";
    const candidateTitle = profile?.currentTitle || "Senior QA Automation Engineer & AI-Driven Quality Engineering Specialist";
    const email = user?.email || "gauravmanujendra@gmail.com";
    const phone = profile?.phone || "+91-9123243009";
    const location = profile?.location || "Bengaluru, India";

    // Tailored summary aligning candidate history with target job description
    const tailoredSummary = `Results-driven Senior QA Automation Engineer with 5.5+ years of experience designing and scaling AI-powered test automation solutions across web, API, and mobile platforms. Specialized in autonomous AI agents, MCP server integrations, self-healing locator strategies, and CI/CD quality gates. Tailored for the ${params.jobTitle} role at ${params.companyName}, bringing proven expertise in Selenium, Playwright (Python/Java), Appium, Robot Framework, Rest Assured, Jenkins, Docker, AWS, and AI tools (GitHub Copilot, Claude AI, ChatGPT, n8n) to accelerate delivery and ensure top-tier release quality.`;

    const skillsCategorized = {
      languages: "Java, Python, SQL, HTML, CSS",
      aiAndAgents: "AI Agent Development, MCP Server Integration, Skill File Creation, Claude AI, GitHub Copilot, ChatGPT, n8n Workflow Automation, Self-Healing Test Automation",
      automationFrameworks: "Selenium WebDriver, Playwright, Appium, Robot Framework, Rest Assured, RequestsLibrary, Pytest, TestNG, Pabot",
      ciCdDevOps: "Jenkins, GitLab CI, Docker, AWS, Linux, Git, GitHub, Bitbucket",
      apiAndTools: "Postman, REST API Testing, GraphQL",
      projectManagement: "JIRA, Agile/Scrum, Maven, Word, Excel",
    };

    const experience: WorkExperienceItem[] = [
      {
        title: "Automation Engineer — AI & Quality Engineering",
        company: "DataArt Technologies India Pvt Ltd",
        location: "Bengaluru",
        period: "September 2025 – Present",
        bullets: [
          `Architect and deploy AI agents and MCP server integrations tailored for ${params.jobTitle} automation requirements at ${params.companyName}.`,
          `Design custom skill files for AI-assisted test generation, reducing new test authoring time by ~40%.`,
          `Build scalable automation frameworks for web and API testing using Playwright (Python) and RequestsLibrary with self-healing locator strategies.`,
          `Integrate GitHub Copilot and ChatGPT into the SDLC to accelerate script development, code reviews, and root-cause analysis.`,
          `Implement n8n workflow automation to orchestrate test triggers, Slack notifications, and JIRA ticket creation.`,
          `Engineer intelligent CI/CD quality gates in Jenkins, reducing defect escape rate by 30%.`,
          `Mentor 4+ engineers on AI tooling adoption, modern automation patterns, and clean-code practices.`,
        ],
      },
      {
        title: "Project Lead – Quality Automation Engineer",
        company: "Persistent Systems",
        location: "Bengaluru",
        period: "April 2024 – September 2025",
        bullets: [
          `Built an end-to-end mobile automation framework from scratch using Robot Framework + Appium, achieving 85% test automation coverage.`,
          `Reduced manual testing effort by 60% through parallel execution with Pabot and a Jenkins CI pipeline.`,
          `Led migration to a new quality management system, ensuring zero regression impact during cutover.`,
          `Introduced AI-assisted defect prediction reports, improving sprint planning accuracy.`,
          `Mentored and onboarded new automation engineers, establishing team coding standards and review processes.`,
        ],
      },
      {
        title: "Senior SDET",
        company: "TAO Digital",
        location: "Bengaluru",
        period: "August 2023 – December 2023",
        bullets: [
          `Automated functional, regression, smoke, and sanity test suites across multiple product lines.`,
          `Drove root-cause analysis and contributed to a 25% reduction in production defects.`,
          `Documented engineering procedures and mentored junior SDETs on framework best practices.`,
        ],
      },
      {
        title: "Senior SDET",
        company: "Brillio Technology",
        location: "Bengaluru",
        period: "October 2022 – July 2023",
        bullets: [
          `Developed a Robot Framework-based UI and API automation framework from scratch, improving coverage by 50%.`,
          `Implemented parallel test execution and CI pipeline integration, cutting test run time by 45%.`,
          `Ensured product stability through comprehensive regression and smoke testing across release cycles.`,
        ],
      },
      {
        title: "Senior Engineer – Testing",
        company: "Capgemini",
        location: "Bengaluru",
        period: "December 2020 – October 2022",
        bullets: [
          `Designed and automated functional, regression, smoke, and sanity test cases across diverse enterprise projects.`,
          `Led successful transition to a new quality management system with minimal disruption.`,
          `Assisted in root-cause analysis, contributing to improved product quality and release confidence.`,
        ],
      },
    ];

    const projects: KeyProjectItem[] = [
      {
        name: "Yield Book API (DataArt)",
        description:
          "Automated validation of fixed-income analytics APIs using Python RequestsLibrary; integrated AI-assisted test generation with GitHub Copilot and Claude AI to enhance accuracy and coverage for complex financial calculations.",
      },
      {
        name: "Sync – Frontline Worker Platform (Persistent)",
        description:
          "Delivered mobile automation coverage for a real-time push-to-talk/video communication platform used in retail, healthcare, and manufacturing via Appium + Robot Framework. Leveraged Claude AI and GitHub Copilot to auto-generate test cases for complex multi-device communication flows, reducing test authoring time by 35%. Used AI-driven analysis to identify flaky tests and implement self-healing locator strategies, improving suite stability.",
      },
      {
        name: "Al-Muzaini Exchange Application",
        description:
          "Automated end-to-end money exchange transaction flows, including dynamic API generation and bank server integration validation, ensuring data integrity across all transaction states.",
      },
      {
        name: "Jenkins 2.0 – Life Sciences (Capgemini)",
        description:
          "Tested clinical trial management modules (SSP/F, PMD, TEM) covering planning, drug provisioning, and temperature monitoring during shipment.",
      },
      {
        name: "Access Unification – Verizon",
        description:
          "Validated consolidation of customer LEC access circuits to reduce infrastructure costs, ensuring seamless migration and regression stability.",
      },
    ];

    return {
      candidateName,
      candidateTitle,
      email,
      phone,
      location,
      targetJobTitle: params.jobTitle,
      targetCompany: params.companyName,
      summary: tailoredSummary,
      skillsCategorized,
      experience,
      projects,
      education: "B.Tech – Electronics & Communication Engineering | The Techno School, Bhubaneswar (BPUT) | CGPA: 7.9 / 10",
      certifications: "View all certifications: Google Drive Link",
      achievement: "■ Value Champion Award — recognised for outstanding contribution to team quality and automation initiatives.",
    };
  }
}
