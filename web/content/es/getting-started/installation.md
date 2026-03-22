---
title: Instalacion
description: Prerequisitos, opciones de instalacion y configuracion inicial.
---

# Instalacion

## Prerequisitos

- Google Antigravity (2026+)
- Bun
- uv

## Opcion 1: Instalacion interactiva

```bash
bunx oh-my-agent
```

Instala skills y flujos de trabajo en `.agents/` en el proyecto actual.

## Opcion 2: Instalacion global

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Recomendado si utiliza los comandos del orquestador con frecuencia.

## Opcion 3: Integracion en proyecto existente

### Via CLI

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Copia manual

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Comando de configuracion inicial

```text
/setup
```

Crea `.agents/config/user-preferences.yaml`.

## Proveedores de CLI requeridos

Instale y autentique al menos uno:

- Gemini
- Claude
- Codex
- Qwen
