#!/bin/bash
set -eu

docker compose pull
docker compose up -d
docker image prune -f

exit 0
