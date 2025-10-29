// file: make-auth-header.ts
import { NilauthClient, PayerBuilder, Signer } from "@nillion/nuc";

const NILAUTH_URL = process.env.NILAUTH_URL!;
const BLIND_MODULE = (process.env.BLIND_MODULE ?? "nildb") as "nildb" | "nilai";
const PAYER_KEY = process.env.NILLION_PAYER_PRIVATE_KEY!;
const NILLION_PRIVATE_KEY_HEX = process.env.NILLION_PRIVATE_KEY_HEX!;
const RPC_URL = process.env.NILCHAIN_RPC_URL!;

(async () => {
  const payer = await PayerBuilder.fromPrivateKey(PAYER_KEY)
    .chainUrl(RPC_URL)
    .gasLimit("auto")
    .broadcastTimeoutMs(10000)
    .broadcastPollIntervalMs(1000)
    .build();

  const payerSigner = Signer.fromPrivateKey(PAYER_KEY);
  const builderSigner = Signer.fromPrivateKey(NILLION_PRIVATE_KEY_HEX);
  const nilauth = await NilauthClient.create({ baseUrl: NILAUTH_URL });

  const health = await nilauth.health();
  console.log("Health:", health);

  const builderDid = await builderSigner.getDid();
  const payerDid = await payerSigner.getDid();

  const cost = await nilauth.subscriptionCost(BLIND_MODULE);
  const status = await nilauth.subscriptionStatus(builderDid, BLIND_MODULE);
  console.log("Subscription Status:", status);

  const { resourceHash, payload } = await nilauth.createPaymentResource(
    builderDid,
    BLIND_MODULE,
    payerDid
  );

  const txHash = await payer.pay(resourceHash, cost);
  console.log("Tx Hash:", txHash);

  const response = await nilauth.validatePayment(txHash, payload, payerSigner);
  console.log("Response:", response);
})();
