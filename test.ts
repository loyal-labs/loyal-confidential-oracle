import { Did } from "@nillion/nuc";
import { AclDto, CreateOwnedDataRequest } from "@nillion/secretvaults";
import { createDelegationToken } from "./src/slices/nillion/builder";
import {
  getBuilderClient,
  getUserClient,
  getUserSigner,
} from "./src/slices/nillion/helpers";
import { MockUserMessage } from "./src/slices/nillion/schemas";

export const uploadUserData = async (
  collectionId: string,
  delegationToken: string,
  builderDid: Did
) => {
  const userClient = await getUserClient();
  const userDid = await userClient.getDid();
  const builderDidString = await builderDid.didString;
  console.log("Builder DID String:", builderDidString);

  const acl: AclDto = {
    grantee: builderDidString,
    read: true,
    write: false,
    execute: false,
  };
  console.log("ACL:", acl);

  const createDataRequest: CreateOwnedDataRequest = {
    owner: await userClient.getId(),
    collection: collectionId,
    data: [MockUserMessage],
    acl: acl,
  };

  const result = await userClient.createData(createDataRequest, {
    auth: {
      delegation: delegationToken,
    },
  });

  console.log("Result:", result);
};

(async () => {
  const collectionId = "019a3048-3c89-7000-8177-a3a21d2caa59";
  const userClient = await getUserClient();
  const userSigner = getUserSigner();
  const userDid = await userSigner.getDid();

  const builderClient = await getBuilderClient();

  // await builderClient.refreshRootToken();

  // await builderClient.register({
  //   did: await builderClient.getDid().toString(),
  //   name: "Loyal Builder",
  // });

  console.log("Builder ID:", await builderClient.getId());
  console.log("Builder DID:", await builderClient.getDid());

  const builderDid = await builderClient.getDid();
  const builderSigner = builderClient.signer;

  const delegationToken = await createDelegationToken(
    userDid,
    builderDid,
    builderSigner
  );

  const uploadResult = await uploadUserData(
    collectionId,
    delegationToken,
    builderDid
  );

  console.log("Upload result:", uploadResult);
})();
