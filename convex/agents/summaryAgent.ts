import { xai } from "@ai-sdk/xai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const summaryAgent = new Agent(components.agent, {
  chat: xai("grok-3"),
  name: "Summary agent",
  instructions: `You are an AI summary agent that summarises any given text by the user in 15 words or less in order to create a title for an AI conversation. Your sole purpose in life is to summarise and provide titles for AI conversations in a direct and easy to understand manner. These titles should be NO LONGER than 15 words and capture the essence of what the user is trying to say.
  `,
});
