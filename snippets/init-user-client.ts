import { NilauthClient, Signer } from "@nillion/nuc";
import { SecretVaultUserClient } from "@nillion/secretvaults";

export async function initSecretVaultUserClient() {
  const BUILDER_NAME = "Loyal Builder";
  const NILLION_PRIVATE_KEY_HEX = process.env.NILLION_PRIVATE_KEY_HEX!;
  const NILAUTH_URL = process.env.NILAUTH_URL!;
  const user = Signer.fromPrivateKey(NILLION_PRIVATE_KEY_HEX);

  const nilauthClient = await NilauthClient.create({
    baseUrl: NILAUTH_URL,
  });

  const userClient = await SecretVaultUserClient.from({
    signer: user,
    baseUrls: [
      "https://nildb-stg-n1.nillion.network",
      "https://nildb-stg-n2.nillion.network",
      "https://nildb-stg-n3.nillion.network",
    ],
    blindfold: { operation: "store" },
  });

  return userClient;
}
