import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export const getContextAddress = (wallet: PublicKey): PublicKey => {
  const [contextAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from("context"), wallet.toBuffer()],
    PROGRAM_ID
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
    PROGRAM_ID
  );
  return chatAddress;
};
