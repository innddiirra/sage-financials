import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Link2,
  Loader2,
  Pencil,
  PiggyBank,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { formatCurrency, monthlySeries, useFinance, type WishlistDraft, type WishlistItem } from "@/lib/finance-store";
import { analyzeProductLink } from "@/lib/wishlist-link";
import {
  categorizeWishlistItems,
  computeWishlistBudget,
  type CategorizedWishlistItem,
  type WishlistCategory,
} from "@/lib/wishlist-budget";

export const Route = createFileRoute("/_app/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — piggy 🐷" },
      {
        name: "description",
        content: "Add things you want, paste a product link, and see what actually fits this month's budget.",
      },
      { property: "og:title", content: "Wishlist — piggy 🐷" },
      { property: "og:description", content: "See what fits this month's budget, and what needs a savings goal." },
    ],
  }),
  component: WishlistPage,
});

const emptyDraft: WishlistDraft = { name: "", cost: 0, imageUrl: "", sourceUrl: "" };

const SECTIONS: { key: WishlistCategory; title: string; emoji: string; blurb: string }[] = [
  {
    key: "affordable",
    title: "Affordable this month",
    emoji: "✅",
    blurb: "Fits inside what's free to spend after savings and groceries.",
  },
  {
    key: "save_more",
    title: "Save a bit more",
    emoji: "⏳",
    blurb: "Within a normal month's budget, just not free cash right now.",
  },
  {
    key: "move_to_goal",
    title: "Needs a savings goal",
    emoji: "🎯",
    blurb: "Costs more than a month's income — worth saving toward over time.",
  },
];

function WishlistPage() {
  const {
    wishlist,
    wishlistLoading,
    addWishlistItem,
    editWishlistItem,
    deleteWishlistItem,
    moveWishlistItemToGoal,
    transactions,
    totals,
    profile,
    updateProfile,
  } = useFinance();

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<WishlistDraft>(emptyDraft);
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [editDraft, setEditDraft] = useState<WishlistDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const budget = useMemo(
    () => computeWishlistBudget(totals.balance, totals.monthlyIncome, monthlySeries(transactions), profile.groceryReservePercent),
    [totals.balance, totals.monthlyIncome, transactions, profile.groceryReservePercent],
  );
  const categorized = useMemo(() => categorizeWishlistItems(wishlist, budget), [wishlist, budget]);

  function startEdit(item: WishlistItem) {
    setEditing(item);
    setEditDraft({ name: item.name, cost: item.cost, imageUrl: item.imageUrl ?? "", sourceUrl: item.sourceUrl ?? "" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Wishlist 🎁</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
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
              <span className="hidden sm:inline">Add item</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add a wishlist item</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setAdding(true);
                try {
                  await addWishlistItem(addDraft);
                  toast.success("Added to your wishlist");
                  setAddOpen(false);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Couldn't add that item");
                } finally {
                  setAdding(false);
                }
              }}
            >
              <WishlistFormFields draft={addDraft} setDraft={setAddDraft} idPrefix="add" />
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full" disabled={adding}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to wishlist"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">This month's budget</h2>
          <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
            {[10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => updateProfile({ groceryReservePercent: pct })}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  profile.groceryReservePercent === pct
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pct}% groceries
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <BudgetStat label="Current balance" value={formatCurrency(budget.balance)} />
          <BudgetStat label="Savings (20%, untouched)" value={formatCurrency(budget.savingsReserve)} />
          <BudgetStat label={`Groceries (${budget.groceryPercent}%)`} value={formatCurrency(budget.groceryReserve)} />
          <BudgetStat label="Free for wishlist" value={formatCurrency(budget.availableThisMonth)} highlight />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {budget.salary > 0
            ? `Comparing item costs against ${budget.salaryIsEstimate ? "your average" : "this month's"} income of ${formatCurrency(budget.salary)}${budget.salaryIsEstimate ? " (estimated from past months, since nothing's logged yet this month)" : ""}.`
            : "Log an income transaction so piggy knows what a month's salary looks like for you."}
        </p>
      </div>

      {wishlistLoading && (
        <div className="surface-card flex items-center justify-center gap-2 p-14 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your wishlist…
        </div>
      )}

      {!wishlistLoading && wishlist.length === 0 && (
        <div className="surface-card p-14 text-center text-sm text-muted-foreground">
          Nothing on your wishlist yet — paste a product link or add one manually above. 🎁
        </div>
      )}

      {!wishlistLoading &&
        wishlist.length > 0 &&
        SECTIONS.map((section) => {
          const items = categorized.filter((i) => i.category === section.key);
          return (
            <div key={section.key} className="space-y-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <span>{section.emoji}</span> {section.title}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                    {items.length}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">{section.blurb}</p>
              </div>
              {items.length === 0 ? (
                <div className="surface-card p-6 text-center text-sm text-muted-foreground">Nothing here right now.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      onEdit={() => startEdit(item)}
                      deleting={deletingId === item.id}
                      onDelete={async () => {
                        setDeletingId(item.id);
                        try {
                          await deleteWishlistItem(item.id);
                          toast("Removed from wishlist");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Couldn't remove that item");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      moving={movingId === item.id}
                      onMoveToGoal={
                        item.category === "move_to_goal"
                          ? async () => {
                              setMovingId(item.id);
                              try {
                                await moveWishlistItemToGoal(item.id);
                                toast.success(`Created a savings goal for ${item.name}`);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Couldn't create that goal");
                              } finally {
                                setMovingId(null);
                              }
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit wishlist item</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              setSaving(true);
              try {
                await editWishlistItem(editing.id, editDraft);
                toast.success("Item updated");
                setEditing(null);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Couldn't update that item");
              } finally {
                setSaving(false);
              }
            }}
          >
            <WishlistFormFields draft={editDraft} setDraft={setEditDraft} idPrefix="edit" />
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

function BudgetStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${highlight ? "bg-accent" : "bg-muted"}`}>
      <p className={`text-xs ${highlight ? "text-accent-foreground/80" : "text-muted-foreground"}`}>{label}</p>
      <p className={`mt-1 text-base font-bold ${highlight ? "text-accent-foreground" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function WishlistCard({
  item,
  onEdit,
  onDelete,
  deleting,
  onMoveToGoal,
  moving,
}: {
  item: CategorizedWishlistItem;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  onMoveToGoal?: () => void;
  moving: boolean;
}) {
  return (
    <div className="surface-card flex gap-3 p-4">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-accent text-2xl">
          <ShoppingBag className="h-6 w-6 text-accent-foreground" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-bold hover:underline"
              >
                {item.name}
              </a>
            ) : (
              <p className="truncate text-sm font-bold">{item.name}</p>
            )}
            <p className="text-base font-extrabold text-primary">{formatCurrency(item.cost)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`} onClick={onEdit}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} disabled={deleting} onClick={onDelete}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        {onMoveToGoal && (
          <Button size="sm" className="mt-2 rounded-full" disabled={moving} onClick={onMoveToGoal}>
            {moving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <PiggyBank className="h-3.5 w-3.5" /> Move to savings goal <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function WishlistFormFields({
  draft,
  setDraft,
  idPrefix,
}: {
  draft: WishlistDraft;
  setDraft: (d: WishlistDraft) => void;
  idPrefix: string;
}) {
  const [analyzing, setAnalyzing] = useState(false);

  async function handleAnalyze() {
    if (!draft.sourceUrl.trim()) {
      toast.error("Paste a product link first");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeProductLink({ data: { url: draft.sourceUrl.trim() } });
      setDraft({
        ...draft,
        name: result.name ?? draft.name,
        cost: result.price ?? draft.cost,
        imageUrl: result.imageUrl ?? draft.imageUrl,
      });
      if (!result.price) {
        toast("Got the name/image — I couldn't find a price, so add that part manually.");
      } else {
        toast.success("Link analyzed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't analyze that link");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-url`}>Product link (optional)</Label>
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-url`}
            type="url"
            value={draft.sourceUrl}
            onChange={(e) => setDraft({ ...draft, sourceUrl: e.target.value })}
            placeholder="https://example.com/product"
          />
          <Button type="button" variant="secondary" className="shrink-0" disabled={analyzing} onClick={handleAnalyze}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            <span className="hidden sm:inline">Analyze</span>
          </Button>
        </div>
        {draft.imageUrl && (
          <img src={draft.imageUrl} alt="" className="mt-1 h-20 w-20 rounded-xl object-cover" />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Item name</Label>
        <Input
          id={`${idPrefix}-name`}
          required
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Noise-cancelling headphones"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-cost`}>Cost</Label>
        <Input
          id={`${idPrefix}-cost`}
          type="number"
          step="0.01"
          min="0.01"
          required
          value={draft.cost || ""}
          onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) })}
          placeholder="2499"
        />
      </div>
    </>
  );
}
