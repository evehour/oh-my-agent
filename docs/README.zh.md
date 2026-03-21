# oh-my-agent: 便携式多代理 Harness

[![npm version](https://img.shields.io/npm/v/oh-my-agent?color=cb3837&logo=npm)](https://www.npmjs.com/package/oh-my-agent) [![npm downloads](https://img.shields.io/npm/dm/oh-my-agent?color=cb3837&logo=npm)](https://www.npmjs.com/package/oh-my-agent) [![GitHub stars](https://img.shields.io/github/stars/first-fluke/oh-my-agent?style=flat&logo=github)](https://github.com/first-fluke/oh-my-agent) [![License](https://img.shields.io/github/license/first-fluke/oh-my-agent)](https://github.com/first-fluke/oh-my-agent/blob/main/LICENSE) [![Last Updated](https://img.shields.io/github/last-commit/first-fluke/oh-my-agent?label=updated&logo=git)](https://github.com/first-fluke/oh-my-agent/commits/main)

[English](../README.md) | [한국어](./README.ko.md) | [Português](./README.pt.md) | [日本語](./README.ja.md) | [Français](./README.fr.md) | [Español](./README.es.md) | [Nederlands](./README.nl.md) | [Polski](./README.pl.md) | [Русский](./README.ru.md) | [Deutsch](./README.de.md)

专为严谨的 AI 辅助工程打造的便携式、基于角色的代理 Harness。

适用于所有主流 AI IDE，包括 Antigravity、Claude Code、Cursor、Gemini、OpenCode 等。它将基于角色的代理、显式工作流、实时可观测性和标准化指导融为一体，帮助团队告别粗制滥造的 AI 代码，走向更有纪律的工程执行。

## 目录

- [这是什么？](#这是什么)
- [为何不同](#为何不同)
- [快速开始](#快速开始)
- [架构](#架构)
- [赞助商](#赞助商)
- [许可证](#许可证)

## 这是什么？

一套 **Agent 技能**集合，支持协作式多代理开发。工作按明确的角色、工作流和验证边界分配给各专业代理：

| 代理 | 专业领域 | 触发条件 |
|------|---------|---------|
| **Brainstorm** | 规划前的设计优先构思 | "brainstorm", "ideate", "explore idea" |
| **PM Agent** | 需求分析、任务分解、架构设计 | "plan", "break down", "what should we build" |
| **Frontend Agent** | React/Next.js、TypeScript、Tailwind CSS | "UI", "component", "styling" |
| **Backend Agent** | Backend (Python, Node.js, Rust, ...) | "API", "database", "authentication" |
| **DB Agent** | SQL/NoSQL 建模、规范化、完整性、备份、容量规划 | "ERD", "schema", "database design", "index tuning" |
| **Mobile Agent** | Flutter 跨平台开发 | "mobile app", "iOS/Android" |
| **QA Agent** | OWASP Top 10 安全、性能、可访问性 | "review security", "audit", "check performance" |
| **Debug Agent** | Bug 诊断、根因分析、回归测试 | "bug", "error", "crash" |
| **Developer Workflow** | 单仓库任务自动化、mise 任务、CI/CD、迁移、发布 | "dev workflow", "mise tasks", "CI/CD pipeline" |
| **TF Infra Agent** | 多云 IaC 基础设施配置（AWS、GCP、Azure、OCI） | "infrastructure", "terraform", "cloud setup" |
| **Orchestrator** | 基于 CLI 的并行代理执行，使用  | "spawn agent", "parallel execution" |
| **Commit** | 遵循项目特定规则的 Conventional Commits | "commit", "save changes" |



## 为何不同

- **`.agents/` 是权威来源**：技能、工作流、共享资源和配置都存放在一个可移植的项目结构中，而不是锁死在某个 IDE 插件里。
- **角色化代理团队**：PM、QA、DB、Infra、Frontend、Backend、Mobile、Debug 和 Workflow 代理按工程组织的模式建模，而不只是一堆提示词。
- **工作流优先的编排**：规划、审查、调试和协调执行都是一等公民的工作流，而非事后补丁。
- **内建标准意识**：代理携带针对 ISO 驱动规划、QA、数据库连续性/安全及基础设施治理的专项指导。
- **为验证而设计**：仪表盘、清单生成、共享执行协议和结构化输出以可追溯性为先，而不是凭感觉生成。



## 快速开始

### 前置条件

- **AI IDE** (Antigravity, Claude Code, Codex, Gemini 등)

### 选项 1：一键安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

빠진 의존성(bun, uv)을 자동으로 찾아서 설치하고 대화형 설정을 시작합니다.

### 选项 2：手动安装

```bash
# bun이 없으면:
# curl -fsSL https://bun.sh/install | bash

# uv가 없으면:
# curl -LsSf https://astral.sh/uv/install.sh | sh

bunx oh-my-agent
```

프로젝트 타입을 고르면 `.agents/skills/`에 스킬이 설치됩니다.

| 프리셋 | 스킬 |
|--------|--------|
| ✨ All | 전체 |
| 🌐 Fullstack | oma-brainstorm, oma-frontend, oma-backend, oma-db, oma-pm, oma-qa, oma-debug, oma-commit |
| 🎨 Frontend | oma-brainstorm, oma-frontend, oma-pm, oma-qa, oma-debug, oma-commit |
| ⚙️ Backend | oma-brainstorm, oma-backend, oma-db, oma-pm, oma-qa, oma-debug, oma-commit |
| 📱 Mobile | oma-brainstorm, oma-mobile, oma-pm, oma-qa, oma-debug, oma-commit |
| 🚀 DevOps | oma-brainstorm, oma-tf-infra, oma-dev-workflow, oma-pm, oma-qa, oma-debug, oma-commit |

### 옵션 3: 전역 설치 (Orchestrator용)

SubAgent Orchestrator를 쓰거나 도구를 전역에서 쓰려면:

```bash
bun install --global oh-my-agent
```

CLI 도구가 최소 1개 필요합니다:

| CLI | 설치 | 인증 |
|-----|------|------|
| Gemini | `bun install --global @google/gemini-cli` | Auto on first `gemini` run |
| Claude | `curl -fsSL https://claude.ai/install.sh \| bash` | Auto on first `claude` run |
| Codex | `bun install --global @openai/codex` | `codex login` |
| Qwen | `bun install --global @qwen-code/qwen-code` | `/auth` inside CLI |

### 옵션 4: 기존 프로젝트에 추가

프로젝트 루트에서 실행하면 스킬과 워크플로우가 자동 설치됩니다:

```bash
bunx oh-my-agent
```

> **팁:** 설치 후 `bunx oh-my-agent doctor`를 실행하면 설정이 제대로 됐는지 확인할 수 있습니다.

### 2. 使用으로 쓰기

**복잡한 프로젝트** (/coordinate):

```
"사용자 인증이 있는 TODO 앱 만들어줘"
→ /coordinate → PM Agent가 기획 → Agent Manager에서 에이전트 실행
```

**전력 투구** (/ultrawork):

```
"인증 모듈 리팩토링, API 테스트 추가, 문서 업데이트"
→ /ultrawork → 독립된 작업이 에이전트 사이에서 동시 실행
```

**간단한 작업** (도메인 스킬 직접 호출):

```
"Tailwind CSS로 로그인 폼 만들어줘"
→ oma-frontend 스킬
```

**커밋** (Conventional Commits):

```
/commit
→ 변경 분석, 커밋 타입/스코프 제안, Co-Author 포함 커밋
```

### 3. 仪表盘监控

대시보드 설정과 사용법은 [`web/content/ko/guide/usage.md`](./web/content/ko/guide/usage.md#실시간-대시보드)를 참고하세요.



## 架构

```mermaid
flowchart TD
    subgraph Workflows["工作流"]
        direction TB
        W0["/brainstorm"]
        W1["/coordinate"]
        W1b["/ultrawork"]
        W2["/orchestrate"]
        W3["/plan"]
        W4["/review"]
        W5["/debug"]
        W6["/deepinit"]
    end

    subgraph Orchestration["编排"]
        direction TB
        PM[oma-pm]
        ORC[orchestrator]
    end

    subgraph Domain["领域代理"]
        direction TB
        FE[oma-frontend]
        BE[oma-backend]
        DB[oma-db]
        MB[oma-mobile]
        TF[oma-tf-infra]
    end

    subgraph Quality["质量"]
        direction TB
        QA[oma-qa]
        DBG[oma-debug]
    end


    Workflows --> Orchestration
    Orchestration --> Domain
    Domain --> Quality
    Quality --> CMT([commit])
```


## 赞助商

이 프로젝트는 후원자분들 덕분에 유지됩니다.

> **마음에 드셨나요?** 스타 눌러주세요!
>
> ```bash
> gh api --method PUT /user/starred/first-fluke/oh-my-agent
> ```
>
> 스타터 템플릿도 있습니다: [fullstack-starter](https://github.com/first-fluke/fullstack-starter)

<a href="https://github.com/sponsors/first-fluke">
  <img src="https://img.shields.io/badge/후원하기-♥-ea4aaa?style=for-the-badge" alt="Sponsor" />
</a>
<a href="https://buymeacoffee.com/firstfluke">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-FFDD00?style=for-the-badge" alt="Buy Me a Coffee" />
</a>

### 🚀 Champion

<!-- Champion ($100/월) 로고 -->

### 🛸 Booster

<!-- Booster ($30/월) 로고 -->

### ☕ Contributor

<!-- Contributor ($10/월) 이름 -->

[후원자 되기 →](https://github.com/sponsors/first-fluke)

전체 후원자 목록은 [SPONSORS.md](./SPONSORS.md)를 참고하세요.



## 许可证

MIT


