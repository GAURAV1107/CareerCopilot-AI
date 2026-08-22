import test from "node:test";
import assert from "node:assert";
import { JobMatchEngine } from "../lib/ai/match-engine";

test("Skill Match Calculation - detects exact and partial skill matches", () => {
  const result = JobMatchEngine.calculateSkillMatch(
    ["Selenium", "Java", "RestAssured", "SQL", "Jenkins"],
    "Looking for a QA Automation Engineer with Selenium, Java, SQL, and Docker experience."
  );

  assert.strictEqual(result.matchingSkills.includes("SELENIUM"), true);
  assert.strictEqual(result.matchingSkills.includes("JAVA"), true);
  assert.strictEqual(result.missingSkills.includes("DOCKER"), true);
  assert.ok(result.score > 0);
});

test("Hybrid Match Score - produces deterministic 0-100 explainable score", () => {
  const match = JobMatchEngine.calculateOverallScore({
    candidateSkills: ["Selenium", "Playwright", "Java", "Python", "RestAssured", "Jenkins", "Docker"],
    yearsExperience: 6,
    profileSummary: "Senior SDET with 6 years experience in Java, Selenium, Playwright and CI/CD pipelines.",
    remotePreference: "Remote",
    candidateLocation: "San Francisco, CA",
    jobDescription: "Senior SDET role requiring 5+ years experience, Selenium, Java, Playwright, Docker, and CI/CD.",
    jobWorkMode: "Remote",
    jobLocation: "San Francisco, CA",
  });

  assert.ok(match.overallScore >= 75, `Expected score >= 75, got ${match.overallScore}`);
  assert.ok(match.explanation.length > 0);
  assert.ok(match.matchingSkills.length > 0);
});
