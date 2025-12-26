import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchGitHubData } from "./github-data-fetcher";

export const ZReturnGithubUserQuery = z
  .object({
    login: z.string(),
    avatarUrl: z.string(),
    name: z.string().nullable(),
    bio: z.string().nullable(),
    publicRepos: z.number(),
    followers: z.number(),
    following: z.number(),
    createdAt: z.string(),
  })
  .strict();

const ZGithubUserRawQuery = z.object({
  login: z.string(),
  avatar_url: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
  created_at: z.string(),
});

type TGitHubUserRawQuery = z.infer<typeof ZGithubUserRawQuery>;

export type TReturnGithubUserQuery = z.infer<typeof ZReturnGithubUserQuery>;

export const githubUserQuery = ({ username }: { username: string }) =>
  queryOptions({
    queryKey: ["github-user", username] as const,
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
    queryFn: async ({ queryKey }) => {
      const result = await fetchGitHubData<TGitHubUserRawQuery>(
        `/users/${queryKey[1]}`
      );

      return ZReturnGithubUserQuery.parse({
        login: result.login,
        avatarUrl: result.avatar_url,
        name: result.name,
        bio: result.bio,
        publicRepos: result.public_repos,
        followers: result.followers,
        following: result.following,
        createdAt: result.created_at,
      });
    },
    meta: {
      persist: true,
    },
  });
