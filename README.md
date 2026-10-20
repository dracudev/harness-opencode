# Harness OpenCode

Configuración, agentes, skills y plugins de mi entorno de OpenCode. Este repositorio es el espejo del harness vivo: `~/.opencode` y `~/.config/opencode`.

Estado: 2026-10-20 · OpenCode 2.1.1.

## Estructura

```
harness-opencode/
├── .opencode/                     # Workspace
│   ├── agent/
│   │   ├── openagent.md           # Agente universal (por defecto)
│   │   ├── opencoder.md           # Features grandes con specs y approval gates
│   │   └── subagents/             # 9 subagentes (code, core, development)
│   ├── skills/                    # Skills locales: context7, impeccable, task-management
│   ├── command/                   # commit, test
│   ├── harness-inventory.md       # Inventario del harness
│   ├── harness-log.md             # Historial de cambios
│   └── harness-instructions.md    # Reglas de mantenimiento
├── global-config/
│   ├── opencode.jsonc             # Provider, MCP, plugins
│   ├── cli.json                   # TUI y permisos de sesión
│   ├── dcp.jsonc                  # Dynamic Context Pruning
│   ├── AGENTS.md                  # Instrucciones globales
│   └── plugins/                   # engram, dcp-tag-strip, rtk, oac-shim
└── global-skills/                 # Skills globales (~/.agents/skills)
```

## Contenido

**Agentes.** `openagent` es el agente diario: analiza, propone un plan, espera confirmación, ejecuta (delegando si toca 4+ archivos) y valida antes de resumir. `opencoder` está pensado para features grandes: specs, ejecución incremental y gates de aprobación.

**Skills.** 26 visibles entre locales, globales, plugin `superpowers` (7) y plugin `ponytail` (5). Las globales cubren Odoo, frontend, SEO y texto; las SEO se eligieron por valoración del repositorio de origen.

**Contexto.** No hay capa de contexto propia. El agente lee `AGENTS.md` y los archivos del proyecto. El antiguo `~/.opencode/context/` se eliminó por falta de uso.

## Instalación

Requisitos: OpenCode >= 2, Engram y `rtk` en el PATH.

```bash
# Workspace
cp -r harness-opencode/.opencode ~/.opencode

# Config global
cp harness-opencode/global-config/{opencode.jsonc,cli.json,dcp.jsonc,AGENTS.md} ~/.config/opencode/
cp -r harness-opencode/global-config/plugins/* ~/.config/opencode/plugins/

# Skills globales
cp -r harness-opencode/global-skills/. ~/.agents/skills/
```

Los plugins npm (`superpowers`, `opencode-dcp`, `ponytail`) los instala OpenCode a partir de `opencode.jsonc`; hace falta reiniciar tras cambiar la configuración.

## Mantenimiento

Las reglas están en `.opencode/harness-instructions.md`: documentar el cambio, copiarlo al repositorio y commitear.

## Recuperación

El estado previo a la poda de octubre de 2026 está en el tag `pre-cleanup-2026-10-20`:

```bash
git show pre-cleanup-2026-10-20:.opencode/context/navigation.md
git checkout pre-cleanup-2026-10-20 -- .opencode/context
```
