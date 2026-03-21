## Tabla de Contenidos

- [¿Qué es esto?](#qué-es-esto)
- [Por qué diferente](#por-qué-diferente)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [Patrocinadores](#patrocinadores)
- [Licencia](#licencia)

## ¿Qué es esto?

Una colección de **Agent Skills** que habilitan desarrollo colaborativo multi-agente. El trabajo se distribuye entre agentes expertos:

| Agente | Especialización | Activadores |
|-------|---------------|----------|
| **Brainstorm** | Ideación design-first antes de la planificación | "brainstorm", "ideate", "explore idea" |
| **PM Agent** | Análisis de requisitos, descomposición de tareas, arquitectura | "planificar", "descomponer", "qué deberíamos construir" |
| **Frontend Agent** | React/Next.js, TypeScript, Tailwind CSS | "UI", "componente", "estilos" |
| **Backend Agent** | Backend (Python, Node.js, Rust, ...) | "API", "base de datos", "autenticación" |
| **DB Agent** | Modelado SQL/NoSQL, normalización, integridad, backup, capacidad | "ERD", "schema", "database design", "index tuning" |
| **Mobile Agent** | Desarrollo multiplataforma con Flutter | "app móvil", "iOS/Android" |
| **QA Agent** | Seguridad OWASP Top 10, rendimiento, accesibilidad | "revisar seguridad", "auditoría", "verificar rendimiento" |
| **Debug Agent** | Diagnóstico de bugs, análisis de causa raíz, pruebas de regresión | "bug", "error", "crash" |
| **Developer Workflow** | Automatización de tareas monorepo, tareas mise, CI/CD, migraciones, release | "workflow dev", "tareas mise", "pipeline CI/CD" |
| **TF Infra Agent** | Provisión IaC multi-nube (AWS, GCP, Azure, OCI) | "infraestructura", "terraform", "config cloud" |
| **Orchestrator** | Ejecución paralela de agentes basada en CLI  | "generar agente", "ejecución paralela" |
| **Commit** | Conventional Commits con reglas específicas del proyecto | "commit", "guardar cambios" |


## Por qué diferente

- **`.agents/` es la fuente de verdad**: skills, workflows, recursos compartidos y configuración viven en una estructura de proyecto portátil en lugar de estar atrapados dentro de un plugin IDE.
- **Equipos de agentes basados en roles**: los agentes PM, QA, DB, Infra, Frontend, Backend, Mobile, Debug y Workflow están modelados como una organización de ingeniería, no solo como una pila de prompts.
- **Orquestación workflow-first**: planificación, revisión, depuración y ejecución coordinada son workflows de primera clase, no pensados después.
- **Diseño consciente de estándares**: los agentes ahora llevan guía enfocada para planificación ISO, QA, continuidad/seguridad de bases de datos y gobernanza de infraestructura.
- **Construido para verificación**: dashboards, generación de manifiestos, protocolos de ejecución compartidos y salidas estructuradas favorecen la trazabilidad sobre generación basada solo en vibes.



## Inicio Rápido

### Requisitos Previos

- **AI IDE** (Antigravity, Claude Code, Codex, Gemini, etc.)

### Opción 1: Instalación en Una Línea (Recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Detecta e instala automáticamente las dependencias faltantes (bun, uv) y luego lanza la configuración interactiva.

### Opción 2: Instalación Manual

```bash
# Instala bun si no lo tienes:
# curl -fsSL https://bun.sh/install | bash

# Instala uv si no lo tienes:
# curl -LsSf https://astral.sh/uv/install.sh | sh

bunx oh-my-agent
```

Selecciona tu tipo de proyecto y los skills se instalarán en `.agents/skills/`.

| Preset | Skills |
|--------|--------|
| ✨ All | Todo |
| 🌐 Fullstack | oma-brainstorm, oma-frontend, oma-backend, oma-db, oma-pm, oma-qa, oma-debug, oma-commit |
| 🎨 Frontend | oma-brainstorm, oma-frontend, oma-pm, oma-qa, oma-debug, oma-commit |
| ⚙️ Backend | oma-brainstorm, oma-backend, oma-db, oma-pm, oma-qa, oma-debug, oma-commit |
| 📱 Mobile | oma-brainstorm, oma-mobile, oma-pm, oma-qa, oma-debug, oma-commit |
| 🚀 DevOps | oma-brainstorm, oma-tf-infra, oma-dev-workflow, oma-pm, oma-qa, oma-debug, oma-commit |

### Opción 3: Instalación Global (Para Orchestrator)

Para usar las herramientas principales globalmente o ejecutar el SubAgent Orchestrator:

```bash
bun install --global oh-my-agent
```

También necesitarás al menos una herramienta CLI:

| CLI | Instalar | Autenticación |
|-----|---------|------|
| Gemini | `bun install --global @google/gemini-cli` | Auto on first `gemini` run |
| Claude | `curl -fsSL https://claude.ai/install.sh \| bash` | Auto on first `claude` run |
| Codex | `bun install --global @openai/codex` | `codex login` |
| Qwen | `bun install --global @qwen-code/qwen-code` | `/auth` inside CLI |

### Opción 4: Integrar en Proyecto Existente

**Recomendado (CLI):**

Ejecuta el siguiente comando en la raíz de tu proyecto para instalar/actualizar automáticamente skills y workflows:

```bash
bunx oh-my-agent
```

> **Consejo:** Ejecuta `bunx oh-my-agent doctor` después de la instalación para verificar que todo esté configurado correctamente (incluyendo workflows globales).

### 2. Chat

**Tarea simple** (invocar skill de dominio directamente):

```
"Crear un formulario de login con Tailwind CSS y validación de formularios"
→ skill oma-frontend
```

**Proyecto complejo** (/coordinate workflow):

```
"Construir una app TODO con autenticación de usuarios"
→ /coordinate → PM Agent planifica → agentes generados en Agent Manager
```

**Despliegue máximo** (/ultrawork workflow):

```
"Refactorizar módulo de auth, agregar tests de API y actualizar docs"
→ /ultrawork → Tareas independientes se ejecutan en paralelo entre agentes
```

**Commitear cambios** (conventional commits):

```
/commit
→ Analizar cambios, sugerir tipo/scope de commit, crear commit con Co-Author
```

### 3. Monitorear con Dashboards

Para detalles de configuración y uso del dashboard, consulta [`web/content/es/guide/usage.md`](./web/content/es/guide/usage.md#dashboards-en-tiempo-real).


## Arquitectura

```mermaid
flowchart TD
    subgraph Workflows["Flujos de Trabajo"]
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

    subgraph Orchestration["Orquestación"]
        direction TB
        PM[oma-pm]
        ORC[orchestrator]
    end

    subgraph Domain["Agentes de Dominio"]
        direction TB
        FE[oma-frontend]
        BE[oma-backend]
        DB[oma-db]
        MB[oma-mobile]
        TF[oma-tf-infra]
    end

    subgraph Quality["Calidad"]
        direction TB
        QA[oma-qa]
        DBG[oma-debug]
    end


    Workflows --> Orchestration
    Orchestration --> Domain
    Domain --> Quality
    Quality --> CMT([commit])
```


## Patrocinadores

Este proyecto se mantiene gracias a nuestros generosos patrocinadores.

<a href="https://github.com/sponsors/first-fluke">
  <img src="https://img.shields.io/badge/Sponsor-♥-ea4aaa?style=for-the-badge" alt="Sponsor" />
</a>
<a href="https://buymeacoffee.com/firstfluke">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-FFDD00?style=for-the-badge" alt="Buy Me a Coffee" />
</a>

### 🚀 Champion

<!-- Champion tier ($100/mo) logos here -->

### 🛸 Booster

<!-- Booster tier ($30/mo) logos here -->

### ☕ Contributor

<!-- Contributor tier ($10/mo) names here -->

[Conviértete en patrocinador →](https://github.com/sponsors/first-fluke)

Consulta [SPONSORS.md](./SPONSORS.md) para una lista completa de colaboradores.


## Licencia

MIT

