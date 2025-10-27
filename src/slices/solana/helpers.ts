import { BN, Wallet } from "@coral-xyz/anchor";
import { Keypair, PublicKey, type Commitment } from "@solana/web3.js";
import assert from "node:assert";
import { createLogger } from "../../core/logger";
import { LOYAL_PROGRAM_ID } from "./constants";
import { SOLANA_COMMITMENT, SOLANA_ORACLE_PRIVATE_KEY } from "./env";
import { DEFAULT_COMMITMENT, VALID_COMMITMENTS } from "./schemas";

const logger = createLogger({ module: "solana:helpers" });

export const getContextAddress = (wallet: PublicKey): PublicKey => {
  const [contextAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from("context"), wallet.toBuffer()],
    LOYAL_PROGRAM_ID
  );
  return contextAddress;
};

export const getChatAddress = (
  contextAddress: PublicKey,
  chatId: BN
): PublicKey => {
  const [chatAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("chat"),
      contextAddress.toBuffer(),
      chatId.toArrayLike(Buffer, "le", 8),
    ],
    LOYAL_PROGRAM_ID
  );
  return chatAddress;
};

export const extractSolanaHost = (endpoint: string): string | undefined => {
  try {
    return new URL(endpoint).host;
  } catch {
    return undefined;
  }
};

export const resolveCommitment = (): Commitment => {
  const candidate = SOLANA_COMMITMENT?.toLowerCase() as Commitment | undefined;

  if (candidate && VALID_COMMITMENTS.has(candidate)) {
    return candidate;
  }

  if (candidate) {
    logger.warn(
      { commitment: SOLANA_COMMITMENT },
      "solana: unsupported commitment configured; using default"
    );
  }

  return DEFAULT_COMMITMENT;
};

export const getOracleKeypair = (): Wallet => {
  const privateKey = SOLANA_ORACLE_PRIVATE_KEY;
  assert(privateKey, "SOLANA_ORACLE_PRIVATE_KEY not configured");
  const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, "hex"));

  return new Wallet(keypair);
};
