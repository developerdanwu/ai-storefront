import { Outlet } from "react-router";
import { AppProviders } from "~/components/app-providers";

export default function Providers() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
