export const DelegationTokenResponseSchema = {
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
