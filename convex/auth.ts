import { type AuthFunctions, AuthKit } from "@convex-dev/workos-authkit";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

const authFunctions: AuthFunctions = internal.auth;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
  authFunctions,
});

// Event handlers to sync with your users table
export const { authKitEvent } = authKit.events({
  "user.created": async (ctx, event) => {
    await ctx.db.insert("users", {
      externalId: event.data.id,
      email: event.data.email,
      emailVerified: event.data.emailVerified,
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      profilePictureUrl: event.data.profilePictureUrl,
      isAnonymous: false,
    });
  },
  "user.updated": async (ctx, event) => {
    const user = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", event.data.id))
      .unique();
    if (!user) {
      return;
    }
    await ctx.db.patch(user._id, {
      email: event.data.email, // TODO: handle email changes
      emailVerified: event.data.emailVerified,
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      profilePictureUrl: event.data.profilePictureUrl,
    });
  },
  "user.deleted": async (ctx, event) => {
    const user = await ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", event.data.id))
      .unique();
    if (!user) {
      return;
    }
    await ctx.db.delete(user._id);
  },
});
