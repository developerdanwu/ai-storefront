import { useQuery } from "@tanstack/react-query";
import type {
  ContributionCalendar,
  ContributionsCollection,
} from "convex/github/action";
import { githubContributionsQuery } from "~/routes/git-wrapped-2025/lib/github-contributions.query";
import type { TGitHubRepoCleansed } from "~/routes/git-wrapped-2025/lib/github-languages.query";
import { githubLanguagesQuery } from "../lib/github-languages.query";
import { githubReposQuery } from "../lib/github-repos.query";
import { githubUserQuery } from "../lib/github-user.query";

// Updated ActivityStats to use GraphQL data
export interface ActivityStats {
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  totalCodeReviews: number;
  totalContributions: number;
  contributedRepos: number;
}

export interface RepoStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  mostStarredRepo: TGitHubRepoCleansed | null;
  mostActiveRepo: TGitHubRepoCleansed | null;
}

// Re-export contribution calendar type
export type { ContributionCalendar, ContributionsCollection };

export function useGitHubStats(username: string) {
  const userQuery = useQuery({
    ...githubUserQuery({ username }),
  });
  const reposQuery = useQuery({
    ...githubReposQuery({ username }),
  });

  const languagesQuery = useQuery({
    ...githubLanguagesQuery({ repos: reposQuery.data || [], username }),
    enabled: !!reposQuery.data,
  });

  const contributionsQuery = useQuery({
    ...githubContributionsQuery({ username }),
  });

  const isLoading =
    userQuery.isLoading ||
    reposQuery.isLoading ||
    contributionsQuery.isLoading ||
    languagesQuery.isLoading;

  const isError =
    userQuery.isError ||
    reposQuery.isError ||
    contributionsQuery.isError ||
    languagesQuery.isError;

  const error =
    userQuery.error ||
    reposQuery.error ||
    contributionsQuery.error ||
    languagesQuery.error;

  // Compute activity stats from GraphQL contributions data
  const activityStats: ActivityStats = (() => {
    const contributions = contributionsQuery.data;
    if (!contributions) {
      return {
        totalCommits: 0,
        totalPullRequests: 0,
        totalIssues: 0,
        totalCodeReviews: 0,
        totalContributions: 0,
        contributedRepos: 0,
      };
    }

    return {
      totalCommits: contributions.totalCommitContributions,
      totalPullRequests: contributions.totalPullRequestContributions,
      totalIssues: contributions.totalIssueContributions,
      totalCodeReviews: contributions.totalPullRequestReviewContributions,
      totalContributions: contributions.contributionCalendar.totalContributions,
      contributedRepos: contributions.totalRepositoriesWithContributedCommits,
    };
  })();

  // Compute repo stats
  const repoStats: RepoStats = (() => {
    if (!reposQuery.data) {
      return {
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        mostStarredRepo: null,
        mostActiveRepo: null,
      };
    }

    const repos = reposQuery.data;
    const totalStars = repos.reduce((sum, r) => sum + r.stargazersCount, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forksCount, 0);

    const mostStarredRepo = repos.reduce(
      (max, r) => (r.stargazersCount > (max?.stargazersCount || 0) ? r : max),
      null as TGitHubRepoCleansed | null
    );

    // Most active = most recently pushed
    const mostActiveRepo = repos.reduce(
      (max, r) =>
        new Date(r.pushedAt) > new Date(max?.pushedAt || 0) ? r : max,
      null as TGitHubRepoCleansed | null
    );

    return {
      totalRepos: repos.length,
      totalStars,
      totalForks,
      mostStarredRepo,
      mostActiveRepo,
    };
  })();

  return {
    user: userQuery.data,
    repos: reposQuery.data,
    contributions: contributionsQuery.data,
    contributionCalendar: contributionsQuery.data?.contributionCalendar,
    languageStats: languagesQuery.data || [],
    activityStats,
    repoStats,
    isLoading,
    isError,
    error,
  };
}
