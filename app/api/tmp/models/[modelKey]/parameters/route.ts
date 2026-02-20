import { NextResponse } from "next/server";
import { listTmpModelParameters } from "@/lib/tmp/catalog";

export async function GET(
  _request: Request,
  { params }: { params: { modelKey: string } },
) {
  const modelKey = params.modelKey?.trim();
  if (!modelKey) {
    return NextResponse.json({ error: "modelKey is required" }, { status: 400 });
  }

  const parameters = await listTmpModelParameters(modelKey);
  return NextResponse.json({ data: parameters });
}
