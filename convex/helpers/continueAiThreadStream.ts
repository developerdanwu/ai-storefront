import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VContinueAiThreadArgs = v.object({
  threadId: v.string(),
  prompt: v.optional(v.string()),
  promptMessageId: v.optional(v.string()),
  userId: v.string(),
});

export type TContinueAiThreadArgs = Infer<typeof VContinueAiThreadArgs>;

export function continueAiThreadStream<TAgent extends Agent<any>>(
  ctx: ActionCtx,
  agent: TAgent,
  args: TContinueAiThreadArgs
) {
  return ResultAsync.fromPromise(
    agent.continueThread(ctx, {
      threadId: args.threadId,
      userId: args.userId,
    }),
    (e) =>
      Errors.continueThreadFailed({
        message: "Failed to continue thread",
        error: e,
      })
  ).andThen((x) => {
    let messageId: string | undefined;
    return ResultAsync.fromPromise(
      x.thread.streamText(
        {
          prompt: args.prompt,
          promptMessageId: args.promptMessageId,
          temperature: 0.3,
          onFinish: async ({ steps }) => {
            if (steps.length === 10 && messageId) {
              await agent.completeMessage(ctx, {
                threadId: args.threadId,
                messageId: messageId,
                result: {
                  kind: "error",
                  error: "MaxStepsReached",
                },
              });
            }
          },
        },
        {
          saveStreamDeltas: { chunking: "word", throttleMs: 800 },
        }
      ),
      (e) => {
        return Errors.generateAiTextFailed({
          message: "Failed to generate AI text",
        });
      }
    )
      .andThen((streamResult) => {
        messageId = streamResult.messageId;
        return ResultAsync.fromPromise(
          (async () => {
            let fullText = "";
            for await (const chunk of streamResult.textStream) {
              fullText += chunk;
            }
            return fullText;
          })(),
          (e) => {
            console.error("ERRORRR101", e);
            return Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
            });
          }
        );
      })
      .andThen((text) => {
        return ok(text);
      });
  });
}
