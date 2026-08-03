import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/_app/goals")({
  head: () => ({
    meta: [
      { title: "Savings Goals — piggy 🐷" },
      { name: "description", content: "Create savings goals, track progress and add contributions toward each target." },
      { property: "og:title", content: "Savings Goals — piggy 🐷" },
      { property: "og:description", content: "Create goals, track progress and add contributions." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, addGoal, contribute, totals } = useFinance();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", target: "", deadline: "", emoji: "🎯" });

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Savings Goals 🎯</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(totals.savings)} saved of {formatCurrency(totalTarget)}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 rounded-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create a savings goal</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                addGoal({
                  name: draft.name,
                  target: Number(draft.target),
                  saved: 0,
                  deadline: draft.deadline || "No deadline",
                  emoji: draft.emoji || "🎯",
                });
                toast.success("Goal created");
                setOpen(false);
                setDraft({ name: "", target: "", deadline: "", emoji: "🎯" });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-[80px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <Label htmlFor="emoji">Icon</Label>
                  <Input
                    id="emoji"
                    maxLength={2}
                    value={draft.emoji}
                    onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Goal name</Label>
                  <Input
                    id="name"
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="New bike"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target">Target amount</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    required
                    value={draft.target}
                    onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Target date</Label>
                  <Input
                    id="deadline"
                    value={draft.deadline}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                    placeholder="Mar 2027"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">
                  Create goal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100);
          const remaining = Math.max(0, g.target - g.saved);
          return (
            <div key={g.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-xl">
                    {g.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{g.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> {g.deadline}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                  {pct}%
                </span>
              </div>

              <Progress value={pct} className="mt-4 h-2.5" />

              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">{formatCurrency(g.saved)}</span>
                <span className="text-muted-foreground">of {formatCurrency(g.target)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {remaining === 0 ? "Goal complete 🎉" : `${formatCurrency(remaining)} to go`}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[1000, 5000, 10000].map((amt) => (
                  <Button
                    key={amt}
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      contribute(g.id, amt);
                      toast.success(`Added ${formatCurrency(amt)} to ${g.name}`);
                    }}
                  >
                    +{formatCurrency(amt)}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">AI suggestion: </span>
          At your current pace you'll finish the emergency fund in 9 months. Redirecting the ₹11,000
          gym charge you haven't used since May would shave 5 weeks off that.
        </p>
      </div>
    </div>
  );
}
