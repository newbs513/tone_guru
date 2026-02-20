import { NextResponse } from "next/server";
import { getTmpModelByKey } from "@/lib/tmp/catalog";

export async function GET(
  _request: Request,
  { params }: { params: { modelKey: string } },
) {
  const modelKey = params.modelKey?.trim();
  if (!modelKey) {
    return NextResponse.json({ error: "modelKey is required" }, { status: 400 });
  }

  const model = await getTmpModelByKey(modelKey);
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  return NextResponse.json({ data: model });
}
