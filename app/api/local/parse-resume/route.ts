import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Only PDF parsing is supported by this endpoint." }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "The PDF must be smaller than 15 MB." }, { status: 400 });
    const result = await pdfParse(Buffer.from(await file.arrayBuffer()));
    const text = result.text.replace(/\u0000/g, "").replace(/\n{3,}/g, "\n\n").trim();
    if (!text) return NextResponse.json({ error: "No selectable text was found. Scanned-image PDFs require OCR and are not supported yet." }, { status: 422 });
    return NextResponse.json({ success: true, text, pages: result.numpages });
  } catch (error) {
    return NextResponse.json({ error: `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
