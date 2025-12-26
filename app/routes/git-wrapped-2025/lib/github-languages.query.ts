import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchGitHubData } from "./github-data-fetcher";

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

// Computed stats types
export const ZLanguageStats = z.object({
  name: z.string(),
  count: z.number(),
  percentage: z.number(),
  color: z.string(),
});

export type TLanguageStats = z.infer<typeof ZLanguageStats>;

export const ZReturnGitHubLanguagesQuery = z.array(ZLanguageStats);

const ZGitHubRepoCleansed = z.object({
  ownerName: z.string(),
  repoName: z.string(),
  stargazersCount: z.number(),
  forksCount: z.number(),
  pushedAt: z.string(),
});

export type TGitHubRepoCleansed = z.infer<typeof ZGitHubRepoCleansed>;

export const githubLanguagesQuery = ({
  repos,
  username,
}: {
  repos: TGitHubRepoCleansed[];
  username: string;
}) =>
  queryOptions({
    queryKey: ["hydrate:github-languages", username] as const,
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
    staleTime: 1000 * 60 * 60 * 24, // 24 hour
    throwOnError: false,
    queryFn: async () => {
      // First pass: aggregate bytes per language
      const langBytes: Record<string, number> = {};
      for (const repo of repos || []) {
        const langs = await fetchGitHubData<Record<string, number>>(
          `/repos/${repo.ownerName}/${repo.repoName}/languages`
        );

        for (const [lang, bytes] of Object.entries(langs)) {
          langBytes[lang] = (langBytes[lang] || 0) + bytes;
        }
      }

      // Calculate total bytes
      const totalBytes = Object.values(langBytes).reduce(
        (sum, bytes) => sum + bytes,
        0
      );

      // Second pass: convert to TLanguageStats with percentages
      const stats: TLanguageStats[] = Object.entries(langBytes).map(
        ([lang, bytes]) => ({
          name: lang,
          count: bytes,
          percentage:
            totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
          color: LANGUAGE_COLORS[lang] || "#8b8b8b",
        })
      );

      // Sort by count descending
      return stats.sort((a, b) => b.count - a.count);
    },
  });
