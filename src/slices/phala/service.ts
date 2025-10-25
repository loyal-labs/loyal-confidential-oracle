import assert from "node:assert/strict";

import { createLogger } from "../../core/logger";
import { getCompletions as fetchCompletions } from "./model";
import {
  PhalaCompletionsResponseSchema,
  type PhalaChatMessage,
} from "./schemas";

const logger = createLogger({ module: "phala:service" });

export const getCompletions = async (
  messages: PhalaChatMessage[]
): Promise<string> => {
  const response = await fetchCompletions(messages);
  logger.debug({ response }, "phala: completions response");

  const parsedResponse = PhalaCompletionsResponseSchema.parse(response);
  assert(parsedResponse.choices.length > 0, "Phala choices response is empty");

  const firstChoice = parsedResponse.choices[0];
  assert(firstChoice, "Phala completion choice is missing");

  return firstChoice.message.content;
};
