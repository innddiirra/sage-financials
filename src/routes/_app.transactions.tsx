import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, useFinance, type Transaction, type TransactionDraft } from "@/lib/finance-store";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — piggy 🐷" },
      { name: "description", content: "Search, filter and add income and expense transactions across all your categories." },
      { property: "og:title", content: "Transactions — piggy 🐷" },
      { property: "og:description", content: "Search, filter and log every income and expense." },
    ],
  }),
  component: TransactionsPage,
});

const categories = [
  "Income",
  "Groceries",
  "Housing",
  "Transport",
  "Dining",
  "Shopping",
  "Utilities",
  "Travel",
  "Health",
  "Subscriptions",
];

const emptyDraft: TransactionDraft = {
  merchant: "",
  amount: 0,
  category: "Groceries",
  type: "expense",
  date: new Date().toISOString().slice(0, 10),
};

function TransactionsPage() {
  const { transactions, transactionsLoading, addTransaction, editTransaction, deleteTransaction } = useFinance();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<TransactionDraft>(emptyDraft);
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editDraft, setEditDraft] = useState<TransactionDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesQuery =
        t.merchant.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesQuery && matchesType && matchesCategory;
    });
  }, [transactions, query, typeFilter, categoryFilter]);

  function startEdit(t: Transaction) {
    setEditing(t);
    setEditDraft({ merchant: t.merchant, amount: t.amount, category: t.category, type: t.type, date: t.date });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Transactions 🧾</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} records</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(open) => {
          setAddOpen(open);
          if (open) setAddDraft(emptyDraft);
        }}>
          <DialogTrigger asChild>
            <Button className="shrink-0 rounded-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add transaction</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add transaction</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setAdding(true);
                try {
                  await addTransaction(addDraft);
                  toast.success("Transaction added");
                  setAddOpen(false);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Couldn't add that transaction");
                } finally {
                  setAdding(false);
                }
              }}
            >
              <TransactionFormFields draft={addDraft} setDraft={setAddDraft} idPrefix="add" />
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full" disabled={adding}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save transaction"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface-card p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative min-w-0">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search merchant or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <ul className="divide-y divide-border">
          {transactionsLoading && (
            <li className="flex items-center justify-center gap-2 px-5 py-14 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions…
            </li>
          )}
          {!transactionsLoading &&
            filtered.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    t.type === "income" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.type === "income" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.merchant}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                      {t.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                  <span
                    className={`text-sm font-bold ${t.type === "income" ? "text-success" : "text-foreground"}`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${t.merchant}`}
                    onClick={() => startEdit(t)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${t.merchant}`}
                    disabled={deletingId === t.id}
                    onClick={async () => {
                      setDeletingId(t.id);
                      try {
                        await deleteTransaction(t.id);
                        toast("Transaction removed");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Couldn't delete that transaction");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          {!transactionsLoading && filtered.length === 0 && (
            <li className="px-5 py-14 text-center text-sm text-muted-foreground">
              {transactions.length === 0
                ? "No transactions yet — add your first one above. 💸"
                : "No transactions match that search."}
            </li>
          )}
        </ul>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              setSaving(true);
              try {
                await editTransaction(editing.id, editDraft);
                toast.success("Transaction updated");
                setEditing(null);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Couldn't update that transaction");
              } finally {
                setSaving(false);
              }
            }}
          >
            <TransactionFormFields draft={editDraft} setDraft={setEditDraft} idPrefix="edit" />
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

function TransactionFormFields({
  draft,
  setDraft,
  idPrefix,
}: {
  draft: TransactionDraft;
  setDraft: (d: TransactionDraft) => void;
  idPrefix: string;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-merchant`}>Description</Label>
        <Input
          id={`${idPrefix}-merchant`}
          required
          value={draft.merchant}
          onChange={(e) => setDraft({ ...draft, merchant: e.target.value })}
          placeholder="Corner Bakery"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amount`}>Amount</Label>
          <Input
            id={`${idPrefix}-amount`}
            type="number"
            step="0.01"
            min="0.01"
            required
            value={draft.amount || ""}
            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
            placeholder="24.50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-date`}>Date</Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            required
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={draft.type}
            onValueChange={(v) => setDraft({ ...draft, type: v as "income" | "expense" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
