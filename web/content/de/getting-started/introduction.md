---
title: Einführung
description: Was oh-my-agent ist und wie die Multi-Agenten-Zusammenarbeit funktioniert.
---

# Einführung

oh-my-agent ist ein Multi-Agenten-Orchestrator für die Antigravity-IDE. Er leitet Anfragen an spezialisierte Skills weiter und koordiniert Agenten über Serena-Speicher.

## Was Sie erhalten

- Anfragengesteuerte Skill-Weiterleitung
- Workflow-basierte Ausführung für Planung/Review/Debugging
- CLI-Orchestrierung für parallele Agentenläufe
- Echtzeit-Dashboards zur Sitzungsüberwachung

## Agentenrollen

| Agent | Verantwortlichkeit |
|---|---|
| workflow-guide | Koordiniert komplexe domänenübergreifende Projekte |
| pm-agent | Planung und Architekturzerlegung |
| frontend-agent | React/Next.js-Implementierung |
| backend-agent | API-/Datenbank-/Auth-Implementierung |
| mobile-agent | Flutter/Mobile-Implementierung |
| qa-agent | Sicherheits-/Performance-/Barrierefreiheits-Review |
| debug-agent | Ursachenanalyse und regressionssichere Korrekturen |
| brainstorm | Design-First-Ideenfindung und Konzepterkundung |
| db-agent | Datenbankmodellierung, Schema-Design und Query-Tuning |
| dev-workflow | Entwickler-Workflow-Optimierung und CI/CD |
| tf-infra-agent | Terraform Infrastructure-as-Code Bereitstellung |
| translator | Kontextbewusste mehrsprachige Übersetzung |
| orchestrator | CLI-basierte Sub-Agenten-Orchestrierung |
| commit | Conventional-Commit-Workflow |

## Projektstruktur

- `.agents/skills/`: Skill-Definitionen und Ressourcen
- `.agents/workflows/`: Explizite Workflow-Befehle
- `.serena/memories/`: Laufzeit-Orchestrierungszustand
- `cli/cli.ts`: Referenzquelle für Befehlsschnittstellen

## Progressive Offenlegung

1. Absicht der Anfrage identifizieren
2. Nur benötigte Skill-Ressourcen laden
3. Mit spezialisierten Agenten ausführen
4. Über QA-/Debug-Schleifen verifizieren und iterieren
