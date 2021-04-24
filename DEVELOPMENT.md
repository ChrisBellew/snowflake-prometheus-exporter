Install kind
```
sudo ./kind_with_registry.sh
```

Install kubectl
```
sudo snap install kubectl --classic
```

Start the repo server
```
npx http-server ./charts
```

Install the chart
```
sudo helm update \
    exporter \
    --set snowflake.account=$SNOWFLAKE_ACCOUNT \
    --set snowflake.username=$SNOWFLAKE_USERNAME \
    --set snowflake.password=$SNOWFLAKE_PASSWORD \
    http://127.0.0.1:8080/snowflake-prometheus-exporter-1.0.0.tgz
```

Check the pod is running
```
sudo kubectl get pods
```

Expose the exporter locally on port 3000
```
export POD_NAME=$(sudo kubectl get pods --namespace default -l "app.kubernetes.io/name=snowflake-prometheus-exporter,app.kubernetes.io/instance=exporter" -o jsonpath="{.items[0].metadata.name}")
sudo kubectl --namespace default port-forward $POD_NAME 3000:3000
```

Fetch the latest metrics
```
curl http://localhost:3000/metrics
```