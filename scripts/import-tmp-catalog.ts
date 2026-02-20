import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, SourceType, TmpModelCategory, TmpParameterDataType } from "@prisma/client";

const prisma = new PrismaClient();

function parseCsv(path: string): Record<string, string>[] {
  const raw = readFileSync(path, "utf8").trim();
  const [headerLine, ...lines] = raw.split("\n");
  const headers = headerLine.split(",");
  return lines
    .filter(Boolean)
    .map((line) => {
      const cols = line.split(",");
      return headers.reduce<Record<string, string>>((acc, h, i) => {
        acc[h] = cols[i] ?? "";
        return acc;
      }, {});
    });
}

function asSourceType(value: string): SourceType | undefined {
  if (!value) return undefined;
  return value as SourceType;
}

async function main() {
  const modelsPath = resolve("data/templates/tmp_models.csv");
  const paramsPath = resolve("data/templates/tmp_parameters.csv");
  const availabilityPath = resolve("data/templates/tmp_availability.csv");

  const modelRows = parseCsv(modelsPath);
  const parameterRows = parseCsv(paramsPath);
  const availabilityRows = parseCsv(availabilityPath);

  for (const row of modelRows) {
    await prisma.tmpModel.upsert({
      where: { modelKey: row.modelKey },
      update: {
        displayName: row.displayName,
        category: row.category as TmpModelCategory,
        description: row.description || null,
        sourceType: asSourceType(row.sourceType),
        sourceUrl: row.sourceUrl || null,
        confidence: row.confidence ? Number(row.confidence) : null,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
      },
      create: {
        modelKey: row.modelKey,
        displayName: row.displayName,
        category: row.category as TmpModelCategory,
        description: row.description || null,
        sourceType: asSourceType(row.sourceType),
        sourceUrl: row.sourceUrl || null,
        confidence: row.confidence ? Number(row.confidence) : null,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
      },
    });
  }

  for (const row of parameterRows) {
    const model = await prisma.tmpModel.findUniqueOrThrow({ where: { modelKey: row.modelKey } });
    await prisma.tmpModelParameter.upsert({
      where: { modelId_paramKey: { modelId: model.id, paramKey: row.paramKey } },
      update: {
        name: row.name,
        dataType: row.dataType as TmpParameterDataType,
        unit: row.unit || null,
        minValue: row.minValue ? Number(row.minValue) : null,
        maxValue: row.maxValue ? Number(row.maxValue) : null,
        step: row.step ? Number(row.step) : null,
        enumOptions: row.enumOptions ? JSON.parse(row.enumOptions) : null,
        defaultValue: row.defaultValue ? JSON.parse(row.defaultValue) : null,
        sourceType: asSourceType(row.sourceType),
        sourceUrl: row.sourceUrl || null,
        confidence: row.confidence ? Number(row.confidence) : null,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
      },
      create: {
        modelId: model.id,
        paramKey: row.paramKey,
        name: row.name,
        dataType: row.dataType as TmpParameterDataType,
        unit: row.unit || null,
        minValue: row.minValue ? Number(row.minValue) : null,
        maxValue: row.maxValue ? Number(row.maxValue) : null,
        step: row.step ? Number(row.step) : null,
        enumOptions: row.enumOptions ? JSON.parse(row.enumOptions) : null,
        defaultValue: row.defaultValue ? JSON.parse(row.defaultValue) : null,
        sourceType: asSourceType(row.sourceType),
        sourceUrl: row.sourceUrl || null,
        confidence: row.confidence ? Number(row.confidence) : null,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
      },
    });
  }

  for (const row of availabilityRows) {
    const model = await prisma.tmpModel.findUniqueOrThrow({ where: { modelKey: row.modelKey } });
    const fw = await prisma.tmpFirmwareVersion.upsert({
      where: { version: row.firmwareVersion },
      update: {},
      create: { version: row.firmwareVersion },
    });
    const parameter = row.paramKey
      ? await prisma.tmpModelParameter.findFirstOrThrow({ where: { modelId: model.id, paramKey: row.paramKey } })
      : null;

    await prisma.tmpModelAvailability.upsert({
      where: {
        firmwareVersionId_modelId_parameterId: {
          firmwareVersionId: fw.id,
          modelId: model.id,
          parameterId: parameter?.id ?? null,
        },
      },
      update: { isAvailable: row.isAvailable !== "false", notes: row.notes || null },
      create: {
        firmwareVersionId: fw.id,
        modelId: model.id,
        parameterId: parameter?.id ?? null,
        isAvailable: row.isAvailable !== "false",
        notes: row.notes || null,
      },
    });
  }

  console.log("TMP catalog import complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
