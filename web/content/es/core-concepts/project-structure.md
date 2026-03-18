---
title: Estructura del Proyecto
description: Árbol de directorios actualizado tras la separación de los workspaces CLI y docs web.
---

# Estructura del Proyecto

Árbol de directorios detallado para este repositorio.

```text
.
├── .agents/
│   ├── config/
│   │   └── user-preferences.yaml   # Idioma, zona horaria, mapeo CLI
│   ├── workflows/
│   │   ├── brainstorm.md           # /brainstorm (ideación y exploración de conceptos)
│   │   ├── coordinate.md           # /coordinate (orquestación multi-agente mediante UI)
│   │   ├── deepinit.md             # /deepinit (inicialización profunda de proyecto)
│   │   ├── exec-plan.md            # /exec-plan (ejecución de plan paso a paso)
│   │   ├── orchestrate.md          # /orchestrate (ejecución paralela automatizada CLI)
│   │   ├── plan.md                 # /plan (descomposición de tareas PM)
│   │   ├── review.md               # /review (pipeline QA completo)
│   │   ├── debug.md                # /debug (corrección de bugs estructurada)
│   │   ├── setup.md                # /setup (configuración CLI y MCP)
│   │   ├── tools.md                # /tools (gestión de herramientas MCP)
│   │   └── ultrawork.md            # /ultrawork (ejecución de máximo paralelismo)
│   └── skills/
│       ├── _shared/                    # Recursos comunes (no es un skill)
│       │   ├── serena-memory-protocol.md
│       │   ├── common-checklist.md
│       │   ├── skill-routing.md
│       │   ├── context-loading.md
│       │   ├── context-budget.md
│       │   ├── reasoning-templates.md
│       │   ├── clarification-protocol.md
│       │   ├── difficulty-guide.md
│       │   ├── lessons-learned.md
│       │   ├── verify.sh
│       │   └── api-contracts/
│       ├── backend-agent/              # FastAPI
│       ├── brainstorm/                 # Ideación y exploración de conceptos
│       ├── commit/                     # Skill de conventional commits
│       ├── db-agent/                   # Modelado de bases de datos y esquemas
│       ├── debug-agent/                # Corrección de bugs
│       ├── dev-workflow/               # Optimización de flujos de trabajo y CI/CD
│       ├── frontend-agent/             # React/Next.js
│       ├── mobile-agent/               # Flutter
│       ├── orchestrator/               # Generador de sub-agentes basado en CLI
│       ├── pm-agent/                   # Product manager
│       ├── qa-agent/                   # Seguridad y QA
│       ├── tf-infra-agent/             # Infraestructura como código con Terraform
│       ├── translator/                 # Traducción multilingüe
│       └── workflow-guide/             # Coordinación multi-agente
│       # Cada skill tiene:
│       #   SKILL.md              (~40 líneas, optimizado para tokens)
│       #   resources/
│       #     ├── execution-protocol.md  (pasos chain-of-thought)
│       #     ├── examples.md            (entrada/salida few-shot)
│       #     ├── checklist.md           (auto-verificación)
│       #     ├── error-playbook.md      (recuperación de fallos)
│       #     ├── tech-stack.md          (especificaciones técnicas detalladas)
│       #     └── snippets.md            (patrones copiar y pegar)
├── .serena/
│   └── memories/                   # Estado de ejecución (gitignored)
├── package.json
├── docs/
│   ├── USAGE.md                    # Guía de uso detallada (Inglés)
│   ├── USAGE.ko.md                 # Guía de uso detallada (Coreano)
│   ├── project-structure.md        # Referencia de estructura completa (Inglés)
│   └── project-structure.ko.md     # Referencia de estructura completa (Coreano)
├── README.md                       # Este archivo (Inglés)
└── README.ko.md                    # Guía en Coreano
```
