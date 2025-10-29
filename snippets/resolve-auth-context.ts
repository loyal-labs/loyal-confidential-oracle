import { Signer } from "@nillion/nuc";
import type { SecretVaultBuilderClient } from "@nillion/secretvaults";

type ReadCollectionsOptions = Parameters<
  SecretVaultBuilderClient["readCollections"]
>[0];
type NonNullReadCollectionsOptions = NonNullable<ReadCollectionsOptions>;
type ExtractAuth<T> = T extends { auth?: infer TAuth } ? TAuth : never;

export type AuthContext = ExtractAuth<NonNullReadCollectionsOptions>;

const {
  NILLION_AUTH_DELEGATION,
  NILLION_AUTH_INVOCATIONS,
  NILLION_PRIVATE_KEY_HEX,
} = process.env;

function parseInvocationMap(raw: string): Record<string, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error("NILLION_AUTH_INVOCATIONS is not valid JSON", {
      cause: error,
    });
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("NILLION_AUTH_INVOCATIONS must be a JSON object map");
  }

  const result: Record<string, string> = {};

  for (const [nodeDid, token] of Object.entries(parsed)) {
    if (typeof token !== "string" || token.length === 0) {
      throw new Error(
        `NILLION_AUTH_INVOCATIONS entry for '${nodeDid}' must be a non-empty string`
      );
    }

    result[nodeDid] = token;
  }

  if (Object.keys(result).length === 0) {
    throw new Error("NILLION_AUTH_INVOCATIONS cannot be an empty object");
  }

  return result;
}

export function resolveAuthContext(): AuthContext | undefined {
  if (NILLION_AUTH_DELEGATION) {
    return { delegation: NILLION_AUTH_DELEGATION };
  }

  if (NILLION_AUTH_INVOCATIONS) {
    return { invocations: parseInvocationMap(NILLION_AUTH_INVOCATIONS) };
  }

  if (NILLION_PRIVATE_KEY_HEX) {
    const signer = Signer.fromPrivateKey(NILLION_PRIVATE_KEY_HEX);
    return { signer };
  }

  return undefined;
}
