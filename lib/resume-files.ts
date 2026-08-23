"use client";

import type { TailoredResumeData } from "@/lib/pdf-generator";

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "txt") return (await file.text()).trim();
  if (extension === "docx") {
    const { default: JSZip } = await import("jszip");
    const archive = await JSZip.loadAsync(await file.arrayBuffer());
    const documentXml = await archive.file("word/document.xml")?.async("string");
    if (!documentXml) throw new Error("This DOCX file does not contain a readable Word document.");
    const decode = (value: string) => value
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    return decode(documentXml)
      .replace(/<w:tab\s*\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .match(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|\n/g)
      ?.map((part) => part === "\n" ? part : part.replace(/^<w:t(?:\s[^>]*)?>|<\/w:t>$/g, ""))
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim() || "";
  }
  if (extension === "pdf") {
    const formData = new FormData();
    formData.append("file", file);
    const response = await window.fetch("/api/local/parse-resume", { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "PDF parsing failed.");
    return String(payload.text || "").trim();
  }
  throw new Error("Use a PDF, DOCX, or TXT resume file.");
}

export function inferResumeSkills(text: string): string[] {
  const known = ["Java", "Python", "JavaScript", "TypeScript", "SQL", "Selenium", "Playwright", "Cypress", "Appium", "Robot Framework", "Rest Assured", "Postman", "Pytest", "TestNG", "Jenkins", "GitHub Actions", "GitLab CI", "Docker", "Kubernetes", "AWS", "Azure", "JIRA", "Agile", "API Testing", "GraphQL", "Maven", "Git"];
  return known.filter((skill) => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
}

export async function downloadTailoredResumeDOCX(data: TailoredResumeData, filename: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const section = (title: string) => new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 80 } });
  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ alignment: "center", children: [new TextRun({ text: data.candidateName.toUpperCase(), bold: true, size: 34 })] }),
    new Paragraph({ alignment: "center", children: [new TextRun({ text: data.candidateTitle, bold: true, color: "2563EB", size: 23 })] }),
    new Paragraph({ alignment: "center", text: [data.email, data.phone, data.location, data.linkedinUrl].filter(Boolean).join(" | ") }),
    section("PROFESSIONAL SUMMARY"),
    new Paragraph({ text: data.summary }),
    section("TECHNICAL SKILLS"),
    new Paragraph({ text: data.skills?.join(", ") || Object.values(data.skillsCategorized || {}).filter(Boolean).join(", ") }),
    section("WORK EXPERIENCE"),
  ];
  for (const exp of data.experience || []) {
    children.push(new Paragraph({ children: [new TextRun({ text: `${exp.title} — ${exp.company}`, bold: true }), new TextRun({ text: `  ${exp.period}`, italics: true })] }));
    for (const bullet of exp.bullets || []) children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
  }
  if (data.projects?.length) {
    children.push(section("PROJECTS"));
    for (const project of data.projects) children.push(new Paragraph({ children: [new TextRun({ text: `${project.name}: `, bold: true }), new TextRun(project.description)] }));
  }
  if (data.education) children.push(section("EDUCATION"), new Paragraph(data.education));
  if (data.certifications) children.push(section("CERTIFICATIONS"), new Paragraph(data.certifications));
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
