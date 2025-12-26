import { convexAction } from "@convex-dev/react-query";
import { queryOptions } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import z from "zod";

export const ZReturnGitHubContributionsQuery = z.object({
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
});

export type TReturnGitHubContributionsQuery = z.infer<
  typeof ZReturnGitHubContributionsQuery
>;

export const githubContributionsQuery = ({ username }: { username: string }) =>
  queryOptions({
    meta: {
      persist: true,
    },
    ...convexAction(api.github.action.getGitHubContributions, { username }),
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
  });
