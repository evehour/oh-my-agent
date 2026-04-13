import { formatJson } from "../lib/summary/formatters/json.js";
import { formatMermaid } from "../lib/summary/formatters/mermaid.js";
import { formatTerminal } from "../lib/summary/formatters/terminal.js";
import { collectSummary, type SummaryOptions } from "../lib/summary/index.js";

export async function summary(
  jsonMode = false,
  options: SummaryOptions & { mermaid?: boolean; graph?: boolean } = {},
): Promise<void> {
  const output = await collectSummary(options);

  if (jsonMode) {
    console.log(formatJson(output));
    return;
  }

  if (options.mermaid) {
    console.log(formatMermaid(output));
    return;
  }

  if (options.graph) {
    // Phase 3 — placeholder
    console.log("Graph visualization not yet implemented. Use --json for now.");
    return;
  }

  formatTerminal(output);
}
