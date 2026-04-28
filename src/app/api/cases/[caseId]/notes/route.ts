import { NextResponse } from "next/server";
import { addAnalystNote } from "@/lib/cloud/firestore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const body = (await request.json().catch(() => null)) as { note?: string } | null;

  if (!body?.note) {
    return NextResponse.json({ error: "Missing note field." }, { status: 400 });
  }

  const result = await addAnalystNote(caseId, body.note);
  return NextResponse.json({ ok: true, caseId, result });
}
