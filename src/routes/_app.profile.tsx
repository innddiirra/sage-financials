import { createFileRoute } from "@tanstack/react-router";
import { Mail, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Fernway Finance" },
      { name: "description", content: "Manage your Fernway account details, monthly budget and notification preferences." },
      { property: "og:title", content: "Profile — Fernway Finance" },
      { property: "og:description", content: "Manage account details, budget and notifications." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, updateProfile, totals, transactions, goals } = useFinance();
  const [form, setForm] = useState(profile);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account details and preferences</p>
      </div>

      <div className="surface-card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5 sm:p-6">
        <Avatar className="h-16 w-16 shrink-0 border border-border">
          <AvatarFallback className="bg-accent text-lg font-bold text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile.name}</p>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {profile.email}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified · Premium plan
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Net balance", value: formatCurrency(totals.balance) },
          { label: "Transactions", value: String(transactions.length) },
          { label: "Active goals", value: String(goals.length) },
        ].map((s) => (
          <div key={s.label} className="surface-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <form
        className="surface-card space-y-5 p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile(form);
          toast.success("Profile updated");
        }}
      >
        <h2 className="text-base font-bold">Account details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pname">Full name</Label>
            <Input
              id="pname"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pemail">Email</Label>
            <Input
              id="pemail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcurrency">Currency</Label>
            <Input
              id="pcurrency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pbudget">Monthly budget</Label>
            <Input
              id="pbudget"
              type="number"
              min="0"
              value={form.monthlyBudget}
              onChange={(e) => setForm({ ...form, monthlyBudget: Number(e.target.value) })}
            />
          </div>
        </div>

        <Separator />

        <h2 className="text-base font-bold">Preferences</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Weekly AI insights</p>
              <p className="text-xs text-muted-foreground">
                A short summary of your money every Monday.
              </p>
            </div>
            <Switch
              checked={form.aiInsights}
              onCheckedChange={(v) => setForm({ ...form, aiInsights: v })}
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Overspending alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified when a category runs hot.
              </p>
            </div>
            <Switch
              checked={form.alerts}
              onCheckedChange={(v) => setForm({ ...form, alerts: v })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button type="submit" className="rounded-full">
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setForm(profile)}
          >
            Reset
          </Button>
        </div>
      </form>

      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Wallet className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          Connected accounts sync read-only every 6 hours. You can disconnect a bank at any time and
          your history stays intact.
        </p>
      </div>
    </div>
  );
}
