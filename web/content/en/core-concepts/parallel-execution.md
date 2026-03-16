---
title: Parallel Execution
description: CLI orchestration patterns for running multiple agents concurrently.
---

# Parallel Execution

## Basic Pattern

```bash
oma agent:spawn backend "Implement auth API" session-01 &
oma agent:spawn frontend "Create login form" session-01 &
wait
```

## Workspace-Aware Pattern

```bash
oma agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oma agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Monitoring Pattern

```bash
bunx oh-my-agent dashboard:web
# open http://localhost:9847
```

## Multi-CLI Configuration

Configure different CLIs per agent type in `.agents/config/user-preferences.yaml`:

```yaml
# Response language
language: ko  # ko, en, ja, zh, ...

# Default CLI (single tasks)
default_cli: gemini

# Per-agent CLI mapping (multi-CLI mode)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Run `/setup` to configure interactively.

## CLI Vendor Resolution Priority

1. `--vendor` command line argument
2. `agent_cli_mapping` from user-preferences.yaml
3. `default_cli` from user-preferences.yaml
4. `active_vendor` from cli-config.yaml (legacy)
5. Hardcoded fallback: `gemini`
