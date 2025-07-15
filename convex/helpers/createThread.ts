import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import * as Errors from "../errors";
import { generateSummaryTitle } from "./generateSummaryTitle";

export const VCreateThreadArgs = v.object({
  userId: v.string(),
  prompt: v.string(),
});

export type TCreateThreadArgs = Infer<typeof VCreateThreadArgs>;

export function createThread<TAgent extends Agent<any>>(
  ctx: ActionCtx,
  agent: TAgent,
  args: TCreateThreadArgs
) {
  return generateSummaryTitle(ctx, {
    prompt: `
          summarise the prompt below to create a title
\`\`\`
${args.prompt}
\`\`\`
          `,
  }).andThen((x) => {
    return ResultAsync.fromPromise(
      agent.createThread(ctx, {
        title: x.text,
        userId: args.userId,
      }),
      (e) => {
        return Errors.createThreadFailed({
          message: "Failed to create thread",
          error: e,
        });
      }
    );
  });
}
