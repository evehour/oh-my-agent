import { createReadStream, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { registerParser } from "../registry.js";
import type { NormalizedEntry } from "../schema.js";

const HISTORY_PATH = join(homedir(), ".codex", "history.jsonl");

registerParser({
  name: "codex",

  async detect() {
    return existsSync(HISTORY_PATH);
  },

  async parse(start, end) {
    if (!existsSync(HISTORY_PATH)) return [];

    const entries: NormalizedEntry[] = [];
    const rl = createInterface({
      input: createReadStream(HISTORY_PATH),
      crlfDelay: Number.POSITIVE_INFINITY,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        // Codex uses Unix seconds — convert to ms
        const ts = (row.ts ?? 0) * 1000;
        if (ts < start || ts >= end) continue;

        const prompt = row.text;
        if (!prompt) continue;

        entries.push({
          tool: "codex",
          timestamp: ts,
          prompt,
          sessionId: row.session_id || undefined,
        });
      } catch {
        // skip malformed lines
      }
    }

    return entries;
  },
});
