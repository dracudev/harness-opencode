#!/bin/bash
export OD_SIDECAR_IPC_PATH=/tmp/open-design/ipc/default/daemon.sock
exec node /home/dracudev/dev/open-design/apps/daemon/dist/cli.js mcp
