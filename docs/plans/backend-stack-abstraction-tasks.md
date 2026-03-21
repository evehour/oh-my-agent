# Backend Stack Abstraction - 구현 태스크 계획

> Status: Draft
> Created: 2026-03-21
> Design doc: `docs/plans/backend-stack-abstraction-design.md`
> Total: 19 tasks across 3 phases

---

## Phase 1: 추상화 (Task 1-9)

### Task 1: Python variant 디렉토리 생성 및 기존 리소스 이동
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/oma-backend/variants/python/snippets.md` (신규 — resources/ 에서 이동)
  - `.agents/skills/oma-backend/variants/python/tech-stack.md` (신규 — resources/ 에서 이동)
  - `.agents/skills/oma-backend/variants/python/api-template.py` (신규 — resources/ 에서 이동)
  - `.agents/skills/oma-backend/resources/snippets.md` (삭제)
  - `.agents/skills/oma-backend/resources/tech-stack.md` (삭제)
  - `.agents/skills/oma-backend/resources/api-template.py` (삭제)
- **Description**: 현재 `resources/` 안의 Python 전용 파일 3개를 내용 변경 없이 `variants/python/`으로 이동. git mv 사용하여 히스토리 보존.
- **Acceptance Criteria**:
  - `variants/python/` 디렉토리에 3개 파일 존재
  - `resources/`에서 해당 3개 파일 제거됨
  - 파일 내용이 원본과 동일 (diff 없음)

---

### Task 2: SKILL.md 추상화 재작성
- **Phase**: 1
- **Dependencies**: Task 1
- **Files**:
  - `.agents/skills/oma-backend/SKILL.md` (수정)
- **Description**: 설계서 Section 3.2의 "After" 버전으로 재작성. 핵심 변경:
  1. description에서 "FastAPI" 제거
  2. Core Rules에서 Python 용어 제거 ("Pydantic" → "validation library" 등)
  3. Python 코드 예제 블록(DI) 제거
  4. Stack Detection 섹션 추가 (project files → stack/ → ask user 순서)
  5. References에서 `resources/snippets.md` → `stack/snippets.md` 등 경로 변경
  6. `__init__.py` 관련 Python 전용 노트 제거
- **Acceptance Criteria**:
  - "Python", "FastAPI", "SQLAlchemy", "Pydantic", "Ruff", "mypy", "Alembic" 문자열 0건
  - Stack Detection 섹션 존재
  - 아키텍처 패턴(Router → Service → Repository → Models) 유지

---

### Task 3: checklist.md 용어 제네릭화
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/oma-backend/resources/checklist.md` (수정)
- **Description**: 3줄 치환. "Pydantic" → "validation library", "Alembic" 제거, "Input validation with Pydantic" → "Input validation enforced".
- **Acceptance Criteria**:
  - "Pydantic" 0건, "Alembic" 0건
  - 체크리스트 항목 수와 구조 변경 없음

---

### Task 4: execution-protocol.md 용어 제네릭화
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/oma-backend/resources/execution-protocol.md` (수정)
- **Description**: 2줄 치환. "Pydantic schemas" → "Validation schemas", `resources/api-template.py` → `stack/api-template.*`.
- **Acceptance Criteria**:
  - "Pydantic" 0건
  - `api-template.py` → `stack/api-template.*`

---

### Task 5: error-playbook.md 용어 제네릭화
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/oma-backend/resources/error-playbook.md` (수정)
- **Description**: Python 전용 에러명/도구명을 범용 표현으로 치환. `ModuleNotFoundError` → "Module/package not found errors", `pyproject.toml` → "package manifest", `alembic` → "migration tool", `pytest` → "test runner" 등.
- **Acceptance Criteria**:
  - "alembic" 0건, "pyproject.toml" 0건, "ModuleNotFoundError" 0건
  - 에러 복구 로직의 의미 보존

---

### Task 6: examples.md 경로 제네릭화
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/oma-backend/resources/examples.md` (수정)
- **Description**: 출력 예제의 파일 경로에서 `.py` 확장자 하드코딩을 범용 표현으로 대체.
- **Acceptance Criteria**:
  - 파일 경로에 `.py` 확장자 하드코딩 없음

---

### Task 7: context-loading.md Backend Agent 섹션 경로 변경
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.agents/skills/_shared/context-loading.md` (수정)
- **Description**: Backend Agent 매핑 테이블과 Loading Order Complex 항목에서 `resources/snippets.md` → `stack/snippets.md`, `resources/tech-stack.md` → `stack/tech-stack.md` 변경.
- **Acceptance Criteria**:
  - Backend Agent 섹션 `snippets.md`/`tech-stack.md` 참조가 모두 `stack/` 경로
  - 다른 Agent 섹션 변경 없음

---

### Task 8: backend-engineer.md 에이전트 정의 범용화
- **Phase**: 1
- **Dependencies**: 없음
- **Files**:
  - `.claude/agents/backend-engineer.md` (수정)
- **Description**: description에서 "FastAPI/SQLAlchemy" 제거, 스택 감지 지시 추가, Rules에서 "Pydantic" → "validation library".
- **Acceptance Criteria**:
  - "FastAPI", "SQLAlchemy", "Pydantic" 0건
  - 스택 감지 지시 포함

---

### Task 9: Phase 1 통합 검증
- **Phase**: 1
- **Dependencies**: Task 1-8
- **Files**: 없음 (검증만)
- **Description**: Phase 1 완료 후 전체 검증.
  1. `oma-backend/SKILL.md` + `resources/` 전체에서 Python 전용 용어 grep 0건
  2. `variants/python/` 파일 3개 존재
  3. 기존 CLI 테스트 통과 (`vitest run`)
- **Acceptance Criteria**:
  - `grep -ri "fastapi\|sqlalchemy\|pydantic\|alembic\|ruff\|mypy"` 결과 0건
  - `vitest run` 통과

---

## Phase 2: CLI 변경 (Task 10-15)

### Task 10: installSkill() 함수에 variant 파라미터 추가
- **Phase**: 2
- **Dependencies**: Task 1
- **Files**:
  - `cli/lib/skills.ts` (수정)
- **Description**: `installSkill()` 시그니처에 `variant?: string` 추가. 로직:
  1. 기존 복사 후 `variants/{variant}` 존재 시 `stack/`으로 복사
  2. `stack/stack.yaml` 생성
  3. `variants/` 디렉토리 삭제 (사용자 프로젝트에 불필요)
- **Acceptance Criteria**:
  - `installSkill(src, "oma-backend", target, "python")` 시 `stack/` 생성
  - `variants/` 미존재 확인
  - variant 미지정 시 기존 동작 유지

---

### Task 11: install 커맨드에 언어 선택 프롬프트 추가
- **Phase**: 2
- **Dependencies**: Task 10
- **Files**:
  - `cli/commands/install.ts` (수정)
- **Description**: `SKILL_VARIANTS` 설정 + backend 선택 시 언어 sub-prompt. "other" 선택 시 variant 미전달. install 옵션 backend hint 변경.
- **Acceptance Criteria**:
  - backend 선택 시 언어 프롬프트 표시
  - "other" 선택 시 stack/ 미생성
  - 다른 skill은 variant 프롬프트 없음

---

### Task 12: SKILLS 레지스트리 description 업데이트
- **Phase**: 2
- **Dependencies**: 없음
- **Files**:
  - `cli/lib/skills.ts` (수정)
- **Description**: `oma-backend` desc를 "FastAPI/SQLAlchemy API specialist" → "Backend API specialist (multi-language)" 변경.
- **Acceptance Criteria**:
  - "FastAPI" 0건
  - 기존 테스트 통과

---

### Task 13: update 커맨드에 stack/ 백업/복원 + 마이그레이션 추가
- **Phase**: 2
- **Dependencies**: Task 10
- **Files**:
  - `cli/commands/update.ts` (수정)
- **Description**:
  1. `.agents/` 복사 전 `oma-backend/stack/` tmpdir에 백업
  2. 복사 후 복원
  3. `variants/` 삭제
  4. 기존 사용자 마이그레이션: `resources/snippets.md` 존재 + `stack/` 미존재 → 3파일 이동 + stack.yaml 생성
- **Acceptance Criteria**:
  - update 후 기존 `stack/` 보존
  - `variants/` 미존재
  - 기존 Python 사용자 자동 마이그레이션

---

### Task 14: installSkill variant 처리 단위 테스트
- **Phase**: 2
- **Dependencies**: Task 10
- **Files**:
  - `cli/__tests__/skills.test.ts` (수정 또는 신규)
- **Description**: variant 지정/미지정/잘못된 variant 이름 3가지 케이스 테스트.
- **Acceptance Criteria**:
  - 3개+ 테스트 케이스
  - `vitest run` 통과

---

### Task 15: update stack/ 보존 + 마이그레이션 단위 테스트
- **Phase**: 2
- **Dependencies**: Task 13
- **Files**:
  - `cli/__tests__/update.test.ts` (수정 또는 신규)
- **Description**: stack/ 백업/복원, 마이그레이션, 이미 stack/ 있을 때 스킵 3가지 케이스 테스트.
- **Acceptance Criteria**:
  - 3개+ 테스트 케이스
  - `vitest run` 통과

---

## Phase 3: /stack-set + 프리셋 (Task 16-19)

### Task 16: /stack-set 워크플로우 생성
- **Phase**: 3
- **Dependencies**: Task 2
- **Files**:
  - `.agents/workflows/stack-set.md` (신규)
  - `.claude/skills/stack-set/SKILL.md` (신규)
- **Description**: 설계서 Section 3.10 구현. 4단계 워크플로우 (Detect → Confirm → Generate → Verify). Claude Code 네이티브 skill 매핑 포함.
- **Acceptance Criteria**:
  - `/stack-set` 워크플로우 파일 존재
  - Claude Code에서 `/stack-set` 호출 가능
  - snippets.md 필수 8개 패턴 체크리스트 포함

---

### Task 17: Node.js variant 프리셋 작성
- **Phase**: 3
- **Dependencies**: Task 1
- **Files**:
  - `.agents/skills/oma-backend/variants/node/snippets.md` (신규)
  - `.agents/skills/oma-backend/variants/node/tech-stack.md` (신규)
  - `.agents/skills/oma-backend/variants/node/api-template.ts` (신규)
- **Description**: NestJS/Hono + Prisma/Drizzle 기반. Python 프리셋과 동일한 8개 패턴 구조.
- **Acceptance Criteria**:
  - 3개 파일 존재
  - snippets.md 8개 필수 패턴 포함
  - TypeScript 코드

---

### Task 18: Rust variant 프리셋 작성
- **Phase**: 3
- **Dependencies**: Task 1
- **Files**:
  - `.agents/skills/oma-backend/variants/rust/snippets.md` (신규)
  - `.agents/skills/oma-backend/variants/rust/tech-stack.md` (신규)
  - `.agents/skills/oma-backend/variants/rust/api-template.rs` (신규)
- **Description**: Axum/Actix-web + SQLx/SeaORM 기반. 동일한 8개 패턴 구조.
- **Acceptance Criteria**:
  - 3개 파일 존재
  - snippets.md 8개 필수 패턴 포함
  - Rust 코드

---

### Task 19: 문서 업데이트
- **Phase**: 3
- **Dependencies**: Task 1-18 전체
- **Files**:
  - `CLAUDE.md` — `/stack-set` 매핑 추가, stack/ SSOT 예외 명시
  - `README.md` — backend hint 범용화, `/stack-set` 설명
  - `docs/README.ko.md` — 동일
  - `docs/README.ja.md` — 동일
  - `docs/README.zh.md` — 동일
  - `docs/README.de.md` — 동일
  - `docs/README.es.md` — 동일
  - `docs/README.fr.md` — 동일
  - `docs/README.nl.md` — 동일
  - `docs/README.pl.md` — 동일
  - `docs/README.pt.md` — 동일
  - `docs/README.ru.md` — 동일
  - `docs/SUPPORTED_AGENTS.md` — backend-engineer description 범용화
  - `docs/AGENTS_SPEC.md` — backend skill 구조 변경 반영
- **Description**: 설계서 Section 8에 따라 전체 문서 반영.
- **Acceptance Criteria**:
  - CLAUDE.md에 `/stack-set` 행 존재
  - 모든 README에서 backend 설명 범용화
  - SUPPORTED_AGENTS.md에 "FastAPI" 하드코딩 0건

---

## 의존성 그래프

```
Phase 1 (추상화):
  Task 1 (variant 이동) ──→ Task 2 (SKILL.md)
  Task 3 (checklist)    ──┐
  Task 4 (exec-proto)   ──┤
  Task 5 (error-play)   ──┼──→ Task 9 (Phase 1 검증)
  Task 6 (examples)     ──┤
  Task 7 (ctx-loading)  ──┤
  Task 8 (agent.md)     ──┘

Phase 2 (CLI):
  Task 10 (installSkill) ──→ Task 11 (install prompt)
  Task 10 ──→ Task 13 (update backup) ──→ Task 15 (update test)
  Task 10 ──→ Task 14 (skill test)
  Task 12 (SKILLS desc) — 독립

Phase 3 (stack-set + 프리셋):
  Task 16 (workflow)    — Task 2 의존
  Task 17 (node preset) — Task 1 의존
  Task 18 (rust preset) — Task 1 의존
  Task 19 (docs)        — 전체 의존
```

## 병렬 실행 가능 그룹

| 그룹 | 태스크 | 비고 |
|:---|:---|:---|
| Phase 1 병렬 A | Task 1, 3, 4, 5, 6, 7, 8 | Task 1 완료 후 Task 2 시작 |
| Phase 2 병렬 A | Task 10, 12 | 독립 |
| Phase 2 병렬 B | Task 11, 13, 14 | Task 10 완료 후 |
| Phase 3 병렬 A | Task 16, 17, 18 | 독립 |
