import { authkitLoader } from "@workos-inc/authkit-react-router";
import { Outlet } from "react-router";
import { Authenticated } from "~/components/auth/auth-provider";
import type { Route } from "../+types/_index";

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, { ensureSignedIn: true });

export default function AuthRoute() {
  return (
    <Authenticated>
      <Outlet />
    </Authenticated>
  );
}
