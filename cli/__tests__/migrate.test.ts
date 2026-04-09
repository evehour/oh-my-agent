import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { migrateClaudeMdLocal } from "../commands/migrations/004-claude-md-local.js";
import { migrateSharedLayout, migrateToAgents } from "../lib/migrate.js";

describe("migrateToAgents", () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots) {
      rmSync(root, { recursive: true, force: true });
    }
    tempRoots.length = 0;
  });

  it("renames .agent/ to .agents/ when only .agent/ exists", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    const oldDir = join(root, ".agent");
    mkdirSync(join(oldDir, "skills"), { recursive: true });
    writeFileSync(join(oldDir, "skills", "test.md"), "content", "utf-8");

    const actions = migrateToAgents(root);

    expect(actions).toContain(".agent/ → .agents/ (renamed)");
    expect(existsSync(oldDir)).toBe(false);
    expect(existsSync(join(root, ".agents", "skills", "test.md"))).toBe(true);
  });

  it("removes .agent/ after merge when both directories have overlapping items", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    const oldDir = join(root, ".agent");
    const newDir = join(root, ".agents");

    // Create overlapping structure
    mkdirSync(join(oldDir, "skills"), { recursive: true });
    mkdirSync(join(newDir, "skills"), { recursive: true });
    writeFileSync(join(oldDir, "skills", "a.md"), "old", "utf-8");
    writeFileSync(join(newDir, "skills", "a.md"), "new", "utf-8");

    const actions = migrateToAgents(root);

    expect(actions).toContain(".agent/ (removed after merge)");
    expect(existsSync(oldDir)).toBe(false);
    // .agents/ keeps its own version for overlapping items
    expect(readFileSync(join(newDir, "skills", "a.md"), "utf-8")).toBe("new");
  });

  it("merges unique items from .agent/ into .agents/ then removes .agent/", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    const oldDir = join(root, ".agent");
    const newDir = join(root, ".agents");

    mkdirSync(join(oldDir, "config"), { recursive: true });
    mkdirSync(join(newDir, "skills"), { recursive: true });
    writeFileSync(join(oldDir, "config", "custom.yaml"), "custom", "utf-8");
    writeFileSync(join(newDir, "skills", "a.md"), "skill", "utf-8");

    const actions = migrateToAgents(root);

    expect(actions).toContain(".agent/config → .agents/config (merged)");
    expect(actions).toContain(".agent/ (removed after merge)");
    expect(existsSync(oldDir)).toBe(false);
    expect(existsSync(join(newDir, "config", "custom.yaml"))).toBe(true);
    expect(existsSync(join(newDir, "skills", "a.md"))).toBe(true);
  });

  it("does nothing when only .agents/ exists", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    mkdirSync(join(root, ".agents", "skills"), { recursive: true });

    const actions = migrateToAgents(root);

    // No .agent/ → .agents/ migration actions
    const dirMigrationActions = actions.filter(
      (a) => a.includes(".agent/") && !a.includes("skills/"),
    );
    expect(dirMigrationActions).toHaveLength(0);
  });
});

describe("migrateSharedLayout", () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots) {
      rmSync(root, { recursive: true, force: true });
    }
    tempRoots.length = 0;
  });

  it("removes legacy files when the new location already exists", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    const oldPath = join(
      root,
      ".agents",
      "skills",
      "_shared",
      "context-loading.md",
    );
    const newPath = join(
      root,
      ".agents",
      "skills",
      "_shared",
      "core",
      "context-loading.md",
    );

    mkdirSync(join(root, ".agents", "skills", "_shared", "core"), {
      recursive: true,
    });
    writeFileSync(oldPath, "same content\n", "utf-8");
    writeFileSync(newPath, "same content\n", "utf-8");

    const actions = migrateSharedLayout(root);

    expect(actions).toContain(
      ".agents/skills/_shared/context-loading.md (removed legacy path)",
    );
    expect(existsSync(oldPath)).toBe(false);
    expect(readFileSync(newPath, "utf-8")).toBe("same content\n");
  });

  it("backs up customized legacy files before removing them (shared layout)", () => {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-"));
    tempRoots.push(root);

    const oldPath = join(
      root,
      ".agents",
      "skills",
      "_shared",
      "phase-gates.md",
    );
    const newPath = join(
      root,
      ".agents",
      "workflows",
      "ultrawork",
      "resources",
      "phase-gates.md",
    );
    const backupPath = join(
      root,
      ".agents",
      ".migration-backup",
      "shared-layout-v2",
      "skills",
      "_shared",
      "phase-gates.md",
    );

    mkdirSync(join(root, ".agents", "skills", "_shared"), { recursive: true });
    mkdirSync(join(root, ".agents", "workflows", "ultrawork", "resources"), {
      recursive: true,
    });

    writeFileSync(oldPath, "custom legacy content\n", "utf-8");
    writeFileSync(newPath, "new canonical content\n", "utf-8");

    const actions = migrateSharedLayout(root);

    expect(actions).toContain(
      ".agents/skills/_shared/phase-gates.md → .agents/.migration-backup/shared-layout-v2/skills/_shared/phase-gates.md (backup)",
    );
    expect(existsSync(oldPath)).toBe(false);
    expect(readFileSync(newPath, "utf-8")).toBe("new canonical content\n");
    expect(readFileSync(backupPath, "utf-8")).toBe("custom legacy content\n");
  });
});

describe("migrateClaudeMdLocal (004)", () => {
  const tempRoots: string[] = [];
  let originalHome: string | undefined;

  function setup(): string {
    const root = mkdtempSync(join(tmpdir(), "oma-migrate-004-"));
    tempRoots.push(root);
    originalHome = process.env.HOME;
    process.env.HOME = root;
    return root;
  }

  afterEach(() => {
    process.env.HOME = originalHome;
    for (const root of tempRoots) {
      rmSync(root, { recursive: true, force: true });
    }
    tempRoots.length = 0;
  });

  it("does nothing when ~/.claude/CLAUDE.md does not exist", () => {
    setup();
    const actions = migrateClaudeMdLocal.up("/unused");
    expect(actions).toHaveLength(0);
  });

  it("does nothing when no OMA block exists", () => {
    const home = setup();
    const claudeDir = join(home, ".claude");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(join(claudeDir, "CLAUDE.md"), "# My global notes\n");

    const actions = migrateClaudeMdLocal.up("/unused");
    expect(actions).toHaveLength(0);
    expect(readFileSync(join(claudeDir, "CLAUDE.md"), "utf-8")).toBe(
      "# My global notes\n",
    );
  });

  it("removes OMA block and keeps user content", () => {
    const home = setup();
    const claudeDir = join(home, ".claude");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      join(claudeDir, "CLAUDE.md"),
      "# My notes\n\n<!-- OMA:START -->\noma stuff\n<!-- OMA:END -->\n\n# More notes\n",
    );

    const actions = migrateClaudeMdLocal.up("/unused");

    expect(actions).toHaveLength(1);
    expect(actions[0]).toContain("OMA block removed");
    const content = readFileSync(join(claudeDir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("# My notes");
    expect(content).toContain("# More notes");
    expect(content).not.toContain("OMA:START");
    expect(content).not.toContain("oma stuff");
  });

  it("deletes file when OMA block was only content", () => {
    const home = setup();
    const claudeDir = join(home, ".claude");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      join(claudeDir, "CLAUDE.md"),
      "<!-- OMA:START -->\noma stuff\n<!-- OMA:END -->",
    );

    const actions = migrateClaudeMdLocal.up("/unused");

    expect(actions).toHaveLength(1);
    expect(actions[0]).toContain("removed");
    expect(existsSync(join(claudeDir, "CLAUDE.md"))).toBe(false);
  });

  it("handles full OMA:START marker with description", () => {
    const home = setup();
    const claudeDir = join(home, ".claude");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      join(claudeDir, "CLAUDE.md"),
      "# Notes\n<!-- OMA:START — managed by oh-my-agent. Do not edit this block manually. -->\nblock\n<!-- OMA:END -->\n",
    );

    const actions = migrateClaudeMdLocal.up("/unused");

    expect(actions).toHaveLength(1);
    const content = readFileSync(join(claudeDir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("# Notes");
    expect(content).not.toContain("OMA:START");
  });
});
