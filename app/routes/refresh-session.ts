import { refreshSession } from "@workos-inc/authkit-react-router";
import { useFetcher } from "react-router";
import type { Route } from "./+types/refresh-session";

export const action = async ({ request }: Route.LoaderArgs) => {
  const refreshed = await refreshSession(request);
  console.log("refreshed", refreshed);
  return refreshed;
};

export function useRefreshSession() {
  return useFetcher<typeof action>();
}
