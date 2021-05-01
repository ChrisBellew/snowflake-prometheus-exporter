![Snowflake](snowflake.svg) &nbsp;&nbsp;&nbsp;![Prometheus](prometheus.svg)

# Snowflake Prometheus Exporter

This is an (unofficial) Prometheus exporter for Snowflake. It connects to a given Snowflake account and runs queries periodically, exposing the result as Prometheus metrics on a `/metrics` endpoint.

Only [Gauges](https://prometheus.io/docs/concepts/metric_types/#gauge) are supported currently. This essentially means you can emit a single value that might increase and decrease over time. Your query must return a single value.

If you have a use case for a [Counter](https://prometheus.io/docs/concepts/metric_types/#counter), [Histogram](https://prometheus.io/docs/concepts/metric_types/#histogram) or [Summary](https://prometheus.io/docs/concepts/metric_types/#summary) then raise an issue and explain your use case.

# Usage

1. Prepare one or more queries you want to run and expose metrics for.
2. Ensure you have a user set up in Snowflake that has the correct permissions to run these queries.
3. Configure each query in a `config.yaml` file as a metric. Below is a simple example. It's the same as the `config.yaml` checked in to the root of this repo.

```yaml
default_fetch_interval: 60
metrics:
  - name: test_metric
    help: A test metric
    statement: SELECT COUNT(*) FROM snowflake_sample_data.weather.daily_14_total
```

For each metric you must prepare one or more Snowflake SQL statements. Often you will need to `USE` a `ROLE` before you run your query because of the permissions model you have. If that's you, you can configure multiple statements for each metric:

```yaml
default_fetch_interval: 60
metrics:
  - name: test_metric
    help: A test metric
    statements:
      - USE ROLE public
      - SELECT COUNT(*) FROM snowflake_sample_data.weather.daily_14_total
```

You don't configure credentials in this `config.yaml` because it would be poor security hygiene to have them stored in plain text and checked in to source control. Instead they are passed in as environment variables.

4. Download and [install](#installation) the exporter.
5. Watch your metrics appear. Often this means configuring the exporter to be scraped by Prometheus. Or you could just `curl` them.

# Installation

## Snowflake Connection parameters

In addition to the `config.yaml` you will need three Snowflake connection parameters

| Parameter | Comment                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account   | The name of the Snowflake account. This is the first part of the domain when you are visiting Snowflake in your browser. It looks something like `id.region`. For example `ab12345.us-east-1`. |
| Username  | The name of a user who will have sufficient privileges to run your queries.                                                                                                                    |
| Password  | The password of the user                                                                                                                                                                       |

## Docker, kubectl or helm?

This exporter is deployed as a container. Here's some guides to help you install with your preferred container workflow.

- [Install with Docker](#install-with-docker)
- [Install into Kubernetes with helm](#install-into-kubernetes-with-helm)

## Install with Docker

First let's run the container interactively so we know we are passing the configuration correctly. We'll pull it straight from [Docker Hub](https://hub.docker.com/r/cbellew/snowflake-prometheus-exporter). This command assumes you have put the `config.yaml` in the current directory or you are running it from the repository root where there is a default `config.yaml`. Replace the account, username and password.

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
Starting Snowflake Prometheus exporter...
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

Now you can run the container detached in the background. Replace the account, username and password.

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

The Snowflake Prometheus exporter has a self-hosted helm chart repo. First, add that to your local repos list.

```
helm repo add snowflake-prometheus-exporter https://snowflake-prometheus-exporter.s3.amazonaws.com
helm repo update
```

You can now install the latest chart. Replace the account, username and password.

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
