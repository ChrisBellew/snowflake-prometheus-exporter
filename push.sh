#!/bin/sh
docker login
docker build . -t cbellew/snowflake-prometheus-exporter:1.0.1 -t cbellew/snowflake-prometheus-exporter:latest
docker push cbellew/snowflake-prometheus-exporter --all-tags