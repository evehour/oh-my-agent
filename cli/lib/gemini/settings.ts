/**
 * Recommended Gemini CLI settings managed by oh-my-agent.
 * Applies to project-local `.gemini/settings.json`.
 */

export const RECOMMENDED_GEMINI_GENERAL = {
  enableNotifications: true,
} as const;

export const RECOMMENDED_GEMINI_MCP = {
  serena: {
    url: "http://localhost:12341/mcp",
  },
} as const;

type JsonRecord = Record<string, unknown>;

interface GeminiMcpServer {
  url?: string;
  [key: string]: unknown;
}

export interface GeminiSettings {
  general?: JsonRecord;
  mcpServers?: Record<string, GeminiMcpServer>;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeGeminiSettings(input: unknown): GeminiSettings {
  if (!isRecord(input)) return {};

  const general = isRecord(input.general) ? input.general : undefined;
  const mcpServers = isRecord(input.mcpServers)
    ? (input.mcpServers as Record<string, GeminiMcpServer>)
    : undefined;

  return {
    ...input,
    general,
    mcpServers,
  };
}

export function needsGeminiSettingsUpdate(rawSettings: unknown): boolean {
  const geminiSettings = normalizeGeminiSettings(rawSettings);
  const general = geminiSettings.general;
  if (!general) return true;

  for (const [key, expected] of Object.entries(RECOMMENDED_GEMINI_GENERAL)) {
    if (general[key] !== expected) return true;
  }

  const serenaUrl = geminiSettings.mcpServers?.serena?.url;
  if (serenaUrl !== RECOMMENDED_GEMINI_MCP.serena.url) return true;

  return false;
}

export function applyRecommendedGeminiSettings(
  rawSettings: unknown,
): GeminiSettings {
  const geminiSettings = normalizeGeminiSettings(rawSettings);
  geminiSettings.general = {
    ...(geminiSettings.general || {}),
    ...RECOMMENDED_GEMINI_GENERAL,
  };

  geminiSettings.mcpServers = {
    ...(geminiSettings.mcpServers || {}),
    ...RECOMMENDED_GEMINI_MCP,
  };

  return geminiSettings;
}
