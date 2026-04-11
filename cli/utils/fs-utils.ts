import * as fs from "node:fs";
import { join } from "node:path";

/**
 * Remove path if it exists as a symlink or file (not a real directory).
 * Handles re-installation where symlinks from a previous install
 * conflict with directory copies.
 */
export function clearNonDirectory(path: string): void {
  try {
    if (!fs.lstatSync(path).isDirectory()) {
      fs.unlinkSync(path);
    }
  } catch {
    // Path doesn't exist
  }
}

/**
 * For each entry in sourceDir that is a directory, remove the corresponding
 * entry in destDir if it exists as a non-directory (symlink or file).
 * Prevents cpSync from failing when overwriting symlinks with directories.
 */
export function clearConflictingEntries(
  sourceDir: string,
  destDir: string,
): void {
  if (!fs.existsSync(destDir)) return;

  try {
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        clearNonDirectory(join(destDir, entry.name));
      }
    }
  } catch {
    // Best-effort cleanup
  }
}
