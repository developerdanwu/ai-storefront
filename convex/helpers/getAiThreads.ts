import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VGetThreadsHandlerArgs = v.object({
  userId: v.string(),
  paginationOpts: paginationOptsValidator,
});

export type TGetThreadsHandlerArgs = Infer<typeof VGetThreadsHandlerArgs>;

export const VGetThreadsHandlerReturn = v.object({
  threads: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
});

export function getAiThreads(ctx: QueryCtx, args: TGetThreadsHandlerArgs) {
  return ResultAsync.fromPromise(
    ctx.runQuery(components.agent.threads.listThreadsByUserId, args),
    () =>
      Errors.getAiThreadsFailed({
        message: "Failed to get AI threads",
      })
  );
}
