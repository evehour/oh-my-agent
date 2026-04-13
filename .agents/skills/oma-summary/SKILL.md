---
name: oma-summary
description: AI 도구 대화이력을 통합 분석하여 테마별 작업 요약을 생성합니다. Claude, Codex, Gemini, Qwen, Cursor 이력을 날짜 또는 기간으로 필터링하여 분석합니다.
---

# AI Tool Conversation History Summary

지정된 기간의 AI 도구 대화이력을 분석하여 테마별 작업 요약을 생성합니다.

## When to use
- 하루 또는 특정 기간의 작업 내역을 요약하고 싶을 때
- 여러 AI 도구에서 수행한 작업의 전체 흐름을 파악하고 싶을 때
- 도구 간 작업 전환 패턴을 분석하고 싶을 때
- 일일 스탠드업, 주간 회고 등에 활용할 요약이 필요할 때

## When NOT to use
- git 커밋 기반 코드 변경 회고 -> `oma retro` 사용
- 실시간 에이전트 모니터링 -> `oma dashboard` 사용
- 생산성 메트릭 조회 -> `oma stats` 사용

## 프로세스

### 1. 데이터 수집

CLI를 통해 정규화된 대화이력을 추출합니다.

```bash
# 기본 사용법 (오늘, 전체 도구)
oma summary --json

# 기간 지정
oma summary --window 7d --json

# 특정 날짜
oma summary --date 2026-04-10 --json

# 도구 필터
oma summary --tool claude,gemini --json
```

**CLI 미설치 시 fallback** — Claude history만 inline으로 처리:

```bash
TARGET_DATE=$(date +%Y-%m-%d)
TZ=Asia/Seoul start_ts=$(date -j -f "%Y-%m-%d %H:%M:%S" "${TARGET_DATE} 00:00:00" +%s)000
end_ts=$((start_ts + 86400000))

TZ=Asia/Seoul jq -r --argjson start "$start_ts" --argjson end "$end_ts" '
  select(.timestamp >= $start and .timestamp < $end and .display != null and .display != "") |
  {
    time: (.timestamp / 1000 | localtime | strftime("%H:%M")),
    project: (.project | split("/") | .[-1]),
    prompt: (.display | gsub("\n"; " ") | if length > 150 then .[0:150] + "..." else . end)
  }
' ~/.claude/history.jsonl
```

### 2. 테마별 분석 및 그룹핑

추출된 데이터를 **모두** 읽고 아래 기준으로 분석합니다:

**그룹핑 규칙:**
- 타임스탬프 간격과 프롬프트 수를 기반으로 **15분 이상 소요된 작업**만 별도 테마로 분류
- 연속된 프롬프트가 같은 주제면 하나의 테마로 묶기
- 15분 미만의 짧은 작업은 "기타" 섹션으로 모으기
- **도구가 아닌 작업 내용 기준**으로 테마를 구성

**크로스-도구 분석:**
- 같은 시간대에 여러 도구가 사용된 경우 작업 흐름을 추적
- 예: "Gemini에서 설계 → Claude에서 구현 → Codex에서 리뷰"
- 도구 전환 패턴에서 인사이트 도출

**각 테마에서 파악할 것:**
- 수행한 핵심 작업
- 내린 주요 결정
- 사용한 도구 조합
- 생성한 산출물 (문서, 코드, 설정 등)

### 3. 출력 포맷

아래 마크다운 형식으로 출력합니다:

```markdown
## {날짜/기간} 작업 요약

### 하루 개요
하루 전체의 흐름을 2~3문장으로 요약. 사용한 도구 비율, 시간대별 흐름, 전체적으로 달성한 것을 서술합니다.

### {테마 1} (오전 09:36~11:30) [Claude, Gemini]
- 수행한 핵심 작업 내용
- 주요 결정 사항
- 도구 간 작업 흐름 (해당 시)
- 테마당 2~4개 bullet

### {테마 2} (오후 13:33~15:21) [Codex]
- 수행한 핵심 작업 내용
- 주요 결정 사항

### 기타
- 15분 미만 소요된 소규모 작업들을 간략히 정리

### 도구 활용 패턴
- 도구별 사용 비율과 주요 용도 요약
- 특이한 도구 전환 패턴이 있으면 언급
```

## 핵심 규칙

1. **요약 우선**: 15분 이상 소요된 작업만 별도 테마. 나머지는 "기타"에 간략히.
2. **하루 개요 필수**: 테마 나열 전에 반드시 하루 전체 흐름을 2~3문장으로 서술.
3. **테마당 2~4 bullet**: 핵심만 간결하게. 모든 단계를 나열하지 않기.
4. **테마는 내용 기준**: 도구가 아니라 실제 작업 내용으로 묶기.
5. **도구 태그**: 테마 제목에 사용된 도구를 `[Claude, Gemini]` 형식으로 표기.
6. **시간대 표시**: 테마 제목에 시간 범위를 포함하여 `(오전/오후/저녁 HH:MM~HH:MM)` 형식으로 표기.
7. **한글로 작성**: 모든 출력은 한글로.
