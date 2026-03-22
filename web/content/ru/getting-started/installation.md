---
title: Установка
description: Предварительные требования, варианты установки и первоначальная настройка.
---

# Установка

## Предварительные требования

- Google Antigravity (2026+)
- Bun
- uv

## Вариант 1: Интерактивная установка

```bash
bunx oh-my-agent
```

Устанавливает навыки и рабочие процессы в `.agents/` в текущем проекте.

## Вариант 2: Глобальная установка

```bash
# Homebrew (macOS/Linux)
brew install oh-my-agent

# npm/bun
bun install --global oh-my-agent
```

Рекомендуется, если вы часто используете команды оркестратора.

## Вариант 3: Интеграция в существующий проект

### Через CLI

```bash
bunx oh-my-agent
bunx oh-my-agent doctor
```

### Ручное копирование

```bash
cp -r oh-my-agent/.agents/skills /path/to/project/.agents/
cp -r oh-my-agent/.agents/workflows /path/to/project/.agents/
cp -r oh-my-agent/.agents/config /path/to/project/.agents/
```

## Команда первоначальной настройки

```text
/setup
```

Создаёт `.agents/config/user-preferences.yaml`.

## Необходимые CLI-вендоры

Установите и авторизуйте хотя бы одного:

- Gemini
- Claude
- Codex
- Qwen
