import assert from "node:assert/strict";

import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";
import type { BaseNodeIrys } from "@irys/upload/esm/base";
import { httpClient } from "../../core/http";
import { createLogger } from "../../core/logger";
import { getItem, getItemField } from "../../core/secrets";
import { IRYS_GATEWAY_BASE_URL, IRYS_ONEPASS_ITEM_NAME } from "./constants";
import { IrysOnepassItemFields } from "./schemas";

const logger = createLogger({ module: "irys:uploader" });
let cachedUploaderPromise: Promise<BaseNodeIrys> | null = null;

const getIrysUploader = async () => {
  if (!cachedUploaderPromise) {
    cachedUploaderPromise = (async () => {
      const onepassItem = await getItem(IRYS_ONEPASS_ITEM_NAME);
      assert(onepassItem, "OnePassword item is not set");
      const privateKey = getItemField(
        onepassItem,
        IrysOnepassItemFields.PRIVATE_KEY
      );
      assert(privateKey, "Private key is not set");

      const irysUploader = await Uploader(Solana).withWallet(privateKey);
      return irysUploader;
    })();
  }
  return cachedUploaderPromise;
};

export const uploadFile = async (file: File, txId?: string) => {
  const uploader = await getIrysUploader();

  const tags = [{ name: "Content-Type", value: "application/json" }];
  if (txId) {
    tags.push({ name: "Root-TX", value: txId });
  }

  const receipt = await uploader.upload(file.toString(), { tags });
  return receipt;
};

export const fetchIrysTransactionData = async (txId: string) => {
  const response = await httpClient.get<ArrayBuffer>(
    `${IRYS_GATEWAY_BASE_URL}/mutable/${txId}`
  );
  return response;
};
