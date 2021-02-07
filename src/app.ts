import express from 'express'
import YAML from 'yaml'
import { snowflakeService } from './snowflake/service';
import fs from 'fs'

const { SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD, CONFIG_YAML_PATH } = process.env;

if (!SNOWFLAKE_ACCOUNT) throw new Error('Missing environment variable SNOWFLAKE_ACCOUNT');
if (!SNOWFLAKE_USERNAME) throw new Error('Missing environment variable SNOWFLAKE_USERNAME');
if (!SNOWFLAKE_PASSWORD) throw new Error('Missing environment variable SNOWFLAKE_PASSWORD');
if (!CONFIG_YAML_PATH) throw new Error('Missing environment variable CONFIG_YAML_PATH');

const config: Config = YAML.parse(fs.readFileSync(CONFIG_YAML_PATH).toString());
const { metrics } = config;

const app = express()
const port = 3000
const prometheus = require('prom-client');

app.get('/healthz', (_, res) => {
  return res.sendStatus(200);
});

app.get('/metrics', (req, res) => {
  return res.send(prometheus.register.metrics());
});

; (async () => {
  const service = snowflakeService(SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD);

  app.listen(port, () => { console.log(`Snowflake exporter listening at http://localhost:${port}`) });

  const metricPromises = metrics.map(async metric => {
    const { name, statement, fetch_interval, help } = metric;
    const fetchInterval = fetch_interval || config.default_fetch_interval || 300;
    const gauge = new prometheus.Gauge({ name, help });
    const statements = Array.isArray(statement) ? statement : [statement];

    while (true) {
      const rows = await service.query(statements);
      if (rows.length) {
        const row = rows[0];
        const number = row[Object.keys(row)[0]];
        gauge.set(number);
      }
      await new Promise((resolve) => setTimeout(resolve, fetchInterval * 1000));
    }
  });

  await Promise.all(metricPromises);
})();

interface Config {
  default_fetch_interval: number
  metrics: Metric[]
}

interface Metric {
  name: string
  statement: string | string[]
  fetch_interval: number | undefined
  help: string | undefined
}