---
title: Automated Updates with GitHub Action
description: Keep oh-my-agent skills up to date automatically using the official GitHub Action.
---

# Automated Updates with GitHub Action

The **oh-my-agent update action** runs `oma update` on a schedule and creates a PR (or commits directly) when new skill versions are available.

## Quick Start

Add this workflow to any repository that uses oh-my-agent:

```yaml
# .github/workflows/update-oma.yml
name: Update oh-my-agent

on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 09:00 UTC
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

This checks for updates weekly and opens a PR if changes are found.

## Action Reference

The action is available at:

- **Monorepo path**: `first-fluke/oh-my-agent/action@v1`
- **Marketplace**: [`first-fluke/oma-update-action@v1`](https://github.com/marketplace/actions/oh-my-agent-update)

### Inputs

| Input | Description | Default |
|:------|:-----------|:--------|
| `mode` | `pr` creates a pull request, `commit` pushes directly | `pr` |
| `base-branch` | Base branch for PR or direct commit target | `main` |
| `force` | Overwrite user config files (`--force`) | `false` |
| `pr-title` | Custom PR title | `chore(deps): update oh-my-agent skills` |
| `pr-labels` | Comma-separated labels for the PR | `dependencies,automated` |
| `commit-message` | Custom commit message | `chore(deps): update oh-my-agent skills` |
| `token` | GitHub token for PR creation | `${{ github.token }}` |

### Outputs

| Output | Description |
|:-------|:-----------|
| `updated` | `true` if changes were detected |
| `version` | The oh-my-agent version after update |
| `pr-number` | PR number (only in `pr` mode) |
| `pr-url` | PR URL (only in `pr` mode) |

## Examples

### Direct Commit Mode

Skip the PR and push changes directly to the base branch:

```yaml
- uses: first-fluke/oh-my-agent/action@v1
  with:
    mode: commit
    commit-message: "chore: sync oh-my-agent skills"
```

### With a Personal Access Token

Required for fork repositories where `GITHUB_TOKEN` lacks write access:

```yaml
- uses: first-fluke/oh-my-agent/action@v1
  with:
    token: ${{ secrets.PAT_TOKEN }}
```

### Conditional Notification

Run a follow-up step only when an update was applied:

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
      - run: echo "oh-my-agent was updated to ${{ needs.update.outputs.version }}"
```

## How It Works

1. Installs the `oh-my-agent` CLI via Bun
2. Runs `oma update --ci` (non-interactive mode, no prompts)
3. Detects changes in `.agents/` and `.claude/` directories
4. Creates a PR or commits directly based on the `mode` input

## Comparison with Central Registry

| | GitHub Action | Central Registry |
|:--|:--:|:--:|
| Setup | 1 workflow file | 3 files (config + 2 workflows) |
| Update method | `oma update` CLI | Tarball download + manual sync |
| Customization | Action inputs | `.agent-registry.yml` |
| Version pinning | Always latest | Explicit version pin |

Use the **GitHub Action** for most projects. Use the **Central Registry** approach if you need strict version pinning or cannot use third-party actions.
