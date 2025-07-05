import { getSignInUrl } from "@workos-inc/authkit-react-router";
import { redirect } from "react-router";

export const loader = async () => {
  const signInUrl = await getSignInUrl().catch((e) => console.error(e));
  console.log("SIGN IN URL", signInUrl);

  if (!signInUrl) {
    return null;
  }

  return redirect(signInUrl);
};

export default function LoginPage() {
  return null;
}
