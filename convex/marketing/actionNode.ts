"use node";

import { render } from "@react-email/render";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { SubscriptionThankYouEmail } from "../../emails/kaolin-signup";
import { internalAction } from "../_generated/server";
import * as Errors from "../errors";
import { resend, resendBase, TEST_EMAILS } from "../resend";

export const emailSubscription = internalAction({
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
  handler: async (ctx, args) => {
    const email = args._test ? TEST_EMAILS[args._test.result] : args.email;

    return ResultAsync.fromPromise(
      resendBase.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_LIST_ID!,
        firstName: args.firstName,
        lastName: args.lastName,
      }),
      (e) =>
        Errors.resendError({
          message: "Failed to create contact",
          error: e,
        })
    )
      .andThen(() =>
        ResultAsync.fromPromise(
          render(SubscriptionThankYouEmail({ firstName: args.firstName })),
          (e) =>
            Errors.resendError({
              message: "Failed to render email template",
              error: e,
            })
        )
      )
      .andThen((emailTemplate) =>
        ResultAsync.fromPromise(
          resend.sendEmail(ctx, {
            from: "Dan Wu <dan@marketing.developerdanwu.com>",
            to: email,
            subject: "Thank you for subscribing to Kaolin Chat",
            html: emailTemplate,
          }),
          (e) =>
            Errors.resendError({
              message: "Failed to send email",
              error: e,
            })
        )
      )
      .match(
        (emailId) => emailId,
        (e) => Errors.propogateConvexError(e)
      );
  },
});
