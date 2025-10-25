import { FullItem, OnePasswordConnect, type Vault } from "@1password/connect";

import assert from "node:assert/strict";
import { runtimeEnv } from "./runtime-env";

const serverURL = runtimeEnv.ONEPASS_CONNECT_HOST;
const token = runtimeEnv.ONEPASS_CONNECT_TOKEN;
const vaultName = runtimeEnv.ONEPASS_CONNECT_VAULT_NAME;

assert(serverURL, "ONEPASS_CONNECT_HOST not configured");
assert(token, "ONEPASS_CONNECT_TOKEN not configured");
assert(vaultName, "ONEPASS_CONNECT_VAULT_NAME not configured");

export const secretsManager = OnePasswordConnect({
  serverURL,
  token,
  keepAlive: true,
});

const vaultCache = new Map<string, Vault>();

export const getVault = async (): Promise<Vault> => {
  const cachedVault = vaultCache.get(vaultName);
  if (cachedVault) {
    return cachedVault;
  }

  const vault = await secretsManager.getVaultByTitle(vaultName);
  vaultCache.set(vaultName, vault);

  return vault;
};

export const getVaultId = async (): Promise<string> => {
  const { id } = await getVault();
  assert(id, "Vault ID not found");

  return id;
};

export const getItem = async (itemName: string) => {
  const { id } = await getVault();
  assert(id, "Vault ID not found");

  const item = await secretsManager.getItem(id, itemName);
  assert(item, "Item not found");

  return item;
};

export const getItemField = (item: FullItem, fieldName: string) => {
  const field = item.fields?.find((field) => field.label === fieldName);
  assert(field, "Field not found");
  assert(field.value, `${fieldName} value not found`);

  return field.value;
};

export default secretsManager;
