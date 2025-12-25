"use node";

import { WorkOS } from "@workos-inc/node";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalMutation } from "../_generated/server";

/**
 * Internal mutation to store GitHub OAuth tokens for a user
 */
export const _storeGitHubTokens = internalMutation({
  args: {
    workosUserId: v.string(),
    githubAccessToken: v.string(),
    githubRefreshToken: v.optional(v.string()),
    githubTokenExpiresAt: v.optional(v.number()),
    githubTokenScopes: v.optional(v.array(v.string())),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Find user by externalId (WorkOS user ID)
    const user = await ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", args.workosUserId))
      .first();

    if (!user) {
      console.log(
        `User with WorkOS ID ${args.workosUserId} not found, will be created via webhook`
      );
      // User might not exist yet if this is their first login
      // The webhook will create them, and we'll update tokens on next login
      return false;
    }

    await ctx.db.patch(user._id, {
      githubAccessToken: args.githubAccessToken,
      githubRefreshToken: args.githubRefreshToken,
      githubTokenExpiresAt: args.githubTokenExpiresAt,
      githubTokenScopes: args.githubTokenScopes,
    });

    console.log(`GitHub tokens stored for user ${args.workosUserId}`);
    return true;
  },
});

/**
 * Public action to refresh tokens and capture GitHub OAuth tokens.
 * This should be called after the user authenticates via the client-side AuthKit.
 * The refreshToken from the client-side auth response is used to get fresh tokens,
 * which includes the GitHub OAuth tokens when configured in WorkOS.
 */
export const refreshAndStoreGitHubTokens = action({
  args: {
    refreshToken: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    hasGitHubTokens: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { refreshToken }) => {
    const workos = new WorkOS(process.env.WORKOS_API_KEY);
    const clientId = process.env.WORKOS_CLIENT_ID;

    if (!clientId) {
      return {
        success: false,
        hasGitHubTokens: false,
        error: "WORKOS_CLIENT_ID not configured",
      };
    }

    try {
      // Use the refresh token to get a new auth response with OAuth tokens
      const authResponse =
        await workos.userManagement.authenticateWithRefreshToken({
          refreshToken,
          clientId,
        });

      console.log(
        "Refresh auth response received, user:",
        authResponse.user.id
      );

      // Check if we got GitHub OAuth tokens
      if (authResponse.oauthTokens) {
        console.log("GitHub OAuth tokens received, storing...");

        await ctx.runMutation(
          internal.github.oauthCallback._storeGitHubTokens,
          {
            workosUserId: authResponse.user.id,
            githubAccessToken: authResponse.oauthTokens.accessToken,
            githubRefreshToken: authResponse.oauthTokens.refreshToken,
            githubTokenExpiresAt: authResponse.oauthTokens.expiresAt,
            githubTokenScopes: authResponse.oauthTokens.scopes,
          }
        );

        return {
          success: true,
          hasGitHubTokens: true,
        };
      }

      console.log(
        "No OAuth tokens in response - user may have logged in with a different provider"
      );
      return {
        success: true,
        hasGitHubTokens: false,
      };
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      return {
        success: false,
        hasGitHubTokens: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
