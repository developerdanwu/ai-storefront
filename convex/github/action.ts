import { ActionCache } from "@convex-dev/action-cache";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { components, internal } from "../_generated/api";
import { action } from "../_generated/server";
import * as Errors from "../errors";

export const _cachedGetGitHubContributions: ActionCache<any> = new ActionCache(
  components.actionCache,
  {
    action: internal.github.nodeAction._getGitHubContributions,
    ttl: 1000 * 60 * 60 * 24, // 24 hour
  }
);

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
    /** ISO 8601 date string for the start of the date range (e.g., "2024-01-01T00:00:00Z") */
    from: v.string(),
    /** ISO 8601 date string for the end of the date range (e.g., "2024-12-31T23:59:59Z") */
    to: v.string(),
  },
  returns: v.union(contributionsCollectionValidator, v.null()),
  handler: async (
    ctx,
    { username, from, to }
  ): Promise<ContributionsCollection | null> => {
    return await ResultAsync.fromPromise(
      _cachedGetGitHubContributions.fetch(ctx, {
        username,
        from,
        to,
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
