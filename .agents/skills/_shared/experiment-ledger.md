# Experiment Ledger

An automatic record of every significant change attempt and its measurable outcome.
Inspired by autoresearch's git-commit-as-experiment-log pattern — every attempt is tracked, not just successes.

---

## Why Track Experiments?

Without a ledger, teams only see the final result. The ledger captures:

1. **What was tried**: Hypothesis behind each change
2. **What worked**: Delta-positive changes (KEEP)
3. **What didn't**: Delta-negative changes (DISCARD) — equally valuable
4. **Accumulation proof**: Score trajectory shows compounding improvements
5. **Agent effectiveness**: Which agents produce the highest deltas

---

## Ledger Location

- **Active session**: `.agents/results/experiment-ledger.md`
- **Archived sessions**: `.agents/results/archive/ledger-{date}.md`

---

## Ledger Format

```markdown
# Experiment Ledger — Session {SESSION_ID}
Started: {ISO timestamp}
Request: "{original user request, first 100 chars}..."

## Experiments

| # | Phase | Agent | Hypothesis | Score Before | Score After | Delta | Decision | Files Changed |
|---|-------|-------|-----------|-------------|------------|-------|----------|---------------|
| 1 | IMPL | backend | REST API with pagination | — | 72 | — | BASELINE | 3 |
| 2 | VERIFY | qa | Add input validation | 72 | 78 | +6 | KEEP | 2 |
| 3 | REFINE | debug | Extract shared util | 78 | 80 | +2 | KEEP | 4 |
| 4 | REFINE | debug | Redis caching layer | 80 | 76 | -4 | DISCARD | 3 |
| 5 | REFINE | backend | Simpler in-memory cache | 80 | 84 | +4 | KEEP | 1 |

## Summary
- Total experiments: 5
- Kept: 3 (60%)
- Discarded: 1 (20%)
- Baseline: 1 (20%)
- Net score improvement: +12 (72 → 84)
- Most effective agent: backend (+4 avg delta)
```

---

## Recording Protocol

### Who Records

| Phase | Recorder | When |
|-------|----------|------|
| IMPL | Main agent / Orchestrator | After implementation complete |
| VERIFY | QA Agent | After each finding + fix cycle |
| REFINE | Debug Agent | After each refinement attempt |
| SHIP | QA Agent | Final score only |

### What Constitutes an "Experiment"

An experiment is recorded when:

1. **A discrete change is applied** (not individual line edits, but logical units)
2. **A quality score can be measured** before and after
3. **A keep/discard decision is made**

Do NOT record:
- Trivial formatting changes
- Changes with no measurable quality impact
- Phase 1 (PLAN) activities

### Recording Steps

1. **Before change**: Note current quality score (or estimate)
2. **Apply change**: Implement the modification
3. **After change**: Measure new quality score
4. **Calculate delta**: `score_after - score_before`
5. **Decision**: Apply Keep/Discard rule from `quality-score.md`
6. **Record**: Append row to ledger

---

## Ledger Analysis (Session End)

At session completion, the orchestrator or main agent generates a summary:

### Auto-Analysis Template

```markdown
## Ledger Analysis

### Score Trajectory
{phase}: {score} → {phase}: {score} → ... → Final: {score}

### Top Improvements (by delta)
1. Experiment #{N}: {hypothesis} → +{delta}
2. Experiment #{N}: {hypothesis} → +{delta}

### Failed Experiments (learning opportunities)
1. Experiment #{N}: {hypothesis} → {delta} — Lesson: {why it failed}

### Agent Effectiveness
| Agent | Experiments | Avg Delta | Keep Rate |
|-------|------------|-----------|-----------|
| backend | 3 | +4.0 | 67% |
| frontend | 2 | +2.5 | 100% |
| debug | 4 | +1.2 | 50% |
```

---

## Integration with Lessons Learned

Failed experiments (DISCARD) are valuable learning data. At session end:

1. **Extract** all DISCARD experiments from ledger
2. **Analyze** why score decreased (performance regression? test failure? security issue?)
3. **Auto-generate** lesson candidates in this format:

```markdown
### {date}: {agent} - {hypothesis} (DISCARDED, delta: {delta})
- **Problem**: {what was attempted}
- **Cause**: {why score decreased}
- **Lesson**: {what to avoid or do differently}
- **Source**: Experiment Ledger #{experiment_number}
```

4. **Append** to relevant section in `lessons-learned.md`

Only experiments with delta <= -5 trigger automatic lesson generation.

---

## Integration Points

| Component | How It Uses Experiment Ledger |
|-----------|------------------------------|
| **Quality Score** | Provides score measurements for delta calculation |
| **Exploration Loop** | Records parallel experiments and winner selection |
| **Session Metrics** | Experiment count and keep rate feed into session summary |
| **Lessons Learned** | DISCARD experiments auto-generate lesson candidates |
| **Phase Gates** | Score trajectory informs gate decisions |
