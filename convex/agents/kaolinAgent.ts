import { Agent, AgentComponent } from "@convex-dev/agent";
import {
  LanguageModelV1Middleware,
  ToolSet,
  tool,
  wrapLanguageModel,
} from "ai";
import z from "zod";
import { grok3Mini } from "./models";

export function createKaolinAgent<AgentTools extends ToolSet>(
  agentComponent: AgentComponent,
  args: {
    maxSteps?: number;
    middleware?: LanguageModelV1Middleware | LanguageModelV1Middleware[];
    modelId?: string;
    providerId?: string;
  }
) {
  const { middleware = [], modelId, providerId, maxSteps = 10 } = args;

  return new Agent(agentComponent, {
    chat: wrapLanguageModel({
      model: grok3Mini,
      middleware,
      modelId,
      providerId,
    }),
    name: "Kaolin agent",
    maxSteps,
    instructions: `You are Kaolin, a helpful assistant that can help answer questions and perform actions on the AI agent creation platform (Kaolin Chat).
      In different contexts you will have different access to different tools.
      `,
    tools: {
      "configure-agent": tool({
        description:
          "This tool allows Kaolin to help the user configure a custom AI agent with a custom prompt",
        parameters: z.object({
          uiPayload: z.object({
            customPrompt: z
              .string()
              .describe("The custom prompt to use for the agent"),
          }),
        }),
      }),
    },
  });
}
