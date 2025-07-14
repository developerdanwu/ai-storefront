import { useAuth } from "@workos-inc/authkit-react";
import { UserProfile } from "@workos-inc/widgets";
import { WorkOsProvider } from "~/lib/work-os-provider";

export default function AppSettingsRoute() {
  const { getAccessToken } = useAuth();

  return (
    <div className="p-4 w-full flex justify-center">
      <div className="max-w-4xl w-full">
        <WorkOsProvider>
          <UserProfile authToken={getAccessToken} />
        </WorkOsProvider>
      </div>
    </div>
  );
}
