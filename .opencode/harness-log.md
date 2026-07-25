### 2026-07-25: Añadido pols-slop como capa preventiva de diseño

**Acción**: Instalado `pols-slop` (https://pols.dev/slop.md) como skill auto-cargado. Añadida regla en `AGENTS.md` para cargarlo automáticamente en cualquier tarea de frontend.

**Por qué**: A diferencia de impeccable (que requiere invocación manual), pols-slop previene slop antes de que se genere. ~100 patrones documentados: fonts, colores, layouts, composición, sombras, animaciones. Más exhaustivo que los 58 detectores de impeccable en reglas preventivas.

**Stack de diseño final**: 3 capas complementarias:
1. `pols-slop` (🔁 auto) — prevención: nunca generes slop
2. `impeccable` (📋 bajo demanda) — construcción: shape, polish, critique, live
3. `design-taste-frontend` (📋 manual) — arquitectura: dials, GSAP skeletons, RSC

**Archivos**:
- `~/.agents/skills/pols-slop/SKILL.md` (87 KB, 1599 líneas)
- `~/.config/opencode/AGENTS.md` (actualizado: regla auto-load + regla ortografía español)
- `~/.opencode/harness-inventory.md` (actualizado)
- `~/harness-opencode/global-config/AGENTS.md` (nuevo en repo)

---

### 2026-07-24: Reemplazado frontend-design por impeccable

**Acción**: Eliminado `frontend-design` (42 líneas, Anthropic skill) y reemplazado por `impeccable` 3.3.1 (skill + CLI). Instalado via `npx impeccable install --providers=opencode --scope=global` y `npm i -g impeccable`.

**Por qué**: 
- `frontend-design` era una directriz simple de 42 líneas ("se creativo, evita Inter"). Impeccable es su evolución directa: 23 comandos, modos (Persuade/Operate/Read/Experience), contexto persistente (PRODUCT.md + DESIGN.md).
- El CLI detector (`npx impeccable detect`) aporta 58 reglas deterministas que detectan AI-slop en HTML/CSS SIN consumir tokens de LLM. Ninguna skill existente tenia esta capacidad.
- `design-taste-frontend` se mantiene: no se solapan. design-taste-frontend = reglas duras + arquitectura + GSAP skeletons. impeccable = proceso + detección.

**Skills de diseño post-cambio**: 2 skills complementarios — `impeccable` (proceso + detección) + `design-taste-frontend` (reglas + arquitectura).

**Archivos**: 
- `~/.agents/skills/frontend-design/` (eliminado)
- `~/.opencode/skills/impeccable/` (nuevo skill)
- `~/.nvm/versions/node/v24.11.0/bin/impeccable` (CLI global)
- `harness-opencode/global-skills/frontend-design/` (eliminado del repo)
- `harness-opencode/.opencode/skills/impeccable/` (agregado al repo)
- `harness-inventory.md` (secciones 5 y 14)
- `harness-log.md` (esta entrada)

---

# Harness Log

Registro de cambios al harness de OpenCode. Cada entrada documenta que se modifico, por que, y que archivos se afectaron.

---

### 2026-07-23: Headroom y Graphify: evaluados y descartados

**Headroom** ([headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom), 61.6k estrellas): Compresión de contexto via ML (torch + CUDA). Descartado por 5.8GB de disco para una mediana de compresión real del 4.8% en workloads de código. Overhead 52ms por request.

**Graphify** ([Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify), 94.5k estrellas): Knowledge graphs de código + docs on-demand via tree-sitter AST. Descartado porque CodeGraph ya cubre navegacion de código en vivo (call tracing). Graphify es snapshot arquitectonico -- útil para onboardear equipos, no para uso diario de agente.

---

### 2026-07-23: RTK instalado y configurado

**Que**: Instalado `rtk` 0.43.0 via script oficial. Inicializado con `rtk init -g --opencode`.
**Por qué**: Compresión de bash tool outputs sin las desventajas de Headroom (5.8GB, 52ms). RTK: 9.7MB, <10ms, Rust binary, zero deps. Plugin TS nativo OpenCode.
**Dónde**: `~/.local/bin/rtk`, plugin `~/.config/opencode/plugins/rtk.ts`.
**Modo**: Always-on. Plugin `tool.execute.before` intercepta bash commands y reescribe via `rtk rewrite`. Tee mode guarda output completo en fallos. Cero conflictos con Engram y Ponytail.
**Archivos**: `~/.local/bin/rtk`, `~/.config/opencode/plugins/rtk.ts`, `harness-inventory.md` (secciones 13, 14), `harness-log.md`.

---

## 2026-07-23

### Integrado plugin ponytail

**Acción**: Agregado `ponytail` como plugin OpenCode activo. Clonado via git a `~/.config/opencode/ponytail/`, registrado en `opencode.jsonc` como `./ponytail/.opencode/plugins/ponytail.mjs`.

**Qué hace**: Inyecta la ruleset "lazy senior dev" en cada sesion automáticamente (nivel `full`). Escalera YAGNI de 7 niveles antes de escribir código. Metricas comprobadas: -54% LOC, -22% tokens, -20% costo, -27% tiempo, 100% seguridad.

**Skills incluidos**: ponytail (cambio de nivel), ponytail-review (auditoria de diff), ponytail-audit (auditoria completa), ponytail-debt (tracking shortcuts), ponytail-gain (scoreboard), ponytail-help.

**Descubrimiento**: La reinyeccion en cada turno de ponytail SI es intencional (a diferencia de Engram) -- es refuerzo de comportamiento, no instrucciones procedurales que el modelo no "olvida". No se optimizo.

**Archivos**: `~/.config/opencode/opencode.jsonc`, `~/.config/opencode/ponytail/`, `harness-inventory.md`

---

### Skills consolidados en `~/.agents/skills/`

**Acción**: Movidos `frontend-design`, `caveman` y `humanizer` desde `~/.claude/skills/` a `~/.agents/skills/`. Directorio `~/.claude/skills/` eliminado.

**Motivo**: Skills estaban dispersos en 3 ubicaciónes. OpenCode escanea todas automáticamente, pero tener un solo directorio global facilita mantenimiento. El usuario no usa Claude.

**Archivos**:
- `~/.agents/skills/frontend-design/SKILL.md` (movido)
- `~/.agents/skills/caveman/SKILL.md` (movido)
- `~/.agents/skills/humanizer/SKILL.md` (movido desde `.disabled/`)
- `~/.claude/skills/` (eliminado)

---

### Eliminado `odoo-development`

**Acción**: Eliminado `~/.agents/skills/odoo-development/` (153 líneas).

**Motivo**: Skill obsoleto. Usa `@api.multi` (deprecado desde Odoo 13). Contenido genérico sin referencias concretas. Redundante frente a `odoo-19` que tiene 18 guías especializadas versión-específicas.

**Archivos**:
- `~/.agents/skills/odoo-development/SKILL.md` (eliminado)

---

### Optimizado plugin Engram: inyeccion de instrucciones una vez por sesion

**Acción**: Modificado `~/.config/opencode/plugins/engram.ts` para que las instrucciones de memoria (~120 líneas) se inyecten en el system prompt solo UNA vez por sesion, en lugar de cada mensaje.

**Motivo**: El hook `experimental.chat.system.transform` se ejecutaba en cada turno de chat, duplicando ~120 líneas de instrucciones. Como el system prompt persiste entre turnos, la reinyeccion era innecesaria. En sesiones de 5+ turnos, esto representaba ~15-20% del context window.

**Cambios en `engram.ts`** (3 ediciones):
1. Agregado flag `memoryInstructionsInjected = false` a nivel de modulo
2. `experimental.chat.system.transform`: solo inyecta si el flag es false; lo pone a true
3. `experimental.session.compacting`: resetea el flag a false para que el nuevo agente post-compaccion reciba instrucciones frescas

**Impacto**: Cero perdida de funcionalidad. Las instrucciones siguen llegando al agente cuando las necesita (inicio de sesion y post-compaccion).

---

### Documentada estructura externa del harness

**Acción**: Agregadas secciones 12 y 13 a `harness-inventory.md` documentando componentes fuera de `.opencode/`.

**Directorios documentados**:
- `~/.local/share/opencode/` (opencode.db, storage, tool-output, logs, snapshots)
- `~/.codegraph/current/` (instalación codegraph v0.9.8)
- `~/.engram/` (SQLite de memoria)
- `~/.cache/opencode/packages/` (plugins cacheados)
- `~/.opencode/node_modules/` (dependencias del workspace OAC)

**Plugins cacheados descubiertos**:
- `opencode-plugin-openspec@latest` -- integrado via `.opencode/node_modules/`
- `opencode-subagent-statusline@latest` -- no declarado en config

---

### Modificado OpenAgent: eliminado `question: "allow"`

**Acción**: Removida la línea `question: "allow"` del frontmatter de permisos en OpenAgent.

**Motivo**: El upstream (OpenAgentsControl) incluye `question: "allow"` en los permisos. La versión local lo omite. No hay `question` tool en el runtime actual de OpenCode, por lo que este permiso es irrelevante.

**Archivos**:
- `.opencode/agent/core/openagent.md` (líneas 6-18 de frontmatter)

---

### Modificado OpenCoder: 7 personalizaciones mayores sobre upstream

**Acción**: OpenCoder local diverge significativamente del upstream (OpenAgentsControl). El upstream tiene un workflow de 6 etapas (Discover->Propose->InitSession->Plan->Execute->ValidateAndHandoff). La versión local agrega 7 bloques:

**Cambios (por orden en el archivo)**:

1. **Codegraph inicializacion** (Stage 1): Paso MANDATORY. Checkea `.codegraph/codegraph.db`, ejecuta `codegraph init` si no existe, agrega `.codegraph/` a `.gitignore`. El upstream no menciona Codegraph en absoluto.

2. **Integracion completa de OpenSpec** (Stages 1-7):
   - **Stage 1**: `openspec init` si no existe directorio `openspec/`, lectura de `openspec/project.md` y specs existentes
   - **Stage 2 (Propose)**: Incluye `**OpenSpec**: {path}` en propuesta, texto en espanol
   - **Stage 3 (CreateSpec)**: NUEVA etapa. Escribe `openspec/specs/YYYY-MM-DD-<slug>.md` en formato 13 secciones, presenta spec al usuario, espera aprobacion explicita. No existe en upstream.
   - **Stage 4 (InitSession)**: Agrega seccion `## OpenSpec` a context.md, agrega `.tmp/` a `.gitignore`
   - **Stage 5 (Plan)**: `**OpenSpec Integration (MANDATORY)**` -- checkea/crea/actualiza spec antes de planificar
   - **Stage 7 (ValidateAndHandoff)**: `**OpenSpec Update** (MANDATORY)` -- actualiza spec con implementacion final

3. **`<user_rules>` block** (líneas 569-583): No existe en upstream.
   - `language_split`: openspec/espanol, sesiones/inglés, código/inglés
   - `no_automatic_commits`: nunca git commit/add/push sin trigger explicito

4. **Propuestas en espanol**: `"**Esperando tu aprobacion antes de continuar.**"` y `"**Aprobas esta especificacion...**"`. Upstream usa inglés.

5. **Stage numbering shift**: 7 stages vs 6 (el extra es Stage 3 CreateSpec).

6. **Stage 1 extra steps**: Inicializacion de `.tmp/` gitignore (ademas de Codegraph y OpenSpec).

7. **`<project_tools>` section** (líneas 585-638): Bloque nuevo al final del archivo con sub-bloques `<codegraph>` y `<openspec>` documentando uso obligatorio de ambas herramientas. No existe en upstream.

**Archivos**:
- `.opencode/agent/core/opencoder.md` (638 líneas vs ~420 líneas upstream)

---

### Modificado CoderAgent: restricciones heredadas de OpenCoder

**Acción**: CoderAgent local diverge del upstream en 5 puntos:

1. **Frontmatter**: Agregado `model: deepseek-v4-flash` (upstream no específica modelo)

2. **Constraints INHERITED FROM OPENCODER** (líneas 44-48):
   ```
   - openspec_mandatory: solo ejecutar subtareas con proposal.md aprobado
   - language_split: código/identificadores en INGLÉS, openspec en ESPAÑOL
   - no_automatic_commits: NUNCA git commit/add/push sin instruccion explicita
   - no_pwd_path_assumption: paths relativos al project root
   ```
   El upstream NO tiene este bloque de constraints heredadas.

3. **Seccion OpenSpec agregada** (líneas 99-117): `"🗂️ OpenSpec — Planning Source of Truth"`. Instruye al CoderAgent a verificar `openspec/changes/` antes de implementar. No existe en upstream.

4. **Seccion Codegraph agregada** (líneas 120-138): `"🔍 Codegraph — Structural Understanding"`. Instruye uso de `codegraph_impact` antes de editar archivos. No existe en upstream.

5. **Path de subtareas**: Local usa `.tmp/sessions/{session-name}/plans/{feature}/`, upstream usa `.tmp/tasks/{feature}/`

**Archivos**:
- `.opencode/agent/subagents/code/coder-agent.md` (302 líneas vs ~250 líneas upstream)

---

### Modificado BuildAgent y CodeReviewer: solo modelo

**Acción**: Ambos subagentes tienen una única diferencia con upstream: `model: opencode-go/deepseek-v4-flash` en el frontmatter. El contenido es identico.

**Archivos**:
- `.opencode/agent/subagents/code/build-agent.md`
- `.opencode/agent/subagents/code/reviewer.md`

---

### 2026-07-23: Repositorio harness-opencode creado

**Acción**: Creacion del repositorio `~/harness-opencode/` con copia completa del harness para versionado git.

**Estructura**:
- `.opencode/` - Harness workspace (agentes, contexto, skills, comandos, tool, config, docs)
- `global-config/` - Config global (opencode.jsonc, dcp.jsonc, tui.json, plugins/engram.ts)
- `global-skills/` - 18 skills globales de `~/.agents/skills/`
- `README.md` - Documentación del repo con guía de instalación
- `.gitignore` - Excluye node_modules y lock files

**Archivos**: `~/harness-opencode/*` (263 archivos staged)

---

### 2026-07-23: Agregado harness-instructions.md

**Acción**: Creado `~/.opencode/harness-instructions.md` con reglas obligatorias de mantenimiento del harness:
1. Documentar cambios en inventario/log
2. Copiar archivos modificados al repo `~/harness-opencode/`
3. Commitear en el repo

**Archivos**: `.opencode/harness-instructions.md`

---

### 2026-07-23: Corregido formato de modelo en 4 subagentes

**Acción**: `model: deepseek-v4-flash` cambiado a `model: opencode-go/deepseek-v4-flash`. OpenCode requiere formato `provider/model-id` (provider = `opencode-go`).

**Descubrimiento**: El formato `deepseek-v4-flash` sin prefijo de provider causaba "model not available" aunque el modelo existe. Todos los modelos en OpenCode usan formato `provider/model-id`.

**Archivos**: `code/coder-agent.md`, `code/build-agent.md`, `code/reviewer.md`, `code/test-engineer.md`

---

### OpenSpec: activo en workflow pero no como plugin cargado

**Verificacion**:
- CLI instalado globalmente: `@fission-ai/openspec@1.3.1` (en `/home/dracudev/.nvm/versions/node/v24.11.0/bin/openspec`)
- Template de referencia: `.opencode/context/core/workflows/openspec-change-template.md` (13 secciones en espanol)
- Plugin `opencode-plugin-openspec@latest` cacheado en `~/.cache/opencode/packages/` pero NO listado en `opencode.jsonc` plugins array
- La integracion es puramente via prompt engineering: OpenCoder ejecuta `openspec init` y escribe specs manualmente (flat files en `openspec/specs/YYYY-MM-DD-<slug>.md`), NO usa el formato `openspec/changes/<slug>/` del plugin
- Estado: **Activo funcionalmente** -- cualquier tarea delegada a OpenCoder seguira el workflow OpenSpec

---

### Categorias de subagentes faltantes

**Upstream tiene 7 categorias** de subagentes: `code/`, `core/`, `development/`, `planning/`, `system-builder/`, `test/`, `utils/`.
**Local tiene solo 4**: `code/`, `core/`, `development/`, `system-builder/`.
**Faltantes**: `planning/`, `test/`, `utils/`.

Nota: `test-engineer.md` local esta en `code/` en lugar de `test/`.
