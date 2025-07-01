"use node";

import { WorkOS } from "@workos-inc/node";
import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const upsertFromWorkos = internalAction({
  args: {
    externalId: v.string(),
  },
  async handler(ctx, { externalId }) {
    const workos = new WorkOS(process.env.WORKOS_API_KEY);
    const workosUser = await workos.userManagement.getUser(externalId);
    workos.userManagement.createUser({
      email: "hello",
    });
    if (!workosUser) {
      throw new ConvexError("workosUser not found");
    }

    await ctx.runMutation(internal.users.upsertFromWorkos, {
      externalId: workosUser.id,
      email: workosUser.email,
      emailVerified: workosUser.emailVerified,
      firstName: workosUser.firstName,
      lastName: workosUser.lastName,
      profilePictureUrl: workosUser.profilePictureUrl,
    });
  },
});
