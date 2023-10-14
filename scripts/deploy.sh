#!/bin/bash
sudo docker compose pull --quiet
sudo docker compose up -d
sudo docker image prune -f
