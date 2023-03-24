interface RawConfig {
  default_fetch_interval_seconds: number;
  metrics: RawMetric[];
}

interface RawMetric {
  name: string;
  statement: string | undefined;
  statements: string[] | undefined;
  fetch_interval: number | undefined;
  help: string | undefined;
}

export interface Metric {
  name: string;
  statements: string[];
  fetchInterval: number;
  help: string | undefined;
}

const DEFAULT_FETCH_INTERVAL_SECONDS = 43200; // 43200 s = 12 hrs

export const parseMetrics = (config: RawConfig): Metric[] => {
  const { default_fetch_interval_seconds, metrics } = config;
  const defaultFetchInterval =
    !isNaN(default_fetch_interval_seconds) && default_fetch_interval_seconds > 0
      ? Number(default_fetch_interval_seconds)
      : DEFAULT_FETCH_INTERVAL_SECONDS;
  if (typeof metrics === "undefined")
    throw new Error("Config file missing `metrics` at root");
  if (!metrics.length)
    throw new Error("Config file missing non empty `metrics` array at root");
  return metrics.map((metric) => {
    const { name, statement, statements, fetch_interval, help } = metric;
    if (!name || typeof name !== "string")
      throw new Error(`Metric name missing in config file`);
    if (
      (!statement || typeof statement !== "string") &&
      (!statements || !statements.length)
    )
      throw new Error(
        `Missing statement or statements for metric ${name} in config file`
      );
    if (statements && statements.some((statement) => !statement)) {
      throw new Error(
        `Invalid statement for metric ${name} in config file`
      );
    }
    const fetchInterval =
      typeof fetch_interval === "number" && fetch_interval > 0
        ? fetch_interval
        : defaultFetchInterval;

    return ({
      name,
      statements: statements ? statements : [statement],
      fetchInterval,
      help,
    } as unknown) as Metric;
  });
};
