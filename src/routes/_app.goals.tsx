import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { formatCurrency, useFinance, type Goal, type GoalDraft } from "@/lib/finance-store";

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

const emptyDraft: GoalDraft = { name: "", target: 0, saved: 0, deadline: "", emoji: "🎯" };

function daysRemaining(deadline: string): number | null {
  if (!deadline) return null;
  const target = new Date(`${deadline}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline: string): string {
  if (!deadline) return "No deadline";
  return new Date(`${deadline}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysRemainingLabel(deadline: string): string {
  const days = daysRemaining(deadline);
  if (days === null) return "No deadline";
  if (days > 1) return `${days} days left`;
  if (days === 1) return "1 day left";
  if (days === 0) return "Due today";
  return `${Math.abs(days)} days overdue`;
}

function GoalsPage() {
  const { goals, goalsLoading, addGoal, editGoal, deleteGoal, contribute, totals } = useFinance();

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<GoalDraft>(emptyDraft);
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<Goal | null>(null);
  const [editDraft, setEditDraft] = useState<GoalDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contributingId, setContributingId] = useState<string | null>(null);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  function startEdit(g: Goal) {
    setEditing(g);
    setEditDraft({ name: g.name, target: g.target, saved: g.saved, deadline: g.deadline, emoji: g.emoji });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Savings Goals 🎯</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(totals.savings)} saved of {formatCurrency(totalTarget)}
          </p>
        </div>
        <Dialog
          open={addOpen}
          onOpenChange={(open) => {
            setAddOpen(open);
            if (open) setAddDraft(emptyDraft);
          }}
        >
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
              onSubmit={async (e) => {
                e.preventDefault();
                setAdding(true);
                try {
                  await addGoal(addDraft);
                  toast.success("Goal created");
                  setAddOpen(false);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Couldn't create that goal");
                } finally {
                  setAdding(false);
                }
              }}
            >
              <GoalFormFields draft={addDraft} setDraft={setAddDraft} idPrefix="add" showSaved={false} />
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full" disabled={adding}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create goal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goalsLoading && (
        <div className="surface-card flex items-center justify-center gap-2 p-14 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading goals…
        </div>
      )}

      {!goalsLoading && goals.length === 0 && (
        <div className="surface-card p-14 text-center text-sm text-muted-foreground">
          No savings goals yet — create your first one above. 🎯
        </div>
      )}

      {!goalsLoading && goals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
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
                        <CalendarDays className="h-3 w-3" /> {formatDeadline(g.deadline)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                      {pct}%
                    </span>
                    <Button variant="ghost" size="icon" aria-label={`Edit ${g.name}`} onClick={() => startEdit(g)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${g.name}`}
                      disabled={deletingId === g.id}
                      onClick={async () => {
                        setDeletingId(g.id);
                        try {
                          await deleteGoal(g.id);
                          toast("Goal removed");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Couldn't delete that goal");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {deletingId === g.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Progress value={pct} className="mt-4 h-2.5" />

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-bold">{formatCurrency(g.saved)}</span>
                  <span className="text-muted-foreground">of {formatCurrency(g.target)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{remaining === 0 ? "Goal complete 🎉" : `${formatCurrency(remaining)} to go`}</span>
                  <span>{daysRemainingLabel(g.deadline)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[1000, 5000, 10000].map((amt) => (
                    <Button
                      key={amt}
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      disabled={contributingId === g.id}
                      onClick={async () => {
                        setContributingId(g.id);
                        try {
                          await contribute(g.id, amt);
                          toast.success(`Added ${formatCurrency(amt)} to ${g.name}`);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Couldn't add that contribution");
                        } finally {
                          setContributingId(null);
                        }
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
      )}

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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit goal</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              setSaving(true);
              try {
                await editGoal(editing.id, editDraft);
                toast.success("Goal updated");
                setEditing(null);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Couldn't update that goal");
              } finally {
                setSaving(false);
              }
            }}
          >
            <GoalFormFields draft={editDraft} setDraft={setEditDraft} idPrefix="edit" showSaved />
            <DialogFooter>
              <Button type="submit" className="w-full rounded-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalFormFields({
  draft,
  setDraft,
  idPrefix,
  showSaved,
}: {
  draft: GoalDraft;
  setDraft: (d: GoalDraft) => void;
  idPrefix: string;
  showSaved: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[80px_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-emoji`}>Icon</Label>
          <Input
            id={`${idPrefix}-emoji`}
            maxLength={2}
            value={draft.emoji}
            onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-name`}>Goal name</Label>
          <Input
            id={`${idPrefix}-name`}
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="New bike"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-target`}>Target amount</Label>
          <Input
            id={`${idPrefix}-target`}
            type="number"
            step="0.01"
            min="0.01"
            required
            value={draft.target || ""}
            onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })}
            placeholder="150000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-deadline`}>Target date</Label>
          <Input
            id={`${idPrefix}-deadline`}
            type="date"
            value={draft.deadline}
            onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
          />
        </div>
      </div>
      {showSaved && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-saved`}>Current saved amount</Label>
          <Input
            id={`${idPrefix}-saved`}
            type="number"
            step="0.01"
            min="0"
            value={draft.saved || ""}
            onChange={(e) => setDraft({ ...draft, saved: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
      )}
    </>
  );
}
