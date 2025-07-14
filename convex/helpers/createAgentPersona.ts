import { Infer, v } from "convex/values";
import { okAsync, ResultAsync } from "neverthrow";
import { MutationCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VCreateAgentPersonaArgs = v.object({
  name: v.string(),
  userId: v.optional(v.id("users")),
  description: v.optional(v.string()),
});

export type TCreateAgentPersonaArgs = Infer<typeof VCreateAgentPersonaArgs>;

export function createAiAgentPersona(
  ctx: MutationCtx,
  args: TCreateAgentPersonaArgs
) {
  return ResultAsync.fromPromise(
    ctx.db.insert("aiAgentPersona", {
      name: args.name,
      userId: args.userId,
      description: args.description,
    }),
    (e) =>
      Errors.createAgentPersonaFailed({
        message: "Failed to create agent persona",
        error: e,
      })
  ).andThen((x) => okAsync({ agentId: x }));
}
