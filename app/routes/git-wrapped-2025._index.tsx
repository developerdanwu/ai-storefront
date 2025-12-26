import { useAuth } from "@workos-inc/authkit-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { UsernameInput } from "./git-wrapped-2025/_components/username-input";

export default function GitWrappedIndexRoute() {
  const navigate = useNavigate();
  const { isLoading: authLoading, user: authUser, signIn } = useAuth();

  // Handle username submission - navigate to profile route
  const handleUsernameSubmit = useCallback(
    (submittedUsername: string) => {
      navigate(
        `/git-wrapped-2025/profile/${encodeURIComponent(submittedUsername)}`
      );
    },
    [navigate]
  );

  // Handle sign in with GitHub
  const handleSignIn = useCallback(() => {
    signIn();
  }, [signIn]);

  return (
    <UsernameInput
      onSubmit={handleUsernameSubmit}
      onSignIn={handleSignIn}
      isLoading={authLoading}
      isAuthenticated={!!authUser}
      authenticatedUsername={undefined}
    />
  );
}
