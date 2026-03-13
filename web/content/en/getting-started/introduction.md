---
title: Introduction
description: What oh-my-agent is and how multi-agent collaboration works.
---

# Introduction

oh-my-agent is a multi-agent orchestrator for AI IDEs. It routes requests to specialized skills and coordinates agents through Serena memories.

## What You Get

- Request-driven skill routing
- Workflow-based execution for planning/review/debugging
- CLI orchestration for parallel agent runs
- Real-time dashboards for session monitoring

## Agent Roles

| Agent | Responsibility |
|---|---|
| workflow-guide | Coordinates complex multi-domain projects |
| pm-agent | Planning and architecture decomposition |
| frontend-agent | React/Next.js implementation |
| backend-agent | API/database/auth implementation |
| mobile-agent | Flutter/mobile implementation |
| qa-agent | Security/performance/accessibility review |
| debug-agent | Root-cause analysis and regression-safe fixes |
| orchestrator | CLI-based sub-agent orchestration |
| commit | Conventional commit workflow |

## Project Structure

- `.agents/skills/`: skill definitions and resources
- `.agents/workflows/`: explicit workflow commands
- `.serena/memories/`: runtime orchestration state
- `cli/cli.ts`: source of truth for command interfaces

## Progressive Disclosure

1. Identify request intent
2. Load only required skill resources
3. Execute with specialized agents
4. Verify and iterate via QA/debug loops
