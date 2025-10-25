import { z } from "zod";

// model
export const PhalaOnepassItemFields = {
  CREDENTIAL: "credential",
  HOST: "hostname",
} as const;

export type PhalaOnepassItemField =
  (typeof PhalaOnepassItemFields)[keyof typeof PhalaOnepassItemFields];

export const PhalaChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

export type PhalaChatMessage = z.infer<typeof PhalaChatMessageSchema>;

export const PhalaCompletionsRequestSchema = z.object({
  model: z.string(),
  messages: z.array(PhalaChatMessageSchema),
});

export type PhalaCompletionsRequest = z.infer<
  typeof PhalaCompletionsRequestSchema
>;

export type PhalaCredentials = {
  host: string;
  apiKey: string;
};

export const PhalaCompletionMessageSchema = z.object({
  content: z.string().min(1, "Phala response content is empty"),
});

export type PhalaCompletionMessage = z.infer<
  typeof PhalaCompletionMessageSchema
>;

export const PhalaCompletionChoiceSchema = z.object({
  message: PhalaCompletionMessageSchema,
});

export type PhalaCompletionChoice = z.infer<
  typeof PhalaCompletionChoiceSchema
>;

export const PhalaCompletionsResponseSchema = z.object({
  choices: z
    .array(PhalaCompletionChoiceSchema)
    .min(1, "Phala choices response is empty"),
});

export type PhalaCompletionsResponse = z.infer<
  typeof PhalaCompletionsResponseSchema
>;
