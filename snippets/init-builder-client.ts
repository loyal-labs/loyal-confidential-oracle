import { BinaryWriter } from "@bufbuild/protobuf/wire";
import {
  DirectSecp256k1HdWallet,
  Registry,
  type GeneratedType,
} from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes,
  GasPrice,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { NilauthClient, Payer, Signer } from "@nillion/nuc";
import { SecretVaultBuilderClient } from "@nillion/secretvaults";

// ---- env ----
const NILAUTH_URL =
  process.env.NILAUTH_URL ??
  "https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz";
const BLIND_MODULE = (process.env.BLIND_MODULE ?? "nilai") as "nildb" | "nilai";

// Sign-in identity (the *network/API* keypair, hex private key, 64 hex chars)
const NILLION_PRIVATE_KEY_HEX = process.env.NILLION_PRIVATE_KEY_HEX!;

// Payer is required by NilauthClient ctor. For token minting it won’t spend
// if you’re already subscribed, but we must still construct it.
const PAYER_MNEMONIC = process.env.PAYER_MNEMONIC!;

// ---- Cosmos (nilChain) RPC for testnet ----
// From Nillion docs → Network Configuration page.
const RPC_URL =
  process.env.NILCHAIN_RPC_URL ??
  "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz";
const GAS_PRICE = process.env.NILCHAIN_GAS_PRICE ?? "0.025unil";
const NILCHAIN_MSG_PAY_FOR = "/nillion.meta.v1.MsgPayFor";

type MsgPayForAmount = {
  denom: string;
  amount: string;
};

type MsgPayFor = {
  resource: Uint8Array;
  fromAddress: string;
  amount: MsgPayForAmount[];
};

const MsgPayForGeneratedType: GeneratedType = {
  encode(message: MsgPayFor, writer: any = new BinaryWriter()) {
    if (message.resource?.length) {
      writer.uint32(10).bytes(message.resource);
    }
    if (message.fromAddress) {
      writer.uint32(18).string(message.fromAddress);
    }
    for (const amount of message.amount ?? []) {
      const amountWriter = new BinaryWriter();
      if (amount.denom) {
        amountWriter.uint32(10).string(amount.denom);
      }
      if (amount.amount) {
        amountWriter.uint32(18).string(amount.amount);
      }
      writer.uint32(26).bytes(amountWriter.finish());
    }
    return writer;
  },
  decode() {
    throw new Error("MsgPayFor decode not implemented");
  },
  fromPartial(object: any): MsgPayFor {
    return {
      resource: object.resource ?? new Uint8Array(),
      fromAddress: object.fromAddress ?? "",
      amount: (object.amount ?? []).map((coin: any) => ({
        denom: coin?.denom ?? "",
        amount: coin?.amount ?? "",
      })),
    };
  },
};

export async function initSecretVaultBuilderClient() {
  // 1) Build a payer (Cosmos client + address)
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(PAYER_MNEMONIC, {
    prefix: "nillion",
  });
  const [acct] = await wallet.getAccounts();
  if (!acct) {
    throw new Error("No Cosmos account derived from PAYER_MNEMONIC");
  }
  const gasPrice = GasPrice.fromString(GAS_PRICE);
  const registry = new Registry([
    ...defaultRegistryTypes,
    [NILCHAIN_MSG_PAY_FOR, MsgPayForGeneratedType],
  ]);
  const client = await SigningStargateClient.connectWithSigner(
    RPC_URL,
    wallet,
    {
      gasPrice,
      registry,
    }
  );
  const payerAddress = ensureNilChainAddress(acct.address);
  const payer = new Payer({ address: payerAddress, client, gasLimit: "auto" });

  const BUILDER_NAME = "Loyal Builder";
  const NILLION_PRIVATE_KEY_HEX = process.env.NILLION_PRIVATE_KEY_HEX!;
  const NILAUTH_URL = process.env.NILAUTH_URL!;
  const builder = Signer.fromPrivateKey(NILLION_PRIVATE_KEY_HEX);

  const nilauthClient = await NilauthClient.create({
    baseUrl: NILAUTH_URL,
  });

  const builderClient = await SecretVaultBuilderClient.from({
    signer: builder,
    nilauthClient,
    dbs: [
      "https://nildb-stg-n1.nillion.network",
      "https://nildb-stg-n2.nillion.network",
      "https://nildb-stg-n3.nillion.network",
    ],
    blindfold: { operation: "store" },
  });

  await builderClient.refreshRootToken();
  console.log("Root token:", builderClient.rootToken);

  const subscriptionStatus = await builderClient.subscriptionStatus();
  console.log("Subscription status:", subscriptionStatus);

  // // 1 time setup for new builders
  // try {
  //   const builderProfile = await builderClient.readProfile();
  //   console.log(
  //     "Using existing builderClient profile:",
  //     builderProfile.data._id
  //   );
  // } catch {
  //   // Profile doesn't exist, register the builderClient
  //   console.log("Registering builderClient profile...");
  //   try {
  //     const builderDid = await builder.getDid();
  //     const builderDidString = builderDid.toString();

  //     await builderClient.register({
  //       did: builderDidString,
  //       name: BUILDER_NAME,
  //     });
  //     console.log(
  //       `1 time builderClient profile registration complete for ${builderDidString}`
  //     );
  //   } catch (error) {
  //     // Ignore duplicate entry errors (concurrent registration)
  //     const seen = new Set<unknown>();
  //     const containsDuplicateKeyword = (value: unknown): boolean => {
  //       if (typeof value === "string") {
  //         return /duplicate/i.test(value);
  //       }
  //       if (value instanceof Error) {
  //         return (
  //           /duplicate/i.test(value.message) ||
  //           containsDuplicateKeyword(value.cause)
  //         );
  //       }
  //       if (value === null || value === undefined) {
  //         return false;
  //       }
  //       if (typeof value !== "object") {
  //         return false;
  //       }
  //       if (seen.has(value)) {
  //         return false;
  //       }
  //       seen.add(value);
  //       if (Array.isArray(value)) {
  //         return value.some(containsDuplicateKeyword);
  //       }
  //       for (const entry of Object.values(value)) {
  //         if (containsDuplicateKeyword(entry)) {
  //           return true;
  //         }
  //       }
  //       return false;
  //     };

  //     const isDuplicateError = containsDuplicateKeyword(error);

  //     if (!isDuplicateError) {
  //       throw error;
  //     }
  //   }
  // }
  return builderClient;
}

type PayerConfig = ConstructorParameters<typeof Payer>[0];
type NilChainAddress = PayerConfig["address"];

export function ensureNilChainAddress(address: string): NilChainAddress {
  if (!address.startsWith("nillion")) {
    throw new Error("Payer address must start with the 'nillion' prefix");
  }
  if (address.length !== 46) {
    throw new Error("Payer address must be 46 characters long");
  }
  return address as NilChainAddress;
}
