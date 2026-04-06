/**
 * Migration 001: Move .agents/config/user-preferences.yaml → .agents/oma-config.yaml
 * Removes the empty config/ directory if no other files remain.
 */
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { Migration } from "./index.js";

export const migrateOmaConfig: Migration = {
  name: "001-oma-config",
  up(cwd: string): void {
    const legacyPath = join(
      cwd,
      ".agents",
      "config",
      "user-preferences.yaml",
    );
    const newPath = join(cwd, ".agents", "oma-config.yaml");

    if (!existsSync(newPath) && existsSync(legacyPath)) {
      cpSync(legacyPath, newPath);
      rmSync(legacyPath);

      const legacyDir = join(cwd, ".agents", "config");
      if (existsSync(legacyDir) && readdirSync(legacyDir).length === 0) {
        rmSync(legacyDir, { recursive: true });
      }
    }
  },
};
