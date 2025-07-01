import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VGetUserArgs = v.object({
  userId: v.string(),
});

export type TGetUserArgs = Infer<typeof VGetUserArgs>;

export function getUser(
  ctx: QueryCtx,
  {
    args,
  }: {
    args: TGetUserArgs;
  }
) {
  return ResultAsync.fromPromise(
    ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", args.userId))
      .first()
      .then((r) => {
        if (!r) {
          throw Errors.userNotFound({
            message: `User with id: ${args.userId} not found`,
          });
        }
        return r;
      }),
    (e) =>
      Errors.userNotFound({
        message: `User with id: ${args.userId} not found`,
      })
  );
}
