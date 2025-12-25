"use node";

import { WorkOS } from "@workos-inc/node";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

// Types for GitHub GraphQL API response
interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface ContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoriesWithContributedCommits: number;
  contributionCalendar: ContributionCalendar;
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: ContributionsCollection;
    };
  };
  errors?: Array<{ message: string }>;
}

// Convex validators for the return type
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

// Get the GitHub username from WorkOS identity
export const _getGitHubUsername = internalAction({
  args: {
    workosUserId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { workosUserId }) => {
    const workos = new WorkOS(process.env.WORKOS_API_KEY);

    try {
      // Get user's identities to find GitHub OAuth connection
      const identities = await workos.userManagement.getUserIdentities(
        workosUserId
      );

      const githubIdentity = identities.find(
        (i) => i.type === "OAuth" && i.provider === "GitHubOAuth"
      );

      if (!githubIdentity) {
        return null;
      }

      // The idpId for GitHub OAuth is the GitHub user ID
      // We can use the GitHub API to get the username from the ID
      const response = await fetch(
        `https://api.github.com/user/${githubIdentity.idpId}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch GitHub user:", response.status);
        return null;
      }

      const userData = (await response.json()) as { login: string };
      return userData.login;
    } catch (error) {
      console.error("Error fetching GitHub identity:", error);
      return null;
    }
  },
});

// GraphQL query for user contributions
const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
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
  },
  returns: v.union(contributionsCollectionValidator, v.null()),
  handler: async (ctx, { username }) => {
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
          variables: { username },
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
