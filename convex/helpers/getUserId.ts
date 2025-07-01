import { getAuthUserId } from "@convex-dev/auth/server";
import { Auth } from "convex/server";
import { ResultAsync } from "neverthrow";
import * as Errors from "../errors";

export function getUserId(ctx: { auth: Auth }) {
  return ResultAsync.fromPromise(
    getAuthUserId(ctx).then((r) => {
      if (!r) {
        throw Errors.notAuthenticated({
          message: "User not authenticated",
        });
      }
      return r;
    }),
    () =>
      Errors.notAuthenticated({
        message: "User not authenticated",
      })
  );
}
