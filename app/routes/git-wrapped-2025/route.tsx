import { Outlet } from "react-router";
import { ThemeProvider } from "~/components/theme-provider";

// Layout route for git-wrapped-2025
// The _components folder is shared between the index and profile routes
export default function GitWrappedLayout() {
  return (
    <ThemeProvider forceTheme="dark">
      <Outlet />
    </ThemeProvider>
  );
}
