# Harness OpenCode

Conjunto completo de configuracion, agentes, skills, contexto y plugins del ecosistema OpenCode.

## Estructura

```
harness-opencode/
├── .opencode/                    # Harness workspace
│   ├── agent/                    # Agentes (OpenAgent, OpenCoder, 11 subagentes)
│   │   ├── open-agent.md         # Agente universal principal
│   │   ├── open-coder.md         # Agente de desarrollo (7 customizaciones)
│   │   └── subagents/            # Subagentes especializados
│   ├── context/                  # Contexto (60+ archivos standards/workflows)
│   │   └── core/
│   │       ├── standards/        # code-quality, documentation, test-coverage
│   │       ├── workflows/        # code-review, task-delegation, openspec
│   │       └── system/           # Configuracion del sistema
│   ├── skills/                   # Skills locales
│   │   ├── impeccable/           # Design guidance con 23 comandos y detector CLI anti-AI-slop
│   │   └── context7/             # Documentacion de librerias externas
│   ├── command/                  # Comandos de OpenCode
│   ├── harness-inventory.md      # Inventario completo del harness
│   ├── harness-log.md            # Historial de cambios fechados
│   └── harness-instructions.md   # Reglas de mantenimiento
├── global-config/                # Config global de OpenCode
│   ├── opencode.jsonc            # MCPs (engram, codegraph), plugins, providers
│   ├── dcp.jsonc                 # Dynamic Context Pruning schema
│   ├── tui.json                  # TUI config (subagent-statusline)
│   └── plugins/
│       └── engram.ts             # Plugin de memoria persistente (optimizado)
└── global-skills/                # 17 skills globales externos
    ├── odoo-19/                  # Odoo 19 con 18 guias especializadas
    ├── design-taste-frontend/    # Landing pages y portfolios (anti-slop)
    ├── caveman/                  # Comunicacion ultra-comprimida
    ├── humanizer/                # Eliminacion de marcas de IA en texto
    ├── web-quality-audit/        # Auditoria integral web
    ├── seo/                      # Optimizacion SEO
    ├── seo-audit/                # Diagnostico SEO
    ├── schema-markup/            # Datos estructurados / rich snippets
    ├── performance/              # Optimizacion de rendimiento web
    ├── accessibility/            # Auditoria WCAG 2.2
    ├── best-practices/           # Buenas practicas web modernas
    ├── core-web-vitals/          # Optimizacion LCP, INP, CLS
    ├── extract-design-system/    # Extraccion de design tokens
    ├── find-skills/              # Descubrimiento de skills instalables
    ├── git-commit/               # Commits con conventional commits
    ├── brainstorm/               # Exploracion creativa pre-implementacion
    ├── systematic-debugging/     # Debugging sistematico
    └── ... (mas skills via plugin superpowers)
```

## Instalacion

### Requisitos previos

- OpenCode >= 1.15.13
- Engram >= 1.16.1 (para memoria persistente)
- Codegraph >= 0.9.8 (para navegacion de codigo)

### Paso 1: Workspace (.opencode)

```bash
cp -r harness-opencode/.opencode ~/.opencode
```

O si ya tenes un workspace, mergea solo lo que necesites:

```bash
cp -r harness-opencode/.opencode/agent/* ~/.opencode/agent/
cp -r harness-opencode/.opencode/context/* ~/.opencode/context/
```

### Paso 2: Config global

```bash
cp harness-opencode/global-config/opencode.jsonc ~/.config/opencode/opencode.jsonc
cp harness-opencode/global-config/dcp.jsonc ~/.config/opencode/dcp.jsonc
cp harness-opencode/global-config/tui.json ~/.config/opencode/tui.json
cp -r harness-opencode/global-config/plugins/* ~/.config/opencode/plugins/
```

### Paso 3: Skills globales

```bash
cp -r harness-opencode/global-skills/* ~/.agents/skills/
```

### Paso 4: Dependencias de plugins

```bash
cd ~/.config/opencode && npm install
```

### Paso 5: Reiniciar OpenCode

Los cambios de configuracion requieren reinicio de OpenCode.

## Mantenimiento

Ver `harness-instructions.md` para las reglas de modificacion del harness.
