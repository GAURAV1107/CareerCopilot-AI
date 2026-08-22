import { jsPDF } from "jspdf";

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
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    period: string;
    bullets: string[];
  }>;
}

export function generateTailoredResumePDF(data: TailoredResumeData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Colors
  const darkNavy = [15, 23, 42]; // #0f172a
  const bluePrimary = [37, 99, 235]; // #2563eb
  const textDark = [51, 65, 85]; // #334155
  const borderGray = [226, 232, 240];

  // Helper to add text with wrapping
  const addWrappedText = (text: string, fontSize: number, isBold: boolean, color: number[], lineHeight = 5) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
  };

  // Header - Name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.candidateName.toUpperCase(), margin, y);
  y += 7;

  // Title & Target Role Tagline
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
  doc.text(`${data.candidateTitle} — Tailored for ${data.targetJobTitle} at ${data.targetCompany}`, margin, y);
  y += 6;

  // Contact Info Line
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const contactStr = [
    data.email,
    data.phone,
    data.location,
    data.linkedinUrl ? "LinkedIn: " + data.linkedinUrl : "",
    data.githubUrl ? "GitHub: " + data.githubUrl : "",
  ]
    .filter(Boolean)
    .join("  |  ");

  doc.text(contactStr, margin, y);
  y += 6;

  // Divider Line
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Section Header Generator
  const addSectionHeader = (title: string) => {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
    doc.setLineWidth(0.7);
    doc.line(margin, y, margin + 40, y);
    y += 5;
  };

  // 1. PROFESSIONAL SUMMARY
  addSectionHeader("Professional Summary");
  addWrappedText(data.summary, 9, false, textDark, 4.5);
  y += 3;

  // 2. TECHNICAL COMPETENCIES & KEYWORDS
  addSectionHeader("Technical Competencies & Targeted Skills");
  const skillsText = data.skills.join("   •   ");
  addWrappedText(skillsText, 8.5, true, textDark, 4.5);
  y += 3;

  // 3. WORK EXPERIENCE
  addSectionHeader("Professional Experience");

  data.experience.forEach((exp) => {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }

    // Role Title & Company
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(exp.title, margin, y);

    // Period on right
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(exp.period, pageWidth - margin - doc.getTextWidth(exp.period), y);
    y += 4.5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
    doc.text(exp.company, margin, y);
    y += 5;

    // Bullet points
    exp.bullets.forEach((bullet) => {
      if (y > 265) {
        doc.addPage();
        y = 18;
      }
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const bulletText = `•   ${bullet}`;
      const splitBullet = doc.splitTextToSize(bulletText, contentWidth - 4);
      doc.text(splitBullet, margin + 2, y);
      y += splitBullet.length * 4.2;
    });

    y += 3;
  });

  return doc;
}
