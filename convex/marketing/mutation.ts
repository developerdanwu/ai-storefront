import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import * as Errors from "../errors";
import { TEST_EMAILS } from "../resend";

export const subscribeNewsletter = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    _test: v.optional(
      v.object({
        result: v.union(
          v.literal("delivered"),
          v.literal("bounced"),
          v.literal("spam")
        ),
      })
    ),
  },
  handler: async (ctx, args): Promise<{ success: true }> => {
    const email = args._test ? TEST_EMAILS[args._test.result] : args.email;

    return ResultAsync.fromPromise(
      ctx.scheduler.runAfter(
        0,
        internal.marketing.actionNode.emailSubscription,
        {
          firstName: args.firstName,
          lastName: args.lastName,
          email,
        }
      ),
      (e) =>
        Errors.actionScheduleError({
          message: "Failed to schedule email subscription",
          error: e,
        })
    ).match(
      () => ({ success: true }),
      (e) => Errors.propogateConvexError(e)
    );
  },
});
