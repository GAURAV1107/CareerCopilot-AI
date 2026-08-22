# CareerCopilot AI — Project Documentation & Architectural Overview

**CareerCopilot AI** is a production-grade, full-stack, AI-powered Job Application Tracker and Career Assistant designed for Software Engineers, QA Automation Engineers, SDETs, and tech professionals.

---

## 📌 1. Project Overview

CareerCopilot AI helps job seekers take complete control over their career search process by unifying job tracking, resume management, AI job match evaluation, tailored ATS resume PDF generation, interview scheduling, and AI career guidance into a single command center.

- **Target Audience**: Software Engineers, QA Automation Engineers, SDETs, and IT Professionals.
- **Primary Account**: `manujendragaurav@gmail.com`
- **Application URL**: `http://localhost:3000`

---

## 🏗️ 2. How the Project Was Developed (Tech Stack & Architecture)

### Core Technologies
- **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript (Strict Mode).
- **Styling & UI**: Tailwind CSS (custom dark-mode SaaS design system with glassmorphism panels, harmonious blue/purple AI palettes, and responsive layouts).
- **Backend & Database**: Next.js Server Components, API Routes, Prisma ORM, SQLite (local zero-config) with PostgreSQL migration readiness.
- **Authentication**: JWT token session cookies (`auth_token`), password hashing via `bcryptjs`, and Google/Apple OAuth integration readiness.
- **PDF Export Engine**: `jsPDF` library producing ATS-optimized single/multi-page PDF resume exports tailored to specific job descriptions.

### System Architecture Diagram
```
                          ┌────────────────────────────────────────┐
                          │          CareerCopilot AI UI           │
                          │   (Next.js App Router & Tailwind)      │
                          └───────────────────┬────────────────────┘
                                              │
                    ┌─────────────────────────┴────────────────────────┐
                    │                                                  │
         ┌──────────▼──────────┐                            ┌──────────▼──────────┐
         │ Next.js REST API    │                            │ Hybrid Match Engine │
         │   (/api/jobs, etc.) │                            │   (40% Skills, 25%  │
         └──────────┬──────────┘                            │   Exp, 15% Semantic,│
                    │                                       │   10% Loc, 10% Kw)  │
         ┌──────────▼──────────┐                            └─────────────────────┘
         │  Prisma ORM & DB    │                                       │
         │  (User, Jobs, Apps) │                            ┌──────────▼──────────┐
         └─────────────────────┘                            │ AI Provider Layer   │
                                                            │ (Gemini, Claude,    │
                                                            │  OpenAI, Custom)    │
                                                            └─────────────────────┘
```

---

## ⚡ 3. Key Modules & How It Works

### A. AI Provider Abstraction Layer (`lib/ai/`)
- **Pluggable Multi-LLM Architecture**: Does not tightly couple business logic to a single provider.
- **Supported Providers**:
  - **Google Gemini**: Native & OpenAI-compatible support (`gemini-3.7-flash`, `gemini-2.5-flash`, `gemini-1.5-pro`).
  - **Anthropic Claude**: (`claude-3-5-sonnet`, `claude-3-7-sonnet`).
  - **OpenAI**: (`gpt-4o`, `gpt-4o-mini`, `o3-mini`).
  - **Custom Endpoints**: Ollama / Local LLM endpoints (`http://localhost:11434/v1`).
  - **Offline Rule-Based Fallback**: Heuristic mock provider ensuring zero downtime even without an external API key.
- **Realtime Authentication Testing**: In **Settings**, click *"Test API Connection & Authenticate"* to execute a live test ping measuring response latency (ms) and validating API keys.

### B. Hybrid Explainable Match Engine (`lib/ai/match-engine.ts`)
Calculates job match compatibility deterministically rather than relying purely on LLM output:
- **40% Skills Matching**: Exact and partial technical skill overlap against job requirements.
- **25% Experience Matching**: Seniority and years of experience alignment.
- **15% Semantic Similarity**: N-gram token overlap and domain keyword density.
- **10% Location & Preference**: Remote, Hybrid, Onsite, and geographic location compatibility.
- **10% Keyword Density**: Targeted job role keyword density.
- Produces human-friendly explanations detailing why points were gained or lost.

### C. 12-Stage Kanban Job Application Tracker (`app/(dashboard)/applications/`)
- Pipeline stages: `Saved`, `Interested`, `Applied`, `Recruiter Contacted`, `Screening`, `Technical Interview`, `Managerial Interview`, `HR Interview`, `Offer`, `Accepted`, `Rejected`, `Withdrawn`.
- Seamless toggle between **Kanban Drag-and-Drop Board** and **Table View**.
- Status updates automatically log audit activity events into the application's timeline.

### D. AI Job-Tailored Resume & PDF Export (`lib/pdf-generator.ts`)
- Automatically compares your **Primary Resume** against a target job description.
- Generates a customized **Professional Summary**, highlighted **Technical Competencies**, and job-aligned **Experience Bullet Points**.
- Provides a **"Download Tailored Resume PDF"** button for instant `.pdf` document export.

### E. AI Copilot & Technical Interview Prep (`app/(dashboard)/ai-copilot/`)
- Grounded AI assistant answering questions using actual candidate data.
- Generates technical study topics, code questions with sample answer key points, and STAR behavioral guidance.

---

## ⚠️ 4. Current Limitations

1. **Local SQLite File Database**:
   - Currently uses a local SQLite database (`dev.db`). For multi-region serverless deployment, switch Prisma provider to PostgreSQL (Supabase / Neon / AWS RDS).
2. **Local Resume Storage Abstraction**:
   - Resumes are stored locally in file storage abstraction. Future versions will stream uploads directly to AWS S3 or Google Cloud Storage.
3. **Rate Limits on Free External LLM Keys**:
   - Free-tier API keys may hit rate limits during heavy usage. (Mitigated by our automatic Rule-Based Heuristic Fallback Provider).

---

## 🚀 5. Upcoming Roadmap & Future Features

### Phase 1: Browser Extension & 1-Click Job Clipper
- Chrome / Firefox Extension to clip jobs directly from LinkedIn, Indeed, and Naukri straight into your CareerCopilot Kanban board with 1 click.

### Phase 2: AI Voice Mock Interview Practice
- Real-time interactive voice practice session simulating recruiter screens and technical coding rounds with automated score reports.

### Phase 3: Career Gap Analysis & 30-Day Skill Blueprint
- Compares your current skill set against target Senior/Staff roles and generates a step-by-step 30-day learning curriculum.

### Phase 4: Multi-User Organization & Placement Office Portal
- Admin role interface allowing university career centers, bootcamps, and recruiters to assist candidates.

---

## 🛠️ 6. Setup & Execution Commands

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed production candidate data
npx prisma db push
npm run db:seed

# 3. Run unit tests
npx tsx --test tests/match-engine.test.ts

# 4. Build & start production server
npm run build
npm start
```
