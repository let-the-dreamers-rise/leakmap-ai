import { NextResponse } from "next/server";
import { updateMatchStatus } from "@/lib/cloud/firestore";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const body = (await request.json().catch(() => null)) as { suspectId?: string; status?: string } | null;

  if (!body?.suspectId || !body?.status) {
    return NextResponse.json({ error: "Missing suspectId or status." }, { status: 400 });
  }

  await updateMatchStatus(caseId, body.suspectId, body.status);
  return NextResponse.json({ ok: true, caseId, suspectId: body.suspectId, status: body.status });
}
