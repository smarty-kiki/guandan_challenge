#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

ln -fs $ROOT_DIR/guandan.Caddyfile /etc/caddy/0.guandan.Caddyfile
/usr/sbin/service caddy reload

# guandan 站点暂无后端进程；将来若加 Node 后端，参照 research/project/after_push.sh
# 追加 supervisor.conf 软链 + supervisorctl update/restart 段
