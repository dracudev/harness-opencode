# OpenCode -- Inventario del Harness

> **Última actualizacion**: 2026-07-23
> **Versión OpenCode**: 1.15.13
> **Propósito**: Referencia completa de todas las herramientas, agentes, skills, MCPs y configuraciones en este espacio de trabajo OpenCode.

---

## Indice

- [1. Capa de Runtime](#1-capa-de-runtime)
- [2. Capa de Planificación](#2-capa-de-planificación)
- [3. Capa de Cognicion](#3-capa-de-cognicion)
- [4. Capa de Memoria](#4-capa-de-memoria)
- [5. Capa de Skills de Dominio](#5-capa-de-skills-de-dominio)
- [6. Capa de Herramientas](#6-capa-de-herramientas)
- [7. Inventario de Agentes](#7-inventario-de-agentes)
- [8. Comandos](#8-comandos)
- [9. Sistema de Contexto](#9-sistema-de-contexto)
- [10. Estadisticas](#10-estadisticas)
- [11. Integraciones Externas](#11-integraciones-externas)
- [12. Estructura Externa del Sistema](#12-estructura-externa-del-sistema)
- [13. Plugins y Paquetes Cacheados](#13-plugins-y-paquetes-cacheados)
- [14. Herramientas Externas Evaluadas](#14-herramientas-externas-evaluadas)

---

## 1. Capa de Runtime

| Componente | Versión | Propósito | Ubicación |
|-----------|---------|-----------|-----------|
| **OpenCode** | 1.15.13 | Runtime principal de agentes -- orquestra sesiones, compaccion, permisos y ciclo de vida del agente | `~/.config/opencode/opencode.jsonc` |
| **Dynamic Context Pruning (DCP)** | latest | Reduce contexto irrelevante en ventanas largas, manteniendo señal alta | Plugin: `@tarquinen/opencode-dcp@latest`, config: `~/.config/opencode/dcp.jsonc` |
| **Engram Plugin** | -- | Adaptador que conecta eventos de OpenCode al servidor HTTP de Engram para persistencia de memoria | `~/.config/opencode/plugins/engram.ts` |

### Configuración de OpenCode (`~/.config/opencode/opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "engram": { "command": ["engram", "mcp", "--tools=agent"], "enabled": true, "type": "local" },
    "codegraph": { "command": ["codegraph", "serve", "--mcp"], "enabled": true, "type": "local" }
  },
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@tarquinen/opencode-dcp@latest"
  ]
}
```

---

## 2. Capa de Planificación

| Componente | Versión | Propósito | Ubicación |
|-----------|---------|-----------|-----------|
| **OpenSpec** | -- | Desarrollo guíado por especificaciones (spec-driven development) | `.opencode/context/core/workflows/openspec-change-template.md` |
| **TaskManager** (subagente) | 2.0.0 | Descompone features complejas en subtareas JSON con dependencias y CLI | `.opencode/agent/subagents/core/task-manager.md` |
| **BatchExecutor** (subagente) | 1.0.0 | Ejecución paralela de subtareas por lotes | `.opencode/config/agent-metadata.json` (registrado) |
| **superpowers/writing-plans** | -- | Planifica tareas multi-paso antes de tocar código | `~/.cache/opencode/packages/superpowers/.../writing-plans/SKILL.md` |
| **superpowers/brainstorming** | -- | Explora intención del usuario, requerimientos y diseño antes de implementar | `~/.cache/opencode/packages/superpowers/.../brainstorming/SKILL.md` |

---

## 3. Capa de Cognicion

| Componente | Versión | Propósito | Ubicación |
|-----------|---------|-----------|-----------|
| **Codegraph** | 0.9.8 | Comprension estructural del repositorio -- call graph, trace, impact analysis, symbol search | MCP: `codegraph serve --mcp` |
| **Dynamic Context Pruning** | latest | Reduce contexto irrelevante en tiempo real; plugin + schema de configuración | `@tarquinen/opencode-dcp@latest`, `~/.config/opencode/dcp.jsonc` |
| **ContextScout** (subagente) | 1.0.0 | Descubre y recomienda archivos de contexto internos (`.opencode/context/`) rankeados por prioridad | `.opencode/agent/subagents/core/contextscout.md` |
| **ExternalScout** (subagente) | 1.0.0 | Busca documentación actualizada de librerias externas/frameworks (Context7 + otras fuentes) | `.opencode/agent/subagents/core/externalscout.md` |
| **ContextRetriever** (subagente) | 1.0.0 | Recuperacion de contexto por busqueda semantica | Registrado en `agent-metadata.json` |
| **ContextManager** (subagente) | 1.0.0 | Gestion y organizacion del sistema de contexto | Registrado en `agent-metadata.json` |

### Herramientas MCP de Codegraph

| Herramienta | Propósito |
|-------------|-----------|
| `codegraph_context` | Puntos de entrada + simbolos relacionados + código clave para preguntas de arquitectura/bugs |
| `codegraph_search` | Busqueda rápida de simbolos por nombre |
| `codegraph_node` | Detalles de un simbolo: ubicación, firma, callers/callees |
| `codegraph_explore` | Multiples simbolos relacionados agrupados por archivo (equivalente a Read) |
| `codegraph_trace` | Ruta completa de llamadas entre dos simbolos |
| `codegraph_callees` | Lista funciones llamadas por un simbolo |
| `codegraph_callers` | Lista funciones que llaman a un simbolo |
| `codegraph_impact` | Simbolos afectados al cambiar un simbolo dado |
| `codegraph_files` | Árbol de archivos indexado con conteo de lenguajes y simbolos |
| `codegraph_status` | Verificacion de salud del indice |

---

## 4. Capa de Memoria

| Componente | Versión | Propósito | Ubicación |
|-----------|---------|-----------|-----------|
| **Engram** | 1.16.1 | Memoria persistente del proyecto -- SQLite + FTS5 full-text search con sincronizacion git | Binario: `~/.local/bin/engram`, MCP: `engram mcp --tools=agent` |
| **Engram Plugin** | -- | Adaptador ligero: eventos OpenCode -> HTTP calls -> engram serve -> SQLite | `~/.config/opencode/plugins/engram.ts` |
| **context7** (skill) | -- | Recupera documentación actualizada de librerias via Context7 API | `.opencode/skills/context7/SKILL.md` |

### Herramientas MCP de Engram

| Herramienta | Propósito |
|-------------|-----------|
| `mem_save` | Guarda observaciones estructuradas (decisiones, bugs, patrones) |
| `mem_search` | Busqueda full-text (FTS5) en todas las memorias |
| `mem_context` | Recupera contexto de sesiones recientes |
| `mem_get_observation` | Obtiene el contenido completo de una observacion |
| `mem_update` | Actualiza una observacion existente |
| `mem_suggest_topic_key` | Sugiere clave de topico para upserts |
| `mem_save_prompt` | Guarda el prompt del usuario |
| `mem_session_summary` | Resumen de fin de sesion estructurado |
| `mem_session_start` / `mem_session_end` | Marca inicio/fin de sesiones |
| `mem_judge` | Registra veredicto sobre conflictos de memoria |
| `mem_compare` | Persiste veredicto semantico entre memorias |
| `mem_capture_passive` | Extrae aprendizajes de texto automáticamente |
| `mem_doctor` | Diagnostico operacional de Engram |
| `mem_current_project` | Detecta el proyecto actual |

### Hooks del Plugin Engram

| Hook | Propósito |
|------|-----------|
| `session.created` | Registra la sesion en Engram (excluye sub-agentes) |
| `session.deleted` | Limpia conteos de herramientas |
| `chat.message` | Captura prompts del usuario (>10 chars) |
| `tool.execute.after` | Cuenta tool calls; captura pasiva de output de Task |
| `experimental.chat.system.transform` | Inyecta instrucciones de memoria en system prompt |
| `experimental.session.compacting` | Auto-save checkpoint + inyecta contexto de sesiones previas + resetea flag de inyeccion para el nuevo agente |

---

## 5. Capa de Skills de Dominio

### Desarrollo Odoo

| Skill | Propósito | Ubicación |
|-------|-----------|-----------|
| **odoo-19** | 18 guías especializadas: Actions, Controllers, Data files, Decorators, Constraints, Indexes, Module dev, Fields, Manifest, Mixins, ORM, Migration, OWL, Performance, QWeb, Security, Testing, Transactions, Translations, XML Views | `~/.agents/skills/odoo-19/SKILL.md` |

### Frontend y Diseño

| Skill | Propósito | Ubicación |
|-------|-----------|-----------|
| **pols-slop** | 🔁 Auto-cargado. Ley anti-slop (~100 patrones): fonts, colores, layouts, sombras, animaciones, composición. Previene slop antes de que se genere. Se carga automáticamente para cualquier tarea de frontend. | `~/.agents/skills/pols-slop/SKILL.md` |
| **impeccable** | Design guidance con 23 comandos, 58 reglas detectoras anti-AI-slop, iteración en vivo, y CLI independiente (`npx impeccable detect`). Fork evolucionado de frontend-design. | `~/.opencode/skills/impeccable/SKILL.md` |
| **design-taste-frontend** | Anti-slop: landing pages, portfolios, redesigns con dirección de diseño real y reglas duras (dials, GSAP skeletons, arquitectura) | `~/.agents/skills/design-taste-frontend/SKILL.md` |
| **extract-design-system** | Extrae primitivas de diseño de sitios publicos hacia token files | `~/.agents/skills/extract-design-system/SKILL.md` |
| **caveman** | Modo de comunicacion ultra-comprimido (~75% menos tokens) | `~/.agents/skills/caveman/SKILL.md` |
| **humanizer** | Remueve señales de escritura AI del texto (invocacion manual) | `~/.agents/skills/humanizer/SKILL.md` |

### Calidad Web

| Skill | Propósito | Ubicación |
|-------|-----------|-----------|
| **web-quality-audit** | Auditoria integral: performance, accessibility, SEO, best practices | `~/.agents/skills/web-quality-audit/SKILL.md` |
| **accessibility** | Auditoria WCAG 2.2: screen readers, keyboard nav, a11y | `~/.agents/skills/accessibility/SKILL.md` |
| **best-practices** | Seguridad web moderna, compatibilidad, calidad de código | `~/.agents/skills/best-practices/SKILL.md` |
| **performance** | Optimización de carga: Core Web Vitals, metricas | `~/.agents/skills/performance/SKILL.md` |
| **core-web-vitals** | LCP, INP, CLS -- optimización específica para page experience y ranking | `~/.agents/skills/core-web-vitals/SKILL.md` |

### SEO

| Skill | Propósito | Ubicación |
|-------|-----------|-----------|
| **seo** | Meta tags, structured data, sitemaps, visibilidad en busqueda | `~/.agents/skills/seo/SKILL.md` |
| **seo-audit** | Diagnostico: technical SEO, rankings, crawl errors, core web vitals | `~/.agents/skills/seo-audit/SKILL.md` |
| **schema-markup** | JSON-LD, rich snippets, FAQ/product/review schema | `~/.agents/skills/.agents/skills/schema-markup/SKILL.md` |

### Otros

| Skill | Propósito | Ubicación |
|-------|-----------|-----------|
| **git-commit** | Conventional commits con staging inteligente y mensajes generados | `~/.agents/skills/git-commit/SKILL.md` |
| **find-skills** | Descubre e instala nuevos skills | `~/.agents/skills/find-skills/SKILL.md` |

### Code Optimization (Ponytail)

Skills incluidos con el plugin **ponytail** (`~/.config/opencode/ponytail/skills/`), activos via OpenCode:

| Skill | Propósito |
|-------|-----------|
| **ponytail** | Cambiar intensidad: lite/full/ultra/off |
| **ponytail-review** | Revisa el diff actual por over-engineering, sugiere que borrar |
| **ponytail-audit** | Audita el repo entero por código innecesario |
| **ponytail-debt** | Tracking de shortcuts `ponytail:` diferidos ("later" -> "never" prevention) |
| **ponytail-gain** | Scoreboard de impacto medido (-54% LOC, -20% costo, -27% tiempo) |
| **ponytail-help** | Referencia rápida de comandos |

---

## 6. Capa de Herramientas

### Superpowers (Plugin)

**Fuente**: `superpowers@git+https://github.com/obra/superpowers.git`

| Skill | Propósito | Estado |
|-------|-----------|--------|
| **using-superpowers** | Guía de uso de Superpowers; siempre cargado | Activo |
| **brainstorming** | Explora intención, requerimientos y diseño antes de crear | Activo |
| **writing-plans** | Planifica tareas multi-paso antes de tocar código | Activo |
| **test-driven-development** | TDD: red-green-refactor antes de implementar | Activo |
| **systematic-debugging** | Debugging sistematico antes de proponer fixes | Activo |
| **subagent-driven-development** | Ejecuta planes con tareas independientes en paralelo | Activo |
| **dispatching-parallel-agents** | Despacha 2+ agentes paralelos para tareas independientes | Activo |
| **verification-before-completion** | Verifica con comandos reales antes de declarar "completado" | Activo |
| **requesting-code-review** | Solicita review al completar features | Activo |
| **receiving-code-review** | Recibe feedback de review con rigor técnico | Activo |
| **executing-plans** | DESHABILITADO | Inactivo |
| **finishing-a-development-branch** | DESHABILITADO | Inactivo |
| **using-git-worktrees** | DESHABILITADO | Inactivo |
| **writing-skills** | DESHABILITADO | Inactivo |

### Servidores MCP

| Servidor | Tipo | Propósito |
|----------|------|-----------|
| **engram** | local | Memoria persistente via `engram mcp --tools=agent` |
| **codegraph** | local | Comprension estructural del código via `codegraph serve --mcp` |

### Herramientas Integradas

| Herramienta | Propósito |
|-------------|-----------|
| **Bash** | Ejecución de comandos shell con timeout y sandbox |
| **Read** | Lectura de archivos y directorios |
| **Write** | Escritura de archivos |
| **Edit** | Edicion precisa con string replacement |
| **Glob** | Busqueda de archivos por patron |
| **Grep** | Busqueda de contenido por regex |
| **Task** | Delegacion a subagentes especializados |
| **WebFetch** | Fetch HTTP de URLs externas |
| **Skill** | Carga dinamica de skills |
| **Compress** | Compresión de contexto en summaries de alta fidelidad |
| **TodoWrite** | Gestion de listas de tareas |

### Herramientas Personalizadas

| Herramienta | Propósito | Ubicación |
|-------------|-----------|-----------|
| **env** | Cargador de variables de entorno desde archivos `.env` | `.opencode/tool/env/index.ts` |

---

## 7. Inventario de Agentes

### Agentes Principales

| Agente | Modo | Propósito | Ubicación |
|--------|------|-----------|-----------|
| **OpenAgent** | primary | Agente universal: preguntas, tareas, coordinacion de workflows, delegacion a especialistas | `.opencode/agent/core/openagent.md` |
| **OpenCoder** | primary | Desarrollo: codificacion, implementacion, debugging | `.opencode/agent/core/opencoder.md` |

### Subagentes -- Nucleo

| Subagente | Propósito | Ubicación |
|-----------|-----------|-----------|
| **TaskManager** | Descompone features complejas en subtareas JSON con dependencias y CLI | `.opencode/agent/subagents/core/task-manager.md` |
| **ContextScout** | Descubre y recomienda context files rankeados por prioridad | `.opencode/agent/subagents/core/contextscout.md` |
| **ExternalScout** | Busca documentación actualizada de librerias externas | `.opencode/agent/subagents/core/externalscout.md` |
| **DocWriter** | Genera documentación comprehensiva | `.opencode/agent/subagents/core/documentation.md` |

### Subagentes -- Código

| Subagente | Propósito | Ubicación |
|-----------|-----------|-----------|
| **CoderAgent** | Ejecuta subtareas de codificacion secuencialmente | `.opencode/agent/subagents/code/coder-agent.md` |
| **TestEngineer** | Autoria de tests y TDD | `.opencode/agent/subagents/code/test-engineer.md` |
| **CodeReviewer** | Code review, seguridad, aseguramiento de calidad | `.opencode/agent/subagents/code/reviewer.md` |
| **BuildAgent** | Type checking y validación de build | `.opencode/agent/subagents/code/build-agent.md` |

### Subagentes -- Desarrollo

| Subagente | Propósito | Ubicación |
|-----------|-----------|-----------|
| **OpenFrontendSpecialist** | UI design: design systems, themes, animations | `.opencode/agent/subagents/development/frontend-specialist.md` |
| **OpenDevopsSpecialist** | CI/CD, infraestructura como código, deployment automation | `.opencode/agent/subagents/development/devops-specialist.md` |

### Subagentes -- Constructor de Sistemas

| Subagente | Propósito | Ubicación |
|-----------|-----------|-----------|
| **ContextOrganizer** | Organiza y genera archivos de contexto (domain, processes, standards, templates) | `.opencode/agent/subagents/system-builder/context-organizer.md` |

### Registrados en Metadata (sin archivo .md implementado aún)

Estos agentes estan definidos en `agent-metadata.json` pero no tienen archivo `.md` correspondiente:

| Agente | Categoria | Propósito |
|--------|-----------|-----------|
| **RepoManager** | meta | Orquestacion y gestion de repositorios |
| **SystemBuilder** | meta | Generación de sistemas, arquitectura, scaffolding |
| **Copywriter** | content | Contenido, marketing, escritura |
| **TechnicalWriter** | content | Documentación técnica |
| **DataAnalyst** | data | Análisis y visualizacion de datos |
| **EvalRunner** | testing | Testing y evaluacion de calidad |
| **BatchExecutor** | subagents/core | Ejecución paralela de lotes |
| **ContextManager** | subagents/core | Gestion de contexto |
| **ContextRetriever** | subagents/core | Recuperacion de contexto |
| **AgentGenerator** | subagents/system-builder | Generación de agentes |
| **CommandCreator** | subagents/system-builder | Creacion de comandos |
| **DomainAnalyzer** | subagents/system-builder | Análisis de dominio |
| **WorkflowDesigner** | subagents/system-builder | Diseño de workflows |
| **ImageSpecialist** | subagents/utils | Imágenes, edicion, generación |
| **SimpleResponder** | subagents/test | Testing y evaluacion |

---

## 8. Comandos

Comandos slash personalizados registrados en `.opencode/command/`:

| Comando | Propósito |
|---------|-----------|
| `/add-context` | Anadir archivos de contexto al sistema |
| `/analyze-patterns` | Analizar patrones de código |
| `/clean` | Limpiar archivos temporales y sesiones |
| `/commit` | Commit con mensaje convencional |
| `/context` | Gestion del sistema de contexto (harvest, extract, organize, map, validate) |
| `/test` | Ejecutar tests |
| `/validate-repo` | Validar estructura del repositorio |
| `/optimize` | Optimización de código/rendimiento |
| `/openagents/*` | Comandos del subsistema OpenAgents Control |

---

## 9. Sistema de Contexto

Estructura completa en `.opencode/context/`:

### Raiz y Namespaces

| Ruta | Contenido |
|------|-----------|
| `navigation.md` | Indice principal de navegacion |
| `core/` | Estandares universales y workflows |
| `openagents-repo/` | Repositorio OpenAgents Control |
| `development/` | Desarrollo de software (todas las stacks) |
| `project-intelligence/` | Inteligencia de proyecto |
| `project/` | Configuración del proyecto actual |
| `ui/` | Diseño visual y UX |

### core/

| Ruta | Contenido |
|------|-----------|
| `navigation.md` | Navegacion del sistema core |
| `essential-patterns.md` | Patrones esenciales |
| `visual-development.md` | Desarrollo visual |
| `context-system.md` | Documentación del sistema de contexto |

### core/standards/ -- Estandares de Calidad

| Archivo | Propósito |
|---------|-----------|
| `code-quality.md` | Estandares de código |
| `documentation.md` | Estandares de documentación |
| `test-coverage.md` | Estandares de testing |
| `code-analysis.md` | Análisis de código |
| `security-patterns.md` | Patrones de seguridad |
| `project-intelligence.md` | Inteligencia de proyecto |
| `project-intelligence-management.md` | Gestion de inteligencia de proyecto |
| `navigation.md` | Navegacion de estandares |

### core/workflows/ -- Workflows Operativos

| Archivo | Propósito |
|---------|-----------|
| `code-review.md` | Revision de código |
| `component-planning.md` | Planificación de componentes |
| `delegation.md` | Delegacion de tareas |
| `task-delegation-basics.md` | Fundamentos de delegacion |
| `task-delegation-caching.md` | Caching en delegacion |
| `task-delegation-specialists.md` | Delegacion a especialistas |
| `feature-breakdown.md` | Descomposicion de features |
| `session-management.md` | Gestion de sesiones |
| `review.md` | Proceso de revision |
| `external-context-integration.md` | Integracion de contexto externo |
| `external-context-management.md` | Gestion de contexto externo |
| `external-libraries-faq.md` | FAQ de librerias externas |
| `external-libraries-scenarios.md` | Escenarios con librerias externas |
| `openspec-change-template.md` | Template de cambios OpenSpec |
| `design-iteration-overview.md` | Vista general de iteraciones de diseño |
| `design-iteration-plan-file.md` | Archivo de plan de iteración |
| `design-iteration-plan-iterations.md` | Planificación de iteraciones |
| `design-iteration-stage-layout.md` | Etapa: layout |
| `design-iteration-stage-animation.md` | Etapa: animacion |
| `design-iteration-stage-theme.md` | Etapa: tema |
| `design-iteration-stage-implementation.md` | Etapa: implementacion |
| `design-iteration-visual-content.md` | Contenido visual de iteraciones |
| `design-iteration-best-practices.md` | Buenas prácticas de iteraciones |
| `navigation.md` | Navegacion de workflows |

### core/context-system/ -- Sistema de Contexto

| Subdirectorio | Contenido |
|---------------|-----------|
| `CHANGELOG.md` | Registro de cambios |
| `navigation.md` | Navegacion |
| `guides/` | compact.md, creation.md, navigation-design-basics.md, navigation-templates.md, organizing-context.md, workflows.md |
| `operations/` | harvest.md, extract.md, organize.md, migrate.md, update.md, error.md |
| `standards/` | frontmatter.md, structure.md, mvi.md, codebase-references.md, templates.md |
| `examples/` | navigation-examples.md |

### core/system/

| Archivo | Propósito |
|---------|-----------|
| `context-paths.md` | Rutas de contexto |
| `context-guide.md` | Guía de contexto |
| `navigation.md` | Navegacion del sistema |

### core/task-management/

| Subdirectorio | Contenido |
|---------------|-----------|
| `navigation.md` | Navegacion de gestion de tareas |
| `guides/managing-tasks.md` | Gestion de tareas |
| `guides/splitting-tasks.md` | Division de tareas |
| `lookup/task-commands.md` | Comandos de tareas |
| `standards/task-schema.md` | Esquema de tareas |

### core/config/

| Archivo | Propósito |
|---------|-----------|
| `navigation.md` | Navegacion de configuración |

---

## 10. Estadisticas

| Categoria | Cantidad |
|-----------|----------|
| Agentes principales | 2 |
| Subagentes (implementados) | 11 |
| Subagentes (solo metadata) | 15 |
| Skills (activos) | 25 |
| Skills (deshabilitados) | 5 |
| Servidores MCP | 2 |
| Plugins | 4 (3 activos + 1 cacheado) |
| Comandos personalizados | 8+ |
| Herramientas personalizadas | 1 |
| Binarios externos | 3 |
| Archivos de contexto | 60+ |
| Herramientas MCP (Engram) | 14 |
| Herramientas MCP (Codegraph) | 9 |

---

## 11. Integraciones Externas

| Integracion | Protocolo | Propósito |
|-------------|-----------|-----------|
| **Engram** | MCP (local) + HTTP (plugin) | Memoria persistente |
| **Codegraph** | MCP (local) | Comprension de código |
| **Context7** | API (via skill) | Documentación actualizada de librerias |
| **Superpowers** | Plugin (npm git) | Skills de desarrollo avanzados |
| **DCP** | Plugin (npm) | Dynamic Context Pruning |
| **Ponytail** | Plugin (local .mjs) | Modo "lazy senior dev" con 7 niveles de escalera YAGNI. Incluye 6 skills de auditoria. |

---

## 12. Estructura Externa del Sistema

Directorios y archivos fuera de `.opencode/` que forman parte del harness.

### ~/.local/share/opencode/ -- Datos de Runtime

| Ruta | Contenido |
|------|-----------|
| `opencode.db` | Base de datos SQLite principal (sesiones, mensajes, configuración) |
| `opencode.db-shm` / `opencode.db-wal` | Archivos auxiliares SQLite (shared memory, write-ahead log) |
| `storage/plugin/` | Almacenamiento de plugins |
| `storage/session_diff/` | Diffs de sesion |
| `tool-output/` | Output capturado de herramientas (archivos de tool calls largos) |
| `log/` | Logs de sesiones (ej: `2026-07-23T160430.log`) |
| `snapshot/` | Snapshots de estado (hashes de git) |
| `repos/` | Workspace repos (vacio actualmente) |
| `auth.json` | Autenticacion de proveedores |

### ~/.codegraph/ -- Instalación de Codegraph

| Ruta | Contenido |
|------|-----------|
| `current/bin/` | Binario codegraph activo |
| `current/lib/` | Librerias de soporte |
| `current/node` | Runtime Node.js empaquetado |
| `versions/v0.9.8/` | Versión instalada |

### ~/.engram/ -- Base de Datos de Memoria

| Archivo | Propósito |
|---------|-----------|
| `engram.db` | SQLite con FTS5 full-text search |
| `engram.db-shm` / `engram.db-wal` | Archivos auxiliares SQLite |

### ~/.cache/opencode/ -- Cache de Paquetes y Plugins

| Ruta | Propósito |
|------|-----------|
| `bin/rg` | ripgrep empaquetado para busquedas |
| `models.json` | Catalogo de modelos disponibles (~3.2 MB) |
| `packages/` | Plugins cacheados (ver Seccion 13) |

### ~/.local/bin/ -- Binarios Globales

| Binario | Propósito |
|---------|-----------|
| `codegraph` | CLI de Codegraph (indexado, serve, MCP) |
| `engram` | CLI de Engram (serve, MCP, memoria) |
| `optimize-images` | Optimización de imágenes (compresión, conversion de formato) |

### ~/.opencode/node_modules/ -- Dependencias del Workspace OAC

| Paquete | Propósito |
|---------|-----------|
| `effect` | Sistema de efectos funcionales |
| `zod` | Validación de schemas |
| `yaml` | Parseo/generación YAML |
| `kubernetes-types` | Tipos Kubernetes |
| `@opencode-ai/plugin` | SDK de plugins de OpenCode |
| `@opencode-ai/sdk` | SDK de OpenCode |
| `cross-spawn` | Spawn de procesos cross-platform |
| `msgpackr` | MessagePack serialization |

> **Nota**: Estas dependencias coinciden con `opencode-plugin-openspec`, indicando que OpenSpec esta integrado en el workspace OAC aunque no se declara explicitamente como plugin en `opencode.jsonc`.

---

## 14. Herramientas Externas Evaluadas

### Ponytail -- Compresión de Output

- **Repo**: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (88k estrellas)
- **Ubicación**: `~/.config/opencode/ponytail/`
- **Activo**: Siempre (plugin en `opencode.jsonc`), nivel `full`

Modo "lazy senior dev" con escalera YAGNI de 7 niveles. Metricas: -54% LOC, -22% tokens, -20% costo. Incluye 6 skills: ponytail, ponytail-review, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help.

### RTK -- Rust Token Killer

- **Repo**: [rtk-ai/rtk](https://github.com/rtk-ai/rtk) (72.8k estrellas)
- **Versión instalada**: 0.43.0 (via script oficial)
- **Ubicación**: `~/.local/bin/rtk` (9.7 MB), plugin `~/.config/opencode/plugins/rtk.ts`
- **Activo**: Siempre (plugin en `opencode.jsonc`)

**Qué hace**: Proxy CLI que intercepta bash commands y comprime el output antes de llegar al LLM. Binario Rust único, zero dependencias externas, <10ms overhead. 100+ comandos soportados con filtros especificos: git, cargo, npm, pytest, docker, kubectl, AWS, etc.

**Estrategia por comando**: Smart filtering (ruido), grouping (agregación), truncation (contexto relevante), deduplication (logs repetidos). No es compresión ML generica -- cada comando tiene filtros especificos que entienden su formato de output.

**Metricas (reduccion de output bash)**:

| Comando | Ahorro |
|---|---|
| `ls -la` | ~75% |
| `git push/pull` | ~93% |
| `cargo test` / `pytest` | ~90% |
| `cargo build` | ~80% |
| `docker ps` / `kubectl` | ~85% |

**Tee mode**: Si un comando falla, RTK guarda el output completo en `~/.local/share/rtk/tee/` para que el LLM pueda leerlo sin re-ejecutar.

**Integracion OpenCode**: Plugin TS nativo (`rtk init -g --opencode`). Hook `tool.execute.before` que intercepta bash/shell commands y los reescribe via `rtk rewrite`. El agente ni se entera. Cero conflicto con Engram (`tool.execute.after`) ni Ponytail (`chat.system.transform`).

**Por qué always-on**: 9.7 MB, <10ms, zero deps, sin peso en system prompt, sin friccion para el usuario. Es lo opuesto a Headroom.

**Complementariedad**:

| Herramienta | Qué comprime | Capa |
|---|---|---|
| RTK | INPUT (bash tool outputs) | Plugin `tool.execute.before` |
| Ponytail | OUTPUT (código generado) | System prompt |
| Caveman | OUTPUT (prosa) | System prompt |
| Engram | Memoria cross-sesion | Plugin `tool.execute.after` |

### Impeccable -- Detector de AI-Slop y Skill de Diseño

- **Repo**: [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (49.6k estrellas)
- **Versión instalada**: 3.3.1 (npm global + skill OpenCode)
- **Ubicación**: skill `~/.opencode/skills/impeccable/`, CLI `~/.nvm/versions/node/v24.11.0/bin/impeccable`
- **Activo**: Skill bajo demanda (`/impeccable`), CLI manual (`npx impeccable detect`)

**Qué hace**: 
- **Skill**: 23 comandos de diseño (polish, critique, audit, distill, animate, etc.), modos (Persuade, Operate, Read, Experience), contexto persistente (PRODUCT.md + DESIGN.md), iteración en vivo en navegador. Fork evolucionado de `frontend-design`.
- **CLI detector**: 58 reglas deterministas que escanean HTML/CSS y detectan anti-patrones de diseño AI (Inter font, purple gradients, cards anidadas, bounce easing, etc.) sin consumir tokens de LLM.

**Detección (CLI)**:
```bash
npx impeccable detect src/      # escanea directorio
npx impeccable detect --json .  # CI-friendly
npx impeccable ignores list     # gestion de waivers
```

**Por qué reemplaza a frontend-design**: `frontend-design` (42 líneas) era una directriz simple de "se creativo, evita Inter". Impeccable es su evolución: comandos granulares, contexto persistente entre sesiones, y un CLI detector determinista que no existia.

**Complementariedad con design-taste-frontend**: No se solapan. `design-taste-frontend` aporta reglas duras (dials VARIANCE/MOTION/DENSITY, GSAP skeletons, arquitectura RSC, mapeo a design systems reales). Impeccable aporta proceso (comandos, modos, live iteration) y detección (CLI determinista).

**Design hook**: No aplica a OpenCode (solo Claude Code, Cursor, Codex, Grok). La detección se usa via CLI manual.

---

## 13. Plugins y Paquetes Cacheados

### Plugins Activos (declarados en `opencode.jsonc`)

| Plugin | Fuente | Propósito |
|--------|--------|-----------|
| **superpowers** | `git+https://github.com/obra/superpowers.git` | 10 skills de desarrollo avanzados |
| **opencode-dcp** | `@tarquinen/opencode-dcp@latest` | Dynamic Context Pruning |
| **engram** | `~/.config/opencode/plugins/engram.ts` | Adaptador de memoria persistente |
| **ponytail** | `./ponytail/.opencode/plugins/ponytail.mjs` | Modo "lazy senior dev": reduce código generado (-54% LOC, -20% costo) via escalera YAGNI. Siempre activo, niveles: lite/full/ultra/off. Incluye 6 skills de auditoria. |
| **rtk** | `~/.config/opencode/plugins/rtk.ts` | Intercepta bash commands y comprime output antes del LLM. 100+ comandos soportados, <10ms overhead. |

### Paquetes Cacheados (~/.cache/opencode/packages/)

| Paquete | Propósito | Estado |
|---------|-----------|--------|
| `superpowers@latest` | Versión cacheada mas reciente de superpowers | Cache |
| `superpowers@git+https:...` | Versión vinculada al repositorio git (activa) | Activo |
| `@tarquinen/opencode-dcp@latest` | Dynamic Context Pruning | Activo |
| **opencode-plugin-openspec@latest** | Spec-driven development con OpenSpec | Cacheado (integrado via `.opencode/node_modules/`) |
| **opencode-subagent-statusline@latest** | Muestra estado de subagentes en TUI | Cacheado (no declarado en config, posible auto-descubrimiento) |
