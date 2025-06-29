import { Outlet } from "react-router";
import { Authenticated } from "~/components/auth/auth-provider";

export default function AuthRoute() {
  return (
    <Authenticated>
      <Outlet />
    </Authenticated>
  );
}
