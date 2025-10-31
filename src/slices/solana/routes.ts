import type { FastifyPluginAsync } from "fastify";

import { createLogger } from "../../core/logger";
import {
  SignInResponseSchema,
  VerifyRequestBodySchema,
  VerifyResponseSchema,
  type VerifySignInRequestBody,
} from "./schemas";
import { createSignInData, verifySIWS } from "./sign-in-with-solana";

const logger = createLogger({ module: "solana:routes" });

export const solanaRoutes: FastifyPluginAsync = async (app) => {
  logger.debug("Registering solana routes");

  app.route({
    method: "GET",
    url: "/solana/sign-in/create",
    schema: {
      response: SignInResponseSchema,
    },
    handler: async () => {
      logger.debug("Creating sign in data");
      return createSignInData();
    },
  });

  app.route<{ Body: VerifySignInRequestBody }>({
    method: "POST",
    url: "/solana/sign-in/verify",
    schema: {
      body: VerifyRequestBodySchema,
      response: VerifyResponseSchema,
    },
    handler: async (request, reply) => {
      const { input, output } = request.body;
      const verified = verifySIWS(input, output);

      if (!verified) {
        reply.code(401);
      }

      return { verified };
    },
  });
};
