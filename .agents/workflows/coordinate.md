---
description: Coordinate multiple agents for a complex multi-domain project using PM planning, parallel agent spawning, and QA review
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agents/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute from Step 0 in order. Explicitly report completion of each step to the user before proceeding to the next.
- **You MUST use MCP tools throughout the entire workflow.** This is NOT optional.
  - Use code analysis tools (`get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `search_for_pattern`) for code exploration.
  - Use memory tools (read/write/edit) for progress tracking.
  - Memory path: configurable via `memoryConfig.basePath` (default: `.serena/memories`)
  - Tool names: configurable via `memoryConfig.tools` in `mcp.json`
  - Do NOT use raw file reads or grep as substitutes. MCP tools are the primary interface for code and memory operations.
- **Read the workflow-guide BEFORE starting.** Read `.agents/skills/workflow-guide/SKILL.md` and follow its Core Rules.
- **Follow the context-loading guide.** Read `.agents/skills/_shared/context-loading.md` and load only task-relevant resources.

---

## Step 0: Preparation (DO NOT SKIP)

1. Read `.agents/skills/workflow-guide/SKILL.md` and confirm Core Rules.
2. Read `.agents/skills/_shared/context-loading.md` for resource loading strategy.
3. Read `.agents/skills/_shared/memory-protocol.md` for memory protocol.
4. Read `.agents/skills/_shared/quality-score.md` for continuous quality scoring.
5. Read `.agents/skills/_shared/experiment-ledger.md` for experiment tracking.
6. Read `.agents/skills/_shared/exploration-loop.md` for hypothesis-driven exploration.
7. Record session start using memory write tool:
   - Create `session-coordinate.md` in the memory base path
   - Include: session start time, user request summary.

---

## Step 1: Analyze Requirements

Analyze the user's request and identify involved domains (frontend, backend, mobile, QA).

- Single domain: suggest using the specific agent directly.
- Multiple domains: proceed to Step 2.
- Use MCP code analysis tools (`get_symbols_overview` or `search_for_pattern`) to understand the existing codebase structure relevant to the request.
- Report analysis results to the user.

---

## Step 2: Run PM Agent for Task Decomposition

// turbo
Activate PM Agent to:

1. Analyze requirements.
2. Define API contracts.
3. Create a prioritized task breakdown.
4. Save plan to `.agents/plan.json`.
5. Use memory write tool to record plan completion.

---

## Step 3: Review Plan with User

Present the PM Agent's task breakdown to the user:

- Priorities (P0, P1, P2)
- Agent assignments
- Dependencies
- **You MUST get user confirmation before proceeding to Step 4.** Do NOT proceed without confirmation.

---

## Step 4: Spawn Agents by Priority Tier

// turbo
Spawn agents using CLI for each task:

```bash
# Example: spawn backend and frontend in parallel
oh-my-ag agent:spawn backend "task description" session-id -w ./backend &
oh-my-ag agent:spawn frontend "task description" session-id -w ./frontend &
wait
```

1. Use spawn-agent.sh for each task (respects agent_cli_mapping from user-preferences.yaml)
2. Spawn all same-priority tasks in parallel using background processes
3. Assign separate workspaces to avoid file conflicts

---

## Step 5: Monitor Agent Progress

- Use memory read tool to poll `progress-{agent}.md` files
- Use MCP code analysis tools (`find_symbol` and `search_for_pattern`) to verify API contract alignment between agents
- Use memory edit tool to record monitoring results

---

## Step 6: Run QA Agent Review

After all implementation agents complete, spawn QA Agent to review all deliverables:

- Security (OWASP Top 10)
- Performance
- Accessibility (WCAG 2.1 AA)
- Code quality

---

## Step 6.1: Measure Quality Score

After QA review completes:

1. Measure Quality Score based on QA findings
2. Record as experiment in Experiment Ledger (`.agents/results/experiment-ledger.md`)
3. This becomes the baseline for issue remediation

---

## Step 7: Address Issues and Iterate

If QA finds CRITICAL or HIGH issues:

1. Re-spawn the responsible agent with QA findings.
2. After fix, re-measure Quality Score and calculate delta.
3. Apply Keep/Discard rule: only keep fixes that maintain or improve score.
4. Record each fix attempt in Experiment Ledger.
5. Repeat Steps 5-7.
6. **If same issue persists after 2 fix attempts**: Activate **Exploration Loop** (see `exploration-loop.md`):
   - Generate 2-3 alternative approaches
   - Re-spawn agents per hypothesis
   - QA scores each result
   - Best result adopted, others discarded
7. Continue until all critical issues are resolved.
8. Use memory write tool to record final results.
9. Generate Experiment Ledger summary and auto-generate lessons from discarded experiments.
