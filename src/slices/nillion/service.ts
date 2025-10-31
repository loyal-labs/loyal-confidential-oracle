import type { DelegationTokenRequest } from "@nillion/nilai-ts";
import { RequestType } from "@nillion/nilai-ts";
import { createLogger } from "../../core/logger";
import { createDelegationToken } from "./builder";
import {
  getBuilderClient,
  getBuilderSigner,
  getUserDidFromSolanaPublicKey,
  getUserHexKeyFromSolanaPublicKey,
} from "./helpers";
import { getDelegationTokenServer } from "./llm";

const logger = createLogger({ module: "nillion:service" });

export const getDelegationToken = async (publicKey: string) => {
  logger.debug("Getting delegation token for public key: %s", publicKey);
  const userDid = getUserDidFromSolanaPublicKey(publicKey);
  const builderClient = await getBuilderClient();
  const builderSigner = getBuilderSigner();
  const delegationToken = await createDelegationToken(
    userDid,
    builderClient,
    builderSigner
  );
  return delegationToken;
};

export const getModelDelegationToken = async (publicKey: string) => {
  logger.debug("Getting model delegation token for public key: %s", publicKey);
  const userHexKey = getUserHexKeyFromSolanaPublicKey(publicKey);
  const server = await getDelegationTokenServer();
  const request: DelegationTokenRequest = {
    public_key: userHexKey,
    type: RequestType.DELEGATION_TOKEN_REQUEST,
  };
  const delegationToken = await server.createDelegationToken(request);
  logger.debug("Model delegation token created for public key: %s", publicKey);
  return delegationToken;
};
