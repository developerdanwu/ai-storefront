import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VGetAnonymousUserArgs = v.object({
  anonymousUserId: v.id("users"),
});

export type TGetAnonymousUserArgs = Infer<typeof VGetAnonymousUserArgs>;

export const getAnonymousUser = (
  ctx: QueryCtx,
  args: TGetAnonymousUserArgs
) => {
  return ResultAsync.fromPromise(
    ctx.db.get(args.anonymousUserId).then((x) => {
      if (!x || !x.isAnonymous) {
        throw Errors.userNotFound({
          message: "User not found",
        });
      }

      return x;
    }),
    (e) =>
      Errors.userNotFound({
        message: "User not found",
      })
  );
};
