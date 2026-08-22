import { z } from "zod";

export const JobAnalysisSchema = z.object({
  jobTitle: z.string().default("Unknown Job Title"),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  yearsOfExperience: z
    .object({
      minimum: z.number().nullable().default(null),
      maximum: z.number().nullable().default(null),
    })
    .default({ minimum: null, maximum: null }),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type JobAnalysisOutput = z.infer<typeof JobAnalysisSchema>;

export const ResumeAnalysisSchema = z.object({
  matchingSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  strongExperienceMatches: z.array(z.string()).default([]),
  weakAreas: z.array(z.string()).default([]),
  importantMissingKeywords: z.array(z.string()).default([]),
  resumeImprovementSuggestions: z.array(z.string()).default([]),
  atsOptimizationSuggestions: z.array(z.string()).default([]),
  overallExplanation: z.string().default(""),
});

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisSchema>;

export const ResumeImprovementSuggestionSchema = z.object({
  originalContent: z.string(),
  suggestedContent: z.string(),
  reason: z.string(),
});

export const ResumeImprovementResponseSchema = z.object({
  improvedSummary: z.string(),
  bulletPointSuggestions: z.array(ResumeImprovementSuggestionSchema),
  skillsToEmphasize: z.array(z.string()),
  atsRecommendations: z.array(z.string()),
});

export type ResumeImprovementResponse = z.infer<typeof ResumeImprovementResponseSchema>;

export const InterviewPrepSchema = z.object({
  studyTopics: z.array(z.string()),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      sampleAnswerKeyPoints: z.array(z.string()),
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      starFormatTips: z.string(),
    })
  ),
  practicePlan: z.array(z.string()),
});

export type InterviewPrepOutput = z.infer<typeof InterviewPrepSchema>;
