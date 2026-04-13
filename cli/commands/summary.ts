import { exec } from "node:child_process";
import { startDashboard } from "../dashboard.js";
import { formatJson } from "../lib/summary/formatters/json.js";
import { formatMermaid } from "../lib/summary/formatters/mermaid.js";
import { formatTerminal } from "../lib/summary/formatters/terminal.js";
import { collectSummary, type SummaryOptions } from "../lib/summary/index.js";

export async function summary(
  jsonMode = false,
  options: SummaryOptions & { mermaid?: boolean; graph?: boolean } = {},
): Promise<void> {
  if (options.graph) {
    const port = process.env.DASHBOARD_PORT || "9847";
    const url = `http://localhost:${port}/summary`;
    startDashboard();
    // Open browser after a short delay to let server start
    setTimeout(() => {
      const cmd =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "start"
            : "xdg-open";
      exec(`${cmd} ${url}`);
    }, 500);
    return;
  }

  const output = await collectSummary(options);

  if (jsonMode) {
    console.log(formatJson(output));
    return;
  }

  if (options.mermaid) {
    console.log(formatMermaid(output));
    return;
  }

  formatTerminal(output);
}
