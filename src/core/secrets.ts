import { OnePasswordConnect } from "@1password/connect";

import assert from "node:assert/strict";
import { runtimeEnv } from "./runtime-env";

const serverURL = runtimeEnv.OP_CONNECT_SERVER_URL;
const token = runtimeEnv.OP_CONNECT_TOKEN;

assert(serverURL, "OP_CONNECT_SERVER_URL not configured");
assert(token, "OP_CONNECT_TOKEN not configured");

export const secretsManager = OnePasswordConnect({
  serverURL,
  token,
  keepAlive: true,
});

export const getVault = async (vaultName: string) =>
  secretsManager.getVaultByTitle(vaultName);

export const getItem = async (vaultId: string, itemName: string) =>
  secretsManager.getItem(vaultId, itemName);

export default secretsManager;
