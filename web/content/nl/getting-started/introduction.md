---
title: Introductie
description: Wat oh-my-agent is en hoe multi-agentsamenwerking werkt.
---

# Introductie

oh-my-agent is een multi-agentorkestrator voor Antigravity IDE. Het routeert verzoeken naar gespecialiseerde skills en coördineert agents via Serena-geheugens.

## Wat u krijgt

- Verzoekgestuurde skillroutering
- Werkstroomgebaseerde uitvoering voor planning/review/debugging
- CLI-orkestratie voor parallelle agentruns
- Realtime dashboards voor sessiemonitoring

## Agentrollen

| Agent | Verantwoordelijkheid |
|---|---|
| workflow-guide | Coördineert complexe multidomain-projecten |
| pm-agent | Planning en architectuuropsplitsing |
| frontend-agent | React/Next.js-implementatie |
| backend-agent | API/database/auth-implementatie |
| mobile-agent | Flutter/mobiele implementatie |
| brainstorm | Design-first ideevorming en conceptverkenning |
| db-agent | Databasemodellering, schemaontwerp en queryoptimalisatie |
| dev-workflow | Ontwikkelworkflow-optimalisatie en CI/CD |
| tf-infra-agent | Terraform infrastructure-as-code provisioning |
| translator | Contextbewuste meertalige vertaling |
| qa-agent | Beveiligings-/prestatie-/toegankelijkheidsreview |
| debug-agent | Hoofdoorzaakanalyse en regressieveilige fixes |
| orchestrator | CLI-gebaseerde subagentorkestratie |
| commit | Conventionele commitworkflow |

## Projectstructuur

- `.agents/skills/`: skilldefinities en resources
- `.agents/workflows/`: expliciete workflowcommando's
- `.serena/memories/`: runtime-orkestratiestatus
- `cli/cli.ts`: bron van waarheid voor commandointerfaces

## Progressieve ontsluiting

1. Verzoekintentie identificeren
2. Alleen benodigde skillresources laden
3. Uitvoeren met gespecialiseerde agents
4. Verifiëren en itereren via QA-/debuglussen
