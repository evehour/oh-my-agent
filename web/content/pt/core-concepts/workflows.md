---
title: Workflows
description: Workflows explícitos por comandos de barra e quando utilizá-los.
---

# Workflows

## Comandos de Workflow

- `/brainstorm`
- `/coordinate`
- `/deepinit`
- `/exec-plan`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`
- `/setup`
- `/tools`
- `/stack-set`
- `/ultrawork`

## Skills vs Workflows

- Skills: invocadas explicitamente via /command ou carregadas pelo campo skills do agente
- Workflows: pipelines explícitos de múltiplas etapas acionados pelo usuário

## Sequência Típica Multi-Agente

1. `/plan` para decomposição
2. `/coordinate` para execução em etapas
3. `agent:spawn` para sub-agentes em paralelo
4. `/review` para portão de QA
