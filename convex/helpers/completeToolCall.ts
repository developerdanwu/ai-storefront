import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VCompleteToolCallArgs = v.object({
  threadId: v.string(),
  messageId: v.string(),
  toolCallId: v.string(),
  toolName: v.string(),
  userId: v.id("users"),
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

const toolCallMessages = {
  success: {
    success: true,
    data: {
      message:
        "the tool call has been completed. You should inform the user that the tool call has been completed and recap what changes have been made",
    },
  },
  error: {
    success: false,
    data: {
      message:
        "the tool call has failed. You should inform the user that the tool call has failed and explain why",
    },
  },
};

export function completeToolCall<TAgent extends Agent<any>>(
  ctx: MutationCtx,
  agent: TAgent,
  args: TCompleteToolCallArgs
) {
  const toolCallResult = toolCallMessages[args.result.kind];

  return ResultAsync.fromPromise(
    Promise.all([
      agent.completeMessage(ctx, {
        threadId: args.threadId,
        messageId: args.messageId,
        result: args.result,
      }),
      agent.saveMessage(ctx, {
        threadId: args.threadId,
        message: {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolName: args.toolName,
              toolCallId: args.toolCallId,
              result: toolCallResult,
            },
          ],
        },
        userId: args.userId,
      }),
    ]),
    (e) => {
      return Errors.completeToolCallFailed({
        message: "Failed to complete tool call",
        error: e,
      });
    }
  ).andThen(([_, { messageId: nextPromptMessageId }]) => {
    const result: ResultAsync<
      Id<"_scheduled_functions">,
      Errors.ContinueThreadFailed
    > = ResultAsync.fromPromise(
      ctx.scheduler.runAfter(
        0,
        internal.product.ai.action._continueKaolinThread,
        {
          threadId: args.threadId,
          promptMessageId: nextPromptMessageId,
          tools: {},
          userId: args.userId,
          maxSteps: 1,
        }
      ),
      (e) => {
        return Errors.continueThreadFailed({
          message: "Failed to continue ai thread",
          error: e,
        });
      }
    );
    return result;
  });
}
