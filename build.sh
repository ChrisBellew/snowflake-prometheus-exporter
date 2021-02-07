docker build . -t localhost:5000/snowflake-prometheus-exporter:1.0.0
docker push localhost:5000/snowflake-prometheus-exporter:1.0.0
helm delete snowflake-prometheus-exporter
helm upgrade \
  --install \
  snowflake-prometheus-exporter \
  --set snowflake.account=$SNOWFLAKE_ACCOUNT \
  --set snowflake.username=$SNOWFLAKE_USERNAME \
  --set snowflake.password=$SNOWFLAKE_PASSWORD \
  ./helm/snowflake-prometheus-exporter/