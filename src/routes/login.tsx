import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sticker } from "@/components/Sticker";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — piggy 🐷" },
      { name: "description", content: "Log back in to your piggy dashboard, transactions and savings goals." },
      { property: "og:title", content: "Log in — piggy 🐷" },
      { property: "og:description", content: "Log back in to your piggy money dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip straight to the dashboard.
  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authLoading, user, navigate]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where your money left off."
      footer={
        <>
          New to piggy?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          const { error } = await signIn(email, password, remember);
          setSubmitting(false);

          if (error) {
            toast.error(error);
            return;
          }

          toast.success("Welcome back");
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} /> Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="gradient-hero relative hidden flex-col justify-between overflow-hidden p-12 text-ink-foreground lg:flex">
        <Sticker emoji="✨" variant="sunshine" rotate={-12} wiggle className="absolute top-10 right-10 grid" />
        <Sticker emoji="🎀" variant="mint" rotate={10} className="absolute bottom-24 left-10 grid" />
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-mint grid h-9 w-9 place-items-center rounded-full text-lg">🐷</span>
          <span className="text-lg font-bold">piggy</span>
        </Link>
        <div>
          <p className="text-3xl leading-snug font-bold">
            “I finally know where my money goes — and it doesn't feel like homework.”
          </p>
          <p className="mt-4 text-ink-foreground/70">Priya N., using piggy since 2025</p>
        </div>
        <p className="text-sm text-ink-foreground/60">Bank-grade encryption · Read-only access</p>
      </div>

      <div className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <Sticker emoji="💖" variant="pink" size="sm" rotate={-10} className="absolute top-8 right-8 grid lg:hidden" />
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="gradient-mint grid h-9 w-9 place-items-center rounded-full text-lg">🐷</span>
            <span className="text-lg font-bold">piggy</span>
          </Link>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
