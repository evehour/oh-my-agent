import { execSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const HUD_PATH = join(__dirname, "../../.agents/hooks/core/hud.ts");

// Strip ANSI escape codes for readable assertions
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape stripping requires matching \x1b
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

function hud(input: Record<string, unknown>): string {
  return execSync(`bun "${HUD_PATH}"`, {
    input: JSON.stringify(input),
    encoding: "utf-8",
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: join(__dirname, "../.."),
    },
  });
}

describe("hud.ts", () => {
  describe("OMA label", () => {
    it("should always show [OMA]", () => {
      const result = stripAnsi(hud({}));
      expect(result).toContain("[OMA]");
    });
  });

  describe("model", () => {
    it("should shorten Opus display name", () => {
      const result = stripAnsi(
        hud({ model: { display_name: "Claude Opus 4.6 (1M context)" } }),
      );
      expect(result).toContain("Opus 4.6");
    });

    it("should shorten Sonnet display name", () => {
      const result = stripAnsi(
        hud({ model: { display_name: "Claude Sonnet 4.6" } }),
      );
      expect(result).toContain("Sonnet 4.6");
    });

    it("should shorten Haiku display name", () => {
      const result = stripAnsi(
        hud({ model: { display_name: "Claude Haiku 4.5" } }),
      );
      expect(result).toContain("Haiku 4.5");
    });

    it("should fall back to model id", () => {
      const result = stripAnsi(hud({ model: { id: "custom/my-model" } }));
      expect(result).toContain("my-model");
    });
  });

  describe("context usage", () => {
    it("should show context percentage", () => {
      const result = stripAnsi(
        hud({ context_window: { used_percentage: 42 } }),
      );
      expect(result).toContain("ctx:42%");
    });

    it("should round context percentage", () => {
      const result = stripAnsi(
        hud({ context_window: { used_percentage: 33.7 } }),
      );
      expect(result).toContain("ctx:34%");
    });
  });

  describe("session cost", () => {
    it("should show cost when > 0", () => {
      const result = stripAnsi(hud({ cost: { total_cost_usd: 1.37 } }));
      expect(result).toContain("$1.37");
    });

    it("should hide cost when 0", () => {
      const result = stripAnsi(hud({ cost: { total_cost_usd: 0 } }));
      expect(result).not.toContain("$");
    });

    it("should hide cost when absent", () => {
      const result = stripAnsi(hud({}));
      expect(result).not.toContain("$");
    });
  });

  describe("rate limits", () => {
    it("should show 5h rate limit percentage", () => {
      const result = stripAnsi(
        hud({ rate_limits: { five_hour: { used_percentage: 12 } } }),
      );
      expect(result).toContain("5h:12%");
    });

    it("should show 7d rate limit percentage", () => {
      const result = stripAnsi(
        hud({ rate_limits: { seven_day: { used_percentage: 5 } } }),
      );
      expect(result).toContain("7d:5%");
    });

    it("should show both rate limits", () => {
      const result = stripAnsi(
        hud({
          rate_limits: {
            five_hour: { used_percentage: 12 },
            seven_day: { used_percentage: 5 },
          },
        }),
      );
      expect(result).toContain("5h:12%");
      expect(result).toContain("7d:5%");
    });

    it("should show reset countdown", () => {
      const future = new Date(Date.now() + 2 * 3_600_000 + 30 * 60_000);
      const result = stripAnsi(
        hud({
          rate_limits: {
            five_hour: {
              used_percentage: 50,
              resets_at: future.toISOString(),
            },
          },
        }),
      );
      expect(result).toMatch(/5h:50%\(2h\d+m\)/);
    });

    it("should omit countdown when resets_at is in the past", () => {
      const past = new Date(Date.now() - 60_000);
      const result = stripAnsi(
        hud({
          rate_limits: {
            five_hour: {
              used_percentage: 50,
              resets_at: past.toISOString(),
            },
          },
        }),
      );
      expect(result).toContain("5h:50%");
      expect(result).not.toMatch(/5h:50%\(/);
    });

    it("should hide rate limits when absent", () => {
      const result = stripAnsi(hud({}));
      expect(result).not.toContain("5h:");
      expect(result).not.toContain("7d:");
    });
  });

  describe("lines changed", () => {
    it("should show added and removed", () => {
      const result = stripAnsi(
        hud({ cost: { total_lines_added: 156, total_lines_removed: 23 } }),
      );
      expect(result).toContain("+156");
      expect(result).toContain("-23");
    });

    it("should show only added when no removals", () => {
      const result = stripAnsi(
        hud({ cost: { total_lines_added: 42, total_lines_removed: 0 } }),
      );
      expect(result).toContain("+42");
      expect(result).not.toContain("-");
    });

    it("should show only removed when no additions", () => {
      const result = stripAnsi(
        hud({ cost: { total_lines_added: 0, total_lines_removed: 10 } }),
      );
      expect(result).toContain("-10");
      expect(result).not.toMatch(/\+\d/);
    });

    it("should hide lines when both are 0", () => {
      const result = stripAnsi(
        hud({ cost: { total_lines_added: 0, total_lines_removed: 0 } }),
      );
      expect(result).not.toMatch(/[+-]\d/);
    });
  });

  describe("full output", () => {
    it("should show all sections separated by │", () => {
      const result = stripAnsi(
        hud({
          model: { display_name: "Claude Opus 4.6 (1M context)" },
          context_window: { used_percentage: 42 },
          cost: {
            total_cost_usd: 1.37,
            total_lines_added: 100,
            total_lines_removed: 20,
          },
          rate_limits: {
            five_hour: { used_percentage: 12 },
            seven_day: { used_percentage: 5 },
          },
        }),
      );
      expect(result).toContain("[OMA]");
      expect(result).toContain("Opus 4.6");
      expect(result).toContain("ctx:42%");
      expect(result).toContain("$1.37");
      expect(result).toContain("5h:12%");
      expect(result).toContain("7d:5%");
      expect(result).toContain("+100");
      expect(result).toContain("-20");
      // Sections separated by │
      expect(result.split("│").length).toBeGreaterThanOrEqual(5);
    });

    it("should gracefully handle empty input", () => {
      const result = stripAnsi(hud({}));
      expect(result).toContain("[OMA]");
      expect(result.split("│").length).toBe(1);
    });
  });
});
