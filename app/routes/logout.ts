import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

export default function Logout() {
  const { signOut } = useAuth();
  useEffect(() => {
    signOut({
      returnTo: "/",
    });
  }, [signOut]);

  return null;
}
