import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import { createStoreAgent } from "../agents/storeAgent";
import * as Errors from "../errors";

export const VCreateThreadArgs = v.object({
  title: v.string(),
  userId: v.string(),
});

export type TCreateThreadArgs = Infer<typeof VCreateThreadArgs>;

export function createThread(ctx: ActionCtx, args: TCreateThreadArgs) {
  return ResultAsync.fromPromise(
    createStoreAgent().createThread(ctx, {
      title: args.title,
      userId: args.userId,
    }),
    (e) =>
      Errors.createThreadFailed({
        message: "Failed to create thread",
        error: e,
      })
  );
}
