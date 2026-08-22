export interface SkillMatchResult {
  score: number; // 0 - 100
  matchingSkills: string[];
  missingSkills: string[];
}

export interface MatchScoreResult {
  overallScore: number;
  skillMatchScore: number;
  expMatchScore: number;
  semanticScore: number;
  locationScore: number;
  keywordScore: number;
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export class JobMatchEngine {
  /**
   * Calculates 40% Skills Match
   */
  static calculateSkillMatch(candidateSkills: string[], jobText: string): SkillMatchResult {
    const textLower = jobText.toLowerCase();
    const candidateLower = candidateSkills.map((s) => s.toLowerCase());

    // Extract potential tech skills from job text
    const knownSkillsList = [
      "selenium", "playwright", "cypress", "java", "python", "javascript", "typescript",
      "restassured", "postman", "api testing", "sql", "jenkins", "github actions", "docker",
      "kubernetes", "aws", "azure", "jmeter", "k6", "junit", "testng", "cucumber", "pytest",
      "git", "agile", "scrum", "graphql", "mongodb", "postgresql", "ci/cd", "performance testing"
    ];

    const jobSkills = knownSkillsList.filter((s) => textLower.includes(s));
    
    if (jobSkills.length === 0) {
      return { score: 85, matchingSkills: candidateSkills, missingSkills: [] };
    }

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    jobSkills.forEach((skill) => {
      if (candidateLower.some((c) => c.includes(skill) || skill.includes(c))) {
        matchingSkills.push(skill.toUpperCase());
      } else {
        missingSkills.push(skill.toUpperCase());
      }
    });

    const ratio = matchingSkills.length / jobSkills.length;
    const score = Math.round(ratio * 100);

    return {
      score: Math.min(100, Math.max(0, score)),
      matchingSkills,
      missingSkills,
    };
  }

  /**
   * Calculates 25% Experience Match
   */
  static calculateExperienceMatch(candidateYears: number, jobText: string): number {
    // Extract years required from job text using regex e.g. "5+ years", "3-5 years"
    const expRegex = /(\d+)\s*\+?\s*(?:-\s*(\d+))?\s*(?:years|yrs)/i;
    const match = jobText.match(expRegex);

    if (!match) return 85; // Default neutral-high score if unspecified

    const minYears = parseInt(match[1], 10);
    const maxYears = match[2] ? parseInt(match[2], 10) : minYears + 3;

    if (candidateYears >= minYears) {
      if (candidateYears <= maxYears + 2) {
        return 100;
      }
      return 95; // Overqualified slightly
    } else {
      const diff = minYears - candidateYears;
      const penalty = diff * 20;
      return Math.max(30, 100 - penalty);
    }
  }

  /**
   * Calculates 15% Semantic Similarity (N-gram overlap)
   */
  static calculateSemanticMatch(profileSummary: string, jobDescription: string): number {
    const cleanStr = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);

    const profileWords = new Set(cleanStr(profileSummary));
    const jobWords = cleanStr(jobDescription);

    if (jobWords.length === 0 || profileWords.size === 0) return 75;

    let hits = 0;
    jobWords.forEach((w) => {
      if (profileWords.has(w)) hits++;
    });

    const ratio = hits / Math.min(jobWords.length, 50);
    return Math.min(100, Math.round(ratio * 100));
  }

  /**
   * Calculates 10% Location and Work Mode Match
   */
  static calculateLocationMatch(
    candidatePref: { remote?: string; location?: string },
    job: { workMode?: string; location?: string }
  ): number {
    let score = 100;
    const jobMode = (job.workMode || "").toLowerCase();
    const candMode = (candidatePref.remote || "").toLowerCase();

    if (jobMode === "remote" || candMode === "remote" || candMode === "any") {
      return 100;
    }

    if (jobMode === "onsite" && candMode === "remote") {
      score -= 40;
    }

    if (job.location && candidatePref.location) {
      const jobLoc = job.location.toLowerCase();
      const candLoc = candidatePref.location.toLowerCase();
      if (!jobLoc.includes(candLoc) && !candLoc.includes(jobLoc)) {
        score -= 20;
      }
    }

    return Math.max(40, score);
  }

  /**
   * Calculates 10% Keyword Density Match
   */
  static calculateKeywordMatch(candidateSkills: string[], jobText: string): number {
    const textLower = jobText.toLowerCase();
    const keywords = ["automation", "testing", "framework", "ci/cd", "pipeline", "regression", "agile", "architecture", "lead", "quality"];

    let matches = 0;
    keywords.forEach((kw) => {
      if (textLower.includes(kw)) matches++;
    });

    return Math.round((matches / keywords.length) * 100);
  }

  /**
   * Calculates hybrid explainable score:
   * 40% Skills + 25% Experience + 15% Semantic + 10% Location + 10% Keyword
   */
  static calculateOverallScore(params: {
    candidateSkills: string[];
    yearsExperience: number;
    profileSummary: string;
    remotePreference?: string;
    candidateLocation?: string;
    jobDescription: string;
    jobWorkMode?: string;
    jobLocation?: string;
  }): MatchScoreResult {
    const skillRes = this.calculateSkillMatch(params.candidateSkills, params.jobDescription);
    const expScore = this.calculateExperienceMatch(params.yearsExperience, params.jobDescription);
    const semanticScore = this.calculateSemanticMatch(params.profileSummary, params.jobDescription);
    const locationScore = this.calculateLocationMatch(
      { remote: params.remotePreference, location: params.candidateLocation },
      { workMode: params.jobWorkMode, location: params.jobLocation }
    );
    const keywordScore = this.calculateKeywordMatch(params.candidateSkills, params.jobDescription);

    const overallScore = Math.round(
      0.4 * skillRes.score +
      0.25 * expScore +
      0.15 * semanticScore +
      0.1 * locationScore +
      0.1 * keywordScore
    );

    // Build human-friendly explanation
    const reasons: string[] = [];
    if (skillRes.matchingSkills.length > 0) {
      reasons.push(`Strong match on key technical skills: ${skillRes.matchingSkills.join(", ")}.`);
    }
    if (skillRes.missingSkills.length > 0) {
      reasons.push(`Missing requested keywords/skills: ${skillRes.missingSkills.join(", ")}.`);
    }
    if (expScore >= 90) {
      reasons.push(`Your ${params.yearsExperience} years of experience align well with job seniority requirements.`);
    } else {
      reasons.push(`Experience level (${params.yearsExperience} yrs) is slightly below preferred target in job post.`);
    }
    if (locationScore === 100) {
      reasons.push("Work mode (Remote/Hybrid) preferences match perfectly.");
    }

    return {
      overallScore,
      skillMatchScore: skillRes.score,
      expMatchScore: expScore,
      semanticScore,
      locationScore,
      keywordScore,
      explanation: reasons.join(" "),
      matchingSkills: skillRes.matchingSkills,
      missingSkills: skillRes.missingSkills,
    };
  }
}
