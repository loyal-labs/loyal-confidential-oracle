import type { Did } from "@nillion/nuc";
import {
  AclDto,
  CreateOwnedDataRequest,
  ReadDataRequestParams,
  SecretVaultUserClient,
} from "@nillion/secretvaults";
import { createLogger } from "../../core/logger";

const logger = createLogger({ module: "nillion:user" });

export const uploadUserData = async (
  collectionId: string,
  delegationToken: string,
  builderDid: Did,
  userClient: SecretVaultUserClient,
  userData: Record<string, any>
) => {
  const builderDidString = await builderDid.didString;
  logger.debug("Builder DID String: %s", builderDidString);

  const acl: AclDto = {
    grantee: builderDidString,
    read: true,
    write: false,
    execute: false,
  };
  logger.debug("ACL: %s", acl);

  const createDataRequest: CreateOwnedDataRequest = {
    owner: await userClient.getId(),
    collection: collectionId,
    data: [userData],
    acl: acl,
  };

  const uploadResult = await userClient.createData(createDataRequest, {
    auth: {
      delegation: delegationToken,
    },
  });

  logger.debug("Upload result: %s", uploadResult);

  return uploadResult;
};

export const readUserData = async (
  collectionId: string,
  recordId: string,
  userClient: SecretVaultUserClient
) => {
  const params: ReadDataRequestParams = {
    collection: collectionId,
    document: recordId,
  };
  const readResult = await userClient.readData(params);
  logger.debug("Read result: %s", readResult);
  return readResult;
};
