# Snowflake Prometheus Exporter

This is a Prometheus exporter for Snowflake. It connects to a given Snowflake account and runs queries periodically, exposing the result as prometheus metrics on a `/metrics` endpoint.

# Installation

## config.yaml
Before you install the Snowflake Prometheus exporter you must set up a `config.yaml` to tell the exporter what queries to run and how to expose the results as metrics.

Here's an example `config.yaml` file. The configuration will work out-of-the-box because all Snowflake accounts contain the `snowflake_sample_data.weather.daily_14_total` table, so it's a good config to get started.
```yaml
default_fetch_interval: 60
metrics:
  - name: test_metric
    help: A test metric
    statement: SELECT COUNT(*) FROM snowflake_sample_data.weather.daily_14_total
```

## Snowflake Connection parameters

In addition to the `config.yaml` you will need three Snowflake connection parameters

|Parameter|Comment|
|-|-|
|Account|The name of the Snowflake account. This is the first part of the domain when you are visiting Snowflake in your browser. It looks something like `id.region`. For example `ab12345.us-east-1`. |
|Username|The name of a user who will have sufficient privileges to run your queries.|
|Password|The password of the user|

## Docker, kubectl or helm?
This exporter is deployed as a container. Here's some guides to help you install with your preferred container workflow.

- [Install with Docker](#install-with-docker)
- [Install into Kubernetes with helm](#install-into-kubernetes-with-helm)

## Install with Docker

First let's run the container interactively so we know we are passing the configuration correctly. We'll pull it straight from [Docker Hub](https://hub.docker.com/r/cbellew/snowflake-prometheus-exporter). This command assumes you have put the `config.yaml` in the current directory.
```
docker run -it \
  -e SNOWFLAKE_ACCOUNT=ab12345.us-east-1 \
  -e SNOWFLAKE_USERNAME=myusername \
  -e SNOWFLAKE_PASSWORD=mypassword \
  -e CONFIG_YAML_PATH=/mount/config.yaml \
  -p 3000:3000 \
  --mount type=bind,source="$(pwd)/config.yaml",target=/mount/config.yaml,readonly \
  cbellew/snowflake-prometheus-exporter:latest
```

You should see
```
Starting Snowflake prometheus exporter...
Snowflake exporter listening at http://localhost:3000
```

In a seperate terminal, fetch the metrics with `curl`
```
curl http://localhost:3000/metrics
```

You should see
```
# HELP test_metric A test metric
# TYPE test_metric gauge
test_metric 74578213
```

Now you can run the container detached in the background
```
docker run -d \
  -e SNOWFLAKE_ACCOUNT=ab12345.us-east-1 \
  -e SNOWFLAKE_USERNAME=myusername \
  -e SNOWFLAKE_PASSWORD=mypassword \
  -e CONFIG_YAML_PATH=/mount/config.yaml \
  -p 3000:3000 \
  --mount type=bind,source="$(pwd)/config.yaml",target=/mount/config.yaml,readonly \
  cbellew/snowflake-prometheus-exporter:latest
```

## Install into Kubernetes with helm

The Snowflake prometheus export has a self-hosted helm chart repo. First, add that to your local repos list.
```
helm repo add snowflake-prometheus-exporter https://snowflake-prometheus-exporter.s3.amazonaws.com
helm repo update
```

You can now install the latest chart

```
helm upgrade \
  --install \
  snowflake-prometheus-exporter \
  --set snowflake.account=ab12345.us-east-1 \
  --set snowflake.username=myusername \
  --set snowflake.password=mypassword \
  snowflake-prometheus-exporter/snowflake-prometheus-exporter
```

Check the pod is running
```
kubectl get pods
```

Expose the exporter locally on port 3000
```
export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=snowflake-prometheus-exporter,app.kubernetes.io/instance=snowflake-prometheus-exporter" -o jsonpath="{.items[0].metadata.name}")
kubectl --namespace default port-forward $POD_NAME 3000:3000
```

Fetch the latest metrics
```
curl http://localhost:3000/metrics
```
