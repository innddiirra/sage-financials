import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  deleteTransaction as deleteTransactionRow,
  fetchTransactions,
  insertTransaction,
  sortTransactions,
  updateTransaction as updateTransactionRow,
  type Transaction,
  type TransactionDraft,
} from "@/lib/transactions";

export type { Transaction, TransactionDraft };

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  emoji: string;
};

export type Profile = {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  aiInsights: boolean;
  alerts: boolean;
};

const seedGoals: Goal[] = [
  { id: "g1", name: "Emergency fund", target: 12000, saved: 8450, deadline: "Dec 2026", emoji: "🛟" },
  { id: "g2", name: "Japan trip", target: 5000, saved: 2150, deadline: "Apr 2027", emoji: "🗼" },
  { id: "g3", name: "New laptop", target: 2600, saved: 1980, deadline: "Oct 2026", emoji: "💻" },
  { id: "g4", name: "Down payment", target: 45000, saved: 9600, deadline: "Jun 2029", emoji: "🏡" },
];

export const monthlyTrend = [
  { month: "Feb", income: 5600, expenses: 3980 },
  { month: "Mar", income: 5900, expenses: 4310 },
  { month: "Apr", income: 5750, expenses: 3720 },
  { month: "May", income: 6200, expenses: 4480 },
  { month: "Jun", income: 6050, expenses: 3890 },
  { month: "Jul", income: 6220, expenses: 4102 },
];

export const categoryColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type Store = {
  transactions: Transaction[];
  transactionsLoading: boolean;
  goals: Goal[];
  profile: Profile;
  addTransaction: (t: TransactionDraft) => Promise<void>;
  editTransaction: (id: string, patch: Partial<TransactionDraft>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id">) => void;
  contribute: (id: string, amount: number) => void;
  updateProfile: (p: Partial<Profile>) => void;
  totals: { income: number; expenses: number; balance: number; savings: number };
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [profile, setProfile] = useState<Profile>({
    name: user?.user_metadata?.["full_name"] ?? "there",
    email: user?.email ?? "",
    currency: "USD",
    monthlyBudget: 4500,
    aiInsights: true,
    alerts: true,
  });

  // Keep the display name/email in sync if the auth user changes.
  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      name: (user.user_metadata?.["full_name"] as string | undefined) || prev.name,
      email: user.email ?? prev.email,
    }));
  }, [user]);

  // Load this user's transactions, and keep them live via Supabase Realtime so
  // the Dashboard updates automatically whenever transactions change —
  // including from another tab or device.
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setTransactionsLoading(false);
      return;
    }

    let cancelled = false;
    setTransactionsLoading(true);

    fetchTransactions(userId)
      .then((rows) => {
        if (cancelled) return;
        setTransactions(rows);
      })
      .catch((err) => {
        console.error("Failed to load transactions", err);
      })
      .finally(() => {
        if (!cancelled) setTransactionsLoading(false);
      });

    const channel = supabase
      .channel(`transactions-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => {
          // Re-fetch on any change (insert/update/delete) so every consumer
          // of this store — dashboard included — re-renders with fresh data.
          fetchTransactions(userId)
            .then((rows) => {
              if (!cancelled) setTransactions(rows);
            })
            .catch((err) => console.error("Failed to refresh transactions", err));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const savings = goals.reduce((s, g) => s + g.saved, 0);
    return { income, expenses, balance: income - expenses, savings };
  }, [transactions, goals]);

  const value: Store = {
    transactions,
    transactionsLoading,
    goals,
    profile,
    totals,
    addTransaction: async (draft) => {
      if (!userId) return;
      const created = await insertTransaction(userId, draft);
      setTransactions((prev) => sortTransactions([created, ...prev]));
    },
    editTransaction: async (id, patch) => {
      const updated = await updateTransactionRow(id, patch);
      setTransactions((prev) => sortTransactions(prev.map((t) => (t.id === id ? updated : t))));
    },
    deleteTransaction: async (id) => {
      await deleteTransactionRow(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    addGoal: (g) => setGoals((prev) => [...prev, { ...g, id: `g${Date.now()}` }]),
    contribute: (id, amount) =>
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)),
      ),
    updateProfile: (p) => setProfile((prev) => ({ ...prev, ...p })),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function categoryBreakdown(transactions: Transaction[]) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}
