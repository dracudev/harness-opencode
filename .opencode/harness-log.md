# Harness Log

Registro de cambios al harness de OpenCode. Cada entrada documenta que se modifico, por que, y que archivos se afectaron.

---

## 2026-07-23

### Skills consolidados en `~/.agents/skills/`

**Accion**: Movidos `frontend-design`, `caveman` y `humanizer` desde `~/.claude/skills/` a `~/.agents/skills/`. Directorio `~/.claude/skills/` eliminado.

**Motivo**: Skills estaban dispersos en 3 ubicaciones. OpenCode escanea todas automaticamente, pero tener un solo directorio global facilita mantenimiento. El usuario no usa Claude.

**Archivos**:
- `~/.agents/skills/frontend-design/SKILL.md` (movido)
- `~/.agents/skills/caveman/SKILL.md` (movido)
- `~/.agents/skills/humanizer/SKILL.md` (movido desde `.disabled/`)
- `~/.claude/skills/` (eliminado)

---

### Eliminado `odoo-development`

**Accion**: Eliminado `~/.agents/skills/odoo-development/` (153 lineas).

**Motivo**: Skill obsoleto. Usa `@api.multi` (deprecado desde Odoo 13). Contenido generico sin referencias concretas. Redundante frente a `odoo-19` que tiene 18 guias especializadas version-especificas.

**Archivos**:
- `~/.agents/skills/odoo-development/SKILL.md` (eliminado)

---

### Optimizado plugin Engram: inyeccion de instrucciones una vez por sesion

**Accion**: Modificado `~/.config/opencode/plugins/engram.ts` para que las instrucciones de memoria (~120 lineas) se inyecten en el system prompt solo UNA vez por sesion, en lugar de cada mensaje.

**Motivo**: El hook `experimental.chat.system.transform` se ejecutaba en cada turno de chat, duplicando ~120 lineas de instrucciones. Como el system prompt persiste entre turnos, la reinyeccion era innecesaria. En sesiones de 5+ turnos, esto representaba ~15-20% del context window.

**Cambios en `engram.ts`** (3 ediciones):
1. Agregado flag `memoryInstructionsInjected = false` a nivel de modulo
2. `experimental.chat.system.transform`: solo inyecta si el flag es false; lo pone a true
3. `experimental.session.compacting`: resetea el flag a false para que el nuevo agente post-compaccion reciba instrucciones frescas

**Impacto**: Cero perdida de funcionalidad. Las instrucciones siguen llegando al agente cuando las necesita (inicio de sesion y post-compaccion).

---

### Documentada estructura externa del harness

**Accion**: Agregadas secciones 12 y 13 a `harness-inventory.md` documentando componentes fuera de `.opencode/`.

**Directorios documentados**:
- `~/.local/share/opencode/` (opencode.db, storage, tool-output, logs, snapshots)
- `~/.codegraph/current/` (instalacion codegraph v0.9.8)
- `~/.engram/` (SQLite de memoria)
- `~/.cache/opencode/packages/` (plugins cacheados)
- `~/.opencode/node_modules/` (dependencias del workspace OAC)

**Plugins cacheados descubiertos**:
- `opencode-plugin-openspec@latest` -- integrado via `.opencode/node_modules/`
- `opencode-subagent-statusline@latest` -- no declarado en config

---

### Modificado OpenAgent: eliminado `question: "allow"`

**Accion**: Removida la linea `question: "allow"` del frontmatter de permisos en OpenAgent.

**Motivo**: El upstream (OpenAgentsControl) incluye `question: "allow"` en los permisos. La version local lo omite. No hay `question` tool en el runtime actual de OpenCode, por lo que este permiso es irrelevante.

**Archivos**:
- `.opencode/agent/core/openagent.md` (lineas 6-18 de frontmatter)

---

### Modificado OpenCoder: 7 personalizaciones mayores sobre upstream

**Accion**: OpenCoder local diverge significativamente del upstream (OpenAgentsControl). El upstream tiene un workflow de 6 etapas (Discover->Propose->InitSession->Plan->Execute->ValidateAndHandoff). La version local agrega 7 bloques:

**Cambios (por orden en el archivo)**:

1. **Codegraph inicializacion** (Stage 1): Paso MANDATORY. Checkea `.codegraph/codegraph.db`, ejecuta `codegraph init` si no existe, agrega `.codegraph/` a `.gitignore`. El upstream no menciona Codegraph en absoluto.

2. **Integracion completa de OpenSpec** (Stages 1-7):
   - **Stage 1**: `openspec init` si no existe directorio `openspec/`, lectura de `openspec/project.md` y specs existentes
   - **Stage 2 (Propose)**: Incluye `**OpenSpec**: {path}` en propuesta, texto en espanol
   - **Stage 3 (CreateSpec)**: NUEVA etapa. Escribe `openspec/specs/YYYY-MM-DD-<slug>.md` en formato 13 secciones, presenta spec al usuario, espera aprobacion explicita. No existe en upstream.
   - **Stage 4 (InitSession)**: Agrega seccion `## OpenSpec` a context.md, agrega `.tmp/` a `.gitignore`
   - **Stage 5 (Plan)**: `**OpenSpec Integration (MANDATORY)**` -- checkea/crea/actualiza spec antes de planificar
   - **Stage 7 (ValidateAndHandoff)**: `**OpenSpec Update** (MANDATORY)` -- actualiza spec con implementacion final

3. **`<user_rules>` block** (lineas 569-583): No existe en upstream.
   - `language_split`: openspec/espanol, sesiones/ingles, codigo/ingles
   - `no_automatic_commits`: nunca git commit/add/push sin trigger explicito

4. **Propuestas en espanol**: `"**Esperando tu aprobacion antes de continuar.**"` y `"**Aprobas esta especificacion...**"`. Upstream usa ingles.

5. **Stage numbering shift**: 7 stages vs 6 (el extra es Stage 3 CreateSpec).

6. **Stage 1 extra steps**: Inicializacion de `.tmp/` gitignore (ademas de Codegraph y OpenSpec).

7. **`<project_tools>` section** (lineas 585-638): Bloque nuevo al final del archivo con sub-bloques `<codegraph>` y `<openspec>` documentando uso obligatorio de ambas herramientas. No existe en upstream.

**Archivos**:
- `.opencode/agent/core/opencoder.md` (638 lineas vs ~420 lineas upstream)

---

### Modificado CoderAgent: restricciones heredadas de OpenCoder

**Accion**: CoderAgent local diverge del upstream en 5 puntos:

1. **Frontmatter**: Agregado `model: deepseek-v4-flash` (upstream no especifica modelo)

2. **Constraints INHERITED FROM OPENCODER** (lineas 44-48):
   ```
   - openspec_mandatory: solo ejecutar subtareas con proposal.md aprobado
   - language_split: codigo/identificadores en INGLES, openspec en ESPANOL
   - no_automatic_commits: NUNCA git commit/add/push sin instruccion explicita
   - no_pwd_path_assumption: paths relativos al project root
   ```
   El upstream NO tiene este bloque de constraints heredadas.

3. **Seccion OpenSpec agregada** (lineas 99-117): `"🗂️ OpenSpec — Planning Source of Truth"`. Instruye al CoderAgent a verificar `openspec/changes/` antes de implementar. No existe en upstream.

4. **Seccion Codegraph agregada** (lineas 120-138): `"🔍 Codegraph — Structural Understanding"`. Instruye uso de `codegraph_impact` antes de editar archivos. No existe en upstream.

5. **Path de subtareas**: Local usa `.tmp/sessions/{session-name}/plans/{feature}/`, upstream usa `.tmp/tasks/{feature}/`

**Archivos**:
- `.opencode/agent/subagents/code/coder-agent.md` (302 lineas vs ~250 lineas upstream)

---

### Modificado BuildAgent y CodeReviewer: solo modelo

**Accion**: Ambos subagentes tienen una unica diferencia con upstream: `model: opencode-go/deepseek-v4-flash` en el frontmatter. El contenido es identico.

**Archivos**:
- `.opencode/agent/subagents/code/build-agent.md`
- `.opencode/agent/subagents/code/reviewer.md`

---

### 2026-07-23: Repositorio harness-opencode creado

**Accion**: Creacion del repositorio `~/harness-opencode/` con copia completa del harness para versionado git.

**Estructura**:
- `.opencode/` - Harness workspace (agentes, contexto, skills, comandos, tool, config, docs)
- `global-config/` - Config global (opencode.jsonc, dcp.jsonc, tui.json, plugins/engram.ts)
- `global-skills/` - 18 skills globales de `~/.agents/skills/`
- `README.md` - Documentacion del repo con guia de instalacion
- `.gitignore` - Excluye node_modules y lock files

**Archivos**: `~/harness-opencode/*` (263 archivos staged)

---

### 2026-07-23: Agregado harness-instructions.md

**Accion**: Creado `~/.opencode/harness-instructions.md` con reglas obligatorias de mantenimiento del harness:
1. Documentar cambios en inventario/log
2. Copiar archivos modificados al repo `~/harness-opencode/`
3. Commitear en el repo

**Archivos**: `.opencode/harness-instructions.md`

---

### 2026-07-23: Corregido formato de modelo en 4 subagentes

**Accion**: `model: deepseek-v4-flash` cambiado a `model: opencode-go/deepseek-v4-flash`. OpenCode requiere formato `provider/model-id` (provider = `opencode-go`).

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
