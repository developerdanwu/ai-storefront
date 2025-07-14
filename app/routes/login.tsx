import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { AppProviders } from "~/components/app-providers";

export function LoginPageInner() {
  const { signIn } = useAuth();
  useEffect(() => {
    signIn();
  }, []);
  return null;
}

export default function LoginPage() {
  return (
    <AppProviders>
      <LoginPageInner />
    </AppProviders>
  );
}
