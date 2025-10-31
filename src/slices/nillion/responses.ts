export const DelegationTokenResponseSchema = {
  200: {
    type: "object",
    properties: {
      storageDelegationToken: { type: "string" },
      modelDelegationToken: { type: "string" },
    },
    required: ["storageDelegationToken", "modelDelegationToken"],
    additionalProperties: false,
  },
  401: {
    type: "object",
    properties: {
      error: { type: "string", const: "Verification failed" },
    },
    required: ["error"],
    additionalProperties: false,
  },
};

export const StorageDelegationTokenResponseSchema = {
  200: {
    type: "object",
    properties: {
      delegationToken: { type: "string" },
    },
    required: ["delegationToken"],
    additionalProperties: false,
  },
  401: {
    type: "object",
    properties: {
      error: { type: "string", const: "Verification failed" },
    },
    required: ["error"],
    additionalProperties: false,
  },
};

export const ModelDelegationTokenResponseSchema = {
  200: {
    type: "object",
    properties: {
      delegationToken: { type: "string" },
    },
    required: ["delegationToken"],
    additionalProperties: false,
  },
  401: {
    type: "object",
    properties: {
      error: { type: "string", const: "Verification failed" },
    },
    required: ["error"],
    additionalProperties: false,
  },
};
