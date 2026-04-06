/**
 * Migration runner — executes all registered migrations in order.
 * Each migration is idempotent: safe to run multiple times.
 */

export interface Migration {
  name: string;
  up(cwd: string): void;
}

import { migrateOmaConfig } from "./001-oma-config.js";

const migrations: Migration[] = [migrateOmaConfig];

export function runMigrations(cwd: string): void {
  for (const migration of migrations) {
    migration.up(cwd);
  }
}
