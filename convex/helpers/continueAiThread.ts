import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VContinueAiThreadArgs = v.object({
  threadId: v.string(),
  prompt: v.optional(v.string()),
  promptMessageId: v.optional(v.string()),
  userId: v.string(),
  context: v.optional(v.string()),
  activeTools: v.optional(v.array(v.string())),
  systemPrompt: v.optional(v.string()),
});

export type TContinueAiThreadArgs = Infer<typeof VContinueAiThreadArgs>;

export function continueAiThread<TAgent extends Agent<any>>(
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
    return ResultAsync.fromPromise(
      x.thread.generateText({
        system: args.systemPrompt,
        experimental_activeTools: args.activeTools,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        temperature: 0.3,
      }),
      (e) => {
        return Errors.generateAiTextFailed({
          message: "Failed to generate AI text",
          error: e,
        });
      }
    );
  });
}
