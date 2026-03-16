---
title: Options
description: Toutes les options de commande actuellement exposées par le CLI.
---

# Options

## Globales

- `-h, --help`
- `-V, --version`

## usage:anti

- `--json`
- `--raw`

## doctor

- `--json`

## stats

- `--json`
- `--reset`

## retro

- `--json`
- `--interactive`

## cleanup

- `--dry-run`
- `--json`

## agent:spawn

- `-v, --vendor <vendor>`
- `-w, --workspace <path>`

## agent:status

- `-r, --root <path>`

## memory:init

- `--json`
- `--force`

## verify

- `-w, --workspace <path>`
- `--json`

## Exemple pratique

```bash
oma usage:anti --json
oma stats --reset
oma cleanup --dry-run
oma agent:spawn backend "Implement auth API" session-01 -v codex -w ./apps/api
```
