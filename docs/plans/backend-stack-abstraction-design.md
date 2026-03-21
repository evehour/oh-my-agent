# Design: Backend Skill Stack Abstraction

> Status: Draft
> Author: brainstorm session 2026-03-21
> Scope: `oma-backend` skill + CLI install/update + `/stack-set` workflow

---

## 1. Problem Statement

현재 `oma-backend` 스킬은 Python/FastAPI/SQLAlchemy에 강결합되어 있다.
SKILL.md 본문에 Python DI 예제, Pydantic 검증, Ruff 린터 등이 인라인되어 있고,
리소스 파일(`snippets.md`, `tech-stack.md`, `api-template.py`)도 전부 Python 전용이다.

이로 인해:
- Python 이외의 백엔드 프로젝트에서는 oma-backend가 **오히려 방해**가 된다.
- 새 언어를 지원하려면 별도 스킬을 만들거나 fork해야 한다.
- LLM이 프로젝트 코드(Cargo.toml, package.json 등)와 SKILL.md 사이에서 **충돌하는 지시**를 받는다.

## 2. Goal

`oma-backend`를 **언어무관 추상 인터페이스**로 리팩터하여,
어떤 백엔드 언어/프레임워크에서든 동일한 아키텍처 원칙을 적용할 수 있게 한다.

### Success Criteria

- [ ] 추상 SKILL.md에 특정 언어/프레임워크 명시가 **0건**
- [ ] 기존 Python 사용자의 경험이 **동일하게 유지**됨 (stack/ 프리셋)
- [ ] `/stack-set` 워크플로우로 **임의의 언어**를 구체화할 수 있음
- [ ] `oma install` 시 언어 선택 프롬프트가 동작함
- [ ] `oma update` 시 기존 `stack/` 보존 + 자동 마이그레이션

## 3. Design

### 3.1 디렉토리 구조 변경

#### 레포 소스 (배포용)

```
.agents/skills/oma-backend/
├── SKILL.md                     # 언어무관 추상 인터페이스
├── resources/                   # 공통 리소스 (제네릭화)
│   ├── execution-protocol.md
│   ├── checklist.md
│   ├── error-playbook.md
│   ├── examples.md
│   └── orm-reference.md
└── variants/                    # 언어별 프리셋 (레포에만 존재)
    ├── python/
    │   ├── snippets.md
    │   ├── tech-stack.md
    │   └── api-template.py
    ├── node/
    │   ├── snippets.md
    │   ├── tech-stack.md
    │   └── api-template.ts
    └── rust/
        ├── snippets.md
        ├── tech-stack.md
        └── api-template.rs
```

#### 사용자 프로젝트 (설치 후)

```
.agents/skills/oma-backend/
├── SKILL.md                     # 추상 인터페이스 (레포 원본 그대로)
├── resources/                   # 공통 리소스
│   ├── execution-protocol.md
│   ├── checklist.md
│   ├── error-playbook.md
│   ├── examples.md
│   └── orm-reference.md
└── stack/                       # 구체화된 스택 레퍼런스 (1개 언어만)
    ├── snippets.md
    ├── tech-stack.md
    ├── api-template.py
    └── stack.yaml               # { language: python, framework: fastapi, ... }
```

`variants/` 디렉토리는 **사용자 프로젝트에 복사되지 않는다.**
CLI가 설치 시 선택된 variant만 `stack/`에 복사하거나,
`/stack-set` 워크플로우가 LLM으로 생성한다.

### 3.2 SKILL.md 변경

#### Before (현재)

```markdown
---
name: oma-backend
description: Backend specialist for APIs, databases, authentication
  using FastAPI with clean architecture...
---

## Core Rules
2. **SOLID**: Use FastAPI's `Depends` for dependency injection
3. **All inputs validated with Pydantic**

## Dependency Injection
\`\`\`python
async def get_recipe_service(db: AsyncSession = Depends(get_db))...
\`\`\`

## Code Quality
- Python 3.12+: Strict type hints (mypy)
- Ruff: Linting/formatting
```

#### After (추상화)

```markdown
---
name: oma-backend
description: Backend specialist for APIs, databases, authentication
  with clean architecture (Repository/Service/Router pattern).
  Use for API, endpoint, REST, database, server, migration, and auth work.
---

## Architecture Pattern
Router (HTTP) → Service (Business Logic) → Repository (Data Access) → Models

## Core Rules
1. Clean architecture: router → service → repository → models
2. No business logic in route handlers
3. All inputs validated with your stack's validation library
4. Parameterized queries only (never string interpolation)
5. JWT + bcrypt for auth; rate limit auth endpoints
6. Async where supported; type annotations on all signatures
7. Custom exceptions via centralized error module
8. Explicit ORM loading strategy per query
9. Explicit transaction boundaries per business operation
10. Safe ORM lifecycle: no shared mutable sessions across concurrent work

## Stack Detection (Priority Order)
1. **Project files first** — Read existing code, pyproject.toml, package.json,
   Cargo.toml etc. to determine the tech stack
2. **stack/ second** — If `stack/` exists, use as supplementary reference
   for coding conventions and snippet templates
3. **Neither exists** — Ask the user or suggest running `/stack-set`

## Stack-Specific Reference
- Tech stack & libraries: `stack/tech-stack.md`
- Code snippets: `stack/snippets.md`
- API template: `stack/api-template.*`
- Stack config: `stack/stack.yaml`
```

### 3.3 공통 리소스 제네릭화

각 파일에서 Python 특정 용어를 범용 표현으로 변경한다.
**내용/구조 변경은 최소화하고 용어만 치환한다.**

#### checklist.md

| Before | After |
|:---|:---|
| `Request/response schemas defined with Pydantic` | `Request/response schemas defined with validation library` |
| `Migrations created (Alembic) and tested` | `Migrations created and tested` |
| `Input validation with Pydantic (no raw user input)` | `Input validation enforced (no raw user input)` |

#### execution-protocol.md

| Before | After |
|:---|:---|
| `Pydantic schemas (request/response)` | `Validation schemas (request/response)` |
| `Use resources/api-template.py as reference` | `Use stack/api-template.* as reference` |

#### error-playbook.md

| Before | After |
|:---|:---|
| `ModuleNotFoundError, ImportError, No module named X` | `Module/package not found errors` |
| `Verify dependency in pyproject.toml or requirements.txt` | `Verify dependency in your package manifest` |
| `alembic upgrade head fails` | `Migration command fails` |
| `alembic downgrade -1 then fix` | `Rollback one migration step then fix` |

#### examples.md

파일 경로의 `.py` 확장자를 제거하거나 제네릭하게 변경한다.

#### orm-reference.md

변경 없음 (이미 크로스 ORM).

### 3.4 _shared/context-loading.md 변경

Backend Agent 섹션의 경로 참조만 변경한다.

```diff
-6. **Complex**: `resources/examples.md` + `resources/tech-stack.md` + `resources/snippets.md`
+6. **Complex**: `resources/examples.md` + `stack/tech-stack.md` + `stack/snippets.md`
```

Backend Agent 매핑 테이블:

```diff
-| CRUD API creation             | snippets.md (route, schema, model, test)    |
-| Authentication implementation | snippets.md (JWT, password) + tech-stack.md |
+| CRUD API creation             | stack/snippets.md (route, schema, model, test)    |
+| Authentication implementation | stack/snippets.md (JWT, password) + stack/tech-stack.md |
```

### 3.5 backend-engineer.md (Claude Code 에이전트) 변경

```diff
 ---
 name: backend-engineer
-description: FastAPI/SQLAlchemy backend implementation. Use for API, authentication, DB migration work.
+description: Backend implementation. Use for API, authentication, DB migration work.
 tools: Read, Write, Edit, Bash, Grep, Glob
 model: sonnet
 maxTurns: 20
 skills:
   - oma-backend
 ---

-You are a Backend Specialist working as part of an automated multi-agent system.
+You are a Backend Specialist. Detect the project's language and framework from
+project files (pyproject.toml, package.json, Cargo.toml, etc.) before writing code.
+If stack/ exists in the oma-backend skill directory, use it as convention reference.

 ## Rules
-4. Pydantic validation on all inputs
+4. Validate all inputs with the project's validation library
-8. Custom exceptions via `src/lib/exceptions.py`
+8. Custom exceptions via centralized error module
```

### 3.6 Python 프리셋 (variants/python/)

현재 리소스 파일 3개를 **내용 변경 없이** `variants/python/`으로 이동:

| 현재 위치 | 이동 후 |
|:---|:---|
| `resources/snippets.md` | `variants/python/snippets.md` |
| `resources/tech-stack.md` | `variants/python/tech-stack.md` |
| `resources/api-template.py` | `variants/python/api-template.py` |

### 3.7 CLI 변경: install

`cli/commands/install.ts`에 domain skill 선택 시 language sub-prompt 추가:

```typescript
// oma-backend 선택 시 언어 프롬프트
const SKILL_VARIANTS: Record<string, { message: string; options: VariantOption[] }> = {
  "oma-backend": {
    message: "Backend language?",
    options: [
      { value: "python", label: "Python", hint: "FastAPI/SQLAlchemy (default)" },
      { value: "node",   label: "Node.js", hint: "NestJS/Hono + Prisma/Drizzle" },
      { value: "rust",   label: "Rust", hint: "Axum/Actix-web" },
      { value: "other",  label: "Other / Auto-detect", hint: "Configure later with /stack-set" },
    ],
    initialValue: "python",
  },
};

// install() 함수 내, skill 반복 전에:
const variantSelections: Record<string, string> = {};
for (const skillName of selectedSkills) {
  if (SKILL_VARIANTS[skillName]) {
    const config = SKILL_VARIANTS[skillName];
    const variant = await p.select({
      message: config.message,
      options: config.options,
    });
    if (!p.isCancel(variant) && variant !== "other") {
      variantSelections[skillName] = variant as string;
    }
  }
}

// installSkill 호출 시 variant 전달:
installSkill(repoDir, skillName, cwd, variantSelections[skillName]);
```

### 3.8 CLI 변경: installSkill() 확장

`cli/lib/skills.ts`의 `installSkill()` 함수 확장:

```typescript
export function installSkill(
  sourceDir: string,
  skillName: string,
  targetDir: string,
  variant?: string,    // 새 파라미터
): boolean {
  const src = join(sourceDir, ".agents", "skills", skillName);
  if (!existsSync(src)) return false;

  const dest = join(targetDir, INSTALLED_SKILLS_DIR, skillName);
  clearNonDirectory(dest);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, force: true });

  // --- variant 처리 ---
  const variantsDir = join(dest, "variants");
  const stackDir = join(dest, "stack");

  if (variant && existsSync(join(variantsDir, variant))) {
    // 선택된 variant를 stack/으로 복사
    mkdirSync(stackDir, { recursive: true });
    cpSync(join(variantsDir, variant), stackDir, { recursive: true, force: true });

    // stack.yaml 생성
    writeFileSync(
      join(stackDir, "stack.yaml"),
      `language: ${variant}\nsource: preset\n`
    );
  }

  // variants/ 디렉토리 삭제 (사용자 프로젝트에 불필요)
  if (existsSync(variantsDir)) {
    rmSync(variantsDir, { recursive: true, force: true });
  }

  return true;
}
```

### 3.9 CLI 변경: update

`cli/commands/update.ts` 변경:

```typescript
// 기존 백업 대상에 stack/ 추가
const backendStackDir = join(cwd, ".agents/skills/oma-backend/stack");
const savedStack = existsSync(backendStackDir)
  ? { exists: true }  // 디렉토리 자체를 보존
  : null;

// 임시 백업
const stackBackupDir = join(tmpdir(), `oma-stack-backup-${Date.now()}`);
if (savedStack) {
  cpSync(backendStackDir, stackBackupDir, { recursive: true });
}

// 전체 .agents/ 복사 (기존 로직)
cpSync(join(repoDir, ".agents"), join(cwd, ".agents"), {
  recursive: true, force: true,
});

// stack/ 복원
if (savedStack) {
  mkdirSync(backendStackDir, { recursive: true });
  cpSync(stackBackupDir, backendStackDir, { recursive: true, force: true });
  rmSync(stackBackupDir, { recursive: true, force: true });
}

// variants/ 정리 (사용자 프로젝트에 불필요)
const variantsDir = join(cwd, ".agents/skills/oma-backend/variants");
if (existsSync(variantsDir)) {
  rmSync(variantsDir, { recursive: true, force: true });
}

// 기존 사용자 일회성 마이그레이션
const oldSnippets = join(cwd, ".agents/skills/oma-backend/resources/snippets.md");
if (existsSync(oldSnippets) && !existsSync(backendStackDir)) {
  mkdirSync(backendStackDir, { recursive: true });
  for (const file of ["snippets.md", "tech-stack.md", "api-template.py"]) {
    const src = join(cwd, ".agents/skills/oma-backend/resources", file);
    if (existsSync(src)) {
      renameSync(src, join(backendStackDir, file));
    }
  }
  writeFileSync(
    join(backendStackDir, "stack.yaml"),
    "language: python\nframework: fastapi\norm: sqlalchemy\nsource: migrated\n"
  );
}
```

### 3.10 `/stack-set` 워크플로우

새 파일: `.agents/workflows/stack-set.md`

```markdown
---
name: stack-set
description: Auto-detect project tech stack and generate stack-specific
  references for domain skills (backend, frontend, mobile)
---

# /stack-set — Stack Configuration Workflow

## Goal
프로젝트 파일을 분석하여 기술 스택을 감지하고,
domain skill의 `stack/` 디렉토리에 언어별 레퍼런스를 생성한다.

## Step 1: Detect

프로젝트 루트에서 다음 파일들을 스캔:

| 파일 | 감지 결과 |
|:---|:---|
| `pyproject.toml`, `requirements.txt`, `Pipfile` | Python |
| `package.json`, `tsconfig.json` | Node.js/TypeScript |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle`, `build.gradle.kts` | Java/Kotlin |
| `go.mod` | Go |
| `mix.exs` | Elixir |
| `Gemfile` | Ruby |
| `*.csproj`, `*.sln` | C#/.NET |

패키지 매니페스트 내용을 읽어서 프레임워크도 감지:
- Python: FastAPI? Django? Flask?
- Node.js: NestJS? Express? Hono?
- Rust: Axum? Actix-web? Rocket?
- Java: Spring Boot? Quarkus?

## Step 2: Confirm

감지 결과를 사용자에게 확인:
```
감지된 백엔드 스택:
  Language: Python 3.12
  Framework: FastAPI 0.115
  ORM: SQLAlchemy 2.0 (async)
  Validation: Pydantic v2
  Migration: Alembic
  Test: pytest + httpx

맞습니까? (Y/n) 또는 직접 수정:
```

## Step 3: Generate

`.agents/skills/oma-backend/stack/` 디렉토리에 다음 파일을 생성:

### stack.yaml
```yaml
language: python
framework: fastapi
orm: sqlalchemy
validation: pydantic
migration: alembic
test: pytest
source: detected      # preset | detected | manual
detected_from:
  - pyproject.toml
  - src/main.py
```

### tech-stack.md
감지된 스택에 맞는 라이브러리 레퍼런스.
반드시 포함:
- 프레임워크 버전 및 핵심 API
- ORM/DB 라이브러리 및 사용법
- 검증 라이브러리
- 마이그레이션 도구
- 테스트 프레임워크
- 린터/포매터

### snippets.md
감지된 스택에 맞는 copy-paste 가능한 코드 패턴.
반드시 포함:
- [ ] Route/Handler + Auth 예제
- [ ] Validation Schema 예제
- [ ] ORM Model/Entity 예제
- [ ] DI (Dependency Injection) 예제
- [ ] Repository 패턴 예제
- [ ] Paginated Query 예제
- [ ] Migration 예제
- [ ] Test 예제

### api-template.*
감지된 언어의 CRUD 엔드포인트 보일러플레이트.
파일 확장자는 언어에 맞게 (.py, .ts, .rs, .java, .go 등).

## Step 4: Verify

생성된 파일들이 체크리스트를 충족하는지 확인:
- [ ] stack.yaml에 language, framework, orm, validation 필드 존재
- [ ] snippets.md에 8개 필수 패턴 포함
- [ ] tech-stack.md에 6개 필수 섹션 포함
- [ ] api-template 파일이 해당 언어로 작성됨
- [ ] 기존 프로젝트 코드 컨벤션과 일관성 있음

## Constraints

- `.agents/skills/oma-backend/SKILL.md` 수정 금지 (추상 인터페이스 보호)
- `resources/` 공통 파일 수정 금지
- `stack/` 디렉토리만 생성/수정
- 기존 `stack/`이 있으면 덮어쓰기 전 확인
```

Claude Code에서 이 워크플로우를 네이티브 skill로 매핑:
새 파일: `.claude/skills/stack-set/SKILL.md`

### 3.11 프리셋 확장성

`variants/` 디렉토리에 새 언어를 추가하려면:
1. `variants/{language}/` 디렉토리 생성
2. `snippets.md`, `tech-stack.md`, `api-template.*` 작성
3. `install.ts`의 `SKILL_VARIANTS` 옵션에 추가

프리셋에 없는 언어는 `/stack-set`이 LLM으로 생성하므로,
프리셋 추가는 **품질 보장용 선택사항**이지 필수가 아니다.

## 4. Migration Plan

### Phase 1: 기존 사용자 마이그레이션

`oma update` 실행 시 자동 처리:

```
1. resources/snippets.md 존재 + stack/ 미존재 감지
2. resources/{snippets.md, tech-stack.md, api-template.py} → stack/ 이동
3. stack/stack.yaml 생성: { language: python, source: migrated }
4. variants/ 디렉토리 삭제
```

### Phase 2: 새 설치

```
1. oma install → backend 선택 → 언어 선택
2. 추상 SKILL.md + 공통 resources/ 복사
3. 선택된 variant → stack/ 복사
4. variants/ 디렉토리 미포함
```

### Phase 3: /stack-set 지원

```
1. 언어 선택에서 "Other" 선택 시 → stack/ 미생성, 안내 메시지
2. /stack-set 실행 → 프로젝트 감지 → stack/ 생성
3. 기존 stack/ 재생성 시에도 /stack-set 사용 가능
```

## 5. Impact Analysis

### 변경 파일 목록

| 파일 | 변경 유형 | 크기 |
|:---|:---|:---|
| `.agents/skills/oma-backend/SKILL.md` | 재작성 (추상화) | 중 |
| `.agents/skills/oma-backend/resources/checklist.md` | 용어 치환 3줄 | 소 |
| `.agents/skills/oma-backend/resources/execution-protocol.md` | 용어 치환 2줄 | 소 |
| `.agents/skills/oma-backend/resources/error-playbook.md` | 용어 치환 4줄 | 소 |
| `.agents/skills/oma-backend/resources/examples.md` | 경로 제네릭화 | 소 |
| `.agents/skills/_shared/context-loading.md` | Backend 섹션 경로 변경 | 소 |
| `.claude/agents/backend-engineer.md` | description 범용화 | 소 |
| `cli/commands/install.ts` | 언어 sub-prompt 추가 | 중 |
| `cli/lib/skills.ts` | installSkill() variant 지원 | 중 |
| `cli/commands/update.ts` | stack/ 백업/복원 + 마이그레이션 | 중 |

### 새 파일

| 파일 | 설명 |
|:---|:---|
| `.agents/skills/oma-backend/variants/python/` | 기존 리소스 이동 (내용 동일) |
| `.agents/skills/oma-backend/variants/node/` | Node.js 프리셋 (신규 작성) |
| `.agents/skills/oma-backend/variants/rust/` | Rust 프리셋 (신규 작성) |
| `.agents/workflows/stack-set.md` | 워크플로우 신규 |
| `.claude/skills/stack-set/SKILL.md` | Claude Code 네이티브 skill 신규 |

### 영향 없는 파일

- `.agents/skills/oma-backend/resources/orm-reference.md` — 이미 크로스 ORM
- 다른 도메인 스킬 (`oma-frontend`, `oma-mobile` 등) — 자체 resources/ 참조
- 워크플로우 파일들 — 백엔드 리소스 경로 직접 참조 없음
- `.agents/config/user-preferences.yaml` — 관련 없음
- `cli-config.yaml` — 관련 없음

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|:---|:---|:---|
| `/stack-set` 생성 품질 불일관 | LLM에 따라 스니펫 품질 차이 | snippets.md 필수 항목 체크리스트로 최소 품질 보장 |
| 기존 사용자 마이그레이션 실패 | stack/ 미생성 시 스니펫 없음 | 마이그레이션 로직 + 폴백: resources/에 파일 남아있으면 그대로 참조 |
| update가 stack/ 덮어쓰기 | 사용자 커스텀 스니펫 유실 | stack/ 백업/복원 로직 필수 |
| SSOT 규칙 위반 | `.agents/` 수정 금지인데 stack/ 생성 | stack/은 "생성된 산출물"로 예외 처리, CLAUDE.md에 명시 |

## 7. Future Extensions

이 패턴은 다른 도메인 스킬에도 동일하게 적용 가능:

- `oma-frontend`: React/Next.js → Vue/Nuxt, Svelte, Angular 등
- `oma-mobile`: Flutter → React Native, SwiftUI, Kotlin Compose 등
- `oma-db`: PostgreSQL → MySQL, MongoDB, DynamoDB 등

각 스킬을 추상화하고 `stack/` + `variants/` + `/stack-set` 패턴을 적용하면,
oh-my-agent가 **특정 기술 스택에 종속되지 않는 범용 프레임워크**가 된다.

## 8. Documentation Updates (구현 완료 후)

구현 완료 시 다음 문서에 변경사항 반영 필요:

| 문서 | 반영 내용 |
|:---|:---|
| `README.md` | backend 프리셋 힌트 변경 ("FastAPI/Python" → 언어 선택), `/stack-set` 커맨드 추가 |
| `docs/README.ko.md` | 동일 |
| `docs/README.ja.md` | 동일 |
| `docs/README.zh.md` | 동일 |
| `docs/README.*.md` (기타 언어) | 동일 |
| `docs/SUPPORTED_AGENTS.md` | backend-engineer description 범용화 |
| `docs/AGENTS_SPEC.md` | backend skill 구조 변경 반영 |
| `CLAUDE.md` | `/stack-set` 슬래시 커맨드 추가, stack/ SSOT 예외 명시 |

## 9. Next Steps

1. `/plan`으로 구현 태스크 분해
2. Phase 1 구현 (SKILL.md 추상화 + 리소스 제네릭화 + Python variant 이동)
3. Phase 2 구현 (CLI install/update 변경)
4. Phase 3 구현 (/stack-set 워크플로우 + Node/Rust 프리셋)
5. 문서 업데이트
6. 테스트 + 릴리스
