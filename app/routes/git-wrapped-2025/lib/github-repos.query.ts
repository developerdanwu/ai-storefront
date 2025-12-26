import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchGitHubData } from "./github-data-fetcher";

const ZGitHubRepo = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  owner: z.object({
    login: z.string(),
  }),
});

type TGitHubRepo = z.infer<typeof ZGitHubRepo>;

export const ZReturnGitHubReposQuery = z.array(
  z.object({
    ownerName: z.string(),
    repoName: z.string(),
    stargazersCount: z.number(),
    forksCount: z.number(),
    pushedAt: z.string(),
  })
);

export type TReturnGitHubReposQuery = z.infer<typeof ZReturnGitHubReposQuery>;

export const githubReposQuery = ({ username }: { username: string }) =>
  queryOptions({
    queryKey: ["hydrate:github-repos", username] as const,
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
    queryFn: async ({ queryKey }) => {
      const perPage = 100;
      let page = 1;
      const all: {
        ownerName: string;
        repoName: string;
        stargazersCount: number;
        forksCount: number;
        pushedAt: string;
      }[] = [];

      // Filter for repos pushed within 2025
      const startOf2025 = new Date("2025-01-01T00:00:00Z");
      const endOf2025 = new Date("2025-12-31T23:59:59Z");

      while (true) {
        const pageData = await fetchGitHubData<TGitHubRepo[]>(
          `/users/${queryKey[1]}/repos?per_page=${perPage}&sort=updated&page=${page}`
        );

        if (!Array.isArray(pageData) || pageData.length === 0) {
          break;
        }

        const cleansedData: TReturnGitHubReposQuery = pageData
          .filter((repo) => {
            const pushedDate = new Date(repo.pushed_at);
            return pushedDate >= startOf2025 && pushedDate <= endOf2025;
          })
          .map((repo) => ({
            ownerName: repo.owner.login,
            repoName: repo.name,
            stargazersCount: repo.stargazers_count,
            forksCount: repo.forks_count,
            pushedAt: repo.pushed_at,
          }));

        all.push(...cleansedData);
        page += 1;
      }

      return all;
    },
  });
