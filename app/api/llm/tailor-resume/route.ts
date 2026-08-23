import { NextResponse } from "next/server";
import { OpenAIProvider } from "@/lib/ai/providers/openai-provider";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic-provider";
import { GeminiProvider } from "@/lib/ai/providers/gemini-provider";

function extractJson(text: string) {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The model did not return valid resume JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(request: Request) {
  try {
    const { config, job, profile, skills, resumeText } = await request.json();
    if (!job?.description || !job?.jobTitle) {
      return NextResponse.json({ error: "The selected job card has no job description." }, { status: 400 });
    }
    if (!String(resumeText || "").trim()) return NextResponse.json({ error: "Primary resume text is missing." }, { status: 400 });
    if (!config?.apiKey && config?.provider !== "mock") {
      return NextResponse.json({ error: "Save and authenticate an LLM API key in Settings first." }, { status: 400 });
    }

    const keywordList = Array.from(new Set(
      String(job.description).match(/[A-Za-z][A-Za-z0-9+#.-]{2,}/g) || []
    )).filter((word) => !/^(and|the|with|for|you|our|are|will|this|that|from|have|using)$/i.test(word)).slice(0, 24);

    if (config.provider === "mock") {
      const targetedSkills = Array.from(new Set([...(skills || []), ...keywordList])).slice(0, 30);
      return NextResponse.json({ tailoredData: {
        candidateName: profile?.name || "Local Candidate",
        candidateTitle: job.jobTitle,
        email: profile?.email || "",
        phone: profile?.phone || "",
        location: profile?.location || job.location || "",
        linkedinUrl: profile?.linkedinUrl || "",
        githubUrl: profile?.githubUrl || "",
        targetJobTitle: job.jobTitle,
        targetCompany: job.companyName,
        summary: `${profile?.summary || String(resumeText).slice(0, 500)} Targeting the ${job.jobTitle} role at ${job.companyName}, with emphasis on ${targetedSkills.slice(0, 8).join(", ")}.`,
        skills: targetedSkills,
        experience: [],
      } });
    }

    const client = config.provider === "anthropic"
      ? new AnthropicProvider(config.apiKey, config.model, config.baseUrl)
      : config.provider === "gemini"
        ? new GeminiProvider(config.apiKey, config.model, config.baseUrl)
        : new OpenAIProvider(config.apiKey, config.model, config.baseUrl);

    const prompt = `You are an expert ATS resume editor. Tailor the candidate resume for exactly this job card.

JOB TITLE: ${job.jobTitle}
COMPANY: ${job.companyName}
LOCATION: ${job.location || "Not specified"}
JOB DESCRIPTION:
${job.description}

CANDIDATE PROFILE:
${JSON.stringify(profile || {})}
KNOWN SKILLS: ${(skills || []).join(", ")}
PRIMARY RESUME (the only source of candidate facts):
${String(resumeText).slice(0, 30000)}

Use important job-description skills and keywords naturally, but preserve the candidate's facts. Never invent employment, education, certifications, metrics, or tools not present in the primary resume. Return JSON only with this structure:
{"candidateTitle":"string","summary":"string","skills":["string"],"skillsCategorized":{"languages":"string","aiAndAgents":"string","automationFrameworks":"string","ciCdDevOps":"string","apiAndTools":"string","projectManagement":"string"},"experience":[{"title":"string","company":"string","location":"string","period":"string","bullets":["string"]}],"projects":[{"name":"string","description":"string"}],"education":"string","certifications":"string"}
The summary must be 3-4 concise ATS-friendly sentences. Rewrite experience bullets only to emphasize truthful overlap with this job. Skills must prioritize exact relevant keywords that are supported by the resume.`;

    const raw = await client.generateText([{ role: "user", content: prompt }], { temperature: 0.2, maxTokens: 2200, responseFormatJson: true });
    const result = extractJson(raw);
    const tailoredData = {
      candidateName: profile?.name || "Local Candidate",
      candidateTitle: result.candidateTitle || job.jobTitle,
      email: profile?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || job.location || "",
      linkedinUrl: profile?.linkedinUrl || "",
      githubUrl: profile?.githubUrl || "",
      targetJobTitle: job.jobTitle,
      targetCompany: job.companyName,
      summary: result.summary,
      skills: Array.isArray(result.skills) ? result.skills : keywordList,
      skillsCategorized: result.skillsCategorized,
      experience: Array.isArray(result.experience) ? result.experience : [],
      projects: Array.isArray(result.projects) ? result.projects : [],
      education: result.education || "",
      certifications: result.certifications || "",
    };
    return NextResponse.json({ success: true, tailoredData });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
