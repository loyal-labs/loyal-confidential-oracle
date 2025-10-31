import { Did } from "@nillion/nuc";
import base58 from "bs58";
import { Buffer } from "buffer";
import { createDelegationToken } from "./src/slices/nillion/builder";
import {
  getBuilderClient,
  getBuilderSigner,
} from "./src/slices/nillion/helpers";

(async () => {
  const userPublicKey = "E9A8xpJ28MpFU88mRbSnFmyHExru43HHrDuscemjrjUb";
  const userPublicKeyBytes = base58.decode(userPublicKey);
  const userPublicKeyHex = Buffer.from(userPublicKeyBytes).toString("hex");
  console.log(userPublicKeyHex);

  const userDid = Did.fromPublicKey(userPublicKeyHex);
  console.log(userDid);
  const builderClient = await getBuilderClient();
  await builderClient.refreshRootToken();
  const builderSigner = getBuilderSigner();

  const delegationToken = await createDelegationToken(
    userDid,
    builderClient,
    builderSigner
  );
  console.log(delegationToken);
})();
