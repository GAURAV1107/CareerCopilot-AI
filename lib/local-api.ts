"use client";

const STORAGE_KEY = "career-copilot-local-data-v1";

type LocalData = {
  profile: Record<string, unknown>;
  user: { id: string; name: string; email: string; role: string };
  skills: string[];
  jobs: any[];
  applications: any[];
  resumes: any[];
  reminders: any[];
  interviews: any[];
  settings: { provider: string; apiKey: string; model: string; baseUrl: string };
};

const initialData: LocalData = {
  user: { id: "local-user", name: "Manujendra Gaurav", email: "manujendragaurav@gmail.com", role: "JOB_SEEKER" },
  profile: { currentTitle: "Senior SDET Profile", location: "Bengaluru, India" },
  skills: [], jobs: [], applications: [], resumes: [], reminders: [], interviews: [],
  settings: { provider: "gemini", apiKey: "", model: "gemini-2.5-flash", baseUrl: "https://generativelanguage.googleapis.com/v1beta" },
};

function read(): LocalData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      ...structuredClone(initialData),
      ...parsed,
      user: { ...initialData.user, ...(parsed.user || {}) },
      profile: { ...initialData.profile, ...(parsed.profile || {}) },
      settings: { ...initialData.settings, ...(parsed.settings || {}) },
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter((item: unknown) => typeof item === "string") : [],
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs.filter((item: any) => item?.id) : [],
      applications: Array.isArray(parsed.applications) ? parsed.applications.filter((item: any) => item?.id) : [],
      resumes: Array.isArray(parsed.resumes) ? parsed.resumes : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      interviews: Array.isArray(parsed.interviews) ? parsed.interviews : [],
    };
  } catch { return structuredClone(initialData); }
}

function write(data: LocalData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function id() { return crypto.randomUUID(); }
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
async function body(init?: RequestInit) {
  try {
    if (init?.body instanceof FormData) {
      const value: Record<string, unknown> = {};
      init.body.forEach((entry, key) => {
        value[key] = entry instanceof File ? entry : String(entry);
      });
      return value;
    }
    return init?.body ? JSON.parse(String(init.body)) : {};
  } catch { return {}; }
}

function enrichApplication(app: any, data: LocalData) {
  const linkedJob = data.jobs.find((item) => item.id === app.jobId);
  const job = { companyName: "Unknown company", jobTitle: "Untitled opportunity", description: "", ...(linkedJob || {}), ...(app.job || {}) };
  const resume = data.resumes.find((item) => item.id === app.resumeId) || null;
  return { ...app, job, resume, activities: app.activities || [], interviews: data.interviews.filter((item) => item.applicationId === app.id), reminders: data.reminders.filter((item) => item.applicationId === app.id), jobMatches: app.jobMatches || [] };
}

export function isLocalApi(url: string) { return url.startsWith("/api/"); }

export async function localApiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const raw = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
  const url = new URL(raw, window.location.origin);
  const path = url.pathname;
  const method = (init.method || "GET").toUpperCase();
  const data = read();

  if (path.startsWith("/api/auth/")) return json({ success: true });
  if (path === "/api/profile") {
    if (method === "GET") return json({ user: data.user, profile: data.profile, skills: data.skills.map((name) => ({ name })) });
    const value = await body(init);
    data.user = { ...data.user, ...(value.name ? { name: value.name } : {}), ...(value.email ? { email: value.email } : {}) };
    data.profile = { ...data.profile, ...value, ...(Array.isArray(value.preferredTitles) ? { preferredTitles: JSON.stringify(value.preferredTitles) } : {}) };
    if (Array.isArray(value.skills)) data.skills = value.skills;
    write(data); return json({ success: true, user: data.user, profile: data.profile, skills: data.skills });
  }
  if (path === "/api/settings") {
    if (method === "GET") return json({ config: { ...data.settings, apiKey: undefined, hasApiKey: Boolean(data.settings.apiKey) } });
    const value = await body(init);
    data.settings = { ...data.settings, ...value, apiKey: value.apiKey || data.settings.apiKey };
    write(data); return json({ success: true, config: { ...data.settings, apiKey: undefined, hasApiKey: Boolean(data.settings.apiKey) } });
  }
  if (path === "/api/settings/test-connection") {
    const value = await body(init);
    const apiKey = value.apiKey || data.settings.apiKey;
    if (value.provider !== "mock" && !apiKey) return json({ error: "Enter an API key or save one locally before testing." }, 400);
    const started = performance.now();
    try {
      if (value.provider === "mock") return json({ success: true, message: "Offline provider is ready.", latencyMs: 0 });
      const result = await window.fetch("/api/llm/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data.settings, ...value, apiKey }) });
      const payload = await result.json();
      return json({ ...payload, latencyMs: Math.round(performance.now() - started) }, result.status);
    } catch (error) { return json({ error: error instanceof Error ? error.message : "Connection failed" }, 500); }
  }

  if (path === "/api/applications/import" && method === "POST") {
    const value = await body(init);
    if (!Array.isArray(value.items)) return json({ error: "Import must contain an items array." }, 400);
    const now = new Date().toISOString();
    let count = 0;
    for (const item of value.items) {
      if (!item || typeof item !== "object" || !item.companyName || !item.jobTitle) continue;
      const job = {
        id: id(), companyName: String(item.companyName), companyWebsite: item.companyWebsite || "",
        jobTitle: String(item.jobTitle), description: String(item.description || ""), jobUrl: item.jobUrl || "",
        location: item.location || "", salaryMin: item.salaryMin ? Number(item.salaryMin) : null,
        salaryMax: item.salaryMax ? Number(item.salaryMax) : null, currency: item.currency || "INR",
        workMode: item.workMode || "Remote", source: item.source || "Other", createdAt: now, updatedAt: now,
      };
      data.jobs.push(job);
      data.applications.push({
        id: id(), jobId: job.id, status: item.status || "Saved", followUpStatus: item.followUpStatus || "No",
        recruiterName: item.recruiterName || "", recruiterEmail: item.recruiterEmail || "",
        referralDetails: item.referralDetails || "", appliedDate: item.appliedDate || null,
        notes: item.notes || "", createdAt: item.createdAt || now, updatedAt: now, activities: [],
      });
      count++;
    }
    write(data);
    return json({ success: true, count, message: `Successfully imported ${count} job cards.` });
  }

  const detail = path.match(/^\/api\/(jobs|applications|resumes|reminders|interviews)\/([^/]+)$/);
  if (detail) {
    const collection = detail[1] as "jobs" | "applications" | "resumes" | "reminders" | "interviews";
    const itemId = detail[2];
    const list = data[collection] as any[];
    const index = list.findIndex((item) => item.id === itemId);
    if (index < 0) return json({ error: "Record not found" }, 404);
    if (method === "DELETE") {
      list.splice(index, 1);
      if (collection === "applications") {
        data.reminders = data.reminders.filter((item) => item.applicationId !== itemId);
        data.interviews = data.interviews.filter((item) => item.applicationId !== itemId);
      } else if (collection === "jobs") {
        const removedApplicationIds = data.applications.filter((item) => item.jobId === itemId).map((item) => item.id);
        data.applications = data.applications.filter((item) => item.jobId !== itemId);
        data.reminders = data.reminders.filter((item) => !removedApplicationIds.includes(item.applicationId));
        data.interviews = data.interviews.filter((item) => !removedApplicationIds.includes(item.applicationId));
      }
      write(data); return json({ success: true });
    }
    if (method === "PATCH" || method === "PUT") {
      const updates = await body(init);
      if (collection === "resumes" && updates.isPrimary === true) {
        data.resumes.forEach((resume) => { resume.isPrimary = resume.id === itemId; });
      }
      if (collection === "applications") {
        const currentJob = data.jobs.find((item) => item.id === list[index].jobId);
        const jobFields = ["companyName", "companyWebsite", "jobTitle", "description", "jobUrl", "location", "salaryMin", "salaryMax", "currency", "workMode", "source"];
        const jobUpdates = Object.fromEntries(jobFields.filter((key) => updates[key] !== undefined).map((key) => [key, ["salaryMin", "salaryMax"].includes(key) && updates[key] !== "" ? Number(updates[key]) : updates[key]]));
        if (currentJob && Object.keys(jobUpdates).length) Object.assign(currentJob, jobUpdates, { updatedAt: new Date().toISOString() });
        if (list[index].job && Object.keys(jobUpdates).length) Object.assign(list[index].job, jobUpdates, { updatedAt: new Date().toISOString() });
        for (const key of jobFields) delete updates[key];
      }
      list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
      write(data);
      const updated = collection === "applications" ? enrichApplication(list[index], data) : list[index];
      return json({ success: true, [collection.slice(0, -1)]: updated });
    }
    const item = collection === "applications" ? enrichApplication(list[index], data) : list[index];
    return json({ [collection.slice(0, -1)]: item, application: collection === "applications" ? item : undefined });
  }

  const root = path.match(/^\/api\/(jobs|applications|resumes|reminders|interviews)$/);
  if (root) {
    const collection = root[1] as "jobs" | "applications" | "resumes" | "reminders" | "interviews";
    const list = data[collection] as any[];
    if (method === "GET") {
      const output = collection === "applications"
        ? list.map((item) => enrichApplication(item, data))
        : collection === "interviews" || collection === "reminders"
          ? list.map((item) => ({ ...item, application: item.application || (item.applicationId ? enrichApplication(data.applications.find((app) => app.id === item.applicationId) || {}, data) : undefined) }))
          : list;
      return json({ [collection]: [...output].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
    }
    const value = await body(init);
    const now = new Date().toISOString();
    let record: any = { ...value, id: id(), createdAt: now, updatedAt: now };
    if (collection === "resumes" && value.file instanceof File) {
      record = { ...record, filename: value.file.name, originalName: value.file.name, fileType: value.file.name.split(".").pop() || "file", fileSize: value.file.size, fileUrl: "", isPrimary: value.isPrimary === "true", file: undefined };
      if (record.isPrimary) data.resumes.forEach((resume) => { resume.isPrimary = false; });
      if (!data.resumes.some((resume) => resume.isPrimary)) record.isPrimary = true;
    }
    if (collection === "applications") {
      let job = value.job;
      if (!job && value.companyName && value.jobTitle) {
        job = {
          id: id(), companyName: value.companyName, companyWebsite: value.companyWebsite || "", jobTitle: value.jobTitle,
          description: value.description || "", location: value.location || "", jobUrl: value.jobUrl || "",
          salaryMin: value.salaryMin ? Number(value.salaryMin) : null, salaryMax: value.salaryMax ? Number(value.salaryMax) : null,
          currency: value.currency || "INR", workMode: value.workMode || "Remote", source: value.source || "Other",
          createdAt: now, updatedAt: now,
        };
        data.jobs.push(job);
      }
      if (!job) job = data.jobs.find((item) => item.id === value.jobId);
      if (!job) return json({ error: "Choose an existing job or enter a company and job title." }, 400);
      const primaryResume = data.resumes.find((resume) => resume.isPrimary && resume.parsedText);
      record = { ...record, jobId: job.id, job: undefined, resumeId: value.resumeId || primaryResume?.id || null, status: value.status || "Saved", appliedDate: value.appliedDate || (value.status === "Applied" ? now : null), activities: [] };
    }
    list.push(record); write(data);
    const created = collection === "applications" ? enrichApplication(record, data) : record;
    return json({ success: true, [collection.slice(0, -1)]: created });
  }

  if (path === "/api/analytics") {
    const counts = data.applications.reduce((acc: any, app: any) => { acc[app.status || "Saved"] = (acc[app.status || "Saved"] || 0) + 1; return acc; }, {});
    const total = data.applications.length;
    const interviewCount = data.applications.filter((app) => String(app.status).includes("Interview")).length;
    const offerCount = data.applications.filter((app) => ["Offer", "Accepted"].includes(app.status)).length;
    const rejectionCount = data.applications.filter((app) => app.status === "Rejected").length;
    const sources = data.applications.reduce((acc: any, app: any) => { const job = app.job || data.jobs.find((item) => item.id === app.jobId); const source = job?.source || "Other"; acc[source] = (acc[source] || 0) + 1; return acc; }, {});
    const percent = (value: number, base: number) => base ? Math.round(value / base * 100) : 0;
    return json({
      metrics: { totalApplications: total, interviewCount, offerCount, rejectionCount, appToInterviewRate: percent(interviewCount, total), interviewToOfferRate: percent(offerCount, interviewCount), offerRate: percent(offerCount, total), rejectionRate: percent(rejectionCount, total) },
      statusDistribution: Object.entries(counts).map(([name, value]) => ({ name, value })),
      sourceDistribution: Object.entries(sources).map(([name, value]) => ({ name, value })),
    });
  }
  if (path === "/api/ai/tailor-resume" && method === "POST") {
    const value = await body(init);
    const application = data.applications.find((item) => item.id === value.applicationId);
    const job = application?.job || data.jobs.find((item) => item.id === (value.jobId || application?.jobId));
    if (!job) return json({ error: "The selected job card was not found." }, 404);
    const resume = data.resumes.find((item) => item.isPrimary && item.parsedText);
    if (!resume?.parsedText) return json({ error: "Upload a readable PDF or DOCX primary resume before tailoring." }, 400);
    const result = await window.fetch("/api/llm/tailor-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: data.settings, job, profile: { ...data.profile, ...data.user }, skills: data.skills, resumeText: resume.parsedText }),
    });
    return new Response(await result.text(), { status: result.status, headers: { "Content-Type": "application/json" } });
  }
  if (path.startsWith("/api/ai/")) return json({ error: "This AI action needs local context support. Configure and test your model in Settings first." }, 400);
  return json({ error: "Local endpoint not found" }, 404);
}

export function getLocalLLMConfig() { return read().settings; }
