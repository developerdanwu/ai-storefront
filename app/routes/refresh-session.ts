import { refreshSession } from "@workos-inc/authkit-react-router";
import type { Route } from "./+types/refresh-session";

export const action = (args: Route.LoaderArgs) => refreshSession(args.request);
