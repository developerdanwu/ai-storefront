import { signOut } from "@workos-inc/authkit-react-router";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  console.log("CALLING LOGOUT");
  return await signOut(request);
}
