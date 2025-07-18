import { Agent } from "@convex-dev/agent";
import { LanguageModelV1Middleware, wrapLanguageModel } from "ai";
import { components } from "../_generated/api";
import { grok3Mini } from "./models";

export const createSummaryAgent = (
  args: {
    middleware?: LanguageModelV1Middleware | LanguageModelV1Middleware[];
    modelId?: string;
    providerId?: string;
  } = {}
) => {
  const { middleware = [], modelId, providerId } = args;

  return new Agent(components.agent, {
    chat: wrapLanguageModel({
      model: grok3Mini,
      middleware,
      modelId,
      providerId,
    }),
    name: "Summary agent",
    instructions: `You are an AI summary agent that summarises any given text by the user in 15 words or less in order to create a title for an AI conversation. Your sole purpose in life is to summarise and provide titles for AI conversations in a direct and easy to understand manner. These titles should be NO LONGER than 15 words and capture the essence of what the user is trying to say.
    `,
  });
};
