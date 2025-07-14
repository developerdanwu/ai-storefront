import { LanguageModelV1Middleware, ToolSet } from "ai";
import { components } from "../_generated/api";
import { createCustomAgent } from "./customAgent";

export function createPlaygroundAgent<AgentTools extends ToolSet>(args: {
  name: string;
  middleware?: LanguageModelV1Middleware | LanguageModelV1Middleware[];
  instructions?: string;
}) {
  const { name, middleware, instructions } = args;
  return createCustomAgent(components.playgroundAgent, {
    maxSteps: 10,
    name,
    instructions,
  });
}
