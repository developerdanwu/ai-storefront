import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { MutationCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VUpdateAiAgentPersonaArgs = v.object({
  agentId: v.id("aiAgentPersona"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  customPrompt: v.optional(v.string()),
});

export type TUpdateAiAgentPersonaArgs = Infer<typeof VUpdateAiAgentPersonaArgs>;

export function updateAiAgentPersona(
  ctx: MutationCtx,
  args: TUpdateAiAgentPersonaArgs
) {
  return ResultAsync.fromPromise(
    ctx.db.patch(args.agentId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.customPrompt && { customPrompt: args.customPrompt }),
    }),
    (e) =>
      Errors.updateAiAgentPersonaFailed({
        message: "Failed to update ai agent persona",
        error: e,
      })
  );
}
