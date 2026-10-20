# OpenCode — Inventario del harness

Estado: 2026-10-20 · OpenCode 2.1.1 · espejo en `~/harness-opencode` (tag `pre-cleanup-2026-10-20`).

## 1. Runtime

| Elemento | Ruta |
|---|---|
| Binario | `~/.opencode/bin/opencode` (v2.1.1, en PATH) |
| Config global | `~/.config/opencode/{opencode.jsonc,cli.json,dcp.jsonc,AGENTS.md}` (3.993 chars de reglas) |
| Plugins locales | `~/.config/opencode/plugins/{engram.ts,dcp-tag-strip.ts,rtk.ts,oac-shim/}` |
| Workspace | `~/.opencode/` |

- `default_agent`: `openagent`. Permisos de sesión: `autoaccept`.
- La aprobación de planes la impone el prompt del agente (fase Plan), no `permissions`.
- Provider: `opencode-go` con `headerTimeout`/`chunkTimeout` desactivados.
- `dcp.jsonc`: compresión automática permitida, notificaciones en toast.

### Plugins

| Plugin | Función |
|---|---|
| `superpowers@v7.0.0` | Bootstrap de skills de proceso (7 skills activas) |
| `@tarquinen/opencode-dcp` | Poda dinámica de contexto + `compress` |
| `@dietrichgebert/ponytail` | Disciplina de cambio mínimo (5 skills) |
| `engram.ts` | Inyecta el protocolo de memoria una vez por sesión |
| `dcp-tag-strip.ts` | Limpia los tags `@N@` del stream |
| `rtk.ts` | Reescribe comandos de shell con `rtk rewrite` |
| `oac-shim` | Compatibilidad V1→V2 (`task`→`subagent`, `todowrite`, `todoread`) |

## 2. Agentes

| Agente | Tamaño | Uso |
|---|---|---|
| `openagent` | 2,5 KB | Agente universal por defecto: analizar → plan → ejecutar → validar |
| `opencoder` | 24 KB | Features grandes guiadas por specs con approval gates |

Subagentes (9): `coder-agent`, `reviewer`, `test-engineer`, `build-agent` (code) · `documentation`, `externalscout`, `task-manager` (core) · `devops-specialist`, `frontend-specialist` (development).

`config/agent-metadata.json` describe solo agentes con archivo real.

## 3. Skills (26 visibles)

| Fuente | Skills |
|---|---|
| `~/.opencode/skills` (3) | `context7`, `impeccable`, `task-management` |
| `~/.agents/skills` (11) | `odoo-19`, `odoo-task`, `humanizer`, `git-commit`, `caveman`, `pols-slop`, `design-taste-frontend`, `extract-design-system`, `seo-audit`, `schema-markup`, `web-quality-audit` |
| superpowers (7) | `brainstorming`, `systematic-debugging`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `using-superpowers` |
| ponytail (5) | `ponytail`, `ponytail-audit`, `ponytail-review`, `ponytail-gain`, `ponytail-help` |

Criterio de poda: se conserva lo usado al menos una vez más el pack de estilado y las skills SEO mejor valoradas en GitHub (`coreyhaines31/marketingskills`, 55,7k★; `addyosmani/web-quality-skills`, 3k★).

## 4. Comandos

Ninguno. El directorio `command/` se eliminó en octubre de 2026: no había una sola invocación y duplicaba la skill `git-commit`.

## 5. MCP

| Servidor | Estado |
|---|---|
| `engram` | Activo (memoria persistente, ~23 MB en `~/.engram`) |
| `codegraph` | Desactivado. Solo se usa si el proyecto tiene `.codegraph/` y se activa el MCP (`glitch-app` es el único indexado) |
| `playwright` | Desactivado |
| `chrome-devtools` | Desactivado. Chrome real vía CDP: consola, red, traces de performance y Lighthouse. Alternativa a Playwright, nunca los dos activos a la vez |

## 6. Contexto

No hay capa de contexto propia. El agente lee `AGENTS.md` y los archivos del proyecto. El antiguo `~/.opencode/context/` (171 archivos) se eliminó en octubre de 2026: nunca se usó y buena parte prescribía estándares de otro stack.

Las reglas de código, documentación, comentarios y git viven en `AGENTS.md`.

## 7. Disco

| Ruta | Tamaño |
|---|---|
| `~/.local/share/opencode/opencode.db` | 615 MB (solo sesiones V2) |
| `~/.local/share/opencode/snapshot` | 983 MB |
| `~/.local/share/opencode/storage` | 35 MB |
| `~/.opencode/v2-migration` | 192 KB (solo notas) |
| Caché de paquetes | 314 MB (statusline 135 MB sin usar, `@tarquinen` 178 MB) |

## 8. Mantenimiento

Ver `harness-instructions.md`.
