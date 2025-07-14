import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { MutationCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VDeleteAiAgentPersonaArgs = v.object({
  agentId: v.id("aiAgentPersona"),
});

export type TDeleteAiAgentPersonaArgs = Infer<typeof VDeleteAiAgentPersonaArgs>;

export function deleteAiAgentPersona(
  ctx: MutationCtx,
  args: TDeleteAiAgentPersonaArgs
) {
  return ResultAsync.fromPromise(ctx.db.delete(args.agentId), (e) =>
    Errors.deleteAiAgentPersonaFailed({
      message: "Failed to delete agent persona",
      error: e,
    })
  );
}
