"use node";

import { render } from "@react-email/render";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { SubscriptionThankYouEmail } from "../../emails/notion-magic-link";
import { action } from "../_generated/server";
import * as Errors from "../errors";
import { resend, resendBase, TEST_EMAILS } from "../resend";

export const emailSubscription = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return ResultAsync.fromPromise(
      resendBase.contacts.create({
        email: args.email,
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
            from: "Me <dan@marketing.kaolin.chat>",
            to: TEST_EMAILS.delivered,
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
