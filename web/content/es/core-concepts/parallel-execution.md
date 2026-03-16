---
title: Ejecucion paralela
description: Patrones de orquestacion CLI para ejecutar multiples agentes concurrentemente.
---

# Ejecucion paralela

## Patron basico

```bash
oma agent:spawn backend "Implement auth API" session-01 &
oma agent:spawn frontend "Create login form" session-01 &
wait
```

## Patron con espacios de trabajo

```bash
oma agent:spawn backend "Auth + DB migration" session-02 -w ./apps/api
oma agent:spawn frontend "Login + token refresh" session-02 -w ./apps/web
```

## Patron de monitoreo

```bash
bunx oh-my-agent dashboard:web
# open http://localhost:9847
```

## Configuracion multi-CLI

Configure diferentes CLIs por tipo de agente en `.agents/config/user-preferences.yaml`:

```yaml
# Idioma de respuesta
language: ko  # ko, en, ja, zh, ...

# CLI predeterminada (tareas individuales)
default_cli: gemini

# Mapeo de CLI por agente (modo multi-CLI)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

Ejecute `/setup` para configurar de forma interactiva.

## Prioridad de resolucion de proveedor CLI

1. Argumento de linea de comandos `--vendor`
2. `agent_cli_mapping` de user-preferences.yaml
3. `default_cli` de user-preferences.yaml
4. `active_vendor` de cli-config.yaml (legado)
5. Valor predeterminado fijo: `gemini`
