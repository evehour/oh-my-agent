---
title: GitHub Action으로 자동 업데이트
description: 공식 GitHub Action을 사용하여 oh-my-agent 스킬을 자동으로 최신 상태로 유지하세요.
---

# GitHub Action으로 자동 업데이트

**oh-my-agent update action**은 스케줄에 따라 `oma update`를 실행하고, 새 스킬 버전이 있으면 PR을 생성(또는 직접 커밋)합니다.

## 빠른 시작

oh-my-agent를 사용하는 레포에 이 워크플로우를 추가하세요:

```yaml
# .github/workflows/update-oma.yml
name: Update oh-my-agent

on:
  schedule:
    - cron: "0 9 * * 1" # 매주 월요일 09:00 UTC
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: first-fluke/oh-my-agent/action@v1
```

매주 업데이트를 확인하고, 변경사항이 있으면 PR을 생성합니다.

## Action 참조

다음 두 가지 경로로 사용 가능합니다:

- **모노레포 경로**: `first-fluke/oh-my-agent/action@v1`
- **Marketplace**: [`first-fluke/oma-update-action@v1`](https://github.com/marketplace/actions/oh-my-agent-update)

### 입력값

| 입력 | 설명 | 기본값 |
|:-----|:----|:------|
| `mode` | `pr`은 풀 리퀘스트 생성, `commit`은 직접 푸시 | `pr` |
| `base-branch` | PR 또는 직접 커밋 대상 브랜치 | `main` |
| `force` | 사용자 설정 파일 덮어쓰기 (`--force`) | `false` |
| `pr-title` | PR 제목 | `chore(deps): update oh-my-agent skills` |
| `pr-labels` | PR에 추가할 라벨 (쉼표 구분) | `dependencies,automated` |
| `commit-message` | 커밋 메시지 | `chore(deps): update oh-my-agent skills` |
| `token` | PR 생성용 GitHub 토큰 | `${{ github.token }}` |

### 출력값

| 출력 | 설명 |
|:----|:----|
| `updated` | 변경사항 감지 시 `true` |
| `version` | 업데이트 후 oh-my-agent 버전 |
| `pr-number` | PR 번호 (`pr` 모드에서만) |
| `pr-url` | PR URL (`pr` 모드에서만) |

## 예시

### 직접 커밋 모드

PR 없이 베이스 브랜치에 바로 푸시:

```yaml
- uses: first-fluke/oh-my-agent/action@v1
  with:
    mode: commit
    commit-message: "chore: sync oh-my-agent skills"
```

### Personal Access Token 사용

`GITHUB_TOKEN`에 쓰기 권한이 없는 포크 레포에서 필요:

```yaml
- uses: first-fluke/oh-my-agent/action@v1
  with:
    token: ${{ secrets.PAT_TOKEN }}
```

### 조건부 알림

업데이트가 적용된 경우에만 후속 작업 실행:

```yaml
jobs:
  update:
    runs-on: ubuntu-latest
    outputs:
      updated: ${{ steps.oma.outputs.updated }}
    steps:
      - uses: actions/checkout@v6
      - uses: first-fluke/oh-my-agent/action@v1
        id: oma

  notify:
    needs: update
    if: needs.update.outputs.updated == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "oh-my-agent가 ${{ needs.update.outputs.version }}으로 업데이트됨"
```

## 작동 방식

1. Bun을 통해 `oh-my-agent` CLI 설치
2. `oma update --ci` 실행 (비대화형 모드, 프롬프트 없음)
3. `.agents/` 및 `.claude/` 디렉토리 변경사항 감지
4. `mode` 입력에 따라 PR 생성 또는 직접 커밋

## Central Registry와 비교

| | GitHub Action | Central Registry |
|:--|:--:|:--:|
| 설정 | 워크플로우 파일 1개 | 파일 3개 (설정 + 워크플로우 2개) |
| 업데이트 방식 | `oma update` CLI | Tarball 다운로드 + 수동 싱크 |
| 커스터마이징 | Action 입력값 | `.agent-registry.yml` |
| 버전 고정 | 항상 최신 | 명시적 버전 고정 |

대부분의 프로젝트에서는 **GitHub Action**을 사용하세요. 엄격한 버전 고정이 필요하거나 서드파티 액션을 사용할 수 없는 경우 **Central Registry** 방식을 사용하세요.
