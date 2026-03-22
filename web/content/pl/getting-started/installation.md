---
title: Instalacja
description: Wymagania wstępne, opcje instalacji i konfiguracja przy pierwszym uruchomieniu.
---

# Instalacja

## Wymagania wstępne

- Google Antigravity (2026+)
- Bun
- uv

## Opcja 1: Instalacja interaktywna

```bash
bunx oh-my-agent
```

Instaluje umiejętności i przepływy pracy do `.agents/` w bieżącym projekcie.

## Opcja 2: Instalacja globalna

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Zalecana, jeśli często używasz komend orkiestratora.

## Opcja 3: Integracja z istniejącym projektem

### Ścieżka CLI

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Ścieżka ręcznego kopiowania

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Komenda początkowej konfiguracji

```text
/setup
```

Tworzy `.agents/config/user-preferences.yaml`.

## Wymagani dostawcy CLI

Zainstaluj i uwierzytelnij co najmniej jednego:

- Gemini
- Claude
- Codex
- Qwen
