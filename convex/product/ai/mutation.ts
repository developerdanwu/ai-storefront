import { v } from "convex/values";
import { components } from "../../_generated/api";
import { createKaolinAgent } from "../../agents/kaolinAgent";
import * as Errors from "../../errors";
import { completeToolCall as completeToolCallHelper } from "../../helpers/completeToolCall";
import { createAiAgentPersona as createAiAgentPersonaHelper } from "../../helpers/createAgentPersona";
import { deleteAiAgentPersona as deleteAiAgentPersonaHelper } from "../../helpers/deleteAiAgentPersona";
import { updateAiAgentPersona as updateAiAgentPersonaHelper } from "../../helpers/updateAiAgentPersona";
import { authedMutation } from "../../procedures";

export const createAiAgentPersona = authedMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return createAiAgentPersonaHelper(ctx, {
      name: args.name,
      userId: ctx.user._id,
      description: args.description,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const deleteAiAgentPersona = authedMutation({
  args: {
    agentId: v.id("aiAgentPersona"),
  },
  handler: async (ctx, args) => {
    return deleteAiAgentPersonaHelper(ctx, {
      agentId: args.agentId,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const updateAiAgentPersona = authedMutation({
  args: {
    agentId: v.id("aiAgentPersona"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return updateAiAgentPersonaHelper(ctx, {
      agentId: args.agentId,
      name: args.name,
      description: args.description,
      customPrompt: args.customPrompt,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const addTextEmbeddings = authedMutation({
  args: {},
  handler: async (ctx) => {},
});

export const completeKaolinToolCall = authedMutation({
  args: {
    threadId: v.string(),
    messageId: v.string(),
    toolCallId: v.string(),
    toolName: v.string(),
    result: v.union(
      v.object({
        kind: v.literal("success"),
      }),
      v.object({
        kind: v.literal("error"),
        error: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const agent = createKaolinAgent(components.kaolinAgent, {});
    return await completeToolCallHelper(ctx, agent, {
      threadId: args.threadId,
      messageId: args.messageId,
      toolCallId: args.toolCallId,
      toolName: args.toolName,
      userId: ctx.user._id,
      result: args.result,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});
