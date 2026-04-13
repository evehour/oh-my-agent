import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { registerParser } from "../registry.js";
import type { NormalizedEntry } from "../schema.js";

const CLAUDE_DIR = join(homedir(), ".claude");
const HISTORY_PATH = join(CLAUDE_DIR, "history.jsonl");
const PROJECTS_DIR = join(CLAUDE_DIR, "projects");

/**
 * Extract assistant response text from a content field.
 * Claude content can be string or array of {type:"text", text:""} blocks.
 */
function extractText(
  content: string | Array<{ type?: string; text?: string }>,
): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  for (const block of content) {
    if (block?.type === "text" && block.text) return block.text;
  }
  return "";
}

/**
 * Build a map of sessionId → Map<promptPrefix, responseSnippet>.
 * Matches user→assistant pairs by sequential order in session JSONL.
 * Uses first 80 chars of user prompt as the key.
 */
function loadSessionResponses(
  sessionIds: Set<string>,
): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  if (!existsSync(PROJECTS_DIR)) return result;

  try {
    for (const projDir of readdirSync(PROJECTS_DIR)) {
      const projPath = join(PROJECTS_DIR, projDir);
      let files: string[];
      try {
        files = readdirSync(projPath).filter(
          (f) =>
            f.endsWith(".jsonl") && sessionIds.has(f.replace(".jsonl", "")),
        );
      } catch {
        continue;
      }

      for (const file of files) {
        const sessionId = file.replace(".jsonl", "");
        const responses = new Map<string, string>();
        try {
          const lines = readFileSync(join(projPath, file), "utf-8")
            .split("\n")
            .filter(Boolean);

          // Collect user/assistant messages in order
          const msgs: Array<{ type: string; text: string }> = [];
          for (const line of lines) {
            const d = JSON.parse(line);
            if (d.type === "user" || d.type === "assistant") {
              const text = extractText(d.message?.content || "");
              msgs.push({ type: d.type, text });
            }
          }

          // Pair user → next assistant
          for (let i = 0; i < msgs.length; i++) {
            if (msgs[i].type !== "user" || !msgs[i].text) continue;
            // Find next assistant message
            for (let j = i + 1; j < msgs.length; j++) {
              if (msgs[j].type === "assistant" && msgs[j].text) {
                const key = msgs[i].text.slice(0, 80);
                responses.set(key, msgs[j].text.slice(0, 200));
                break;
              }
            }
          }
        } catch {
          // skip unreadable
        }
        if (responses.size > 0) {
          result.set(sessionId, responses);
        }
      }
    }
  } catch {
    // ignore
  }
  return result;
}

registerParser({
  name: "claude",

  async detect() {
    return existsSync(HISTORY_PATH);
  },

  async parse(start, end) {
    if (!existsSync(HISTORY_PATH)) return [];

    // First pass: collect entries and session IDs
    const rawEntries: Array<{
      ts: number;
      project?: string;
      prompt: string;
      sessionId?: string;
    }> = [];
    const sessionIds = new Set<string>();

    const rl = createInterface({
      input: createReadStream(HISTORY_PATH),
      crlfDelay: Number.POSITIVE_INFINITY,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        const ts = row.timestamp;
        if (typeof ts !== "number" || ts < start || ts >= end) continue;

        const prompt = row.display;
        if (!prompt) continue;

        const sessionId = row.sessionId || undefined;
        if (sessionId) sessionIds.add(sessionId);

        rawEntries.push({
          ts,
          project: row.project?.split("/").pop() || undefined,
          prompt,
          sessionId,
        });
      } catch {
        // skip malformed lines
      }
    }

    // Second pass: load responses for matching sessions
    const sessionResponses = loadSessionResponses(sessionIds);

    // Build normalized entries with responses (match by prompt text prefix)
    const entries: NormalizedEntry[] = rawEntries.map((raw) => {
      let response: string | undefined;
      if (raw.sessionId) {
        const resMap = sessionResponses.get(raw.sessionId);
        if (resMap) {
          const key = raw.prompt.slice(0, 80);
          response = resMap.get(key);
        }
      }

      return {
        tool: "claude" as const,
        timestamp: raw.ts,
        project: raw.project,
        prompt: raw.prompt,
        response,
        sessionId: raw.sessionId,
      };
    });

    return entries;
  },
});
