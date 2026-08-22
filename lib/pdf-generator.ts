import { jsPDF } from "jspdf";

export interface WorkExperienceItem {
  title: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
}

export interface KeyProjectItem {
  name: string;
  company?: string;
  description: string;
}

export interface TailoredResumeData {
  candidateName: string;
  candidateTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  targetJobTitle: string;
  targetCompany: string;
  summary: string;
  skillsCategorized?: {
    languages?: string;
    aiAndAgents?: string;
    automationFrameworks?: string;
    ciCdDevOps?: string;
    apiAndTools?: string;
    projectManagement?: string;
  };
  skills?: string[];
  experience: WorkExperienceItem[];
  projects?: KeyProjectItem[];
  education?: string;
  certifications?: string;
  achievement?: string;
}

export function generateTailoredResumePDF(data: TailoredResumeData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 12) {
      doc.addPage();
      y = 14;
    }
  };

  // 1. CANDIDATE HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(data.candidateName.toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 6;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(37, 99, 235); // Blue #2563EB
  doc.text(data.candidateTitle, pageWidth / 2, y, { align: "center" });
  y += 5.5;

  // Contact Info Line
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  const contactText = `${data.email} | ${data.phone} | ${data.location} | LinkedIn`;
  doc.text(contactText, pageWidth / 2, y, { align: "center" });
  y += 7;

  // Draw Section Header Helper
  const drawSectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235); // Blue #2563EB
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;
    doc.setLineWidth(0.4);
    doc.setDrawColor(37, 99, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4.5;
  };

  // 2. PROFESSIONAL SUMMARY
  drawSectionHeader("PROFESSIONAL SUMMARY");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  checkPageBreak(summaryLines.length * 4);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4 + 3;

  // 3. TECHNICAL SKILLS (Categorized in Manujendra Gaurav Format)
  drawSectionHeader("TECHNICAL SKILLS");
  doc.setFontSize(8.5);

  const skillsObj = data.skillsCategorized || {
    languages: "Java, Python, SQL, HTML, CSS",
    aiAndAgents:
      "AI Agent Development, MCP Server Integration, Skill File Creation, Claude AI, GitHub Copilot, ChatGPT, n8n Workflow Automation, Self-Healing Test Automation",
    automationFrameworks:
      "Selenium WebDriver, Playwright, Appium, Robot Framework, Rest Assured, RequestsLibrary, Pytest, TestNG, Pabot",
    ciCdDevOps: "Jenkins, GitLab CI, Docker, AWS, Linux, Git, GitHub, Bitbucket",
    apiAndTools: "Postman, REST API Testing, GraphQL",
    projectManagement: "JIRA, Agile/Scrum, Maven, Word, Excel",
  };

  const skillCategories = [
    { label: "Languages", val: skillsObj.languages },
    { label: "AI & Agents", val: skillsObj.aiAndAgents },
    { label: "Automation Frameworks", val: skillsObj.automationFrameworks },
    { label: "CI/CD & DevOps", val: skillsObj.ciCdDevOps },
    { label: "API & Tools", val: skillsObj.apiAndTools },
    { label: "Project Management", val: skillsObj.projectManagement },
  ];

  for (const cat of skillCategories) {
    if (cat.val) {
      checkPageBreak(4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      const labelText = `${cat.label}: `;
      doc.text(labelText, margin, y);
      const labelWidth = doc.getTextWidth(labelText);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const valLines = doc.splitTextToSize(cat.val, contentWidth - labelWidth);
      doc.text(valLines[0], margin + labelWidth, y);

      if (valLines.length > 1) {
        for (let i = 1; i < valLines.length; i++) {
          y += 3.8;
          doc.text(valLines[i], margin + labelWidth, y);
        }
      }
      y += 4.2;
    }
  }
  y += 2;

  // 4. WORK EXPERIENCE
  drawSectionHeader("WORK EXPERIENCE");

  const defaultExperiences: WorkExperienceItem[] = [
    {
      title: "Automation Engineer — AI & Quality Engineering",
      company: "DataArt Technologies India Pvt Ltd",
      location: "Bengaluru",
      period: "September 2025 – Present",
      bullets: [
        "Architect and deploy AI agents and MCP server integrations to enable autonomous test execution, defect triage, and intelligent reporting pipelines.",
        "Design custom skill files for AI-assisted test generation, reducing new test authoring time by ~40%.",
        "Build scalable automation frameworks for web and API testing using Playwright (Python) and RequestsLibrary with self-healing locator strategies.",
        "Integrate GitHub Copilot and ChatGPT into the SDLC to accelerate script development, code reviews, and root-cause analysis.",
        "Implement n8n workflow automation to orchestrate test triggers, Slack notifications, and JIRA ticket creation.",
        "Engineer intelligent CI/CD quality gates in Jenkins, reducing defect escape rate by 30%.",
        "Mentor 4+ engineers on AI tooling adoption, modern automation patterns, and clean-code practices.",
      ],
    },
    {
      title: "Project Lead – Quality Automation Engineer",
      company: "Persistent Systems",
      location: "Bengaluru",
      period: "April 2024 – September 2025",
      bullets: [
        "Built an end-to-end mobile automation framework from scratch using Robot Framework + Appium, achieving 85% test automation coverage.",
        "Reduced manual testing effort by 60% through parallel execution with Pabot and a Jenkins CI pipeline.",
        "Led migration to a new quality management system, ensuring zero regression impact during cutover.",
        "Introduced AI-assisted defect prediction reports, improving sprint planning accuracy.",
        "Mentored and onboarded new automation engineers, establishing team coding standards and review processes.",
      ],
    },
    {
      title: "Senior SDET",
      company: "TAO Digital",
      location: "Bengaluru",
      period: "August 2023 – December 2023",
      bullets: [
        "Automated functional, regression, smoke, and sanity test suites across multiple product lines.",
        "Drove root-cause analysis and contributed to a 25% reduction in production defects.",
        "Documented engineering procedures and mentored junior SDETs on framework best practices.",
      ],
    },
    {
      title: "Senior SDET",
      company: "Brillio Technology",
      location: "Bengaluru",
      period: "October 2022 – July 2023",
      bullets: [
        "Developed a Robot Framework-based UI and API automation framework from scratch, improving coverage by 50%.",
        "Implemented parallel test execution and CI pipeline integration, cutting test run time by 45%.",
        "Ensured product stability through comprehensive regression and smoke testing across release cycles.",
      ],
    },
    {
      title: "Senior Engineer – Testing",
      company: "Capgemini",
      location: "Bengaluru",
      period: "December 2020 – October 2022",
      bullets: [
        "Designed and automated functional, regression, smoke, and sanity test cases across diverse enterprise projects.",
        "Led successful transition to a new quality management system with minimal disruption.",
        "Assisted in root-cause analysis, contributing to improved product quality and release confidence.",
      ],
    },
  ];

  const expList = data.experience && data.experience.length > 0 ? data.experience : defaultExperiences;

  for (const exp of expList) {
    checkPageBreak(12);
    // Role Title (Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(exp.title, margin, y);
    y += 4;

    // Company, Location | Period (Italics)
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const subText = `${exp.company} · ${exp.location || "Bengaluru"} | ${exp.period}`;
    doc.text(subText, margin, y);
    y += 4.5;

    // Bullets
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    for (const bullet of exp.bullets) {
      const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 4);
      checkPageBreak(bulletLines.length * 3.8);
      doc.text(bulletLines, margin + 2, y);
      y += bulletLines.length * 3.8 + 1;
    }
    y += 2.5;
  }

  // 5. KEY PROJECTS
  drawSectionHeader("KEY PROJECTS");

  const defaultProjects: KeyProjectItem[] = [
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

  const projectList = data.projects && data.projects.length > 0 ? data.projects : defaultProjects;

  for (const proj of projectList) {
    checkPageBreak(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const projHeading = `${proj.name}: `;
    doc.text(projHeading, margin, y);
    const headingWidth = doc.getTextWidth(projHeading);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const descLines = doc.splitTextToSize(proj.description, contentWidth - headingWidth);
    doc.text(descLines[0], margin + headingWidth, y);

    if (descLines.length > 1) {
      for (let i = 1; i < descLines.length; i++) {
        y += 3.8;
        doc.text(descLines[i], margin + headingWidth, y);
      }
    }
    y += 4.5;
  }
  y += 1;

  // 6. EDUCATION & CERTIFICATIONS
  drawSectionHeader("EDUCATION & CERTIFICATIONS");
  checkPageBreak(8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("B.Tech – Electronics & Communication Engineering", margin, y);
  doc.text("Professional Certifications", pageWidth / 2 + 5, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("The Techno School, Bhubaneswar (BPUT) | CGPA: 7.9 / 10", margin, y);
  doc.text("View all certifications: Google Drive Link", pageWidth / 2 + 5, y);
  y += 7;

  // 7. ACHIEVEMENT
  drawSectionHeader("ACHIEVEMENT");
  checkPageBreak(6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("■ Value Champion Award — recognised for outstanding contribution to team quality and automation initiatives.", margin, y);

  return doc;
}
