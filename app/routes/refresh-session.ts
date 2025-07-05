import { refreshSession } from "@workos-inc/authkit-react-router";
import { useFetcher } from "react-router";
import type { Route } from "./+types/refresh-session";

export const action = ({ request }: Route.LoaderArgs) =>
  refreshSession(request);

export function useRefreshSession() {
  return useFetcher<typeof action>();
}
