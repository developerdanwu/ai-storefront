import { Slottable } from "@radix-ui/react-slot";
import "@radix-ui/themes/styles.css";
import { useAuth } from "@workos-inc/authkit-react";
import "@workos-inc/widgets/styles.css";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  LayoutDashboard,
  LogInIcon,
  MoonIcon,
  Settings,
  SunIcon,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { AppProviders } from "~/components/app-providers";
import { AuthenticatedWithRedirect } from "~/components/auth/auth-provider";
import { NavigationProgress } from "~/components/navigation-progress";
import { SecondaryPanel } from "~/components/secondary-panel";
import { AiStoreProvider } from "~/components/secondary-panel/ai/ai-store";
import { RightNavbar } from "~/components/secondary-panel/right-navbar";
import { useTheme } from "~/components/theme-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { ROUTES } from "~/lib/routes";
import { NavUser } from "~/routes/_shell/_components/nav-user";

export function AppDashboardInner() {
  const { user, getAccessToken } = useAuth();
  const { setTheme, currentTheme } = useTheme();
  const location = useLocation();
  return (
    <AuthenticatedWithRedirect>
      <div className="flex h-screen w-full">
        <SidebarProvider className="flex w-full h-full">
          <NavigationProgress />
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-between my-2">
                <div className="text-lg font-semibold">Kaolin chat</div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === ROUTES.appAgents}
                    asChild
                  >
                    <NavLink to={ROUTES.appAgents}>
                      <LayoutDashboard />
                      <span>Agents</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenuButton
                isActive={location.pathname === ROUTES.appSettings}
                asChild
              >
                <NavLink to={ROUTES.appSettings}>
                  <Settings />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
              {currentTheme === "dark" && (
                <SidebarMenuButton onClick={() => setTheme("light")}>
                  <SunIcon />
                  Lights on
                </SidebarMenuButton>
              )}
              {currentTheme === "light" && (
                <SidebarMenuButton onClick={() => setTheme("dark")}>
                  <MoonIcon />
                  Lights off
                </SidebarMenuButton>
              )}
              <Authenticated>{user && <NavUser user={user} />}</Authenticated>
              <Unauthenticated>
                <SidebarMenuButton asChild>
                  <LogInIcon />
                  <Slottable>
                    <Link to="/login">Sign In</Link>
                  </Slottable>
                </SidebarMenuButton>
              </Unauthenticated>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex border-b h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-hidden">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
        <SecondaryPanel />
        <RightNavbar />
      </div>
    </AuthenticatedWithRedirect>
  );
}

export default function AppDashboardRoute() {
  return (
    <AppProviders>
      <AiStoreProvider>
        <AppDashboardInner />
      </AiStoreProvider>
    </AppProviders>
  );
}
