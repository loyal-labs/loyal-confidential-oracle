import { Did, NilauthClient, PayerBuilder, Signer } from "@nillion/nuc";
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from "@nillion/secretvaults";
import base58 from "bs58";
import { Buffer } from "buffer";
import { createLogger } from "../../core/logger";
import {
  NILAUTH_URL,
  NILLION_LLM_PUBLIC_KEY_URL,
  NODE_DB_URLS,
  RPC_URL,
} from "./constants";
import { BUILDER_KEY, USER_KEY } from "./env";

const logger = createLogger({ module: "nillion:helpers" });

let builderSigner: Signer | null = null;
let userSigner: Signer | null = null;

let nilauthClient: NilauthClient | null = null;
let builderClient: SecretVaultBuilderClient | null = null;
let userClient: SecretVaultUserClient | null = null;
let builderAsUserClient: SecretVaultUserClient | null = null;

export const getBuilderSigner = (): Signer => {
  if (!builderSigner) {
    builderSigner = Signer.fromPrivateKey(BUILDER_KEY);
  }
  return builderSigner;
};

export const getUserSigner = (): Signer => {
  if (!userSigner) {
    userSigner = Signer.fromPrivateKey(USER_KEY);
  }
  return userSigner;
};

export const getNilauthClient = async (): Promise<NilauthClient> => {
  if (!nilauthClient) {
    const payer = await PayerBuilder.fromPrivateKey(USER_KEY)
      .chainUrl(RPC_URL)
      .gasLimit("auto")
      .broadcastTimeoutMs(10000)
      .broadcastPollIntervalMs(1000)
      .build();

    nilauthClient = await NilauthClient.create({ baseUrl: NILAUTH_URL, payer });
  }
  return nilauthClient;
};

export const getBuilderClient = async (): Promise<SecretVaultBuilderClient> => {
  if (!builderClient) {
    builderClient = await SecretVaultBuilderClient.from({
      signer: getBuilderSigner(),
      nilauthClient: await getNilauthClient(),
      dbs: NODE_DB_URLS,
    });
    await builderClient.refreshRootToken();
  }
  return builderClient;
};

export const getUserClient = async (): Promise<SecretVaultUserClient> => {
  if (!userClient) {
    userClient = await SecretVaultUserClient.from({
      signer: getUserSigner(),
      baseUrls: NODE_DB_URLS,
      blindfold: { operation: "store" },
    });
  }
  return userClient;
};

export const getBuilderAsUserClient =
  async (): Promise<SecretVaultUserClient> => {
    if (!builderAsUserClient) {
      builderAsUserClient = await SecretVaultUserClient.from({
        signer: getBuilderSigner(),
        baseUrls: NODE_DB_URLS,
        blindfold: { operation: "store" },
      });
    }

    return builderAsUserClient;
  };

export const getUserDidFromSolanaPublicKey = (publicKey: string): Did => {
  logger.debug("Getting user DID from Solana public key: %s", publicKey);
  const userPublicKeyBytes = base58.decode(publicKey);
  const userPublicKeyHex = Buffer.from(userPublicKeyBytes).toString("hex");
  return Did.fromPublicKey(userPublicKeyHex, "key");
};

export const getUserHexKeyFromSolanaPublicKey = (publicKey: string): string => {
  logger.debug("Getting user hex key from Solana public key: %s", publicKey);
  const userPublicKeyBytes = base58.decode(publicKey);
  const userPublicKeyHex = Buffer.from(userPublicKeyBytes).toString("hex");
  return userPublicKeyHex;
};

export const getNilaiPublicKey = async (): Promise<string> => {
  const publicKeyUrl = new URL(NILLION_LLM_PUBLIC_KEY_URL);
  const publicKeyResponse = await fetch(publicKeyUrl.toString(), {
    method: "GET",
  });
  const publicKey = await publicKeyResponse.text();
  return publicKey;
};
