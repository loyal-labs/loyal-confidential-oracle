import runtimeEnv from "../../core/runtime-env";

export const SOLANA_RPC_URL = runtimeEnv.SOLANA_RPC_URL;
export const SOLANA_WS_ENDPOINT = runtimeEnv.SOLANA_RPC_WS_URL;
export const SOLANA_COMMITMENT = runtimeEnv.SOLANA_COMMITMENT || "confirmed";
export const SOLANA_ORACLE_PRIVATE_KEY = runtimeEnv.SOLANA_ORACLE_PRIVATE_KEY;

export const EPHEMERAL_PROVIDER_ENDPOINT =
  runtimeEnv.EPHEMERAL_PROVIDER_ENDPOINT || "https://devnet-us.magicblock.app/";
export const EPHEMERAL_WS_ENDPOINT =
  runtimeEnv.EPHEMERAL_WS_ENDPOINT || "wss://devnet-us.magicblock.app/";
