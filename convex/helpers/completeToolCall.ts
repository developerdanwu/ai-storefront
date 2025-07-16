import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { MutationCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VCompleteToolCallArgs = v.object({
  threadId: v.string(),
  messageId: v.string(),
  result: v.union(
    v.object({
      kind: v.literal("success"),
    }),
    v.object({
      kind: v.literal("error"),
      error: v.string(),
    })
  ),
});

export type TCompleteToolCallArgs = Infer<typeof VCompleteToolCallArgs>;

export function completeToolCall<TAgent extends Agent<any>>(
  ctx: MutationCtx,
  agent: TAgent,
  args: TCompleteToolCallArgs
) {
  console.log("THREAD ID", args.threadId, args.messageId);
  return ResultAsync.fromPromise(
    agent.completeMessage(ctx, {
      threadId: args.threadId,
      messageId: args.messageId,
      result: args.result,
    }),
    (e) => {
      return Errors.completeToolCallFailed({
        message: "Failed to complete tool call",
        error: e,
      });
    }
  );
}
