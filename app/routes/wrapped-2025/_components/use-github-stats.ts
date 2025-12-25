import { useConvexAction } from "@convex-dev/react-query";
import { useMutation, useQueries } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type {
  ContributionCalendar,
  ContributionsCollection,
} from "convex/github/action";

const GITHUB_API_BASE = "https://api.github.com";

// Types for GitHub API responses
export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

// Computed stats types
export interface LanguageStats {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

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
  mostStarredRepo: GitHubRepo | null;
  mostActiveRepo: GitHubRepo | null;
}

// Re-export contribution calendar type
export type { ContributionCalendar, ContributionsCollection };

// Language colors (GitHub-style)
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

async function fetchGitHubData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export function useGitHubStats(username: string) {
  // Use Convex action for contributions (GraphQL API)
  const getContributions = useMutation({
    mutationFn: useConvexAction(api.github.action.getGitHubContributions),
  });

  // Use REST API for user profile and repos
  const results = useQueries({
    queries: [
      {
        queryKey: ["github-user", username],
        queryFn: () => fetchGitHubData<GitHubUser>(`/users/${username}`),
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: !!username,
      },
      {
        queryKey: ["github-repos", username],
        queryFn: () =>
          fetchGitHubData<GitHubRepo[]>(
            `/users/${username}/repos?per_page=100&sort=updated`
          ),
        staleTime: 1000 * 60 * 60,
        enabled: !!username,
      },
    ],
  });

  const [userQuery, reposQuery] = results;

  // Fetch contributions when username changes
  const contributionsQuery = useMutation({
    mutationFn: useConvexAction(api.github.action.getGitHubContributions),
  });

  // Trigger contributions fetch when username is available
  // Using a separate effect-like pattern with the mutation
  if (
    username &&
    !contributionsQuery.data &&
    !contributionsQuery.isPending &&
    !contributionsQuery.isError
  ) {
    contributionsQuery.mutate({ username });
  }

  const isLoading =
    userQuery.isLoading || reposQuery.isLoading || contributionsQuery.isPending;
  const isError =
    userQuery.isError || reposQuery.isError || contributionsQuery.isError;
  const error = userQuery.error || reposQuery.error || contributionsQuery.error;

  // Compute language stats from repos
  const languageStats: LanguageStats[] = (() => {
    if (!reposQuery.data) return [];

    const languageCounts: Record<string, number> = {};
    for (const repo of reposQuery.data) {
      if (repo.language) {
        languageCounts[repo.language] =
          (languageCounts[repo.language] || 0) + 1;
      }
    }

    const total = Object.values(languageCounts).reduce((a, b) => a + b, 0);

    return Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: LANGUAGE_COLORS[name] || "#8b8b8b",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

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
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    const mostStarredRepo = repos.reduce(
      (max, r) => (r.stargazers_count > (max?.stargazers_count || 0) ? r : max),
      null as GitHubRepo | null
    );

    // Most active = most recently pushed
    const mostActiveRepo = repos.reduce(
      (max, r) =>
        new Date(r.pushed_at) > new Date(max?.pushed_at || 0) ? r : max,
      null as GitHubRepo | null
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
    languageStats,
    activityStats,
    repoStats,
    isLoading,
    isError,
    error,
  };
}

// Hook to get the authenticated user's GitHub username from WorkOS
export function useGitHubUsername() {
  const getUsername = useMutation({
    mutationFn: useConvexAction(api.github.action.getGitHubUsername),
  });

  return {
    username: getUsername.data,
    isLoading: getUsername.isPending,
    isError: getUsername.isError,
    error: getUsername.error,
    fetchUsername: () => getUsername.mutate({}),
  };
}
