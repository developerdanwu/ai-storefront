import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";

export function LoginPageInner() {
  const { signIn } = useAuth();
  useEffect(() => {
    signIn();
  }, []);
  return null;
}

export default function LoginPage() {
  return <LoginPageInner />;
}
