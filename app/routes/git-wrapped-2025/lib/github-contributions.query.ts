import { convexAction } from "@convex-dev/react-query";
import { queryOptions } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import z from "zod";

export const ZReturnGitHubContributionsQuery = z
  .object({
    totalCommitContributions: z.number(),
    totalIssueContributions: z.number(),
    totalPullRequestContributions: z.number(),
    totalPullRequestReviewContributions: z.number(),
    totalRepositoriesWithContributedCommits: z.number(),
    contributionCalendar: z.object({
      totalContributions: z.number(),
      weeks: z.array(
        z.object({
          contributionDays: z.array(
            z.object({
              contributionCount: z.number(),
              date: z.string(),
              color: z.string(),
            })
          ),
        })
      ),
    }),
  })
  .strict();

export type TReturnGitHubContributionsQuery = z.infer<
  typeof ZReturnGitHubContributionsQuery
>;

export const githubContributionsQuery = ({
  username,
  from = "2025-01-01T00:00:00Z",
  to = "2025-12-31T23:59:59Z",
}: {
  username: string;
  /** ISO 8601 date string for the start of the date range */
  from?: string;
  /** ISO 8601 date string for the end of the date range */
  to?: string;
}) =>
  queryOptions({
    ...convexAction(api.github.action.getGitHubContributions, {
      username,
      from,
      to,
    }),
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
    meta: {
      persist: true,
    },
  });
