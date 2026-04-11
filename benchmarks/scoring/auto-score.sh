#!/usr/bin/env bash
# auto-score.sh — Automated scoring for AI coding harness benchmark
# Usage: ./auto-score.sh <project-dir> <harness-id> > auto-score-{harness}.json

set -uo pipefail

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <project-dir> <harness-id>" >&2
  exit 1
fi

PROJECT_DIR="$(cd "$1" 2>/dev/null && pwd)" || { echo "ERROR: '$1' is not a valid directory" >&2; exit 1; }
HARNESS_ID="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKLIST="$SCRIPT_DIR/checklist.json"
LOG_FILE="$PROJECT_DIR/auto-score.log"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [[ ! -f "$CHECKLIST" ]]; then
  echo "ERROR: checklist.json not found at $CHECKLIST" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Read max values from checklist.json
# ---------------------------------------------------------------------------
get_max() {
  local id="$1"
  jq -r --arg id "$id" \
    '.categories[].items[] | select(.id == $id) | .max' \
    "$CHECKLIST"
}

MAX_SETUP_NEXTJS="$(get_max setup-nextjs)"
MAX_SETUP_TAILWIND="$(get_max setup-tailwind)"
MAX_SETUP_R3F="$(get_max setup-r3f)"
MAX_SETUP_BUILD="$(get_max setup-build)"
MAX_AI_API="$(get_max ai-api)"
MAX_TEST_EXISTS="$(get_max test-exists)"
MAX_TEST_PASS="$(get_max test-pass)"
MAX_TEST_COVERAGE="$(get_max test-coverage)"

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log() {
  echo "[$(date -u +"%H:%M:%S")] $*" >> "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Result accumulation
# ---------------------------------------------------------------------------
declare -A PASS SCORE MAX EVIDENCE
ERRORS=()

set_result() {
  local id="$1" pass="$2" score="$3" max="$4" evidence="$5"
  PASS[$id]="$pass"
  SCORE[$id]="$score"
  MAX[$id]="$max"
  EVIDENCE[$id]="$evidence"
}

add_error() {
  ERRORS+=("$1")
}

# ---------------------------------------------------------------------------
# Early exit: no package.json
# ---------------------------------------------------------------------------
PKG_JSON="$PROJECT_DIR/package.json"

if [[ ! -f "$PKG_JSON" ]]; then
  log "ERROR: package.json not found in $PROJECT_DIR"
  for id in setup-nextjs setup-tailwind setup-r3f setup-build ai-api test-exists test-pass test-coverage; do
    max_var="MAX_$(echo "$id" | tr '[:lower:]-' '[:upper:]_')"
    set_result "$id" false 0 "${!max_var}" "package.json not found"
  done
  add_error "package.json not found in $PROJECT_DIR — all auto-checks scored 0"
else

# ---------------------------------------------------------------------------
# CHECK: setup-nextjs
# ---------------------------------------------------------------------------
log "Check: setup-nextjs"
next_version="$(jq -r '(.dependencies // {}) * (.devDependencies // {}) | .["next"] // empty' "$PKG_JSON" 2>>"$LOG_FILE")"
if [[ -n "$next_version" ]]; then
  set_result "setup-nextjs" true "$MAX_SETUP_NEXTJS" "$MAX_SETUP_NEXTJS" "next@${next_version}"
  log "setup-nextjs: PASS (next@${next_version})"
else
  set_result "setup-nextjs" false 0 "$MAX_SETUP_NEXTJS" "not found"
  log "setup-nextjs: FAIL"
fi

# ---------------------------------------------------------------------------
# CHECK: setup-tailwind
# ---------------------------------------------------------------------------
log "Check: setup-tailwind"
tailwind_version="$(jq -r '(.dependencies // {}) * (.devDependencies // {}) | .["tailwindcss"] // empty' "$PKG_JSON" 2>>"$LOG_FILE")"
if [[ -n "$tailwind_version" ]]; then
  set_result "setup-tailwind" true "$MAX_SETUP_TAILWIND" "$MAX_SETUP_TAILWIND" "tailwindcss@${tailwind_version}"
  log "setup-tailwind: PASS (tailwindcss@${tailwind_version})"
else
  set_result "setup-tailwind" false 0 "$MAX_SETUP_TAILWIND" "not found"
  log "setup-tailwind: FAIL"
fi

# ---------------------------------------------------------------------------
# CHECK: setup-r3f
# ---------------------------------------------------------------------------
log "Check: setup-r3f"
r3f_version="$(jq -r '(.dependencies // {}) * (.devDependencies // {}) | .["@react-three/fiber"] // empty' "$PKG_JSON" 2>>"$LOG_FILE")"
drei_version="$(jq -r '(.dependencies // {}) * (.devDependencies // {}) | .["@react-three/drei"] // empty' "$PKG_JSON" 2>>"$LOG_FILE")"
if [[ -n "$r3f_version" && -n "$drei_version" ]]; then
  set_result "setup-r3f" true "$MAX_SETUP_R3F" "$MAX_SETUP_R3F" "@react-three/fiber@${r3f_version} @react-three/drei@${drei_version}"
  log "setup-r3f: PASS"
else
  missing=""
  [[ -z "$r3f_version" ]]  && missing="@react-three/fiber"
  [[ -z "$drei_version" ]] && missing="${missing:+$missing, }@react-three/drei"
  set_result "setup-r3f" false 0 "$MAX_SETUP_R3F" "missing: $missing"
  log "setup-r3f: FAIL (missing: $missing)"
fi

# ---------------------------------------------------------------------------
# CHECK: setup-build
# ---------------------------------------------------------------------------
log "Check: setup-build"
BUILD_START="$(date +%s)"
build_output="$(
  timeout 300 bash -c "cd $(printf '%q' "$PROJECT_DIR") && npm install && npm run build" \
    >>"$LOG_FILE" 2>>"$LOG_FILE"
  echo $?
)"
build_exit="${build_output##*$'\n'}"
BUILD_END="$(date +%s)"
BUILD_ELAPSED=$(( BUILD_END - BUILD_START ))

if [[ "$build_exit" == "0" ]]; then
  set_result "setup-build" true "$MAX_SETUP_BUILD" "$MAX_SETUP_BUILD" "exit 0 in ${BUILD_ELAPSED}s"
  log "setup-build: PASS (${BUILD_ELAPSED}s)"
elif [[ "$build_exit" == "124" ]]; then
  set_result "setup-build" false 0 "$MAX_SETUP_BUILD" "timeout after 300s"
  add_error "setup-build: timed out after 300s"
  log "setup-build: TIMEOUT"
else
  set_result "setup-build" false 0 "$MAX_SETUP_BUILD" "exit ${build_exit} in ${BUILD_ELAPSED}s"
  log "setup-build: FAIL (exit $build_exit)"
fi

# ---------------------------------------------------------------------------
# CHECK: ai-api
# ---------------------------------------------------------------------------
log "Check: ai-api"
SRC_DIR="$PROJECT_DIR/src"
if [[ -d "$SRC_DIR" ]]; then
  ai_match="$(timeout 300 grep -r "openai\|@anthropic-ai/sdk" "$SRC_DIR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l 2>>"$LOG_FILE" | head -1)"
  ai_grep_exit=$?
  if [[ $ai_grep_exit -eq 124 ]]; then
    set_result "ai-api" false 0 "$MAX_AI_API" "timeout after 300s"
    add_error "ai-api: grep timed out after 300s"
    log "ai-api: TIMEOUT"
  elif [[ -n "$ai_match" ]]; then
    ai_match_rel="${ai_match#$PROJECT_DIR/}"
    set_result "ai-api" true "$MAX_AI_API" "$MAX_AI_API" "found in $ai_match_rel"
    log "ai-api: PASS ($ai_match_rel)"
  else
    set_result "ai-api" false 0 "$MAX_AI_API" "not found"
    log "ai-api: FAIL"
  fi
else
  set_result "ai-api" false 0 "$MAX_AI_API" "src/ directory not found"
  log "ai-api: FAIL (no src/ directory)"
fi

# ---------------------------------------------------------------------------
# CHECK: test-exists
# ---------------------------------------------------------------------------
log "Check: test-exists"
test_files="$(timeout 300 find "$PROJECT_DIR" \
  \( -name "*.test.*" -o -name "*.spec.*" \) \
  -not -path "*/node_modules/*" \
  2>>"$LOG_FILE")"
find_exit=$?

if [[ $find_exit -eq 124 ]]; then
  set_result "test-exists" false 0 "$MAX_TEST_EXISTS" "timeout after 300s"
  add_error "test-exists: find timed out after 300s"
  log "test-exists: TIMEOUT"
else
  test_count=0
  if [[ -n "$test_files" ]]; then
    test_count="$(echo "$test_files" | wc -l | tr -d ' ')"
  fi
  if [[ "$test_count" -gt 0 ]]; then
    set_result "test-exists" true "$MAX_TEST_EXISTS" "$MAX_TEST_EXISTS" "${test_count} test file(s)"
    log "test-exists: PASS ($test_count files)"
  else
    set_result "test-exists" false 0 "$MAX_TEST_EXISTS" "0 test files found"
    log "test-exists: FAIL"
  fi
fi

# ---------------------------------------------------------------------------
# CHECK: test-pass
# ---------------------------------------------------------------------------
log "Check: test-pass"
TEST_START="$(date +%s)"
timeout 300 bash -c "cd $(printf '%q' "$PROJECT_DIR") && npm test -- --passWithNoTests" \
  >>"$LOG_FILE" 2>>"$LOG_FILE"
test_exit=$?
TEST_END="$(date +%s)"
TEST_ELAPSED=$(( TEST_END - TEST_START ))

if [[ $test_exit -eq 124 ]]; then
  set_result "test-pass" false 0 "$MAX_TEST_PASS" "timeout after 300s"
  add_error "test-pass: npm test timed out after 300s"
  log "test-pass: TIMEOUT"
elif [[ $test_exit -eq 0 ]]; then
  set_result "test-pass" true "$MAX_TEST_PASS" "$MAX_TEST_PASS" "exit 0 in ${TEST_ELAPSED}s"
  log "test-pass: PASS (${TEST_ELAPSED}s)"
else
  set_result "test-pass" false 0 "$MAX_TEST_PASS" "exit ${test_exit} in ${TEST_ELAPSED}s"
  log "test-pass: FAIL (exit $test_exit)"
fi

# ---------------------------------------------------------------------------
# CHECK: test-coverage
# ---------------------------------------------------------------------------
log "Check: test-coverage"
COV_START="$(date +%s)"
cov_raw="$(timeout 300 bash -c "cd $(printf '%q' "$PROJECT_DIR") && npm test -- --coverage --passWithNoTests" \
  2>>"$LOG_FILE")"
cov_exit=$?
COV_END="$(date +%s)"
COV_ELAPSED=$(( COV_END - COV_START ))
log "coverage raw output length: ${#cov_raw}"

if [[ $cov_exit -eq 124 ]]; then
  set_result "test-coverage" false 0 "$MAX_TEST_COVERAGE" "timeout after 300s"
  add_error "test-coverage: npm test --coverage timed out after 300s"
  log "test-coverage: TIMEOUT"
elif [[ $cov_exit -ne 0 ]]; then
  set_result "test-coverage" false 0 "$MAX_TEST_COVERAGE" "exit ${cov_exit} — coverage run failed"
  log "test-coverage: FAIL (exit $cov_exit)"
else
  # Parse overall coverage percentage from output lines like:
  #   All files  |   67.34 |   50.00 |   80.00 |   67.34 |
  # or from json summary if present
  cov_pct=""

  # Try lcov-style text output first (vitest / jest --text reporter)
  cov_line="$(echo "$cov_raw" | grep -E "^All files\s*\|" | head -1)"
  if [[ -n "$cov_line" ]]; then
    cov_pct="$(echo "$cov_line" | awk -F'|' '{print $2}' | tr -d ' %')"
  fi

  # Fallback: look for "Statements" line from istanbul text table
  if [[ -z "$cov_pct" ]]; then
    cov_pct="$(echo "$cov_raw" | grep -E "Statements\s*:" | head -1 | grep -oE '[0-9]+\.[0-9]+' | head -1)"
  fi

  # Fallback: look for coverage-summary.json
  cov_summary="$PROJECT_DIR/coverage/coverage-summary.json"
  if [[ -z "$cov_pct" && -f "$cov_summary" ]]; then
    cov_pct="$(jq -r '.total.statements.pct // empty' "$cov_summary" 2>>"$LOG_FILE")"
  fi

  if [[ -n "$cov_pct" ]]; then
    # Strip trailing % if present, compare numerically
    cov_num="${cov_pct//%/}"
    cov_int="${cov_num%%.*}"
    if [[ "$cov_int" -gt 0 ]] 2>/dev/null; then
      set_result "test-coverage" true "$MAX_TEST_COVERAGE" "$MAX_TEST_COVERAGE" "${cov_num}%"
      log "test-coverage: PASS (${cov_num}%)"
    else
      set_result "test-coverage" false 0 "$MAX_TEST_COVERAGE" "coverage is 0%"
      log "test-coverage: FAIL (0%)"
    fi
  else
    # Could not parse coverage but command exited 0 — treat as > 0% if test-pass also passed
    if [[ "${PASS[test-pass]:-false}" == "true" ]]; then
      set_result "test-coverage" true "$MAX_TEST_COVERAGE" "$MAX_TEST_COVERAGE" "coverage output unparseable but exit 0"
      log "test-coverage: PASS (unparseable, inferred from exit 0)"
    else
      set_result "test-coverage" false 0 "$MAX_TEST_COVERAGE" "coverage output unparseable"
      log "test-coverage: FAIL (unparseable)"
    fi
  fi
fi

fi  # end of package.json block

# ---------------------------------------------------------------------------
# Compute totals
# ---------------------------------------------------------------------------
AUTO_TOTAL=0
AUTO_MAX=0

for id in setup-nextjs setup-tailwind setup-r3f setup-build ai-api test-exists test-pass test-coverage; do
  AUTO_TOTAL="$(echo "$AUTO_TOTAL + ${SCORE[$id]:-0}" | bc)"
  AUTO_MAX="$(echo "$AUTO_MAX + ${MAX[$id]:-0}" | bc)"
done

# ---------------------------------------------------------------------------
# Build JSON output
# ---------------------------------------------------------------------------
build_check_json() {
  local id="$1"
  local pass="${PASS[$id]:-false}"
  local score="${SCORE[$id]:-0}"
  local max="${MAX[$id]:-0}"
  local evidence="${EVIDENCE[$id]:-unknown}"

  jq -n \
    --argjson pass "$pass" \
    --argjson score "$score" \
    --argjson max "$max" \
    --arg evidence "$evidence" \
    '{pass: $pass, score: $score, max: $max, evidence: $evidence}'
}

# Build errors JSON array
errors_json="$(printf '%s\n' "${ERRORS[@]+"${ERRORS[@]}"}" | jq -R . | jq -s .)"

jq -n \
  --arg harness "$HARNESS_ID" \
  --arg project_dir "$PROJECT_DIR" \
  --arg timestamp "$TIMESTAMP" \
  --argjson nextjs    "$(build_check_json setup-nextjs)" \
  --argjson tailwind  "$(build_check_json setup-tailwind)" \
  --argjson r3f       "$(build_check_json setup-r3f)" \
  --argjson build     "$(build_check_json setup-build)" \
  --argjson ai_api    "$(build_check_json ai-api)" \
  --argjson texists   "$(build_check_json test-exists)" \
  --argjson tpass     "$(build_check_json test-pass)" \
  --argjson tcoverage "$(build_check_json test-coverage)" \
  --argjson total "$AUTO_TOTAL" \
  --argjson max "$AUTO_MAX" \
  --argjson errors "$errors_json" \
  '{
    harness: $harness,
    project_dir: $project_dir,
    timestamp: $timestamp,
    checks: {
      "setup-nextjs":   $nextjs,
      "setup-tailwind": $tailwind,
      "setup-r3f":      $r3f,
      "setup-build":    $build,
      "ai-api":         $ai_api,
      "test-exists":    $texists,
      "test-pass":      $tpass,
      "test-coverage":  $tcoverage
    },
    auto_score_total: $total,
    auto_score_max: $max,
    errors: $errors
  }'
