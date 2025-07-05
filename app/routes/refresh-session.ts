import { refreshSession } from "@workos-inc/authkit-react-router";
import type { Route } from "./+types/refresh-session";

export const action = ({ request }: Route.LoaderArgs) =>
  refreshSession(request);
