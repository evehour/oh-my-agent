---
title: Workflows
description: Workflows explicites par commande slash et quand les utiliser.
---

# Workflows

## Commandes de workflow

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

## Skills vs Workflows

- Skills : activés automatiquement en fonction de l'intention de la requête
- Workflows : pipelines explicites en plusieurs étapes déclenchés par l'utilisateur

## Séquence multi-agent typique

1. `/plan` pour la décomposition
2. `/coordinate` pour l'exécution par étapes
3. `agent:spawn` pour les sous-agents parallèles
4. `/review` pour le contrôle qualité
