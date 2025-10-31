import { AuthType, NilaiOpenAIClient } from "@nillion/nilai-ts";
import base58 from "bs58";
import { getDelegationTokenServer } from "./src/slices/nillion/llm";

(async () => {
  const nilaiPublicKey =
    "03c425fd532c2d839ce8cf68f2a421d287f38a957fec4f936f8919bfb54f8f6f23";
  const userPublicKey = "E9A8xpJ28MpFU88mRbSnFmyHExru43HHrDuscemjrjUb";
  const userPublicKeyBytes = base58.decode(userPublicKey);
  const userPublicKeyHex = Buffer.from(userPublicKeyBytes).toString("hex");

  const server = await getDelegationTokenServer();
  const client = new NilaiOpenAIClient({
    baseURL: "https://nilai-a779.nillion.network/v1/",
    authType: AuthType.DELEGATION_TOKEN,
  });

  const delegationRequest = client.getDelegationRequest();
  const delegationToken = await server.createDelegationToken(delegationRequest);

  client.updateDelegation(delegationToken);
  const auth =
    (await (client as any)._getInvocationTokenWithDelegation?.()) ??
    (await (client as any)._getInvocationToken?.());
  console.log(auth);

  // console.log("Querying...");

  const response = await client.chat.completions.create({
    model: "google/gemma-3-27b-it",
    messages: [
      { role: "system", content: "Hello, how are you?" },
      { role: "user", content: "I'm doing great, thank you!" },
    ],
  });
  console.log(response);
  console.log(typeof response);
})();
