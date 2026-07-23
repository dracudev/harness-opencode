<!-- Context: development/infrastructure/odoo-database-management | Priority: high | Version: 1.0 | Updated: 2026-07-10 -->

# Odoo Database Import Process

**Purpose**: Standard process for importing Odoo production databases into local Docker environments. Works across Odoo versions (14-19+).

**Triggers**: User says "import db", "copy production database", "add new local db", "bajar base de datos", "import_db".

---

## Quick Reference

```bash
scripts/import_db -d DEST_DB -l HOSTNAME -o SOURCE_DB -w PASSWORD [--no-clean] [--ssl]
```

---

## Process Overview

### 1. Discovery Phase (BEFORE execution)

Before running ANY commands, gather this information:

| What | Where to find it |
|------|-----------------|
| **Import script location** | `scripts/import_db` or similar (glob for `**/import_db*`) |
| **Docker container name** | `scripts/.env` → `ODOO_IMAGE` + `_db` suffix |
| **DB user** | `scripts/.env` → `DB_USER` or `PGUSER` |
| **Existing databases** | `docker exec DB_CONTAINER psql -U USER -l` |
| **Custom module paths** | Look for `odoo/custom/src/` or similar structure |
| **Filestore location** | Docker volume or bind mount — check `docker inspect` or container mounts |

### 2. Read the import_db script

Always read the script first — `--no-xmlrpc` may not exist in newer Odoo versions.

Key parameters:
```
-d, --db          Target database name (e.g., IMQ_previa_produccion)
-l, --location    Server hostname (without protocol, unless the script adds it)
-o, --db-orig     Source database name on remote server (defaults to --db)
-w, --password    Master password for Odoo server
--ssl             Use HTTPS
--no-clean        Skip full cleanup (disable crons, module update, admin password)
--admin-pass      Admin password to set (default: admin)
```

### 3. Master Password Patterns

Odoo master passwords vary by project. Common patterns:
- Plain year: `2024`, `2025`, `2026`
- Company prefix: `ingeos-2025`, `ingeos-2026`
- Default Odoo: `admin`

**Detection strategy**: If the user gives a hint ("a number between X and Y"), try the most likely one. If `Access Denied`, ask the user for the exact master password.

### 4. The Import Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1. Drop +   │ → │ 2. Download  │ → │ 3. Disable   │ → │ 4. Set user  │
│ Create DB   │   │ via curl +   │   │ crons        │   │ passwords    │
│             │   │ pg_restore   │   │              │   │              │
└─────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
                                                              │
                                              ┌───────────────┘
                                              ▼
                                    ┌──────────────────┐
                                    │ 5. Module update │ ← SKIPPED with --no-clean
                                    │ (--update all)   │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ 6. Filestore     │
                                    │ setup            │
                                    └──────────────────┘
```

### 5. After Import (if --no-clean was used)

The module update is skipped. Run it manually:

```bash
# Check if --no-xmlrpc exists in this Odoo version:
docker compose run --no-deps --rm odoo server --help | grep xmlrpc

# Odoo 17+: --no-xmlrpc was removed, omit it
docker compose -f common.yaml -f devel.yaml run --no-deps --rm \
    odoo \
    --database DEST_DB \
    --update all \
    --workers 0 \
    --max-cron-threads 0 \
    --stop-after-init

# Odoo 14-16: include --no-xmlrpc  
docker compose -f common.yaml -f devel.yaml run --no-deps --rm \
    odoo \
    --database DEST_DB \
    --update all \
    --no-xmlrpc \
    --workers 0 \
    --max-cron-threads 0 \
    --stop-after-init
```

### 6. Filestore Handling

The production dump does NOT include the filestore (attachments). Options:

**Option A: Symlink to existing local DB** (recommended if you have a local copy)
```bash
docker exec CONTAINER sh -c 'rm -rf /var/lib/odoo/filestore/NEW_DB && ln -s EXISTING_DB /var/lib/odoo/filestore/NEW_DB'
```

**Option B: Let Odoo create it** — The module update will populate default files.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `pg_restore: error: input file does not appear to be a valid archive` | Wrong password, download failed (HTML returned instead of dump) | Check password, test with `curl -ksSL -X POST -d name="DB" -d master_pwd="PW" -d backup_format="dump" "HOST/web/database/backup" \| head -c 5` — should return `PGDMP` |
| `Database backup error: Access Denied` in HTML response | Wrong master password | Ask user for correct password or try common patterns |
| `no such option: --no-xmlrpc` | Odoo 17+ removed this option | Remove `--no-xmlrpc` from command |
| `relation "ir_cron" does not exist` | DB dropped before data restored | Normal — happens when download fails; fix the download first |
| HTML login page returned from backup endpoint | The `/web/database/backup` route returns HTML on auth failure | Try different password; check if `--ssl` needed |

---

## Environment Adaptation

Scripts and paths differ between projects. Always discover:

1. **Script location**: `scripts/import_db`, `bin/import-db.sh`, `docker/import_db` — glob to find it
2. **Compose files**: `common.yaml`, `devel.yaml`, `prod.yaml` — check which files exist
3. **Module paths**: `odoo/custom/src/`, `addons/`, `extra-addons/` — where custom modules live
4. **Docker setup**: Single container vs docker-compose vs doodba (auto-addons linking)

---

## Key Learnings

- The `--no-xmlrpc` flag was removed in Odoo 17+. Always verify before running.
- Master passwords follow project conventions — look at user password patterns in the import script for hints.
- Never assume filestore path — check Docker mounts (`docker inspect`, `docker volume ls`).
- `--no-clean` skips module update AND admin password change but still disables crons and sets user passwords.
- If the import script's module update fails, run the update manually adjusting for Odoo version.
