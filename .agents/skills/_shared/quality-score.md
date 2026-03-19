# Quality Score Continuum

Replaces binary PASS/FAIL gate evaluation with a **continuous quantitative score** (0-100).
Inspired by autoresearch's val_bpb metric — objective, comparable, and trackable over time.

---

## Why Continuous Scoring?

Binary gates tell you "pass or fail" but not "how good" or "getting better."
A continuous score enables:

1. **Delta-based decisions**: Keep changes only when score improves (autoresearch pattern)
2. **Trend tracking**: Quality trajectory across sessions
3. **Agent benchmarking**: Compare agent effectiveness over time
4. **Threshold tuning**: Adjust quality bar per project maturity

---

## Score Dimensions

| Dimension | Weight | Measurement | Source |
|-----------|--------|-------------|--------|
| **Correctness** | 0.30 | Test pass rate (passed / total) | `test` command exit + count |
| **Security** | 0.25 | OWASP check pass rate | QA Agent review |
| **Performance** | 0.15 | Response time / bundle size vs baseline | Benchmark or estimation |
| **Coverage** | 0.15 | Test coverage % | Coverage tool output |
| **Consistency** | 0.15 | Lint/type errors (inverse: 100 - error_count, min 0) | `lint` + `type-check` |

### Composite Score Formula

```
composite = (correctness * 0.30) + (security * 0.25) + (performance * 0.15)
          + (coverage * 0.15) + (consistency * 0.15)
```

---

## Score Thresholds

| Range | Grade | Gate Decision | Action |
|-------|-------|---------------|--------|
| 90-100 | A | PASS | Proceed immediately |
| 75-89 | B | CONDITIONAL PASS | Proceed with noted improvements |
| 60-74 | C | FAIL | Must improve before proceeding |
| 0-59 | D | HARD FAIL | Rollback, re-plan required |

---

## Scoring Protocol

### When to Score

Score is calculated at these checkpoints:

| Checkpoint | Phase | Scorer |
|------------|-------|--------|
| Pre-implementation baseline | IMPL start | Main agent (estimate or existing metrics) |
| Post-implementation | IMPL end | Main agent (run tests/lint) |
| Post-verification | VERIFY end | QA Agent |
| Post-refinement | REFINE end | Debug Agent |
| Final | SHIP | QA Agent (final) |

### How to Score

1. **Run automated checks** where available:
   ```
   - Tests: count passed/failed/total
   - Lint: count errors/warnings
   - Type check: count errors
   - Coverage: extract % from tool output
   ```

2. **Estimate manually** where automated tools unavailable:
   - Security: QA Agent assigns 0-100 based on OWASP checklist completion
   - Performance: Compare against known baselines or estimate

3. **Record** in session metrics (see Integration section below)

### Score Record Format

```markdown
### Quality Score @ {PHASE}_{checkpoint}
| Dimension | Score | Detail |
|-----------|-------|--------|
| Correctness | 85 | 17/20 tests pass |
| Security | 90 | No CRITICAL/HIGH, 1 MEDIUM |
| Performance | 75 | Estimated: no regression |
| Coverage | 70 | 70% line coverage |
| Consistency | 95 | 0 lint errors, 1 type warning |
| **Composite** | **83.5** | Grade: B |
```

---

## Delta-Based Decision Making

The core autoresearch insight: **changes are evaluated by their impact on the score, not just by whether they "look right."**

### Keep/Discard Rule

```
IF score_after >= score_before:
    KEEP change (commit)
ELSE IF score_after < score_before AND delta > -5:
    REVIEW — minor regression, may be acceptable with justification
ELSE:
    DISCARD change (revert)
```

### Delta Recording

Every change that modifies the score is recorded in the Experiment Ledger (see `experiment-ledger.md`):

```markdown
| Score Before | Score After | Delta | Decision |
|-------------|------------|-------|----------|
| 72 | 81 | +9 | KEEP |
```

---

## Integration Points

| Component | How It Uses Quality Score |
|-----------|--------------------------|
| **Phase Gates** | Gate criteria reference composite score threshold |
| **Experiment Ledger** | Records score delta per experiment |
| **Exploration Loop** | Compares scores across alternative approaches |
| **Session Metrics** | Tracks score progression through session |
| **Lessons Learned** | High-delta experiments auto-feed lessons |

---

## Dimension Customization

Projects can override weights in `.agents/config/quality-score.yaml` (optional):

```yaml
# Example: security-critical project
weights:
  correctness: 0.25
  security: 0.35
  performance: 0.10
  coverage: 0.15
  consistency: 0.15
thresholds:
  pass: 85        # Stricter than default 75
  hard_fail: 65   # Stricter than default 60
```

If config file is absent, use the defaults defined in this document.
