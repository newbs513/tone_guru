import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validate() {
  const modelRows = parseCsv(resolve("data/templates/tmp_models.csv"));
  const parameterRows = parseCsv(resolve("data/templates/tmp_parameters.csv"));

  const modelKeys = new Set<string>();
  for (const row of modelRows) {
    assert(row.modelKey, "modelKey is required");
    assert(!modelKeys.has(row.modelKey), `duplicate modelKey: ${row.modelKey}`);
    modelKeys.add(row.modelKey);
  }

  const parameterCompositeKeys = new Set<string>();
  for (const row of parameterRows) {
    assert(modelKeys.has(row.modelKey), `unknown modelKey in parameters: ${row.modelKey}`);
    assert(row.paramKey, `paramKey missing for model: ${row.modelKey}`);

    const composite = `${row.modelKey}:${row.paramKey}`;
    assert(!parameterCompositeKeys.has(composite), `duplicate param key: ${composite}`);
    parameterCompositeKeys.add(composite);

    if (row.dataType === "NUMBER") {
      assert(row.minValue !== "" && row.maxValue !== "", `missing min/max for numeric param ${composite}`);
      const min = Number(row.minValue);
      const max = Number(row.maxValue);
      assert(Number.isFinite(min) && Number.isFinite(max), `invalid min/max number for ${composite}`);
      assert(min <= max, `minValue > maxValue for ${composite}`);
    }
  }

  console.log("TMP catalog templates validated");
}

try {
  validate();
} catch (error) {
  console.error(error);
  process.exit(1);
}
