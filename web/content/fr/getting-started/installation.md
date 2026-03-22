---
title: Installation
description: Prérequis, options d'installation et configuration initiale.
---

# Installation

## Prérequis

- Google Antigravity (2026+)
- Bun
- uv

## Option 1 : Installation interactive

```bash
bunx oh-my-agent
```

Installe les skills et workflows dans `.agents/` du projet courant.

## Option 2 : Installation globale

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Recommandé si vous utilisez fréquemment les commandes de l'orchestrateur.

## Option 3 : Intégration dans un projet existant

### Via le CLI

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Copie manuelle

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Commande de configuration initiale

```text
/setup
```

Crée `.agents/config/user-preferences.yaml`.

## Fournisseurs CLI requis

Installez et authentifiez au moins un fournisseur :

- Gemini
- Claude
- Codex
- Qwen
