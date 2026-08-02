import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — piggy 🐷" },
      { name: "description", content: "Choose a new password for your piggy account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  // Clicking the emailed reset link signs the browser into a short-lived
  // recovery session, which is what lets updatePassword() below succeed.
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <AuthShell title="Set a new password" subtitle="Verifying your reset link…" footer={null}>
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  if (!user) {
    return (
      <AuthShell
        title="This link has expired"
        subtitle="Password reset links only work for a little while."
        footer={
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Request a new link
          </Link>
        }
      >
        <></>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you'll remember this time." footer={null}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();

          if (password !== confirm) {
            toast.error("Passwords don't match");
            return;
          }

          setSubmitting(true);
          const { error } = await updatePassword(password);
          setSubmitting(false);

          if (error) {
            toast.error(error);
            return;
          }

          toast.success("Password updated — you're all set");
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
