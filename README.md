# Snowflake Prometheus Exporter

A Prometheus exporter for Snowflake

## Usage

The default way to use this exporter is by installing it into kubernetes with helm. You will need to set up your Snowflake connection details inside `values.yaml` like so:

```yaml
snowflake:
  account: <account>.<region>
  username: <username>
  password: <password>
  config:
    default_fetch_interval: 10
    metrics:
      - name: test_metric
        help: A test metric
        statement:
          - "SELECT COUNT(*) FROM snowflake_sample_data.weather.daily_14_total" # snowflake_sample_data.weather.daily_14_total is available in all Snowflake accounts and can be accessed using the `public` role
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
