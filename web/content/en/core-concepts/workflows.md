---
title: Workflows
description: Explicit slash-command workflows and when to use them.
---

# Workflows

## Workflow Commands

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

- Skills: explicitly invoked via /command or loaded through agent skills field
- Workflows: explicit multi-step pipelines triggered by the user

## Typical Multi-Agent Sequence

1. `/plan` for decomposition
2. `/coordinate` for staged execution
3. `agent:spawn` for parallel sub-agents
4. `/review` for QA gate
