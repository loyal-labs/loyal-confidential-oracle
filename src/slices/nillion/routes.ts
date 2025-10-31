import type { FastifyPluginAsync } from "fastify";
import { createLogger } from "../../core/logger";
import {
  VerifyRequestBodySchema,
  type VerifySignInRequestBody,
} from "../solana/schemas";
import { verifySIWS } from "../solana/sign-in-with-solana";
import { StorageDelegationTokenResponseSchema } from "./responses";
import { getDelegationToken } from "./service";

const logger = createLogger({ module: "nillion:routes" });

export const nillionRoutes: FastifyPluginAsync = async (app) => {
  logger.debug("Registering solana delegation token routes");

  // app.route<{ Body: VerifySignInRequestBody }>({
  //   method: "POST",
  //   url: "/solana/delegation-tokens",
  //   schema: {
  //     body: VerifyRequestBodySchema,
  //     response: DelegationTokenResponseSchema,
  //   },
  //   handler: async (request, reply) => {
  //     const { input, output } = request.body;
  //     const verified = verifySIWS(input, output);

  //     if (!verified) {
  //       logger.debug("Verification failed");
  //       reply.code(401);
  //       return { error: "Verification failed" };
  //     }

  //     const publicKey = output.account.address;
  //     const storageDelegationToken = await getDelegationToken(publicKey);
  //     const modelDelegationToken = await getModelDelegationToken(publicKey);
  //     logger.debug("Delegation tokens created for public key: %s", publicKey);
  //     return { storageDelegationToken, modelDelegationToken };
  //   },
  // });

  app.route<{ Body: VerifySignInRequestBody }>({
    method: "POST",
    url: "/solana/delegation-tokens/storage",
    schema: {
      body: VerifyRequestBodySchema,
      response: StorageDelegationTokenResponseSchema,
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
      const storageDelegationToken = await getDelegationToken(publicKey);
      logger.debug(
        "Storage delegation token created for public key: %s",
        publicKey
      );
      return { storageDelegationToken };
    },
  });

  // app.route<{ Body: VerifySignInRequestBody }>({
  //   method: "POST",
  //   url: "/solana/delegation-tokens/model",
  //   schema: {
  //     body: VerifyRequestBodySchema,
  //     response: ModelDelegationTokenResponseSchema,
  //   },
  //   handler: async (request, reply) => {
  //     const { input, output } = request.body;
  //     const verified = verifySIWS(input, output);
  //     if (!verified) {
  //       logger.debug("Verification failed");
  //       reply.code(401);
  //       return { error: "Verification failed" };
  //     }
  //     const publicKey = output.account.address;
  //     const modelDelegationToken = await getModelDelegationToken(publicKey);
  //     logger.debug(
  //       "Model delegation token created for public key: %s",
  //       publicKey
  //     );
  //     return { modelDelegationToken };
  //   },
  // });
};
