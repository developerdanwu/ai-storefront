import { useConvexAction } from "@convex-dev/react-query";
import { Slottable } from "@radix-ui/react-slot";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-react";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { LogInIcon, MoonIcon, SunIcon } from "lucide-react";
import { Link, Outlet, useParams } from "react-router";
import { AppProviders } from "~/components/app-providers";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { NavigationProgress } from "~/components/navigation-progress";
import { useTheme } from "~/components/theme-provider";
import { SidebarHeader } from "~/components/threads-list";
import { Input } from "~/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AnonymousThreads } from "~/routes/_shell/_components/anonymous-threads";
import { AuthenticatedThreads } from "~/routes/_shell/_components/authenticated-threads";
import { EmptyThreads } from "~/routes/_shell/_components/empty-threads";
import { NavUser } from "~/routes/_shell/_components/nav-user";

export function ShellInner() {
  const { user } = useAuth();
  const { threadId } = useParams();
  const { setTheme, currentTheme } = useTheme();

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
  });

  return (
    <SidebarProvider>
      <NavigationProgress />
      <Sidebar>
        <Authenticated>
          <AuthenticatedThreads activeThreadId={threadId} />
        </Authenticated>
        <AnonymousUser
          fallback={
            <>
              <SidebarHeader>
                <Input />
              </SidebarHeader>
              <SidebarContent>
                <EmptyThreads />
              </SidebarContent>
            </>
          }
        >
          <AnonymousThreads activeThreadId={threadId} />
        </AnonymousUser>
        <SidebarFooter>
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
          <Outlet context={{ createThread }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ShellRoute() {
  return (
    <AppProviders>
      <ShellInner />
    </AppProviders>
  );
}
