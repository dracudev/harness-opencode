# Harness OpenCode - Instrucciones de mantenimiento

**Proposito**: Mantener sincronizado y documentado el harness completo de OpenCode.

## Reglas obligatorias

Toda modificacion al harness DEBE cumplir los siguientes 3 pasos:

### 1. Documentar el cambio

- **Cambio estructural** (agentes, skills, MCPs, plugins, contexto): actualizar `harness-inventory.md`
- **Cambio operativo** (optimizaciones, fixes, movimientos): agregar entrada fechada en `harness-log.md`

### 2. Copiar al repositorio

El harness vive en `~/harness-opencode/`. Copiar los archivos modificados a su ubicacion correspondiente dentro del repo:

| Origen | Destino en repo |
|--------|----------------|
| `~/.opencode/*` | `harness-opencode/.opencode/` |
| `~/.config/opencode/opencode.jsonc` | `harness-opencode/global-config/opencode.jsonc` |
| `~/.config/opencode/plugins/*` | `harness-opencode/global-config/plugins/` |
| `~/.config/opencode/dcp.jsonc` | `harness-opencode/global-config/dcp.jsonc` |
| `~/.agents/skills/*` | `harness-opencode/global-skills/` |

### 3. Commitear en el repo

```bash
cd ~/harness-opencode && git add -A && git commit -m "descripcion del cambio"
```

## Estructura del harness

```
~/.opencode/                          # Harness workspace (activo)
  agent/                              # Agentes (OpenAgent, OpenCoder, 9 subagentes)
  skills/                             # Skills locales (context7, impeccable, task-management)
  harness-inventory.md                # Inventario completo
  harness-log.md                      # Historial de cambios
  harness-instructions.md             # Este archivo

~/harness-opencode/                   # Repositorio git (copia sincronizada)
  .opencode/                          # Espejo de ~/.opencode/
  global-config/                      # Config global (opencode.jsonc, cli.json, dcp.jsonc, AGENTS.md, plugins)
  global-skills/                      # Skills globales (~/.agents/skills/)
  README.md                           # Documentacion del repo
```
