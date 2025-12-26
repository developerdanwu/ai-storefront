import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchGitHubData } from "./github-data-fetcher";
// Types for GitHub API responses
export const ZGitHubUser = z.object({
  login: z.string(),
  avatar_url: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
  created_at: z.string(),
});

export type TGitHubUser = z.infer<typeof ZGitHubUser>;

export const githubUserQuery = ({ username }: { username: string }) =>
  queryOptions({
    queryKey: ["hydrate:github-user", username] as const,
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
    queryFn: ({ queryKey }) =>
      fetchGitHubData<TGitHubUser>(`/users/${queryKey[1]}`),
  });
