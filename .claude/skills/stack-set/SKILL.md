---
name: stack-set
description: Auto-detect project tech stack and configure language-specific references. Use when setting up backend/frontend language preferences or switching tech stacks.
disable-model-invocation: true
---

# /stack-set

## Claude Code Adaptation

- Execute inline (no subagent spawn needed)
- Use Grep, Glob, Read tools for project file detection
- Use Write tool to generate stack/ files

## Workflow

Follow `.agents/workflows/stack-set.md` for the complete 4-step process:
1. **Detect** — Scan project manifests
2. **Confirm** — Present findings to user
3. **Generate** — Create stack/ files
4. **Verify** — Validate completeness
