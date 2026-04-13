import type { SummaryOutput } from "../schema.js";

export function formatJson(output: SummaryOutput): string {
  return JSON.stringify(output, null, 2);
}
