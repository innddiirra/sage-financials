import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { formatCurrency, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Fernway Finance" },
      { name: "description", content: "Search, filter and add income and expense transactions across all your categories." },
      { property: "og:title", content: "Transactions — Fernway Finance" },
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

function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    merchant: "",
    amount: "",
    category: "Groceries",
    type: "expense" as "income" | "expense",
    date: "2026-07-31",
  });

  const filtered = transactions.filter((t) => {
    const matchesQuery =
      t.merchant.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase());
    const matchesType = filter === "all" || t.type === filter;
    return matchesQuery && matchesType;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
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
              onSubmit={(e) => {
                e.preventDefault();
                addTransaction({
                  merchant: draft.merchant,
                  category: draft.category,
                  type: draft.type,
                  date: draft.date,
                  amount: Number(draft.amount),
                });
                toast.success("Transaction added");
                setOpen(false);
                setDraft({ ...draft, merchant: "", amount: "" });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="merchant">Description</Label>
                <Input
                  id="merchant"
                  required
                  value={draft.merchant}
                  onChange={(e) => setDraft({ ...draft, merchant: e.target.value })}
                  placeholder="Corner Bakery"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                    placeholder="24.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
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
                  <Select
                    value={draft.category}
                    onValueChange={(v) => setDraft({ ...draft, category: v })}
                  >
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
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">
                  Save transaction
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface-card p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search merchant or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <ul className="divide-y divide-border">
          {filtered.map((t) => (
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
                  aria-label={`Delete ${t.merchant}`}
                  onClick={() => {
                    deleteTransaction(t.id);
                    toast("Transaction removed");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-14 text-center text-sm text-muted-foreground">
              No transactions match that search.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
