import assert from "node:assert/strict";

import { Connection, type ConnectionConfig } from "@solana/web3.js";

import { createLogger } from "../../core/logger";
import { SOLANA_RPC_URL, SOLANA_WS_ENDPOINT } from "./env";
import { extractSolanaHost, resolveCommitment } from "./helpers";

const logger = createLogger({ module: "solana:model" });

let cachedConnectionPromise: Promise<Connection> | null = null;

export const getSolanaConnection = async (): Promise<Connection> => {
  if (!cachedConnectionPromise) {
    cachedConnectionPromise = (async () => {
      const endpoint = SOLANA_RPC_URL;
      assert(endpoint, "SOLANA_RPC_URL not configured");

      const commitment = resolveCommitment();
      const connectionConfig: ConnectionConfig = { commitment };

      const wsEndpoint = SOLANA_WS_ENDPOINT;
      if (wsEndpoint) {
        connectionConfig.wsEndpoint = wsEndpoint;
      }

      const endpointHost = extractSolanaHost(endpoint);

      logger.debug(
        { commitment, endpointHost, hasWsEndpoint: Boolean(wsEndpoint) },
        "solana: creating RPC connection"
      );

      const connection = new Connection(endpoint, connectionConfig);

      try {
        await connection.getVersion();
        logger.debug(
          { commitment, endpointHost },
          "solana: RPC connection established"
        );
        return connection;
      } catch (error) {
        logger.error(
          { err: error, commitment, endpointHost },
          "solana: failed to establish RPC connection"
        );
        throw error;
      }
    })().catch((error) => {
      cachedConnectionPromise = null;
      throw error;
    });
  }

  return cachedConnectionPromise;
};

export default getSolanaConnection;
