import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { caseId, suspect, rightsOwner, event } = body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No Gemini API key" }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a legal compliance AI for a digital media rights protection platform called LeakMap AI.

Generate a professional DMCA takedown notice draft for the following case:

Case ID: ${caseId}
Rights Owner: ${rightsOwner}
Event: ${event}
Infringing Account: ${suspect.account}
Platform: ${suspect.platform}
URL: ${suspect.url}
Confidence Score: ${Math.round(suspect.compositeScore * 100)}%
Modifications Detected: ${suspect.modifications?.join(", ") || "none"}

Generate a formal, legally-sound takedown notice that:
1. Identifies the copyrighted work
2. Identifies the infringing content with specifics
3. States the legal basis (DMCA 17 U.S.C. § 512)
4. Includes evidence summary
5. Requests immediate removal

Format it as a ready-to-send document. Be specific and professional.`,
    });

    const draft = response.text || "Failed to generate takedown draft.";
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("Takedown generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
