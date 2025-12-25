import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import * as Errors from "../errors";
import { authedAction } from "../procedures";

// Validators for contribution data
const contributionDayValidator = v.object({
  contributionCount: v.number(),
  date: v.string(),
  color: v.string(),
});

const contributionWeekValidator = v.object({
  contributionDays: v.array(contributionDayValidator),
});

const contributionCalendarValidator = v.object({
  totalContributions: v.number(),
  weeks: v.array(contributionWeekValidator),
});

const contributionsCollectionValidator = v.object({
  totalCommitContributions: v.number(),
  totalIssueContributions: v.number(),
  totalPullRequestContributions: v.number(),
  totalPullRequestReviewContributions: v.number(),
  totalRepositoriesWithContributedCommits: v.number(),
  contributionCalendar: contributionCalendarValidator,
});

// Public action to get the authenticated user's GitHub username
export const getGitHubUsername = authedAction({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx): Promise<string | null> => {
    // Get the user's WorkOS external ID
    const workosUserId = ctx.user.externalId;

    if (!workosUserId) {
      return null;
    }

    // Call the internal action to get GitHub username
    return await ResultAsync.fromPromise(
      ctx.runAction(internal.github.nodeAction._getGitHubUsername, {
        workosUserId,
      }),
      (e) =>
        Errors.githubApiFailed({
          message: "Failed to get GitHub username",
          error: e,
        })
    ).match(
      (result) => result,
      (error) => {
        console.error("Error getting GitHub username:", error);
        return null;
      }
    );
  },
});

// Types for contribution data
export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoriesWithContributedCommits: number;
  contributionCalendar: ContributionCalendar;
}

// Public action to get GitHub contributions for any user (no auth required)
// Uses server-side PAT to query GitHub GraphQL API
export const getGitHubContributions = action({
  args: {
    username: v.string(),
  },
  returns: v.union(contributionsCollectionValidator, v.null()),
  handler: async (
    ctx,
    { username }
  ): Promise<ContributionsCollection | null> => {
    return await ResultAsync.fromPromise(
      ctx.runAction(internal.github.nodeAction._getGitHubContributions, {
        username,
      }),
      (e) =>
        Errors.githubApiFailed({
          message: `Failed to get GitHub contributions for ${username}`,
          error: e,
        })
    ).match(
      (result) => result,
      (error) => {
        console.error("Error getting GitHub contributions:", error);
        return null;
      }
    );
  },
});
