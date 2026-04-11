import type { CliTool, CliVendor } from "../types/index.js";

export const REPO = "first-fluke/oh-my-agent";
export const INSTALLED_SKILLS_DIR = ".agents/skills";

export const ALL_CLI_VENDORS: CliVendor[] = [
  "claude",
  "codex",
  "copilot",
  "cursor",
  "gemini",
  "qwen",
];

export const CLI_SKILLS_DIR: Record<CliTool, string> = {
  claude: ".claude/skills",
  copilot: ".github/skills",
};
