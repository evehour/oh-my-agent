---
title: Introduccion
description: Que es oh-my-agent y como funciona la colaboracion multi-agente.
---

# Introduccion

oh-my-agent es un orquestador multi-agente para Antigravity IDE. Enruta solicitudes a skills especializados y coordina agentes a traves de las memorias de Serena.

## Que obtiene

- Enrutamiento de skills basado en la solicitud
- Ejecucion basada en flujos de trabajo para planificacion/revision/depuracion
- Orquestacion CLI para ejecuciones paralelas de agentes
- Paneles de control en tiempo real para monitoreo de sesiones

## Roles de agentes

| Agente | Responsabilidad |
|--------|----------------|
| workflow-guide | Coordina proyectos complejos multi-dominio |
| pm-agent | Planificacion y descomposicion de arquitectura |
| frontend-agent | Implementacion React/Next.js |
| backend-agent | Implementacion de API/base de datos/autenticacion |
| mobile-agent | Implementacion Flutter/mobile |
| qa-agent | Revision de seguridad/rendimiento/accesibilidad |
| debug-agent | Analisis de causa raiz y correcciones seguras contra regresiones |
| brainstorm | Ideación y exploración de conceptos con diseño primero |
| db-agent | Modelado de bases de datos, diseño de esquemas y ajuste de consultas |
| dev-workflow | Optimización de flujos de trabajo de desarrollo y CI/CD |
| tf-infra-agent | Aprovisionamiento de infraestructura como código con Terraform |
| translator | Traducción multilingüe consciente del contexto |
| orchestrator | Orquestacion de sub-agentes basada en CLI |
| commit | Flujo de trabajo de commits convencionales |

## Estructura del proyecto

- `.agents/skills/`: definiciones de skills y recursos
- `.agents/workflows/`: comandos de flujo de trabajo explicitos
- `.serena/memories/`: estado de orquestacion en tiempo de ejecucion
- `cli/cli.ts`: fuente de verdad para las interfaces de comandos

## Divulgacion progresiva

1. Identificar la intencion de la solicitud
2. Cargar solo los recursos de skill necesarios
3. Ejecutar con agentes especializados
4. Verificar e iterar mediante ciclos de QA/depuracion
