import { prisma } from "@/lib/db/prisma";

export async function listTmpModels() {
  return prisma.tmpModel.findMany({
    orderBy: { displayName: "asc" },
    select: {
      modelKey: true,
      displayName: true,
      category: true,
      description: true,
      updatedAt: true,
    },
  });
}

export async function getTmpModelByKey(modelKey: string) {
  return prisma.tmpModel.findUnique({
    where: { modelKey },
    select: {
      modelKey: true,
      displayName: true,
      category: true,
      description: true,
      sourceType: true,
      sourceUrl: true,
      confidence: true,
      lastVerifiedAt: true,
      updatedAt: true,
    },
  });
}

export async function listTmpModelParameters(modelKey: string) {
  return prisma.tmpModelParameter.findMany({
    where: { model: { modelKey } },
    orderBy: { name: "asc" },
    select: {
      paramKey: true,
      name: true,
      dataType: true,
      unit: true,
      minValue: true,
      maxValue: true,
      step: true,
      enumOptions: true,
      defaultValue: true,
      updatedAt: true,
    },
  });
}

export async function listModelsForFirmware(version: string) {
  return prisma.tmpModelAvailability.findMany({
    where: {
      firmwareVersion: { version },
      parameterId: null,
      isAvailable: true,
    },
    select: {
      model: {
        select: {
          modelKey: true,
          displayName: true,
          category: true,
        },
      },
    },
    orderBy: { model: { displayName: "asc" } },
  });
}
