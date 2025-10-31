import type { Commitment } from "@solana/web3.js";
import type { WalletAccount } from "@wallet-standard/base";
import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";

export const Status = {
  STATUS_WAITING_FOR_DELEGATION: 0,
  STATUS_PENDING: 1,
  STATUS_DONE: 2,
  STATUS_ERROR: 3,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const DEFAULT_COMMITMENT: Commitment = "confirmed";
export const VALID_COMMITMENTS: ReadonlySet<Commitment> = new Set([
  "processed",
  "confirmed",
  "finalized",
]);

export type SerializedWalletAccount = Omit<WalletAccount, "publicKey"> & {
  publicKey: number[];
};

export type SerializedSolanaSignInOutput = Omit<
  SolanaSignInOutput,
  "account" | "signedMessage" | "signature"
> & {
  account: SerializedWalletAccount;
  signedMessage: number[];
  signature: number[];
};

export type VerifySignInRequestBody = {
  input: SolanaSignInInput;
  output: SerializedSolanaSignInOutput;
};

const byteArraySchema = {
  type: "array",
  items: {
    type: "integer",
    minimum: 0,
    maximum: 255,
  },
};

const signInInputSchema = {
  type: "object",
  properties: {
    domain: { type: "string" },
    address: { type: "string" },
    statement: { type: "string" },
    uri: { type: "string" },
    version: { type: "string" },
    chainId: { type: "string" },
    nonce: { type: "string" },
    issuedAt: { type: "string" },
    expirationTime: { type: "string" },
    notBefore: { type: "string" },
    requestId: { type: "string" },
    resources: {
      type: "array",
      items: { type: "string" },
    },
  },
  additionalProperties: true,
};

const walletAccountSchema = {
  type: "object",
  properties: {
    address: { type: "string" },
    publicKey: byteArraySchema,
    chains: {
      type: "array",
      items: { type: "string" },
    },
    features: {
      type: "array",
      items: { type: "string" },
    },
    label: { type: "string" },
    icon: { type: "string" },
  },
  required: ["address", "publicKey", "chains", "features"],
  additionalProperties: true,
};

export const VerifyRequestBodySchema = {
  type: "object",
  required: ["input", "output"],
  properties: {
    input: signInInputSchema,
    output: {
      type: "object",
      required: ["account", "signature", "signedMessage"],
      properties: {
        account: walletAccountSchema,
        signature: byteArraySchema,
        signedMessage: byteArraySchema,
        signatureType: {
          type: "string",
          enum: ["ed25519"],
        },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: false,
};

export const VerifyResponseSchema = {
  200: {
    type: "object",
    properties: {
      verified: { type: "boolean" },
    },
    required: ["verified"],
    additionalProperties: false,
  },
  401: {
    type: "object",
    properties: {
      verified: { type: "boolean", const: false },
    },
    required: ["verified"],
    additionalProperties: false,
  },
};

export const SignInResponseSchema = {
  200: {
    type: "object",
    properties: {
      domain: { type: "string" },
      statement: { type: "string" },
      version: { type: "string" },
      nonce: { type: "string" },
      chainId: { type: "string" },
      issuedAt: { type: "string" },
      resources: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["domain", "statement", "version", "nonce", "chainId", "issuedAt"],
    additionalProperties: true,
  },
};
