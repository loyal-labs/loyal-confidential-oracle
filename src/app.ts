import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";

import { createLogger } from "./core/logger";
import { runtimeEnv } from "./core/runtime-env";
import { nillionRoutes } from "./slices/nillion/routes";
import { solanaRoutes } from "./slices/solana/routes";

const appLogger = createLogger({ module: "fastify" });

export const buildApp = () => {
  const app = Fastify({
    loggerInstance: appLogger,
    trustProxy: true,
    disableRequestLogging: true,
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: runtimeEnv.npm_package_name ?? "loyal-confidential-oracle",
        version: runtimeEnv.npm_package_version ?? "0.0.0",
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  app.addHook("onRequest", async (request) => {
    request.log.debug(
      {
        method: request.method,
        url: request.url,
      },
      "request: received"
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.debug(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      "request: completed"
    );
  });

  app.get("/health", async () => ({ status: "ok" }));
  app.register(solanaRoutes);
  app.register(nillionRoutes);

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
