# OpenCode -- Inventario del Harness

> **Ultima actualizacion**: 2026-07-23
> **Version OpenCode**: 1.15.13
> **Proposito**: Referencia completa de todas las herramientas, agentes, skills, MCPs y configuraciones en este espacio de trabajo OpenCode.

---

## Indice

- [1. Capa de Runtime](#1-capa-de-runtime)
- [2. Capa de Planificacion](#2-capa-de-planificacion)
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

---

## 1. Capa de Runtime

| Componente | Version | Proposito | Ubicacion |
|-----------|---------|-----------|-----------|
| **OpenCode** | 1.15.13 | Runtime principal de agentes -- orquestra sesiones, compaccion, permisos y ciclo de vida del agente | `~/.config/opencode/opencode.jsonc` |
| **Dynamic Context Pruning (DCP)** | latest | Reduce contexto irrelevante en ventanas largas, manteniendo senal alta | Plugin: `@tarquinen/opencode-dcp@latest`, config: `~/.config/opencode/dcp.jsonc` |
| **Engram Plugin** | -- | Adaptador que conecta eventos de OpenCode al servidor HTTP de Engram para persistencia de memoria | `~/.config/opencode/plugins/engram.ts` |

### Configuracion de OpenCode (`~/.config/opencode/opencode.jsonc`)

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

## 2. Capa de Planificacion

| Componente | Version | Proposito | Ubicacion |
|-----------|---------|-----------|-----------|
| **OpenSpec** | -- | Desarrollo guiado por especificaciones (spec-driven development) | `.opencode/context/core/workflows/openspec-change-template.md` |
| **TaskManager** (subagente) | 2.0.0 | Descompone features complejas en subtareas JSON con dependencias y CLI | `.opencode/agent/subagents/core/task-manager.md` |
| **BatchExecutor** (subagente) | 1.0.0 | Ejecucion paralela de subtareas por lotes | `.opencode/config/agent-metadata.json` (registrado) |
| **superpowers/writing-plans** | -- | Planifica tareas multi-paso antes de tocar codigo | `~/.cache/opencode/packages/superpowers/.../writing-plans/SKILL.md` |
| **superpowers/brainstorming** | -- | Explora intencion del usuario, requerimientos y diseno antes de implementar | `~/.cache/opencode/packages/superpowers/.../brainstorming/SKILL.md` |

---

## 3. Capa de Cognicion

| Componente | Version | Proposito | Ubicacion |
|-----------|---------|-----------|-----------|
| **Codegraph** | 0.9.8 | Comprension estructural del repositorio -- call graph, trace, impact analysis, symbol search | MCP: `codegraph serve --mcp` |
| **Dynamic Context Pruning** | latest | Reduce contexto irrelevante en tiempo real; plugin + schema de configuracion | `@tarquinen/opencode-dcp@latest`, `~/.config/opencode/dcp.jsonc` |
| **ContextScout** (subagente) | 1.0.0 | Descubre y recomienda archivos de contexto internos (`.opencode/context/`) rankeados por prioridad | `.opencode/agent/subagents/core/contextscout.md` |
| **ExternalScout** (subagente) | 1.0.0 | Busca documentacion actualizada de librerias externas/frameworks (Context7 + otras fuentes) | `.opencode/agent/subagents/core/externalscout.md` |
| **ContextRetriever** (subagente) | 1.0.0 | Recuperacion de contexto por busqueda semantica | Registrado en `agent-metadata.json` |
| **ContextManager** (subagente) | 1.0.0 | Gestion y organizacion del sistema de contexto | Registrado en `agent-metadata.json` |

### Herramientas MCP de Codegraph

| Herramienta | Proposito |
|-------------|-----------|
| `codegraph_context` | Puntos de entrada + simbolos relacionados + codigo clave para preguntas de arquitectura/bugs |
| `codegraph_search` | Busqueda rapida de simbolos por nombre |
| `codegraph_node` | Detalles de un simbolo: ubicacion, firma, callers/callees |
| `codegraph_explore` | Multiples simbolos relacionados agrupados por archivo (equivalente a Read) |
| `codegraph_trace` | Ruta completa de llamadas entre dos simbolos |
| `codegraph_callees` | Lista funciones llamadas por un simbolo |
| `codegraph_callers` | Lista funciones que llaman a un simbolo |
| `codegraph_impact` | Simbolos afectados al cambiar un simbolo dado |
| `codegraph_files` | Arbol de archivos indexado con conteo de lenguajes y simbolos |
| `codegraph_status` | Verificacion de salud del indice |

---

## 4. Capa de Memoria

| Componente | Version | Proposito | Ubicacion |
|-----------|---------|-----------|-----------|
| **Engram** | 1.16.1 | Memoria persistente del proyecto -- SQLite + FTS5 full-text search con sincronizacion git | Binario: `~/.local/bin/engram`, MCP: `engram mcp --tools=agent` |
| **Engram Plugin** | -- | Adaptador ligero: eventos OpenCode -> HTTP calls -> engram serve -> SQLite | `~/.config/opencode/plugins/engram.ts` |
| **context7** (skill) | -- | Recupera documentacion actualizada de librerias via Context7 API | `.opencode/skills/context7/SKILL.md` |

### Herramientas MCP de Engram

| Herramienta | Proposito |
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
| `mem_capture_passive` | Extrae aprendizajes de texto automaticamente |
| `mem_doctor` | Diagnostico operacional de Engram |
| `mem_current_project` | Detecta el proyecto actual |

### Hooks del Plugin Engram

| Hook | Proposito |
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

| Skill | Proposito | Ubicacion |
|-------|-----------|-----------|
| **odoo-19** | 18 guias especializadas: Actions, Controllers, Data files, Decorators, Constraints, Indexes, Module dev, Fields, Manifest, Mixins, ORM, Migration, OWL, Performance, QWeb, Security, Testing, Transactions, Translations, XML Views | `~/.agents/skills/odoo-19/SKILL.md` |

### Frontend y Diseno

| Skill | Proposito | Ubicacion |
|-------|-----------|-----------|
| **frontend-design** | Interfaces frontend produccion-grade con alta calidad de diseno; anti-generico | `~/.agents/skills/frontend-design/SKILL.md` |
| **design-taste-frontend** | Anti-slop: landing pages, portfolios, redesigns con direccion de diseno real | `~/.agents/skills/design-taste-frontend/SKILL.md` |
| **extract-design-system** | Extrae primitivas de diseno de sitios publicos hacia token files | `~/.agents/skills/extract-design-system/SKILL.md` |
| **caveman** | Modo de comunicacion ultra-comprimido (~75% menos tokens) | `~/.agents/skills/caveman/SKILL.md` |
| **humanizer** | Remueve senales de escritura AI del texto (invocacion manual) | `~/.agents/skills/humanizer/SKILL.md` |

### Calidad Web

| Skill | Proposito | Ubicacion |
|-------|-----------|-----------|
| **web-quality-audit** | Auditoria integral: performance, accessibility, SEO, best practices | `~/.agents/skills/web-quality-audit/SKILL.md` |
| **accessibility** | Auditoria WCAG 2.2: screen readers, keyboard nav, a11y | `~/.agents/skills/accessibility/SKILL.md` |
| **best-practices** | Seguridad web moderna, compatibilidad, calidad de codigo | `~/.agents/skills/best-practices/SKILL.md` |
| **performance** | Optimizacion de carga: Core Web Vitals, metricas | `~/.agents/skills/performance/SKILL.md` |
| **core-web-vitals** | LCP, INP, CLS -- optimizacion especifica para page experience y ranking | `~/.agents/skills/core-web-vitals/SKILL.md` |

### SEO

| Skill | Proposito | Ubicacion |
|-------|-----------|-----------|
| **seo** | Meta tags, structured data, sitemaps, visibilidad en busqueda | `~/.agents/skills/seo/SKILL.md` |
| **seo-audit** | Diagnostico: technical SEO, rankings, crawl errors, core web vitals | `~/.agents/skills/seo-audit/SKILL.md` |
| **schema-markup** | JSON-LD, rich snippets, FAQ/product/review schema | `~/.agents/skills/.agents/skills/schema-markup/SKILL.md` |

### Otros

| Skill | Proposito | Ubicacion |
|-------|-----------|-----------|
| **git-commit** | Conventional commits con staging inteligente y mensajes generados | `~/.agents/skills/git-commit/SKILL.md` |
| **find-skills** | Descubre e instala nuevos skills | `~/.agents/skills/find-skills/SKILL.md` |

---

## 6. Capa de Herramientas

### Superpowers (Plugin)

**Fuente**: `superpowers@git+https://github.com/obra/superpowers.git`

| Skill | Proposito | Estado |
|-------|-----------|--------|
| **using-superpowers** | Guia de uso de Superpowers; siempre cargado | Activo |
| **brainstorming** | Explora intencion, requerimientos y diseno antes de crear | Activo |
| **writing-plans** | Planifica tareas multi-paso antes de tocar codigo | Activo |
| **test-driven-development** | TDD: red-green-refactor antes de implementar | Activo |
| **systematic-debugging** | Debugging sistematico antes de proponer fixes | Activo |
| **subagent-driven-development** | Ejecuta planes con tareas independientes en paralelo | Activo |
| **dispatching-parallel-agents** | Despacha 2+ agentes paralelos para tareas independientes | Activo |
| **verification-before-completion** | Verifica con comandos reales antes de declarar "completado" | Activo |
| **requesting-code-review** | Solicita review al completar features | Activo |
| **receiving-code-review** | Recibe feedback de review con rigor tecnico | Activo |
| **executing-plans** | DESHABILITADO | Inactivo |
| **finishing-a-development-branch** | DESHABILITADO | Inactivo |
| **using-git-worktrees** | DESHABILITADO | Inactivo |
| **writing-skills** | DESHABILITADO | Inactivo |

### Servidores MCP

| Servidor | Tipo | Proposito |
|----------|------|-----------|
| **engram** | local | Memoria persistente via `engram mcp --tools=agent` |
| **codegraph** | local | Comprension estructural del codigo via `codegraph serve --mcp` |

### Herramientas Integradas

| Herramienta | Proposito |
|-------------|-----------|
| **Bash** | Ejecucion de comandos shell con timeout y sandbox |
| **Read** | Lectura de archivos y directorios |
| **Write** | Escritura de archivos |
| **Edit** | Edicion precisa con string replacement |
| **Glob** | Busqueda de archivos por patron |
| **Grep** | Busqueda de contenido por regex |
| **Task** | Delegacion a subagentes especializados |
| **WebFetch** | Fetch HTTP de URLs externas |
| **Skill** | Carga dinamica de skills |
| **Compress** | Compresion de contexto en summaries de alta fidelidad |
| **TodoWrite** | Gestion de listas de tareas |

### Herramientas Personalizadas

| Herramienta | Proposito | Ubicacion |
|-------------|-----------|-----------|
| **env** | Cargador de variables de entorno desde archivos `.env` | `.opencode/tool/env/index.ts` |

---

## 7. Inventario de Agentes

### Agentes Principales

| Agente | Modo | Proposito | Ubicacion |
|--------|------|-----------|-----------|
| **OpenAgent** | primary | Agente universal: preguntas, tareas, coordinacion de workflows, delegacion a especialistas | `.opencode/agent/core/openagent.md` |
| **OpenCoder** | primary | Desarrollo: codificacion, implementacion, debugging | `.opencode/agent/core/opencoder.md` |

### Subagentes -- Nucleo

| Subagente | Proposito | Ubicacion |
|-----------|-----------|-----------|
| **TaskManager** | Descompone features complejas en subtareas JSON con dependencias y CLI | `.opencode/agent/subagents/core/task-manager.md` |
| **ContextScout** | Descubre y recomienda context files rankeados por prioridad | `.opencode/agent/subagents/core/contextscout.md` |
| **ExternalScout** | Busca documentacion actualizada de librerias externas | `.opencode/agent/subagents/core/externalscout.md` |
| **DocWriter** | Genera documentacion comprehensiva | `.opencode/agent/subagents/core/documentation.md` |

### Subagentes -- Codigo

| Subagente | Proposito | Ubicacion |
|-----------|-----------|-----------|
| **CoderAgent** | Ejecuta subtareas de codificacion secuencialmente | `.opencode/agent/subagents/code/coder-agent.md` |
| **TestEngineer** | Autoria de tests y TDD | `.opencode/agent/subagents/code/test-engineer.md` |
| **CodeReviewer** | Code review, seguridad, aseguramiento de calidad | `.opencode/agent/subagents/code/reviewer.md` |
| **BuildAgent** | Type checking y validacion de build | `.opencode/agent/subagents/code/build-agent.md` |

### Subagentes -- Desarrollo

| Subagente | Proposito | Ubicacion |
|-----------|-----------|-----------|
| **OpenFrontendSpecialist** | UI design: design systems, themes, animations | `.opencode/agent/subagents/development/frontend-specialist.md` |
| **OpenDevopsSpecialist** | CI/CD, infraestructura como codigo, deployment automation | `.opencode/agent/subagents/development/devops-specialist.md` |

### Subagentes -- Constructor de Sistemas

| Subagente | Proposito | Ubicacion |
|-----------|-----------|-----------|
| **ContextOrganizer** | Organiza y genera archivos de contexto (domain, processes, standards, templates) | `.opencode/agent/subagents/system-builder/context-organizer.md` |

### Registrados en Metadata (sin archivo .md implementado aun)

Estos agentes estan definidos en `agent-metadata.json` pero no tienen archivo `.md` correspondiente:

| Agente | Categoria | Proposito |
|--------|-----------|-----------|
| **RepoManager** | meta | Orquestacion y gestion de repositorios |
| **SystemBuilder** | meta | Generacion de sistemas, arquitectura, scaffolding |
| **Copywriter** | content | Contenido, marketing, escritura |
| **TechnicalWriter** | content | Documentacion tecnica |
| **DataAnalyst** | data | Analisis y visualizacion de datos |
| **EvalRunner** | testing | Testing y evaluacion de calidad |
| **BatchExecutor** | subagents/core | Ejecucion paralela de lotes |
| **ContextManager** | subagents/core | Gestion de contexto |
| **ContextRetriever** | subagents/core | Recuperacion de contexto |
| **AgentGenerator** | subagents/system-builder | Generacion de agentes |
| **CommandCreator** | subagents/system-builder | Creacion de comandos |
| **DomainAnalyzer** | subagents/system-builder | Analisis de dominio |
| **WorkflowDesigner** | subagents/system-builder | Diseno de workflows |
| **ImageSpecialist** | subagents/utils | Imagenes, edicion, generacion |
| **SimpleResponder** | subagents/test | Testing y evaluacion |

---

## 8. Comandos

Comandos slash personalizados registrados en `.opencode/command/`:

| Comando | Proposito |
|---------|-----------|
| `/add-context` | Anadir archivos de contexto al sistema |
| `/analyze-patterns` | Analizar patrones de codigo |
| `/clean` | Limpiar archivos temporales y sesiones |
| `/commit` | Commit con mensaje convencional |
| `/context` | Gestion del sistema de contexto (harvest, extract, organize, map, validate) |
| `/test` | Ejecutar tests |
| `/validate-repo` | Validar estructura del repositorio |
| `/optimize` | Optimizacion de codigo/rendimiento |
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
| `project/` | Configuracion del proyecto actual |
| `ui/` | Diseno visual y UX |

### core/

| Ruta | Contenido |
|------|-----------|
| `navigation.md` | Navegacion del sistema core |
| `essential-patterns.md` | Patrones esenciales |
| `visual-development.md` | Desarrollo visual |
| `context-system.md` | Documentacion del sistema de contexto |

### core/standards/ -- Estandares de Calidad

| Archivo | Proposito |
|---------|-----------|
| `code-quality.md` | Estandares de codigo |
| `documentation.md` | Estandares de documentacion |
| `test-coverage.md` | Estandares de testing |
| `code-analysis.md` | Analisis de codigo |
| `security-patterns.md` | Patrones de seguridad |
| `project-intelligence.md` | Inteligencia de proyecto |
| `project-intelligence-management.md` | Gestion de inteligencia de proyecto |
| `navigation.md` | Navegacion de estandares |

### core/workflows/ -- Workflows Operativos

| Archivo | Proposito |
|---------|-----------|
| `code-review.md` | Revision de codigo |
| `component-planning.md` | Planificacion de componentes |
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
| `design-iteration-overview.md` | Vista general de iteraciones de diseno |
| `design-iteration-plan-file.md` | Archivo de plan de iteracion |
| `design-iteration-plan-iterations.md` | Planificacion de iteraciones |
| `design-iteration-stage-layout.md` | Etapa: layout |
| `design-iteration-stage-animation.md` | Etapa: animacion |
| `design-iteration-stage-theme.md` | Etapa: tema |
| `design-iteration-stage-implementation.md` | Etapa: implementacion |
| `design-iteration-visual-content.md` | Contenido visual de iteraciones |
| `design-iteration-best-practices.md` | Buenas practicas de iteraciones |
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

| Archivo | Proposito |
|---------|-----------|
| `context-paths.md` | Rutas de contexto |
| `context-guide.md` | Guia de contexto |
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

| Archivo | Proposito |
|---------|-----------|
| `navigation.md` | Navegacion de configuracion |

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

| Integracion | Protocolo | Proposito |
|-------------|-----------|-----------|
| **Engram** | MCP (local) + HTTP (plugin) | Memoria persistente |
| **Codegraph** | MCP (local) | Comprension de codigo |
| **Context7** | API (via skill) | Documentacion actualizada de librerias |
| **Superpowers** | Plugin (npm git) | Skills de desarrollo avanzados |
| **DCP** | Plugin (npm) | Dynamic Context Pruning |

---

## 12. Estructura Externa del Sistema

Directorios y archivos fuera de `.opencode/` que forman parte del harness.

### ~/.local/share/opencode/ -- Datos de Runtime

| Ruta | Contenido |
|------|-----------|
| `opencode.db` | Base de datos SQLite principal (sesiones, mensajes, configuracion) |
| `opencode.db-shm` / `opencode.db-wal` | Archivos auxiliares SQLite (shared memory, write-ahead log) |
| `storage/plugin/` | Almacenamiento de plugins |
| `storage/session_diff/` | Diffs de sesion |
| `tool-output/` | Output capturado de herramientas (archivos de tool calls largos) |
| `log/` | Logs de sesiones (ej: `2026-07-23T160430.log`) |
| `snapshot/` | Snapshots de estado (hashes de git) |
| `repos/` | Workspace repos (vacio actualmente) |
| `auth.json` | Autenticacion de proveedores |

### ~/.codegraph/ -- Instalacion de Codegraph

| Ruta | Contenido |
|------|-----------|
| `current/bin/` | Binario codegraph activo |
| `current/lib/` | Librerias de soporte |
| `current/node` | Runtime Node.js empaquetado |
| `versions/v0.9.8/` | Version instalada |

### ~/.engram/ -- Base de Datos de Memoria

| Archivo | Proposito |
|---------|-----------|
| `engram.db` | SQLite con FTS5 full-text search |
| `engram.db-shm` / `engram.db-wal` | Archivos auxiliares SQLite |

### ~/.cache/opencode/ -- Cache de Paquetes y Plugins

| Ruta | Proposito |
|------|-----------|
| `bin/rg` | ripgrep empaquetado para busquedas |
| `models.json` | Catalogo de modelos disponibles (~3.2 MB) |
| `packages/` | Plugins cacheados (ver Seccion 13) |

### ~/.local/bin/ -- Binarios Globales

| Binario | Proposito |
|---------|-----------|
| `codegraph` | CLI de Codegraph (indexado, serve, MCP) |
| `engram` | CLI de Engram (serve, MCP, memoria) |
| `optimize-images` | Optimizacion de imagenes (compresion, conversion de formato) |

### ~/.opencode/node_modules/ -- Dependencias del Workspace OAC

| Paquete | Proposito |
|---------|-----------|
| `effect` | Sistema de efectos funcionales |
| `zod` | Validacion de schemas |
| `yaml` | Parseo/generacion YAML |
| `kubernetes-types` | Tipos Kubernetes |
| `@opencode-ai/plugin` | SDK de plugins de OpenCode |
| `@opencode-ai/sdk` | SDK de OpenCode |
| `cross-spawn` | Spawn de procesos cross-platform |
| `msgpackr` | MessagePack serialization |

> **Nota**: Estas dependencias coinciden con `opencode-plugin-openspec`, indicando que OpenSpec esta integrado en el workspace OAC aunque no se declara explicitamente como plugin en `opencode.jsonc`.

---

## 13. Plugins y Paquetes Cacheados

### Plugins Activos (declarados en `opencode.jsonc`)

| Plugin | Fuente | Proposito |
|--------|--------|-----------|
| **superpowers** | `git+https://github.com/obra/superpowers.git` | 10 skills de desarrollo avanzados |
| **opencode-dcp** | `@tarquinen/opencode-dcp@latest` | Dynamic Context Pruning |
| **engram** | `~/.config/opencode/plugins/engram.ts` | Adaptador de memoria persistente |

### Paquetes Cacheados (~/.cache/opencode/packages/)

| Paquete | Proposito | Estado |
|---------|-----------|--------|
| `superpowers@latest` | Version cacheada mas reciente de superpowers | Cache |
| `superpowers@git+https:...` | Version vinculada al repositorio git (activa) | Activo |
| `@tarquinen/opencode-dcp@latest` | Dynamic Context Pruning | Activo |
| **opencode-plugin-openspec@latest** | Spec-driven development con OpenSpec | Cacheado (integrado via `.opencode/node_modules/`) |
| **opencode-subagent-statusline@latest** | Muestra estado de subagentes en TUI | Cacheado (no declarado en config, posible auto-descubrimiento) |
