#!/usr/bin/env bash
set -euo pipefail

QDE_HOST="${QDE_HOST:-root@45.148.62.92}"
QDE_ROOT="${QDE_ROOT:-/var/www/teamx}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DIRS=(phone teams teaminput teamfun)

for dir in "${DIRS[@]}"; do
    echo "Syncing ${dir}/ -> ${QDE_HOST}:${QDE_ROOT}/${dir}/"
    rsync -az --delete \
        --exclude '.DS_Store' \
        --exclude '.htaccess' \
        "${SCRIPT_DIR}/${dir}/" "${QDE_HOST}:${QDE_ROOT}/${dir}/"
done

echo "QDE deployment complete."
