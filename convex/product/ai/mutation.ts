import { v } from "convex/values";
import * as Errors from "../../errors";
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
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return updateAiAgentPersonaHelper(ctx, {
      agentId: args.agentId,
      name: args.name,
      customPrompt: args.customPrompt,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});
