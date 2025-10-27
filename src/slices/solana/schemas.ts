import type { Commitment } from "@solana/web3.js";

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
