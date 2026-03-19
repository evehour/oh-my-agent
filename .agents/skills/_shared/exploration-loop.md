# Exploration Loop (Hypothesis-Driven)

Transforms the reactive "fix what's broken" pattern into a proactive "explore alternatives, pick the best" pattern.
Inspired by autoresearch's continuous hypothesis → experiment → evaluate → keep/discard loop.

---

## Why Explore Instead of Just Fix?

The current Issue Remediation Loop works like this:
```
QA finds issue → Agent fixes issue → QA re-checks → Repeat
```

This is **reactive**: it only corrects the first approach. It never asks "is there a better approach?"

The Exploration Loop works like this:
```
Issue found → Generate N hypotheses → Experiment each → Measure scores → Keep best
```

This is **proactive**: it discovers the optimal solution among alternatives.

---

## When to Activate

The Exploration Loop is NOT for every situation. Activate when:

| Condition | Example |
|-----------|---------|
| **VERIFY_GATE fails twice** on the same issue | Security fix keeps breaking tests |
| **Quality Score delta is negative** after a fix attempt | Fixing performance regresses correctness |
| **Multiple valid approaches exist** and the best isn't obvious | REST vs GraphQL, SQL vs NoSQL |
| **User explicitly requests** exploration | "Try a few approaches and pick the best" |

Do NOT activate for:
- Simple bug fixes with obvious solutions
- First-attempt implementations (try the standard approach first)
- Trivial changes (formatting, naming)

---

## Exploration Protocol

### Step 1: Hypothesize

Generate 2-3 alternative approaches. Use the reasoning template:

```markdown
=== Exploration: {problem description} ===

Current approach: {what was tried and why it's insufficient}
Current score: {quality score before exploration}

Hypothesis A: {approach description}
  - Expected impact: {which score dimensions improve/regress}
  - Risk: {what could go wrong}
  - Scope: {files to modify}

Hypothesis B: {approach description}
  - Expected impact: {which score dimensions improve/regress}
  - Risk: {what could go wrong}
  - Scope: {files to modify}

Hypothesis C (optional): {approach description}
  - Expected impact: ...
```

### Step 2: Experiment

Execute each hypothesis in isolation:

**In multi-agent mode** (orchestrate/coordinate):
- Spawn separate agents per hypothesis (parallel execution)
- Each agent works in its own workspace/worktree
- Agents are unaware of each other's approach

**In single-agent mode** (ultrawork inline):
- Execute sequentially: try A, measure, revert, try B, measure, revert
- Use git stash or branch per experiment
- Keep all measurements for comparison

### Step 3: Measure

Score each experiment using the Quality Score protocol:

```markdown
### Exploration Results

| Hypothesis | Composite Score | Correctness | Security | Performance | Coverage | Consistency |
|-----------|----------------|-------------|----------|-------------|----------|-------------|
| A | 82 | 85 | 90 | 70 | 75 | 90 |
| B | 87 | 90 | 85 | 85 | 80 | 95 |
| C | 78 | 95 | 60 | 80 | 75 | 90 |

Winner: Hypothesis B (score: 87, delta from current: +15)
```

### Step 4: Select

Apply the selection rule:

```
best = max(scores)

IF best.score > current_score:
    KEEP best hypothesis
    DISCARD others
    Record all experiments in Experiment Ledger
ELSE:
    KEEP current approach (no exploration result improved it)
    Record as "exploration inconclusive"
    ESCALATE to user for guidance
```

### Step 5: Record

Log all experiments in the Experiment Ledger, including discarded ones:

```markdown
| # | Phase | Agent | Hypothesis | Score Before | Score After | Delta | Decision |
|---|-------|-------|-----------|-------------|------------|-------|----------|
| 4 | EXPLORE | backend-A | Lazy loading | 72 | 82 | +10 | DISCARD (not best) |
| 5 | EXPLORE | backend-B | Prefetch + cache | 72 | 87 | +15 | KEEP (winner) |
| 6 | EXPLORE | backend-C | Stream response | 72 | 78 | +6 | DISCARD (not best) |
```

---

## Exploration Constraints

To prevent unbounded exploration:

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Max hypotheses | 3 | Diminishing returns beyond 3 |
| Max exploration rounds per session | 2 | Avoid infinite exploration |
| Max turns per experiment | 10 | Scope-limit each attempt |
| Min score gap to justify exploration | 5 points | Don't explore if current score is close to threshold |

---

## Integration with Workflows

### In `/ultrawork`

```
VERIFY_GATE fails (2nd time on same issue)
  → Activate Exploration Loop
  → Generate hypotheses based on QA findings
  → Experiment (sequential, inline agent)
  → Select winner
  → Resume VERIFY with winning approach
```

### In `/orchestrate`

```
Agent verification fails after retry
  → Activate Exploration Loop
  → Spawn parallel agents per hypothesis
  → Collect results, score each
  → Keep winner, discard others
  → Continue orchestration
```

### In `/coordinate`

```
Issue Remediation Loop stalls (same issue persists after fix)
  → Activate Exploration Loop
  → Re-spawn agent with alternative approaches
  → QA scores each result
  → Best result adopted
```

---

## Exploration Reasoning Template

Add to `reasoning-templates.md` reference:

```
=== Exploration Decision ===

Problem: {what needs to be solved}
Current Score: {composite score}
Attempts So Far: {count and outcomes}

Hypothesis A: {approach}
  Predicted Score: {estimate}
  Confidence: HIGH / MEDIUM / LOW

Hypothesis B: {approach}
  Predicted Score: {estimate}
  Confidence: HIGH / MEDIUM / LOW

Selection Criteria: Highest composite score with confidence >= MEDIUM
Fallback: If all LOW confidence, escalate to user
```

---

## Integration Points

| Component | How It Uses Exploration Loop |
|-----------|----------------------------|
| **Quality Score** | Provides measurement for hypothesis comparison |
| **Experiment Ledger** | Records all hypotheses (kept and discarded) |
| **Phase Gates** | Triggers exploration on repeated gate failures |
| **Session Metrics** | Exploration rounds count toward session complexity |
| **Reasoning Templates** | Provides structured format for hypothesis generation |
