---
title: Workflows
description: Explizite Slash-Befehl-Workflows und wann man sie verwendet.
---

# Workflows

## Workflow-Befehle

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

## Skills vs. Workflows

- Skills: automatisch aktiviert basierend auf der Absicht der Anfrage
- Workflows: explizite, mehrstufige Pipelines, die vom Benutzer ausgelöst werden

## Typische Multi-Agenten-Sequenz

1. `/plan` für die Aufgabenzerlegung
2. `/coordinate` für die stufenweise Ausführung
3. `agent:spawn` für parallele Sub-Agenten
4. `/review` für die QA-Freigabe
