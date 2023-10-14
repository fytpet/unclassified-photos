#!/bin/bash
set -eu

sudo docker compose pull
sudo docker compose up -d
sudo docker image prune -f

exit 0
