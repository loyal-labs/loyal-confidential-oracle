import {
  DelegationTokenServer,
  NilAuthInstance,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
} from "@nillion/nilai-ts";
import assert from "node:assert/strict";
import { createLogger } from "../../core/logger";
import { BUILDER_KEY } from "./env";

const logger = createLogger({ module: "nillion:llm" });

let delegationTokenServer: DelegationTokenServer | null = null;

export const getDelegationTokenServer = async (
  expTime: number = 2880,
  tokenUses: number = 1,
  sandbox: boolean = true
): Promise<DelegationTokenServer> => {
  if (!delegationTokenServer) {
    assert(expTime > 0, "Expiration time must be greater than 0");
    assert(tokenUses > 0, "Token uses must be greater than 0");
    assert(typeof sandbox === "boolean", "Sandbox must be a boolean");

    const nilauthInstance = sandbox
      ? NilAuthInstance.SANDBOX
      : NilAuthInstance.PRODUCTION;

    delegationTokenServer = new DelegationTokenServer(BUILDER_KEY, {
      nilauthInstance,
      expirationTime: expTime,
      tokenMaxUses: tokenUses,
    });
  }
  return delegationTokenServer;
};

export const createIntelligenceDelegationToken = async (
  request: DelegationTokenRequest
): Promise<DelegationTokenResponse> => {
  logger.debug("Creating intelligence delegation token");
  const server = await getDelegationTokenServer();

  const delegationToken: DelegationTokenResponse =
    await server.createDelegationToken(request);
  return delegationToken;
};
