import { Agent, AgentComponent } from "@convex-dev/agent";
import { LanguageModelV1Middleware, ToolSet, wrapLanguageModel } from "ai";
import { grok3Mini } from "./models";

export function createCustomAgent<AgentTools extends ToolSet>(
  agentComponent: AgentComponent,
  args: {
    maxSteps?: number;
    name: string;
    middleware?: LanguageModelV1Middleware | LanguageModelV1Middleware[];
    modelId?: string;
    providerId?: string;
    instructions?: string;
    tools?: AgentTools;
  }
) {
  const {
    tools,
    middleware = [],
    modelId,
    providerId,
    name,
    maxSteps = 10,
    instructions,
  } = args;

  return new Agent(agentComponent, {
    chat: wrapLanguageModel({
      model: grok3Mini,
      middleware,
      modelId,
      providerId,
    }),
    name,
    maxSteps,
    instructions,
    tools,
  });
}
