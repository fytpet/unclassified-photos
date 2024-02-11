#!/bin/bash
set -eu

docker compose pull
docker compose up -d
docker image prune -f

docker exec nginx nginx -s reload

exit 0
