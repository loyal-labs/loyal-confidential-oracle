import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import { CHAIN_NETWORK, DOMAIN_NAME, SIGN_IN_STATEMENT } from "./constants";
import type { SerializedSolanaSignInOutput } from "./schemas";

export const createSignInData = async (): Promise<SolanaSignInInput> => {
  const now: Date = new Date();
  const domain = DOMAIN_NAME;
  const nonce = Math.random().toString(36).substring(2, 15);

  const currentDateTime = now.toISOString();

  const signInData: SolanaSignInInput = {
    domain,
    statement: SIGN_IN_STATEMENT,
    version: "1",
    nonce: nonce,
    chainId: CHAIN_NETWORK,
    issuedAt: currentDateTime,
  };

  return signInData;
};

export function verifySIWS(
  input: SolanaSignInInput,
  output: SerializedSolanaSignInOutput
): boolean {
  const { publicKey, ...accountRest } = output.account;
  const deserializedOutput: SolanaSignInOutput = {
    account: {
      ...accountRest,
      publicKey: new Uint8Array(publicKey),
    },
    signature: new Uint8Array(output.signature),
    signedMessage: new Uint8Array(output.signedMessage),
    signatureType: output.signatureType,
  };
  return verifySignIn(input, deserializedOutput);
}
