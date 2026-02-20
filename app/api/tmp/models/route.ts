import { NextResponse } from "next/server";
import { listTmpModels } from "@/lib/tmp/catalog";

export async function GET() {
  const models = await listTmpModels();
  return NextResponse.json({ data: models });
}
