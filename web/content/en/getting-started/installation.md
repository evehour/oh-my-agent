---
title: Installation
description: Prerequisites, install options, and first-run setup.
---

# Installation

## Prerequisites

- AI IDE (2026+)
- Bun
- uv

## Option 1: Interactive Install

```bash
bunx oh-my-agent
```

Installs skills and workflows into `.agents/` in the current project.

## Option 2: Global Install

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Recommended if you use orchestrator commands frequently.

## Option 3: Existing Project Integration

### CLI path

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Manual copy path

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Initial Setup Command

```text
/setup
```

Creates `.agents/config/user-preferences.yaml`.

## Required CLI Vendors

Install and authenticate at least one:

- Gemini
- Claude
- Codex
- Qwen
