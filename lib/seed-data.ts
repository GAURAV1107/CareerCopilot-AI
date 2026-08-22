import { db } from "./db";
import { hashPassword } from "./auth";

export async function seedDemoData() {
  const prodEmail = "gauravmanujendra@gmail.com";

  // Check if seed user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email: prodEmail },
        { email: "manujendragaurav@gmail.com" }
      ]
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await hashPassword("Password123!");

  // 1. Create User
  const user = await db.user.create({
    data: {
      email: prodEmail,
      passwordHash: hashedPassword,
      name: "Manujendra Gaurav",
      role: "JOB_SEEKER",
    },
  });

  // 2. Create UserProfile
  await db.userProfile.create({
    data: {
      userId: user.id,
      phone: "+91-9123243009",
      location: "Bengaluru, India",
      linkedinUrl: "https://linkedin.com/in/manujendra-gaurav",
      portfolioUrl: "https://manujendragaurav.dev",
      githubUrl: "https://github.com/GAURAV1107",
      currentTitle: "Senior QA Automation Engineer & AI-Driven Quality Engineering Specialist",
      yearsExperience: 5.5,
      currentCompany: "DataArt Technologies India Pvt Ltd",
      summary:
        "Results-driven Senior QA Automation Engineer with 5.5+ years of experience designing and scaling AI-powered test automation solutions across web, API, and mobile platforms. Expert in building autonomous AI agents, custom skill files, and MCP server integrations to enable self-healing, intelligent test ecosystems. Proficient in Java, Python, Selenium, Playwright, Appium, and Robot Framework. Deep experience integrating CI/CD pipelines (Jenkins), cloud platforms (AWS, Docker), and AI tools (GitHub Copilot, Claude AI, ChatGPT, n8n) to accelerate delivery and improve software quality.",
      expectedSalary: "₹24,000,000 - ₹30,000,000 / $150,000 - $175,000",
      noticePeriod: "Immediate / 1 Month",
      preferredTitles: JSON.stringify([
        "Senior QA Automation Engineer",
        "AI-Driven Quality Engineering Specialist",
        "Software Development Engineer in Test (SDET)",
        "Automation Lead",
      ]),
      preferredLocations: "Bengaluru, India; Remote",
      remotePreference: "Remote",
      employmentType: "Full-time",
      expectedSalaryMin: 150000,
      expectedSalaryMax: 175000,
    },
  });

  // 3. Create Skills
  const qaSkills = [
    { name: "Java", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "SQL", category: "Languages" },
    { name: "HTML/CSS", category: "Languages" },
    { name: "AI Agent Development", category: "AI & Agents" },
    { name: "MCP Server Integration", category: "AI & Agents" },
    { name: "Skill File Creation", category: "AI & Agents" },
    { name: "Claude AI", category: "AI & Agents" },
    { name: "GitHub Copilot", category: "AI & Agents" },
    { name: "ChatGPT", category: "AI & Agents" },
    { name: "n8n Workflow Automation", category: "AI & Agents" },
    { name: "Self-Healing Test Automation", category: "AI & Agents" },
    { name: "Selenium WebDriver", category: "Automation Frameworks" },
    { name: "Playwright", category: "Automation Frameworks" },
    { name: "Appium", category: "Automation Frameworks" },
    { name: "Robot Framework", category: "Automation Frameworks" },
    { name: "Rest Assured", category: "Automation Frameworks" },
    { name: "RequestsLibrary", category: "Automation Frameworks" },
    { name: "Pytest", category: "Automation Frameworks" },
    { name: "TestNG", category: "Automation Frameworks" },
    { name: "Pabot", category: "Automation Frameworks" },
    { name: "Jenkins", category: "CI/CD & DevOps" },
    { name: "GitLab CI", category: "CI/CD & DevOps" },
    { name: "Docker", category: "CI/CD & DevOps" },
    { name: "AWS", category: "CI/CD & DevOps" },
    { name: "Linux", category: "CI/CD & DevOps" },
    { name: "Git / GitHub / Bitbucket", category: "CI/CD & DevOps" },
    { name: "Postman", category: "API & Tools" },
    { name: "REST API Testing", category: "API & Tools" },
    { name: "GraphQL", category: "API & Tools" },
    { name: "JIRA", category: "Project Management" },
    { name: "Agile/Scrum", category: "Project Management" },
    { name: "Maven", category: "Project Management" },
  ];

  for (const s of qaSkills) {
    const skill = await db.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });

    await db.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: skill.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        skillId: skill.id,
      },
    });
  }

  // 4. Create Primary Resume
  const primaryResumeText = `MANUJENDRA GAURAV
Senior QA Automation Engineer & AI-Driven Quality Engineering Specialist
gauravmanujendra@gmail.com | +91-9123243009 | Bengaluru, India | LinkedIn

PROFESSIONAL SUMMARY
Results-driven Senior QA Automation Engineer with 5.5+ years of experience designing and scaling AI-powered test automation solutions across web, API, and mobile platforms. Expert in building autonomous AI agents, custom skill files, and MCP server integrations to enable self-healing, intelligent test ecosystems. Proficient in Java, Python, Selenium, Playwright, Appium, and Robot Framework. Deep experience integrating CI/CD pipelines (Jenkins), cloud platforms (AWS, Docker), and AI tools (GitHub Copilot, Claude AI, ChatGPT, n8n) to accelerate delivery and improve software quality. Proven leader who mentors teams and champions modern QA practices in Agile environments.

TECHNICAL SKILLS
Languages: Java, Python, SQL, HTML, CSS
AI & Agents: AI Agent Development, MCP Server Integration, Skill File Creation, Claude AI, GitHub Copilot, ChatGPT, n8n Workflow Automation, Self-Healing Test Automation, AI-Driven Test Generation
Automation Frameworks: Selenium WebDriver, Playwright, Appium, Robot Framework, Rest Assured, RequestsLibrary, Pytest, TestNG, Pabot
CI/CD & DevOps: Jenkins, GitLab CI, Docker, AWS, Linux, Git, GitHub, Bitbucket
API & Tools: Postman, REST API Testing, GraphQL
Project Management: JIRA, Agile/Scrum, Maven, Word, Excel

WORK EXPERIENCE
Automation Engineer — AI & Quality Engineering
DataArt Technologies India Pvt Ltd · Bengaluru | September 2025 – Present
• Architect and deploy AI agents and MCP server integrations to enable autonomous test execution, defect triage, and intelligent reporting pipelines.
• Design custom skill files for AI-assisted test generation, reducing new test authoring time by ~40%.
• Build scalable automation frameworks for web and API testing using Playwright (Python) and RequestsLibrary with self-healing locator strategies.
• Integrate GitHub Copilot and ChatGPT into the SDLC to accelerate script development, code reviews, and root-cause analysis.
• Implement n8n workflow automation to orchestrate test triggers, Slack notifications, and JIRA ticket creation.
• Engineer intelligent CI/CD quality gates in Jenkins, reducing defect escape rate by 30%.
• Mentor 4+ engineers on AI tooling adoption, modern automation patterns, and clean-code practices.

Project Lead – Quality Automation Engineer
Persistent Systems · Bengaluru | April 2024 – September 2025
• Built an end-to-end mobile automation framework from scratch using Robot Framework + Appium, achieving 85% test automation coverage.
• Reduced manual testing effort by 60% through parallel execution with Pabot and a Jenkins CI pipeline.
• Led migration to a new quality management system, ensuring zero regression impact during cutover.
• Introduced AI-assisted defect prediction reports, improving sprint planning accuracy.
• Mentored and onboarded new automation engineers, establishing team coding standards and review processes.

Senior SDET
TAO Digital · Bengaluru | August 2023 – December 2023
• Automated functional, regression, smoke, and sanity test suites across multiple product lines.
• Drove root-cause analysis and contributed to a 25% reduction in production defects.
• Documented engineering procedures and mentored junior SDETs on framework best practices.

Senior SDET
Brillio Technology · Bengaluru | October 2022 – July 2023
• Developed a Robot Framework-based UI and API automation framework from scratch, improving coverage by 50%.
• Implemented parallel test execution and CI pipeline integration, cutting test run time by 45%.
• Ensured product stability through comprehensive regression and smoke testing across release cycles.

Senior Engineer – Testing
Capgemini · Bengaluru | December 2020 – October 2022
• Designed and automated functional, regression, smoke, and sanity test cases across diverse enterprise projects.
• Led successful transition to a new quality management system with minimal disruption.
• Assisted in root-cause analysis, contributing to improved product quality and release confidence.

KEY PROJECTS
Yield Book API (DataArt): Automated validation of fixed-income analytics APIs using Python RequestsLibrary; integrated AI-assisted test generation with GitHub Copilot and Claude AI to enhance accuracy and coverage for complex financial calculations.
Sync – Frontline Worker Platform (Persistent): Delivered mobile automation coverage for a real-time push-to-talk/video communication platform used in retail, healthcare, and manufacturing via Appium + Robot Framework. Leveraged Claude AI and GitHub Copilot to auto-generate test cases for complex multi-device communication flows, reducing test authoring time by 35%. Used AI-driven analysis to identify flaky tests and implement self-healing locator strategies, improving suite stability.
Al-Muzaini Exchange Application: Automated end-to-end money exchange transaction flows, including dynamic API generation and bank server integration validation, ensuring data integrity across all transaction states.
Jenkins 2.0 – Life Sciences (Capgemini): Tested clinical trial management modules (SSP/F, PMD, TEM) covering planning, drug provisioning, and temperature monitoring during shipment.
Access Unification – Verizon: Validated consolidation of customer LEC access circuits to reduce infrastructure costs, ensuring seamless migration and regression stability.

EDUCATION & CERTIFICATIONS
B.Tech – Electronics & Communication Engineering | The Techno School, Bhubaneswar (BPUT) | CGPA: 7.9 / 10
Professional Certifications: View all certifications on Google Drive Link

ACHIEVEMENT
■ Value Champion Award — recognised for outstanding contribution to team quality and automation initiatives.`;

  const primaryResume = await db.resume.create({
    data: {
      userId: user.id,
      filename: "Manujendra_Gaurav_AI_Quality_Engineer_Resume.pdf",
      originalName: "Manujendra_Gaurav_AI_Quality_Engineer_Resume.pdf",
      fileType: "pdf",
      fileUrl: "/sample-resumes/manujendra_gaurav_resume.pdf",
      fileSize: 285000,
      isPrimary: true,
      notes: "Official Master Resume - Senior QA Automation Engineer & AI-Driven Quality Engineering Specialist",
      extractedSkills: JSON.stringify([
        "Java", "Python", "SQL", "Selenium", "Playwright", "Appium", "Robot Framework", "Rest Assured",
        "AI Agent Development", "MCP Server Integration", "Claude AI", "GitHub Copilot", "ChatGPT", "n8n",
        "Jenkins", "Docker", "AWS", "JIRA", "Postman", "Pytest"
      ]),
      parsedText: primaryResumeText,
    },
  });

  // 5. Create Sample Jobs matching candidate profile
  const job1 = await db.job.create({
    data: {
      userId: user.id,
      companyName: "CloudScale Systems",
      companyWebsite: "https://cloudscale.example.com",
      jobTitle: "Senior Software Development Engineer in Test (SDET)",
      description: `About the Role:
We are seeking a Senior SDET & AI Quality Engineer to lead automated testing initiatives.
Key Responsibilities:
- Design hybrid test automation frameworks using Selenium, Playwright, Python, and Java.
- Integrate AI tools (GitHub Copilot, Claude AI, ChatGPT) into testing pipelines for self-healing tests.
- Build automated REST API test suites using RestAssured and RequestsLibrary.
- Setup Jenkins CI/CD execution grids with Docker containers.`,
      jobUrl: "https://linkedin.com/jobs/view/1001",
      location: "Bengaluru, India (Hybrid / Remote)",
      salaryMin: 160000,
      salaryMax: 185000,
      currency: "USD",
      employmentType: "Full-time",
      workMode: "Remote",
      source: "LinkedIn",
    },
  });

  const app1 = await db.application.create({
    data: {
      userId: user.id,
      jobId: job1.id,
      resumeId: primaryResume.id,
      status: "Technical Interview",
      appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recruiterName: "Sarah Jenkins",
      recruiterEmail: "sarah.jenkins@cloudscale.example.com",
      activities: {
        create: [
          { eventType: "Job Saved", description: "Saved job opportunity from LinkedIn" },
          { eventType: "Resume Analyzed", description: "Ran AI match comparison (94% Match Score)" },
          { eventType: "Application Submitted", description: "Submitted application via portal" },
          { eventType: "Interview Scheduled", description: "Technical Automation Round scheduled" },
        ],
      },
    },
  });

  await db.jobMatchAnalysis.create({
    data: {
      applicationId: app1.id,
      jobId: job1.id,
      resumeId: primaryResume.id,
      overallScore: 94,
      skillMatchScore: 96,
      expMatchScore: 95,
      semanticScore: 92,
      locationScore: 100,
      keywordScore: 90,
      explanation: "Exceptional match! 5.5+ years experience in Playwright, Python, AI Agents, RestAssured, and Jenkins directly matches all requirements.",
      matchingSkills: JSON.stringify(["Selenium", "Playwright", "Python", "Java", "Rest Assured", "AI Agent Development", "Jenkins", "Docker"]),
      missingSkills: JSON.stringify(["GraphQL"]),
    },
  });

  // Default LLM Config
  await db.lLMConfig.create({
    data: {
      userId: user.id,
      provider: "gemini",
      model: "gemini-2.5-flash",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    },
  });

  return user;
}
