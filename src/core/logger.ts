import pino, { type Bindings, type LoggerOptions } from "pino";

type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv: RuntimeEnv = (() => {
  const bunEnv = (
    globalThis as typeof globalThis & { Bun?: { env: RuntimeEnv } }
  ).Bun?.env;

  if (bunEnv) {
    return bunEnv;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
})();

const isProduction = runtimeEnv.NODE_ENV === "production";

const LOG_LEVELS: ReadonlySet<LoggerOptions["level"]> = new Set([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

const defaultLevel: LoggerOptions["level"] = isProduction ? "info" : "debug";

const resolvedLevel: LoggerOptions["level"] = (() => {
  const candidate = runtimeEnv.LOG_LEVEL?.toLowerCase() as
    | LoggerOptions["level"]
    | undefined;

  if (candidate && LOG_LEVELS.has(candidate)) {
    return candidate;
  }

  return defaultLevel;
})();

const options: LoggerOptions = {
  level: resolvedLevel,
  base: {
    env: runtimeEnv.NODE_ENV ?? (isProduction ? "production" : "development"),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const prettyTransport = (() => {
  if (isProduction) {
    return undefined;
  }

  try {
    return pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        singleLine: true,
        hideObject: true,
        translateTime: "SYS:standard",
        messageFormat: "[{env}] {msg}",
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.warn(
      `logger: pino-pretty unavailable (${reason}); falling back to JSON logs`
    );
    return undefined;
  }
})();

export const logger = pino(options, prettyTransport);

export type AppLogger = typeof logger;

export const createLogger = (bindings: Bindings = {}): AppLogger =>
  logger.child(bindings) as AppLogger;

export default logger;
