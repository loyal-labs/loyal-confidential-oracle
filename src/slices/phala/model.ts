import assert from "node:assert/strict";

import { httpClient } from "../../core/http";
import { createLogger } from "../../core/logger";
import { getItem, getItemField } from "../../core/secrets";
import {
  COMPLETIONS_ENDPOINT,
  PHALA_ONEPASS_ITEM_NAME,
  SELECTED_MODEL,
} from "./constants";
import {
  PhalaCompletionsRequestSchema,
  PhalaOnepassItemFields,
  type PhalaChatMessage,
  type PhalaCredentials,
} from "./schemas";

const logger = createLogger({ module: "phala:model" });

let cachedCredentialsPromise: Promise<PhalaCredentials> | null = null;

const getPhalaCredentials = async (): Promise<PhalaCredentials> => {
  if (!cachedCredentialsPromise) {
    cachedCredentialsPromise = (async () => {
      const onepassItem = await getItem(PHALA_ONEPASS_ITEM_NAME);
      const host = getItemField(onepassItem, PhalaOnepassItemFields.HOST);
      const apiKey = getItemField(
        onepassItem,
        PhalaOnepassItemFields.CREDENTIAL
      );

      assert(host, "Phala host is not set");
      assert(apiKey, "Phala API key is not set");

      return { host, apiKey };
    })();
  }

  return cachedCredentialsPromise;
};

export const getCompletions = async (
  messages: PhalaChatMessage[]
): Promise<Record<string, unknown>> => {
  const { host, apiKey } = await getPhalaCredentials();

  const payload = PhalaCompletionsRequestSchema.parse({
    model: SELECTED_MODEL,
    messages,
  });
  const normalizedHost = host.endsWith("/") ? host : `${host}/`;
  const url = new URL(COMPLETIONS_ENDPOINT, normalizedHost).toString();

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await httpClient.post<Record<string, unknown>>(
      url,
      payload,
      {
        headers,
      }
    );
    return response;
  } catch (error) {
    logger.error(
      { err: error, url, messageCount: messages.length },
      "phala: error getting completions"
    );

    throw error;
  }
};
