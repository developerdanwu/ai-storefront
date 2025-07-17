import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VDeleteAiThreadArgs = v.object({
  threadId: v.string(),
});

export type TDeleteAiThreadArgs = Infer<typeof VDeleteAiThreadArgs>;

export function deleteAiThread<TAgent extends Agent<any>>(
  ctx: ActionCtx,
  agent: TAgent,
  args: TDeleteAiThreadArgs
) {
  return ResultAsync.fromPromise(
    agent.deleteThreadSync(ctx, {
      threadId: args.threadId,
    }),
    (e) =>
      Errors.deleteThreadFailed({
        message: "Failed to delete thread",
        error: e,
      })
  );
}
