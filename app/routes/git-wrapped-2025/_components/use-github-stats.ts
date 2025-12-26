import { useQuery } from "@tanstack/react-query";
import type {
  ContributionCalendar,
  ContributionsCollection,
} from "convex/github/action";
import { useMemo } from "react";
import { githubContributionsQuery } from "~/routes/git-wrapped-2025/lib/github-contributions.query";
import type { TGitHubRepoCleansed } from "~/routes/git-wrapped-2025/lib/github-languages.query";
import { githubLanguagesQuery } from "../lib/github-languages.query";
import { githubReposQuery } from "../lib/github-repos.query";
import { githubUserQuery } from "../lib/github-user.query";

// Updated ActivityStats to use contribution calendar data (includes private repos)
export interface ActivityStats {
  totalContributions: number;
  longestStreak: number;
  bestMonth: { month: string; count: number };
  weekendContributions: number;
  activeDaysPercentage: number;
  activeDays: number;
  totalDays: number;
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

  // Compute activity stats from contribution calendar (includes private repos)
  const activityStats: ActivityStats = useMemo(() => {
    const contributions = contributionsQuery.data;
    if (!contributions) {
      return {
        totalContributions: 0,
        longestStreak: 0,
        bestMonth: { month: "January", count: 0 },
        weekendContributions: 0,
        activeDaysPercentage: 0,
        activeDays: 0,
        totalDays: 0,
      };
    }

    const calendar = contributions.contributionCalendar;
    const allDays = calendar.weeks.flatMap((week) => week.contributionDays);

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    for (const day of allDays) {
      if (day.contributionCount > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Calculate best month
    const monthlyContributions: Record<string, number> = {};
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (const day of allDays) {
      const date = new Date(day.date);
      const monthKey = monthNames[date.getMonth()];
      monthlyContributions[monthKey] =
        (monthlyContributions[monthKey] || 0) + day.contributionCount;
    }

    const bestMonth = Object.entries(monthlyContributions).reduce(
      (best, [month, count]) => (count > best.count ? { month, count } : best),
      { month: "January", count: 0 }
    );

    // Calculate weekend contributions (Saturday = 6, Sunday = 0)
    const weekendContributions = allDays
      .filter((day) => {
        const date = new Date(day.date);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      })
      .reduce((sum, day) => sum + day.contributionCount, 0);

    // Calculate active days and percentage
    const activeDays = allDays.filter(
      (day) => day.contributionCount > 0
    ).length;
    const totalDays = allDays.length;
    const activeDaysPercentage =
      totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

    return {
      totalContributions: calendar.totalContributions,
      longestStreak,
      bestMonth,
      weekendContributions,
      activeDaysPercentage,
      activeDays,
      totalDays,
    };
  }, [contributionsQuery.data]);

  // Compute repo stats
  const repoStats: RepoStats = useMemo(() => {
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
  }, [reposQuery.data]);

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
