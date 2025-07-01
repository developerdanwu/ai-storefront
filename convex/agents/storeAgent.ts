import { xai } from "@ai-sdk/xai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const storeAgent = new Agent(components.agent, {
  chat: xai("grok-3"),
  name: "Store agent",
  instructions: `You are an AI assistant that can continue a conversation with the user. You are given a conversation history and a new message from the user. You should continue the conversation in a natural and engaging manner.`,
});
