import assert from "node:assert/strict";

import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";
import type { BaseNodeIrys } from "@irys/upload/esm/base";
import { createLogger } from "../../core/logger";
import { getItem, getItemField } from "../../core/secrets";
import { IRYS_ONEPASS_ITEM_NAME } from "./constants";
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
