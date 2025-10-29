import { Builder, Did, Signer } from "@nillion/nuc";
import { NucCmd } from "@nillion/secretvaults";
import { randomUUIDv7 } from "bun";
import assert from "node:assert/strict";
import { getBuilderClient } from "./helpers";

export async function createCollection(
  collectionName: string,
  owned: boolean = false,
  schema: Record<string, any>
) {
  assert(schema, "Schema is required");
  assert(collectionName, "Collection name is required");
  assert(owned !== undefined, "Owned is required");

  const builderClient = await getBuilderClient();
  const collectionType = owned ? "owned" : "standard";
  const collectionId = randomUUIDv7();

  const newCollection = await builderClient.createCollection({
    _id: collectionId,
    name: collectionName,
    type: collectionType,
    schema,
  });

  return newCollection;
}

export async function getCollections() {
  const builderClient = await getBuilderClient();
  const collections = await builderClient.readCollections();
  return collections;
}

export async function createDelegationToken(
  userDid: Did,
  builderDid: Did,
  builderSigner: Signer,
  expiresInMinutes: number = 2880
): Promise<string> {
  const expiresInSeconds = expiresInMinutes * 60;
  const delegationToken = await Builder.delegation()
    .issuer(builderDid)
    .audience(userDid)
    .subject(builderDid)
    .command(NucCmd.nil.db.data.create)
    .expiresAt(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .signAndSerialize(builderSigner);

  return delegationToken;
}

export async function createInvocationTokenFromString(
  builderDid: Did,
  userSigner: Signer,
  proofString: string
) {
  const invocationToken = await Builder.invocationFromString(proofString)
    .audience(builderDid)
    .arguments({ table: "users" })
    .signAndSerialize(userSigner);

  return invocationToken;
}
