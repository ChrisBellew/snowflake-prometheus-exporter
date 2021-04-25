#!/bin/sh
docker build . -t localhost:5000/snowflake-prometheus-exporter:1.0.0
docker push localhost:5000/snowflake-prometheus-exporter:1.0.0