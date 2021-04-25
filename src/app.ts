import express from 'express'
import YAML from 'yaml'
import { snowflakeService } from './snowflake/service';
import fs from 'fs'
import { parseMetrics } from './config';

console.log('Starting Snowflake prometheus exporter...');

const { SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD, CONFIG_YAML_PATH } = process.env;

if (!SNOWFLAKE_ACCOUNT) throw new Error('Missing environment variable SNOWFLAKE_ACCOUNT');
if (!SNOWFLAKE_USERNAME) throw new Error('Missing environment variable SNOWFLAKE_USERNAME');
if (!SNOWFLAKE_PASSWORD) throw new Error('Missing environment variable SNOWFLAKE_PASSWORD');
if (!CONFIG_YAML_PATH) throw new Error('Missing environment variable CONFIG_YAML_PATH');
if (!fs.existsSync(CONFIG_YAML_PATH)) throw new Error(`No config file found at ${CONFIG_YAML_PATH}`);
if (!fs.existsSync(CONFIG_YAML_PATH)) throw new Error(`No config file found at ${CONFIG_YAML_PATH}`);

const metrics = parseMetrics(YAML.parse(fs.readFileSync(CONFIG_YAML_PATH).toString()));

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
    const { name, statements, fetchInterval, help } = metric;
    const gauge = new prometheus.Gauge({ name, help });

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