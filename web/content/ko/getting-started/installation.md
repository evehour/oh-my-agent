---
title: 설치
description: 사전 요구 사항, 설치 옵션, 초기 설정을 안내합니다.
---

# 설치

## 사전 요구 사항

- AI IDE (Amp, Claude Code, Gemini CLI 등)
- Bun
- uv

## 옵션 1: 대화형 설치

```bash
bunx oh-my-agent
```

현재 프로젝트의 `.agents/`에 스킬과 워크플로우를 설치합니다.

## 옵션 2: 전역 설치

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

오케스트레이터 명령을 자주 사용할 때 권장합니다.

## 옵션 3: 기존 프로젝트 통합

### CLI 방식

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### 수동 복사 방식

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## 초기 설정 명령

```text
/setup
```

`.agents/config/user-preferences.yaml`이 생성됩니다.

## 필요한 CLI 벤더

최소 1개 이상 설치/인증 필요:

- Gemini
- Claude
- Codex
- Qwen
