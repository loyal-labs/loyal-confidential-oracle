import {
  DelegationTokenServer,
  NilAuthInstance,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
} from "@nillion/nilai-ts";
import assert from "node:assert/strict";
import { createLogger } from "../../core/logger";
import { TOKEN_EXPIRATION_TIME, TOKEN_SANDBOX, TOKEN_USES } from "./constants";
import { BUILDER_KEY } from "./env";

const logger = createLogger({ module: "nillion:llm" });

let delegationTokenServer: DelegationTokenServer | null = null;

export const getDelegationTokenServer = async (
  expTime: number = TOKEN_EXPIRATION_TIME,
  tokenUses: number = TOKEN_USES,
  sandbox: boolean = TOKEN_SANDBOX
): Promise<DelegationTokenServer> => {
  if (!delegationTokenServer) {
    console.debug("Creating new delegation token server");
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
  console.debug("Delegation token server created");
  return delegationTokenServer;
};

export const createIntelligenceDelegationToken = async (
  delegationTokenServer: DelegationTokenServer,
  request: DelegationTokenRequest
): Promise<DelegationTokenResponse> => {
  const delegationToken: DelegationTokenResponse =
    await delegationTokenServer.createDelegationToken(request);
  return delegationToken;
};
