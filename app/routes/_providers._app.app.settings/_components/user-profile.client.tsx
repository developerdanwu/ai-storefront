import { useAuth } from "@workos-inc/authkit-react";
import { UserProfile as WorkOsUserProfile } from "@workos-inc/widgets";
import { WorkOsProvider } from "~/lib/work-os-provider";

export function UserProfile() {
  const { getAccessToken } = useAuth();

  return (
    <WorkOsProvider>
      <WorkOsUserProfile authToken={getAccessToken} />
    </WorkOsProvider>
  );
}
