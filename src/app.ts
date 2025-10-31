import Fastify from "fastify";

import { createLogger } from "./core/logger";
import { runtimeEnv } from "./core/runtime-env";

const appLogger = createLogger({ module: "fastify" });

export const buildApp = () => {
  const app = Fastify({
    loggerInstance: appLogger,
  });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
};

export type App = ReturnType<typeof buildApp>;

export const startApp = async (): Promise<App> => {
  const app = buildApp();

  const port = Number(runtimeEnv.PORT ?? "3000");
  const host = runtimeEnv.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    appLogger.info({ port, host }, "fastify: server listening");
  } catch (error) {
    appLogger.error({ err: error }, "fastify: failed to start");
    if (typeof process !== "undefined") {
      process.exit(1);
    } else {
      throw error;
    }
  }

  return app;
};

if (import.meta.main) {
  void startApp();
}
