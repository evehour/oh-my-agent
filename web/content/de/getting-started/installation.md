---
title: Installation
description: Voraussetzungen, Installationsoptionen und Ersteinrichtung.
---

# Installation

## Voraussetzungen

- Google Antigravity (2026+)
- Bun
- uv

## Option 1: Interaktive Installation

```bash
bunx oh-my-agent
```

Installiert Skills und Workflows in `.agents/` im aktuellen Projekt.

## Option 2: Globale Installation

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Empfohlen, wenn Sie häufig Orchestrator-Befehle verwenden.

## Option 3: Integration in ein bestehendes Projekt

### CLI-Weg

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Manueller Kopierweg

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Ersteinrichtungsbefehl

```text
/setup
```

Erstellt `.agents/config/user-preferences.yaml`.

## Erforderliche CLI-Anbieter

Installieren und authentifizieren Sie mindestens einen:

- Gemini
- Claude
- Codex
- Qwen
