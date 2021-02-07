# Snowflake Prometheus Exporter

A Prometheus exporter for Snowflake

## Usage

The default way to use this exporter is by installing it into kubernetes with helm. You will need to set up your Snowflake fetch configs inside `values.yaml` like so:

```yaml
snowflake:
  config:
    default_fetch_interval: 10
    metrics:
      - name: test_metric
        help: A test metric
        statement:
          - "SELECT COUNT(*) FROM snowflake_sample_data.weather.daily_14_total" # snowflake_sample_data.weather.daily_14_total is available in all Snowflake accounts and can be accessed using the `public` role
```

And provide the connection details as helm values:

```
helm upgrade \
  --install \
  snowflake-prometheus-exporter \
  --set snowflake.account=$SNOWFLAKE_ACCOUNT \
  --set snowflake.username=$SNOWFLAKE_USERNAME \
  --set snowflake.password=$SNOWFLAKE_PASSWORD \
  snowflake-prometheus-exporter
```

## Developing

Set up a kind cluster for local development

```
./kind-with-registry.sh
```

Build the docker image, push to the registry inside kind, and use helm to install the snowflake-prometheus-exporter chart into kubernetes

```
./build.sh
```
