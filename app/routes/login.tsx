import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { signIn } = useAuth();
  useEffect(() => {
    signIn();
  }, []);
  return null;
}
