---
title: Projectstructuur
description: Bijgewerkte directorystructuur na het splitsen van CLI en web docs workspaces.
---

# Project structuur

Gedetailleerde directory tree voor deze repository.

```text
.
├── .agents/
│   ├── config/
│   │   └── user-preferences.yaml   # Taal, tijdzone, CLI mapping
│   ├── workflows/
│   │   ├── brainstorm.md           # /brainstorm (design-first ideevorming)
│   │   ├── coordinate.md           # /coordinate (multi-agent orkestratie via UI)
│   │   ├── deepinit.md             # /deepinit (diepgaande projectinitialisatie)
│   │   ├── exec-plan.md            # /exec-plan (planuitvoering en -beheer)
│   │   ├── orchestrate.md          # /orchestrate (geautomatiseerde CLI parallelle uitvoering)
│   │   ├── plan.md                 # /plan (PM taak decompositie)
│   │   ├── review.md               # /review (volledige QA pipeline)
│   │   ├── debug.md                # /debug (gestructureerd bug repareren)
│   │   ├── setup.md                # /setup (CLI & MCP configuratie)
│   │   ├── tools.md                # /tools (MCP tool management)
│   │   └── ultrawork.md            # /ultrawork (maximale parallelle uitvoering)
│   └── skills/
│       ├── _shared/                    # Gemeenschappelijke resources (geen skill)
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
│       ├── brainstorm/                 # Design-first ideevorming
│       ├── commit/                     # Conventional commits skill
│       ├── db-agent/                   # Databasemodellering & queryoptimalisatie
│       ├── debug-agent/                # Bug repareren
│       ├── dev-workflow/               # CI/CD & ontwikkelworkflow
│       ├── frontend-agent/             # React/Next.js
│       ├── mobile-agent/               # Flutter
│       ├── orchestrator/               # CLI-gebaseerde sub-agent spawner
│       ├── pm-agent/                   # Product manager
│       ├── qa-agent/                   # Beveiliging & QA
│       ├── tf-infra-agent/             # Terraform infrastructure-as-code
│       ├── translator/                 # Contextbewuste meertalige vertaling
│       └── workflow-guide/             # Multi-agent coördinatie
│       # Elke skill heeft:
│       #   SKILL.md              (~40 regels, token-geoptimaliseerd)
│       #   resources/
│       #     ├── execution-protocol.md  (chain-of-thought stappen)
│       #     ├── examples.md            (few-shot input/output)
│       #     ├── checklist.md           (zelf-verificatie)
│       #     ├── error-playbook.md      (foutherstel)
│       #     ├── tech-stack.md          (gedetailleerde tech specs)
│       #     └── snippets.md            (copy-paste patronen)
├── .serena/
│   └── memories/                   # Runtime state (gitignored)
├── package.json
├── docs/
│   ├── USAGE.md                    # Gedetailleerde gebruiksgids (Engels)
│   ├── USAGE.ko.md                 # Gedetailleerde gebruiksgids (Koreaans)
│   ├── USAGE.nl.md                 # Gedetailleerde gebruiksgids (Nederlands)
│   ├── project-structure.md        # Volledige structuur referentie (Engels)
│   ├── project-structure.ko.md     # Volledige structuur referentie (Koreaans)
│   └── project-structure.nl.md     # Volledige structuur referentie (Nederlands)
├── README.md                       # Dit bestand (Engels)
├── README.ko.md                    # Koreaanse gids
└── README.nl.md                    # Nederlandse gids
```
