import { Agent, AgentComponent } from "@convex-dev/agent";
import { LanguageModelV1Middleware, ToolSet, wrapLanguageModel } from "ai";
import { BackendErrorSchema } from "../errors";
import { grok3Mini } from "./models";

type AgentToolSuccess<T> = {
  success: true;
  value: T;
};

type AgentToolError = {
  success: false;
  error: BackendErrorSchema;
};

type AgentToolResult<T> = AgentToolSuccess<T> | AgentToolError;

function agentSuccess<T>(x: T): AgentToolSuccess<T> {
  return {
    success: true,
    value: x,
  };
}

function agentError<T>(error: BackendErrorSchema): AgentToolError {
  return {
    success: false,
    error,
  };
}

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
