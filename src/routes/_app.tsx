import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { AppSidebar } from "@/components/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { FinanceProvider, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function Topbar() {
  const { profile } = useFinance();
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Hi, {profile.name.split(" ")[0]} 👋</p>
        <p className="truncate text-xs text-muted-foreground">Here's your money, clearly explained.</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-accent text-xs font-bold text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, user, navigate]);

  // While we check for a session, or while redirecting an unauthenticated
  // visitor to /login, render nothing but a spinner so protected content
  // never flashes on screen.
  if (loading || !user) {
    return (
      <div className="grid min-h-screen w-full place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FinanceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FinanceProvider>
  );
}
