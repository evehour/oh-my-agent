---
title: ワークフロー
description: 明示的なスラッシュコマンドワークフローとその使用場面。
---

# ワークフロー

## ワークフローコマンド

- `/brainstorm`
- `/coordinate`
- `/deepinit`
- `/exec-plan`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`
- `/setup`
- `/tools`
- `/stack-set`
- `/ultrawork`

## スキル vs ワークフロー

- スキル: /commandで明示的に呼び出し、またはエージェントのskillsフィールドでロード
- ワークフロー: ユーザーが明示的にトリガーするマルチステップパイプライン

## 典型的なマルチエージェントシーケンス

1. `/plan` でタスク分解
2. `/coordinate` で段階的実行
3. `agent:spawn` で並列サブエージェント起動
4. `/review` で QA ゲート
