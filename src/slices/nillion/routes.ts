import type { FastifyPluginAsync } from "fastify";
import { createLogger } from "../../core/logger";
import {
  VerifyRequestBodySchema,
  type VerifySignInRequestBody,
} from "../solana/schemas";
import { verifySIWS } from "../solana/sign-in-with-solana";
import { DelegationTokenResponseSchema } from "./responses";
import { getDelegationToken } from "./service";

const logger = createLogger({ module: "nillion:routes" });

export const nillionRoutes: FastifyPluginAsync = async (app) => {
  logger.debug("Registering solana delegation token routes");

  app.route<{ Body: VerifySignInRequestBody }>({
    method: "POST",
    url: "/solana/delegation-token",
    schema: {
      body: VerifyRequestBodySchema,
      response: DelegationTokenResponseSchema,
    },
    handler: async (request, reply) => {
      const { input, output } = request.body;
      const verified = verifySIWS(input, output);
      if (!verified) {
        logger.debug("Verification failed");
        reply.code(401);
        return { error: "Verification failed" };
      }
      const publicKey = output.account.address;
      const delegationToken = await getDelegationToken(publicKey);
      logger.debug("Delegation token created for public key: %s", publicKey);
      return { delegationToken };
    },
  });
};
