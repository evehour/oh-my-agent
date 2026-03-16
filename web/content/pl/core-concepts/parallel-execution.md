---
title: Wykonywanie równoległe
description: Wzorce orkiestracji CLI do jednoczesnego uruchamiania wielu agentów.
---

# Wykonywanie równoległe

## Wzorzec podstawowy

```bash
oma agent:spawn backend "Implement auth API" session-01 &
oma agent:spawn frontend "Create login form" session-01 &
wait
```

## Wzorzec z uwzględnieniem przestrzeni roboczych

```bash
oma agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oma agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Wzorzec monitorowania

```bash
bunx oh-my-agent dashboard:web
# open http://localhost:9847
```

## Konfiguracja wielu CLI

Skonfiguruj różne CLI dla poszczególnych typów agentów w `.agents/config/user-preferences.yaml`:

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

Uruchom `/setup`, aby skonfigurować interaktywnie.

## Priorytet rozwiązywania dostawcy CLI

1. Argument wiersza poleceń `--vendor`
2. `agent_cli_mapping` z user-preferences.yaml
3. `default_cli` z user-preferences.yaml
4. `active_vendor` z cli-config.yaml (przestarzałe)
5. Domyślna wartość zakodowana na stałe: `gemini`
