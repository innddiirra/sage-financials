import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Fernway Finance" },
      { name: "description", content: "Sign in to your Fernway account to view your dashboard, transactions and savings goals." },
      { property: "og:title", content: "Log in — Fernway Finance" },
      { property: "og:description", content: "Sign in to your Fernway personal finance dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex.rivera@example.com");
  const [password, setPassword] = useState("");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where your money left off."
      footer={
        <>
          New to Fernway?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Welcome back, Alex");
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
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Remember me
          </label>
          <span className="text-sm font-medium text-primary">Forgot password?</span>
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg">
          Log in
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
      <div className="gradient-hero hidden flex-col justify-between p-12 text-ink-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-mint grid h-9 w-9 place-items-center rounded-xl text-primary-foreground">
            <Wallet className="h-4.5 w-4.5" />
          </span>
          <span className="text-lg font-bold">Fernway</span>
        </Link>
        <div>
          <p className="text-3xl leading-snug font-extrabold">
            “I finally know where my money goes — and what to do about it.”
          </p>
          <p className="mt-4 text-ink-foreground/70">Priya N., using Fernway since 2025</p>
        </div>
        <p className="text-sm text-ink-foreground/60">Bank-grade encryption · Read-only access</p>
      </div>

      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="gradient-mint grid h-9 w-9 place-items-center rounded-xl text-primary-foreground">
              <Wallet className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg font-bold">Fernway</span>
          </Link>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
