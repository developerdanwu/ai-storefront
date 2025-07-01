import { httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/workos-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();
    const sigHeader = String(request.headers.get("workos-signature"));

    try {
      const { data, event } = JSON.parse(bodyText);

      switch (event) {
        case "user.created":
        case "user.updated":
          await ctx.runMutation(internal.users.mutation._upsertFromWorkos, {
            externalId: data.id,
            email: data.email,
            emailVerified: data.email_verified,
            firstName: data.first_name,
            lastName: data.last_name,
            profilePictureUrl: data.profile_picture_url,
            isAnonymous: false,
          });
          break;
        case "user.deleted": {
          await ctx.runMutation(internal.users.mutation._deleteFromWorkos, {
            externalId: data.id,
          });
          break;
        }
        default:
          throw new ConvexError("Unsupported Clerk webhook event");
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error occured", error);
      return new Response("Auth Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;
