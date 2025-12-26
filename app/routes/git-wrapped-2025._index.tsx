import { useCallback } from "react";
import { useNavigate } from "react-router";
import { UsernameInput } from "./git-wrapped-2025/_components/username-input";

export default function GitWrappedIndexRoute() {
  const navigate = useNavigate();
  // Handle username submission - navigate to profile route
  const handleUsernameSubmit = useCallback(
    (submittedUsername: string) => {
      navigate(
        `/git-wrapped-2025/profile/${encodeURIComponent(submittedUsername)}`
      );
    },
    [navigate]
  );

  return <UsernameInput onSubmit={handleUsernameSubmit} />;
}
