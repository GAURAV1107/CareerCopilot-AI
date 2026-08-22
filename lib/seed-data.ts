import { db } from "./db";
import { hashPassword } from "./auth";

export async function seedDemoData() {
  const prodEmail = "manujendragaurav@gmail.com";

  // Check if seed user already exists
  const existingUser = await db.user.findUnique({
    where: { email: prodEmail },
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
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA (Remote)",
      linkedinUrl: "https://linkedin.com/in/manujendra-gaurav",
      portfolioUrl: "https://manujendragaurav.dev",
      githubUrl: "https://github.com/manujendragaurav",
      currentTitle: "Senior QA Automation Engineer",
      yearsExperience: 6,
      currentCompany: "NextGen Software",
      summary:
        "Results-driven Senior QA Automation Engineer and SDET with 6 years of expertise designing robust test automation frameworks using Selenium, Playwright, Java, and Python. Specialized in API automation with RestAssured, CI/CD pipeline integration via Jenkins/GitHub Actions, and containerized test infrastructure with Docker.",
      expectedSalary: "$140,000 - $165,000",
      noticePeriod: "2 Weeks",
      preferredTitles: JSON.stringify([
        "Senior QA Automation Engineer",
        "Software Development Engineer in Test (SDET)",
        "Lead QA Engineer",
        "Automation Architect",
      ]),
      preferredLocations: "San Francisco, CA; San Jose, CA; Remote USA",
      remotePreference: "Remote",
      employmentType: "Full-time",
      expectedSalaryMin: 140000,
      expectedSalaryMax: 165000,
    },
  });

  // 3. Create Skills
  const qaSkills = [
    { name: "Selenium", category: "Automation" },
    { name: "Playwright", category: "Automation" },
    { name: "Cypress", category: "Automation" },
    { name: "Java", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "JavaScript", category: "Programming" },
    { name: "TypeScript", category: "Programming" },
    { name: "RestAssured", category: "API Testing" },
    { name: "Postman", category: "API Testing" },
    { name: "API Testing", category: "API Testing" },
    { name: "SQL", category: "Database" },
    { name: "Jenkins", category: "CI/CD" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "Docker", category: "Cloud & Ops" },
    { name: "Kubernetes", category: "Cloud & Ops" },
    { name: "AWS", category: "Cloud & Ops" },
    { name: "JMeter", category: "Performance" },
    { name: "k6", category: "Performance" },
  ];

  for (const s of qaSkills) {
    const skill = await db.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });

    if (
      [
        "Selenium",
        "Java",
        "Python",
        "Playwright",
        "API Testing",
        "RestAssured",
        "Jenkins",
        "GitHub Actions",
        "SQL",
        "Docker",
      ].includes(s.name)
    ) {
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
  }

  // 4. Create Primary Resume
  const primaryResume = await db.resume.create({
    data: {
      userId: user.id,
      filename: "Manujendra_Gaurav_SDET_Resume_2026.pdf",
      originalName: "Manujendra_Gaurav_SDET_Resume_2026.pdf",
      fileType: "pdf",
      fileUrl: "/sample-resumes/manujendra_gaurav_resume.pdf",
      fileSize: 245000,
      isPrimary: true,
      notes: "Primary general resume tailored for Senior SDET and QA Lead roles.",
      extractedSkills: JSON.stringify([
        "Selenium",
        "Playwright",
        "Java",
        "Python",
        "RestAssured",
        "API Testing",
        "SQL",
        "Jenkins",
        "GitHub Actions",
        "Docker",
        "JUnit",
        "TestNG",
        "Cucumber",
        "Git",
      ]),
      parsedText: `MANUJENDRA GAURAV
Senior QA Automation Engineer / SDET
Email: manujendragaurav@gmail.com | Phone: +1 (555) 234-5678 | San Francisco, CA

SUMMARY
Senior SDET with 6 years of experience building scalable test automation frameworks for web apps, microservices, and distributed backend systems. Hands-on experience in Java, Python, Selenium WebDriver, Playwright, and RestAssured. Expertise in CI/CD automation with Jenkins & GitHub Actions.

SKILLS
- Automation Frameworks: Selenium WebDriver, Playwright, RestAssured, Cypress
- Languages: Java, Python, TypeScript, SQL
- DevOps & Tools: Jenkins, Docker, GitHub Actions, Git, Postman, JMeter
- Methodologies: Agile/Scrum, BDD (Cucumber), TDD, API Test Strategy

WORK EXPERIENCE
Senior QA Automation Engineer — NextGen Software (2023 - Present)
• Built end-to-end UI automation suite using Java, Selenium WebDriver, and TestNG, reducing regression execution time by 65%.
• Engineered automated API testing framework using RestAssured integrated into GitHub Actions CI pipeline.
• Dockerized execution grids with Selenium Grid & Selenoid to enable parallel cross-browser execution on 50+ concurrent nodes.

SDET — TechCorp Solutions (2020 - 2023)
• Developed Python & PyTest backend test suite for REST microservices with 90%+ code coverage.
• Implemented continuous test triggers in Jenkins for nightly automated execution and Slack alerts.
• Authored complex SQL scripts to validate data integrity across PostgreSQL and MySQL databases.`,
    },
  });

  // Secondary resume
  await db.resume.create({
    data: {
      userId: user.id,
      filename: "Manujendra_Gaurav_Playwright_Specialist.pdf",
      originalName: "Manujendra_Gaurav_Playwright_Specialist.pdf",
      fileType: "pdf",
      fileUrl: "/sample-resumes/manujendra_gaurav_playwright.pdf",
      fileSize: 210000,
      isPrimary: false,
      notes: "Tailored specifically for TypeScript & Playwright modern frontend web automation roles.",
      extractedSkills: JSON.stringify(["Playwright", "TypeScript", "JavaScript", "Cypress", "Node.js", "Docker", "GitHub Actions"]),
    },
  });

  // 5. Create Sample Jobs
  const job1 = await db.job.create({
    data: {
      userId: user.id,
      companyName: "CloudScale Systems",
      companyWebsite: "https://cloudscale.example.com",
      jobTitle: "Senior Software Development Engineer in Test (SDET)",
      description: `About the Role:
We are looking for a Senior SDET to lead our quality automation initiatives. You will design, build, and maintain enterprise automation frameworks for high-throughput SaaS web applications and REST APIs.

Key Responsibilities:
- Design hybrid test automation frameworks using Selenium, Java, and Playwright.
- Build automated API regression suites with RestAssured or Postman.
- Integrate automated execution into Jenkins and GitHub Actions CI pipelines.
- Deploy containerized grid execution infrastructure using Docker.
- Collaborate with developers in Agile sprints to ensure high testability.

Requirements:
- 5+ years of experience in Software Test Automation or SDET roles.
- Expert-level proficiency in Java or Python.
- Deep knowledge of Selenium, Playwright, API testing, and SQL.
- Solid experience with Docker, Jenkins, and Git.`,
      jobUrl: "https://linkedin.com/jobs/view/1001",
      location: "San Francisco, CA (Hybrid)",
      salaryMin: 150000,
      salaryMax: 175000,
      currency: "USD",
      employmentType: "Full-time",
      workMode: "Hybrid",
      source: "LinkedIn",
      notes: "Great tech stack match! Applied through internal recruiter referral.",
    },
  });

  const job2 = await db.job.create({
    data: {
      userId: user.id,
      companyName: "DataStream AI",
      companyWebsite: "https://datastream.example.com",
      jobTitle: "Lead QA Automation Engineer",
      description: `DataStream AI is scaling its real-time analytics engine. We need a Lead QA Automation Engineer with strong API automation and performance testing skills.

Requirements:
- 6+ years QA Automation experience.
- Strong Java, Python, and SQL skills.
- Experience with RestAssured, Postman, JMeter, and Docker.
- Experience with Cloud infrastructure (AWS / Kubernetes) is preferred.`,
      jobUrl: "https://indeed.com/viewjob?id=2002",
      location: "Remote (USA)",
      salaryMin: 160000,
      salaryMax: 185000,
      currency: "USD",
      employmentType: "Full-time",
      workMode: "Remote",
      source: "Indeed",
      notes: "High salary range. Technical interview scheduled!",
    },
  });

  const job3 = await db.job.create({
    data: {
      userId: user.id,
      companyName: "FinTech Prime",
      companyWebsite: "https://fintechprime.example.com",
      jobTitle: "QA Automation Engineer",
      description: `Seeking a QA Automation Engineer to automate financial transaction APIs and web portals. Required skills: Cypress, JavaScript, API Testing, SQL, CI/CD.`,
      jobUrl: "https://fintechprime.example.com/careers/3003",
      location: "New York, NY (Onsite)",
      salaryMin: 135000,
      salaryMax: 150000,
      currency: "USD",
      employmentType: "Full-time",
      workMode: "Onsite",
      source: "Company Website",
    },
  });

  const job4 = await db.job.create({
    data: {
      userId: user.id,
      companyName: "HyperVelocity Software",
      companyWebsite: "https://hypervelocity.example.com",
      jobTitle: "SDET II - Playwright & Cypress",
      description: `HyperVelocity is hiring SDET II for our core web frontend test automation. Must know Playwright, TypeScript, Docker, and GitHub Actions.`,
      jobUrl: "https://linkedin.com/jobs/view/4004",
      location: "Remote",
      salaryMin: 145000,
      salaryMax: 165000,
      currency: "USD",
      employmentType: "Full-time",
      workMode: "Remote",
      source: "LinkedIn",
    },
  });

  // 6. Create Applications
  const app1 = await db.application.create({
    data: {
      userId: user.id,
      jobId: job1.id,
      resumeId: primaryResume.id,
      status: "Technical Interview",
      appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      recruiterName: "Sarah Jenkins",
      recruiterEmail: "sarah.jenkins@cloudscale.example.com",
      notes: "Recruiter screen went great. Tech interview scheduled focusing on Java & Playwright framework design.",
      activities: {
        create: [
          { eventType: "Job Saved", description: "Saved job opportunity from LinkedIn" },
          { eventType: "Resume Analyzed", description: "Ran AI match comparison with Primary Resume (88% Match Score)" },
          { eventType: "Application Submitted", description: "Submitted application via CloudScale careers portal" },
          { eventType: "Recruiter Contacted", description: "Sarah Jenkins reached out for preliminary screen" },
          { eventType: "Interview Scheduled", description: "Technical Automation Round scheduled for upcoming Tuesday" },
        ],
      },
    },
  });

  const app2 = await db.application.create({
    data: {
      userId: user.id,
      jobId: job2.id,
      resumeId: primaryResume.id,
      status: "Screening",
      appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recruiterName: "David Miller",
      recruiterEmail: "david.m@datastream.example.com",
      activities: {
        create: [
          { eventType: "Job Saved", description: "Saved job opportunity from Indeed" },
          { eventType: "Application Submitted", description: "Submitted resume and application" },
          { eventType: "Recruiter Contacted", description: "Recruiter screening email received" },
        ],
      },
    },
  });

  await db.application.create({
    data: {
      userId: user.id,
      jobId: job3.id,
      resumeId: primaryResume.id,
      status: "Applied",
      appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      activities: {
        create: [
          { eventType: "Job Saved", description: "Saved job from FinTech Prime portal" },
          { eventType: "Application Submitted", description: "Applied on company website" },
        ],
      },
    },
  });

  await db.application.create({
    data: {
      userId: user.id,
      jobId: job4.id,
      resumeId: primaryResume.id,
      status: "Interested",
      activities: {
        create: [{ eventType: "Job Saved", description: "Saved role on LinkedIn" }],
      },
    },
  });

  // 7. Create Job Match Analysis
  await db.jobMatchAnalysis.create({
    data: {
      applicationId: app1.id,
      jobId: job1.id,
      resumeId: primaryResume.id,
      overallScore: 88,
      skillMatchScore: 92,
      expMatchScore: 95,
      semanticScore: 84,
      locationScore: 90,
      keywordScore: 80,
      explanation:
        "Strong match because you have extensive experience in Selenium, Java, API Automation (RestAssured), Jenkins, and SQL. Minor gap: Docker containerized grids mentioned in job description can be highlighted further.",
      matchingSkills: JSON.stringify(["Selenium", "Playwright", "Java", "Python", "RestAssured", "API Testing", "SQL", "Jenkins", "GitHub Actions"]),
      missingSkills: JSON.stringify(["Kubernetes", "AWS"]),
    },
  });

  // 8. Create Interviews
  await db.interview.create({
    data: {
      userId: user.id,
      applicationId: app1.id,
      type: "Technical Interview",
      round: 1,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: "14:00",
      timezone: "PST",
      interviewerName: "Marcus Vance (Staff SDET)",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      notes: "Focus area: Object-Oriented Framework Architecture, Page Object Model design, parallel execution, and RestAssured assertion strategies.",
      status: "Scheduled",
    },
  });

  // 9. Create Reminders
  await db.reminder.create({
    data: {
      userId: user.id,
      applicationId: app1.id,
      type: "Interview",
      title: "Prepare for CloudScale Technical Interview",
      description: "Review Playwright & Java POM design patterns and RestAssured code snippets.",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
  });

  await db.reminder.create({
    data: {
      userId: user.id,
      applicationId: app2.id,
      type: "Follow Up",
      title: "Follow up with David Miller (DataStream AI)",
      description: "You applied 5 days ago and had a phone screen request. Confirm recruiter availability.",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
  });

  // 10. Default LLM Config
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
