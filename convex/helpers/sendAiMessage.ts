import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VSendAiMessageArgs = v.object({
  threadId: v.string(),
  userId: v.id("users"),
  prompt: v.string(),
});

export type TSendAiMessageArgs = Infer<typeof VSendAiMessageArgs>;

export function sendAiMessage<TAgent extends Agent<any>>(
  ctx: ActionCtx,
  agent: TAgent,
  args: TSendAiMessageArgs
) {
  return ResultAsync.fromPromise(
    agent.continueThread(ctx, {
      threadId: args.threadId,
      userId: args.userId,
    }),
    (e) =>
      Errors.sendAiMessageFailed({
        message: "Failed to send AI message",
      })
  ).andThen((x) => {
    return ResultAsync.fromPromise(
      x.thread.generateText({
        prompt: args.prompt,
      }),
      (e) => Errors.sendAiMessageFailed({ message: "Failed to generate text" })
    ).andThen(() => ok(x));
  });
}
