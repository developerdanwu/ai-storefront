import { UserProfile } from "~/routes/_providers._app.app.settings/_components/user-profile.client";

export default function AppSettingsRoute() {
  return (
    <div className="p-4 w-full flex justify-center">
      <div className="max-w-4xl w-full">
        <UserProfile />
      </div>
    </div>
  );
}
