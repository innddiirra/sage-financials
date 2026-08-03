import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — piggy 🐷" },
      {
        name: "description",
        content: "Open a free piggy account and start tracking spending, savings goals and AI money insights today.",
      },
      { property: "og:title", content: "Create your account — piggy 🐷" },
      { property: "og:description", content: "Free AI money tracking, but make it cute. Set up in three minutes." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authLoading, user, navigate]);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Three minutes now, a much calmer month ahead."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          const { error, signedIn } = await signUp(form.email, form.password, form.name);
          setSubmitting(false);

          if (error) {
            toast.error(error);
            return;
          }

          if (signedIn) {
            toast.success("Welcome to piggy! 🐷");
            navigate({ to: "/dashboard" });
          } else {
            // Email confirmation is required before a session is issued.
            toast.success("Account created — check your email to confirm it, then log in.");
            navigate({ to: "/login" });
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Alex Rivera"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
