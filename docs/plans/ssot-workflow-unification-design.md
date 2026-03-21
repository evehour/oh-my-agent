# Design: SSOT Workflow & Agent Unification

> Status: Draft (v2 — Antigravity 검증 반영)
> Author: brainstorm session 2026-03-21
> Scope: `.agents/` → 워크플로우 통합 + 에이전트 추상화 + 벤더 감지
> Depends on: backend-stack-abstraction (완료)

---

## 1. Problem Statement

현재 `.agents/`가 SSOT라고 선언되어 있지만, 실제로는 **반쪽짜리 SSOT**:

| 구분 | SSOT 위치 | SSOT 여부 |
|:---|:---|:---|
| oma-* 도메인 Skills | `.agents/skills/oma-*/` | **O** — 3도구 공유 표준 |
| _shared 리소스 | `.agents/skills/_shared/` | **O** |
| 워크플로우 | `.agents/workflows/` + `.claude/skills/*/SKILL.md` | **X** — 이중 관리 |
| 에이전트 정의 | `.claude/agents/` only | **X** — Claude 전용, Codex/Gemini 미존재 |

구체적 문제:
- `.agents/workflows/orchestrate.md` (4,591B, Gemini용)와 `.claude/skills/orchestrate/SKILL.md` (3,455B, Claude용)가 **같은 워크플로우의 별도 파일**
- 하나를 수정하면 다른 쪽 **수동 동기화** 필요
- Codex 지원 추가 시 **3벌 유지보수**

## 2. Goal

`.agents/`를 진짜 SSOT로 만들어, 워크플로우와 에이전트 정의를 한 곳에서 관리.

### Success Criteria

- [ ] `.agents/workflows/*.md` 하나로 Claude Code, Codex, Gemini CLI, Antigravity 모두 대응
- [ ] `.agents/agents/`에 에이전트 추상 정의 존재, CLI가 벤더별 변환
- [ ] `.claude/skills/*/SKILL.md` 13개가 **얇은 라우터**로 전환 (독립 유지 X)
- [ ] 벤더 감지 이중 체크 (시스템 프롬프트 + 도구 존재) 동작 확인
- [ ] 메모리 이슈 "네이티브 서브에이전트 라우팅" 해결

## 3. Design

### 3.1 벤더 감지 메커니즘

검증 완료 (2026-03-21). 시스템 프롬프트 + 도구 이중 체크:

| 도구 | 시스템 프롬프트 | 고유 도구 |
|:---|:---|:---|
| Claude Code | "You are Claude Code" | `Agent` tool |
| Codex CLI | "You are a coding agent running in the Codex CLI" | `apply_patch` tool |
| Gemini CLI | `.agents/skills/` SKILL.md 자동 로드 | `@` 서브에이전트 구문 |
| Antigravity IDE | `.agents/skills/` SKILL.md 자동 로드 | Agent Manager (내장 에이전트만) |

워크플로우에 삽입할 감지 로직:

```markdown
## Vendor Detection (check in order, use first match)
1. System prompt contains "Claude Code" → **Claude mode**
2. System prompt contains "Codex CLI" → **Codex mode**
3. `Agent` tool available → **Claude mode**
4. `apply_patch` tool available → **Codex mode**
5. This file was auto-loaded from .agents/skills/ → **Gemini/Antigravity mode**
6. Fallback → **CLI spawn mode** (oh-my-ag agent:spawn)
```

### 3.2 도구별 기능 매트릭스 (검증 완료)

| 기능 | Claude Code | Codex CLI | Gemini CLI | Antigravity IDE |
|:---|:---|:---|:---|:---|
| `.agents/skills/` 로드 | 심링크 경유 | **네이티브** | **네이티브** | **네이티브** |
| 커스텀 서브에이전트 | `.claude/agents/*.md` | `.codex/agents/*.toml` | `.gemini/agents/*.md` | **미지원** |
| 네이티브 스폰 | Agent tool | 모델 매개 프롬프트 | `@name` 자동 위임 | **내장 에이전트만** (Browser, Terminal) |
| `oh-my-ag agent:spawn` | Bash 경유 | Bash 경유 | Bash 경유 | **유일한 서브에이전트 방법** |
| 에이전트 포맷 | Markdown (YAML) | **TOML** | Markdown (YAML) | N/A |

> **Antigravity 제약**: Agent Manager는 내장 에이전트(Browser, Terminal)만 자동 위임.
> 커스텀 서브에이전트는 "not available at this time" (2026-03 공식 포럼 확인).
> `.gemini/agents/`는 Gemini CLI 전용이며, Antigravity에서는 무시됨.

### 3.3 워크플로우 통합 구조

#### 핵심 전략: `.claude/skills/`는 삭제하지 않고 **얇은 라우터**로 전환

Claude Code 문서에 따르면 skill은 외부 파일을 참조할 수 있음.
3,455B짜리 독립 파일 → 1줄 참조 라우터로 전환.

#### Before (현재)

```
.agents/workflows/orchestrate.md        # Gemini CLI 전용 (4,591B)
.claude/skills/orchestrate/SKILL.md     # Claude Code 전용 (3,455B) — 독립 유지, 수동 동기화 필요
```

#### After

```
.agents/workflows/orchestrate.md        # SSOT — 벤더 공통 + 분기 섹션 포함

.claude/skills/orchestrate/SKILL.md     # 얇은 라우터 (삭제 안 함):
                                        # "Read and follow .agents/workflows/orchestrate.md"
```

#### `.claude/skills/orchestrate/SKILL.md` 라우터 예시

```markdown
---
name: orchestrate
description: Automated CLI-based parallel agent execution — spawn subagents, coordinate through MCP Memory, monitor progress, and run verification
disable-model-invocation: true
---

# /orchestrate

Read and follow `.agents/workflows/orchestrate.md` step by step.

Base directory for this skill: .claude/skills/orchestrate
```

이 방식의 장점:
- `.claude/skills/` 디렉토리 구조 유지 (하위 호환)
- git clone 직후 바로 사용 가능 (oma install 불필요)
- SSOT는 `.agents/workflows/` — 라우터는 변경될 일 없음
- 13개 워크플로우 모두 동일 패턴으로 전환

#### 통합 워크플로우 파일 구조

```markdown
---
description: Orchestrate — parallel multi-agent execution
---

# /orchestrate

## Vendor Detection (check in order, use first match)
1. System prompt contains "Claude Code" → **Claude mode**
2. System prompt contains "Codex CLI" → **Codex mode**
3. `Agent` tool available → **Claude mode**
4. `apply_patch` tool available → **Codex mode**
5. This file was auto-loaded → **Gemini/Antigravity mode**
6. Fallback → **CLI spawn mode**

## Step 0: Preparation
(공통 — 모든 벤더 동일)

## Step 1: Load or Create Plan
(공통)

## Step 2: Initialize Session
(공통)

## Step 3: Spawn Agents

### If Claude Code
Use the Agent tool to spawn subagents:
- Agent(subagent_type="backend-engineer", prompt="...", run_in_background=true)

### If Codex CLI
Request parallel subagent execution:
- Spawn backend and frontend agents in parallel

### If Gemini CLI (native subagents available)
Use @backend-engineer for native delegation, or:
- oh-my-ag agent:spawn backend "task" session-id -w ./backend &

### If Antigravity IDE or CLI Fallback
- oh-my-ag agent:spawn {agent_id} {prompt} {session_id} -w {workspace}
(Antigravity는 커스텀 서브에이전트 미지원 — CLI 스폰만 사용)

## Step 4: Monitor Progress
(공통 구조, MCP 도구 참조만 벤더별 차이)

## Step 5: Review & Merge
(공통)
```

### 3.4 에이전트 추상화

#### 현재 문제

에이전트 정의가 `.claude/agents/`에만 존재. Codex는 TOML 포맷, Gemini CLI는 MD 포맷.
Antigravity는 커스텀 에이전트 미지원.

#### 해결: `.agents/agents/`에 추상 원본

```
.agents/agents/
├── backend-engineer.md     # 추상 정의 (공통 Charter, Rules, Architecture)
├── frontend-engineer.md
├── db-engineer.md
├── debug-investigator.md
├── mobile-engineer.md
├── pm-planner.md
└── qa-reviewer.md
```

추상 에이전트 정의 포맷 (벤더 무관):

```markdown
---
name: backend-engineer
description: Backend implementation. Use for API, authentication, DB migration work.
skills:
  - oma-backend
---

You are a Backend Specialist. Detect the project's language and framework
from project files before writing code.

## Charter Preflight (MANDATORY)
...

## Architecture
Router → Service → Repository → Models

## Rules
1. Stay in scope
2. Write tests for all new code
...
```

CLI `oma install`이 벤더별 변환:

```
.claude/agents/backend-engineer.md    ← 추상 원본 + Claude frontmatter (model: sonnet, tools: Read, Write, Edit, Bash, Grep, Glob)
.codex/agents/backend-engineer.toml   ← 추상 원본 → TOML 변환 (name, description, developer_instructions)
.gemini/agents/backend-engineer.md    ← 추상 원본 + Gemini frontmatter (model, tools)
```

> **Note**: `.gemini/agents/`는 Gemini CLI에서만 유효.
> Antigravity에서는 `oh-my-ag agent:spawn`을 통해 에이전트가 실행되므로,
> `.gemini/agents/` 파일은 무시됨.

### 3.5 CLI 변경

#### installClaudeSkills() 확장 → installVendorAdaptations()

```typescript
export function installVendorAdaptations(
  sourceDir: string,
  targetDir: string,
  vendors: VendorType[],
): void {
  const workflowsDir = join(sourceDir, ".agents", "workflows");
  const agentsDir = join(sourceDir, ".agents", "agents");

  for (const vendor of vendors) {
    switch (vendor) {
      case "claude":
        // 워크플로우 → .claude/skills/*/SKILL.md 라우터 생성
        installClaudeWorkflowRouters(workflowsDir, targetDir);
        // 에이전트 → .claude/agents/*.md 변환 (frontmatter 추가)
        installClaudeAgents(agentsDir, targetDir);
        break;
      case "codex":
        // 에이전트 → .codex/agents/*.toml 변환
        installCodexAgents(agentsDir, targetDir);
        break;
      case "gemini":
        // 에이전트 → .gemini/agents/*.md 복사 (Gemini CLI용, Antigravity는 무시)
        installGeminiAgents(agentsDir, targetDir);
        break;
    }
  }
}
```

#### Claude 워크플로우 라우터 생성

```typescript
function installClaudeWorkflowRouters(
  workflowsDir: string,
  targetDir: string,
): void {
  const workflows = readdirSync(workflowsDir)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"));

  for (const file of workflows) {
    const name = file.replace(".md", "");
    const frontmatter = parseFrontmatter(
      readFileSync(join(workflowsDir, file), "utf-8")
    );
    const routerContent = `---
name: ${name}
description: ${frontmatter.description || name}
disable-model-invocation: true
---

# /${name}

Read and follow \`.agents/workflows/${file}\` step by step.
`;
    const skillDir = join(targetDir, ".claude", "skills", name);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), routerContent);
  }
}
```

#### 에이전트 TOML 변환 (Codex용)

```typescript
function convertAgentToToml(mdContent: string): string {
  const { frontmatter, body } = parseFrontmatter(mdContent);
  const skills = frontmatter.skills
    ? frontmatter.skills.map((s: string) =>
        `\n[[skills.config]]\npath = ".agents/skills/${s}/SKILL.md"\nenabled = true`
      ).join("")
    : "";

  return `name = "${frontmatter.name}"
description = "${frontmatter.description}"
developer_instructions = """
${body.trim()}
"""
${skills}
`;
}
```

### 3.6 네이티브 서브에이전트 라우팅 (메모리 이슈 해결)

통합 워크플로우의 벤더별 분기가 자동으로 네이티브 라우팅을 해결:

```
Claude Code에서 /orchestrate 실행:
  → SKILL.md 라우터 → .agents/workflows/orchestrate.md 읽기
  → 벤더 감지: "Claude Code"
  → Step 3 Claude 섹션 실행
  → Agent tool로 .claude/agents/backend-engineer.md 스폰 (네이티브!)

Codex에서 /orchestrate 실행:
  → .agents/skills/ 또는 AGENTS.md에서 워크플로우 로드
  → 벤더 감지: "Codex CLI"
  → Step 3 Codex 섹션 실행
  → Codex 네이티브 서브에이전트 사용

Gemini CLI에서 /orchestrate 실행:
  → .agents/skills/ 에서 SKILL.md 자동 로드
  → 벤더 감지: "Gemini"
  → Step 3 Gemini 섹션 실행
  → @backend-engineer 네이티브 위임 또는 oh-my-ag agent:spawn

Antigravity IDE에서 /orchestrate 실행:
  → .agents/skills/ 에서 SKILL.md 자동 로드
  → 벤더 감지: Gemini/Antigravity mode
  → Step 3 Antigravity 섹션 실행
  → oh-my-ag agent:spawn만 사용 (커스텀 서브에이전트 미지원)
```

user-preferences.yaml의 `agent_cli_mapping`도 존중:

```markdown
### Step 3.1: Check agent_cli_mapping (CLI spawn only)
If the current vendor matches the agent's mapped vendor → use native spawn
Otherwise → use oh-my-ag agent:spawn with the mapped vendor
```

## 4. Migration Plan

### Phase 1: 에이전트 추상화

1. `.agents/agents/` 디렉토리 생성
2. `.claude/agents/*.md`에서 공통 부분 추출 → `.agents/agents/`에 저장
3. `.claude/agents/*.md`를 CLI 생성 파생물로 전환
4. CLI `installVendorAdaptations()` 구현

### Phase 2: 워크플로우 통합

1. `.agents/workflows/*.md` 12개에 벤더 감지 + 분기 섹션 추가
2. `.claude/skills/*/SKILL.md` 13개를 얇은 라우터로 전환
3. 통합 테스트 — Claude Code에서 라우터 → 워크플로우 → 벤더 분기 동작 확인

### Phase 3: Codex/Gemini 에이전트 지원

1. TOML 변환 로직 구현 (Codex용)
2. `.codex/agents/` 생성 로직 구현
3. `.gemini/agents/` 생성 로직 구현 (Gemini CLI 전용, Antigravity 무시)
4. CLI `oma install`에 Codex/Gemini 옵션 추가

### Phase 4: 테스트 + 문서

1. 벤더 감지 통합 테스트
2. 에이전트 변환 단위 테스트 (MD → TOML)
3. 라우터 생성 단위 테스트
4. 문서 업데이트 (docs/, web/, README)

## 5. Impact Analysis

### 변경 파일

| 파일 | 변경 유형 |
|:---|:---|
| `.agents/agents/*.md` (7개) | 신규 — 추상 에이전트 정의 |
| `.agents/workflows/*.md` (12개) | 수정 — 벤더 감지 + 분기 섹션 추가 |
| `.claude/skills/*/SKILL.md` (13개) | **라우터로 전환** (삭제 안 함) |
| `.claude/agents/*.md` (7개) | CLI 생성 파생물로 전환 |
| `cli/lib/skills.ts` | 수정 — installVendorAdaptations() |
| `cli/commands/install.ts` | 수정 — 벤더 선택 확장 |
| `cli/commands/update.ts` | 수정 — 에이전트/라우터 재생성 |
| `CLAUDE.md` | 수정 — SSOT 구조 업데이트 |

### 영향 없는 파일

- `.agents/skills/oma-*/` — 이미 SSOT, 변경 불필요
- `.agents/skills/_shared/` — 변경 불필요
- `.agents/config/` — 변경 불필요

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|:---|:---|:---|
| 벤더 감지 실패 | 다른 벤더 지시 실행 | 이중 체크 (프롬프트 + 도구) + Fallback to CLI spawn |
| 통합 워크플로우 파일 비대 | 컨텍스트 낭비 | 벤더별 섹션을 최소화, 공통 부분 극대화 |
| TOML 변환 오류 | Codex 에이전트 로드 실패 | 단위 테스트 + 실제 Codex CLI 검증 |
| 라우터 참조 경로 깨짐 | 워크플로우 로드 실패 | 상대경로 대신 프로젝트 루트 기준 경로 사용 |
| Antigravity 커스텀 에이전트 미지원 | Antigravity에서 네이티브 스폰 불가 | CLI spawn fallback (현재와 동일, 회귀 없음) |

## 7. Resolved Questions

### Q1. `.claude/skills/*/SKILL.md`를 삭제할 것인가?
**→ 삭제 안 함.** 얇은 라우터로 전환.
- 라우터: "Read and follow `.agents/workflows/{name}.md`" (1줄)
- SSOT는 `.agents/workflows/` — 라우터는 변경될 일 없음
- git clone 직후 바로 사용 가능 (하위 호환)

### Q2. Codex `developer_instructions`에 뭘 넣을 것인가?
**→ 에이전트용은 워크플로우 전체 인라인, 스킬 참조 병행.**
- `.codex/agents/*.toml`의 `developer_instructions`에 에이전트 본문 인라인
- 워크플로우는 `.agents/skills/`에서 Codex가 네이티브 로드 (SKILL.md 표준)
- `skills.config`로 추가 스킬 참조

### Q3. Gemini CLI에서 `.gemini/agents/`를 사용할 것인가?
**→ 사용하되 Gemini CLI 전용.** Antigravity에서는 무시됨.
- Gemini CLI: `.gemini/agents/` + `@name` 네이티브 위임
- Antigravity: `oh-my-ag agent:spawn`만 사용 (커스텀 서브에이전트 미지원)
- 두 경로 모두 워크플로우에서 벤더 감지로 분기

## 8. Vendor-Specific Notes

### Antigravity IDE 제약사항 (2026-03 확인)

- **Agent Manager**: Mission Control 대시보드에서 내장 에이전트(Browser, Terminal)만 자동 위임
- **커스텀 서브에이전트**: "not available at this time" (공식 포럼 확인)
- **스킬**: `.agents/skills/` 네이티브 로드 지원 ✅
- **서브에이전트 스폰**: `oh-my-ag agent:spawn`이 유일한 방법
- **영향**: 워크플로우의 Antigravity 분기에서 항상 CLI spawn 사용. 회귀 없음 (현재와 동일)

### Codex CLI 참고사항

- **에이전트 포맷**: TOML (다른 도구와 다름 — 변환 필요)
- **스킬**: `.agents/skills/` 네이티브 지원
- **`AGENT=codex` 환경변수**: 제안 중 (github.com/openai/codex/issues/13416), 미머지
- **`CODEX_CI=1`**: 이미 UNIFIED_EXEC_ENV에 설정됨

## 9. Documentation Updates (구현 완료 후)

| 문서 | 반영 내용 |
|:---|:---|
| `CLAUDE.md` | SSOT 구조 업데이트, 라우터 패턴 설명 |
| `README.md` + 11개 번역 | 벤더 지원 확장 (Codex, Gemini CLI) 안내, Antigravity 제약 명시 |
| `docs/AGENTS_SPEC.md` | 에이전트 추상화 구조, 벤더 변환 설명, 라우터 패턴 |
| `docs/SUPPORTED_AGENTS.md` | 벤더별 에이전트 포맷 설명 |
| `web/content/*/` | 관련 페이지 업데이트 |
