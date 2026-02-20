import { NextResponse } from "next/server";
import { listModelsForFirmware } from "@/lib/tmp/catalog";

export async function GET(
  _request: Request,
  { params }: { params: { version: string } },
) {
  const version = params.version?.trim();
  if (!version) {
    return NextResponse.json({ error: "version is required" }, { status: 400 });
  }

  const rows = await listModelsForFirmware(version);
  const data = rows.map((row) => row.model);

  return NextResponse.json({ data });
}
