"use node";

import { Infer, v } from "convex/values";
import { internalAction } from "../_generated/server";

type TContributionsCollection = Infer<typeof VReturn_GetGithubContributions>;

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: TContributionsCollection;
    };
  };
  errors?: Array<{ message: string }>;
}

const VReturn_GetGithubContributions = v.object({
  contributionYears: v.array(v.number()),
  totalCommitContributions: v.number(),
  totalIssueContributions: v.number(),
  totalPullRequestContributions: v.number(),
  totalPullRequestReviewContributions: v.number(),
  totalRepositoriesWithContributedCommits: v.number(),
  contributionCalendar: v.object({
    totalContributions: v.number(),
    weeks: v.array(
      v.object({
        contributionDays: v.array(
          v.object({
            contributionCount: v.number(),
            date: v.string(),
            color: v.string(),
          })
        ),
      })
    ),
  }),
});

export type TReturn_getGitHubContributions = Infer<
  typeof VReturn_GetGithubContributions
>;

// GraphQL query for user contributions
// Note: contributionsCollection requires from/to dates, otherwise it defaults to last 365 days
const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        constributionYears
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }
`;

// Internal action to fetch GitHub stats via GraphQL API
export const _getGitHubContributions = internalAction({
  args: {
    username: v.string(),
    /** ISO 8601 date string for the start of the date range (e.g., "2024-01-01T00:00:00Z") */
    from: v.string(),
    /** ISO 8601 date string for the end of the date range (e.g., "2024-12-31T23:59:59Z") */
    to: v.string(),
  },
  returns: v.union(VReturn_GetGithubContributions, v.null()),
  handler: async (ctx, { username, from, to }) => {
    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
      console.error("GITHUB_PAT environment variable is not set");
      return null;
    }

    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubPat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: CONTRIBUTIONS_QUERY,
          variables: { username, from, to },
        }),
      });

      if (!response.ok) {
        console.error("GitHub GraphQL API error:", response.status);
        return null;
      }

      const result = (await response.json()) as GitHubGraphQLResponse;

      if (result.errors) {
        console.error("GitHub GraphQL errors:", result.errors);
        return null;
      }

      if (!result.data?.user) {
        console.error("GitHub user not found:", username);
        return null;
      }

      return result.data.user.contributionsCollection;
    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      return null;
    }
  },
});
