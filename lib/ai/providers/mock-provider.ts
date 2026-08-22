import { LLMProvider, LLMMessage, LLMOptions } from "../provider-interface";
import { JobAnalysisOutput, ResumeAnalysisOutput, ResumeImprovementResponse, InterviewPrepOutput } from "../schemas/ai-schemas";

export class MockAIProvider implements LLMProvider {
  name = "Rule-based Heuristic Provider (Fallback)";

  async generateText(messages: LLMMessage[]): Promise<string> {
    const userPrompt = messages.find((m) => m.role === "user")?.content || "";
    return `CareerCopilot AI Assistant: Based on your job search data (${userPrompt.slice(0, 100)}...), your highest match rate is in Senior QA Automation Engineer and SDET positions. Continue focusing on Playwright, RestAssured, and Docker to increase your interview calls.`;
  }

  async generateStructuredOutput<T>(
    messages: LLMMessage[],
    schemaValidator: (data: unknown) => T
  ): Promise<T> {
    const userMessage = messages.find((m) => m.role === "user")?.content || "";

    // Identify intent from prompt content
    if (userMessage.includes("Extract required skills") || userMessage.includes("Job Description Analysis")) {
      const mockJobAnalysis: JobAnalysisOutput = {
        jobTitle: "Senior QA Automation Engineer",
        requiredSkills: ["Selenium", "Java", "RestAssured", "API Testing", "SQL", "Jenkins"],
        preferredSkills: ["Playwright", "Docker", "AWS", "Kubernetes"],
        yearsOfExperience: { minimum: 5, maximum: 8 },
        responsibilities: [
          "Design and architect enterprise UI & API test automation frameworks",
          "Integrate continuous automated testing into Jenkins & GitHub Actions CI pipelines",
          "Deploy containerized test grids using Docker for cross-browser testing",
          "Collaborate with developers to establish high quality standards across microservices",
        ],
        qualifications: [
          "Bachelor's degree in Computer Science, Software Engineering, or equivalent experience",
          "5+ years of experience in QA Automation or SDET roles",
          "Strong object-oriented programming background in Java or Python",
        ],
        technologies: ["Selenium", "Playwright", "Java", "Python", "RestAssured", "Docker", "Jenkins", "SQL"],
        keywords: ["Automation", "SDET", "Regression", "CI/CD", "Framework", "Grid", "API"],
      };
      return schemaValidator(mockJobAnalysis);
    }

    if (userMessage.includes("Compare Candidate Resume") || userMessage.includes("Resume Analysis")) {
      const mockResumeAnalysis: ResumeAnalysisOutput = {
        matchingSkills: ["Selenium", "Java", "Python", "RestAssured", "API Testing", "SQL", "Jenkins", "GitHub Actions"],
        missingSkills: ["Docker Grid Setup", "Playwright Automation", "Kubernetes"],
        strongExperienceMatches: [
          "6 years of QA Automation framework development directly matches the requested 5+ years requirement.",
          "RestAssured API test integration into CI/CD pipelines matches backend test expectations.",
        ],
        weakAreas: [
          "Resume mentions Docker usage, but does not explicitly quantify containerized grid scalability.",
          "Playwright experience is present on profile but could be highlighted more prominently in work bullet points.",
        ],
        importantMissingKeywords: ["Containerized Execution", "Test Infrastructure", "Scalable Grid"],
        resumeImprovementSuggestions: [
          "Highlight specific quantitative impact (e.g. 'Reduced regression execution time by 65%').",
          "Add Playwright and TypeScript directly under primary framework competencies.",
        ],
        atsOptimizationSuggestions: [
          "Use standard section headers like 'Work Experience', 'Technical Skills', and 'Education'.",
          "Ensure technologies mentioned in job description appear in the top 1/3 of the first page.",
        ],
        overallExplanation:
          "Strong candidate profile with 88% overall alignment. High technical overlap in Java, Selenium, and RestAssured. Adding explicit metrics around Docker and Playwright will optimize ATS ranking.",
      };
      return schemaValidator(mockResumeAnalysis);
    }

    if (userMessage.includes("Resume Improvement")) {
      const mockImprovement: ResumeImprovementResponse = {
        improvedSummary:
          "Results-driven Senior QA Automation Engineer / SDET with 6 years of experience engineering scalable web and API test automation frameworks using Java, Selenium WebDriver, Playwright, and RestAssured. Proven track record of accelerating release cycles by 65% through containerized CI/CD pipelines in Jenkins and GitHub Actions.",
        bulletPointSuggestions: [
          {
            originalContent: "Worked on UI test automation using Java and Selenium.",
            suggestedContent:
              "Architected and maintained an enterprise Page Object Model UI test automation framework in Java & Selenium, executing 500+ daily regression scripts across parallel browsers.",
            reason: "Includes framework design terminology, metrics (500+ scripts), and parallel execution keywords requested by ATS.",
          },
          {
            originalContent: "Handled API testing using RestAssured.",
            suggestedContent:
              "Engineered automated REST API regression test suites with RestAssured, integrated seamlessly into GitHub Actions to block breaking backend changes prior to deployment.",
            reason: "Emphasizes CI/CD integration and release protection impact.",
          },
        ],
        skillsToEmphasize: ["Playwright", "Docker", "RestAssured", "Parallel Execution", "Jenkins CI/CD"],
        atsRecommendations: [
          "Include 'Software Development Engineer in Test (SDET)' explicitly in professional summary.",
          "Spell out acronyms on first mention e.g., Application Programming Interface (API).",
        ],
      };
      return schemaValidator(mockImprovement);
    }

    // Default Interview Prep schema
    const mockPrep: InterviewPrepOutput = {
      studyTopics: [
        "Page Object Model & Page Factory patterns in Selenium/Playwright",
        "RestAssured Response Validation & JSONPath assertions",
        "Thread-safe Parallel Test Execution & TestNG DataProviders",
        "Docker containerization for Selenium Grid / Selenoid nodes",
      ],
      technicalQuestions: [
        {
          question: "How do you handle dynamic wait strategy in Playwright vs Selenium WebDriver?",
          category: "Framework Architecture",
          sampleAnswerKeyPoints: [
            "Selenium uses explicit WebdriverWait with ExpectedConditions.",
            "Playwright features auto-waiting for actionability checks (visible, stable, enabled) before performing clicks or fills.",
          ],
        },
        {
          question: "Explain how you structure RestAssured API tests for microservices validation.",
          category: "API Automation",
          sampleAnswerKeyPoints: [
            "Given/When/Then BDD syntax.",
            "BaseSpec builders for reusable auth headers & base URIs.",
            "POJO serialization/deserialization with Jackson or Gson.",
          ],
        },
      ],
      behavioralQuestions: [
        {
          question: "Describe a situation where an automated test suite caught a critical production bug before release.",
          starFormatTips: "Detail the Situation, Task, Action (how your CI run blocked deployment), and Result (saved downtime & customer impact).",
        },
      ],
      practicePlan: [
        "Day 1: Review Java OOP & Collection framework concepts",
        "Day 2: Code 2 RestAssured sample tests from scratch",
        "Day 3: Practice mock behavioral questions using STAR method",
      ],
    };
    return schemaValidator(mockPrep);
  }
}
