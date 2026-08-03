import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  deleteGoal as deleteGoalRow,
  fetchGoals,
  insertGoal,
  updateGoal as updateGoalRow,
  type Goal,
  type GoalDraft,
} from "@/lib/goals";
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

export type { Transaction, TransactionDraft, Goal, GoalDraft };

export type Profile = {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  aiInsights: boolean;
  alerts: boolean;
};

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
  goalsLoading: boolean;
  profile: Profile;
  addTransaction: (t: TransactionDraft) => Promise<void>;
  editTransaction: (id: string, patch: Partial<TransactionDraft>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (g: GoalDraft) => Promise<void>;
  editGoal: (id: string, patch: Partial<GoalDraft>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savings: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
  };
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    name: user?.user_metadata?.["full_name"] ?? "there",
    email: user?.email ?? "",
    currency: "INR",
    monthlyBudget: 45000,
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

  // Same pattern as transactions: load this user's goals and keep them live
  // via Supabase Realtime.
  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    let cancelled = false;
    setGoalsLoading(true);

    fetchGoals(userId)
      .then((rows) => {
        if (!cancelled) setGoals(rows);
      })
      .catch((err) => {
        console.error("Failed to load goals", err);
      })
      .finally(() => {
        if (!cancelled) setGoalsLoading(false);
      });

    const channel = supabase
      .channel(`savings-goals-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "savings_goals", filter: `user_id=eq.${userId}` },
        () => {
          fetchGoals(userId)
            .then((rows) => {
              if (!cancelled) setGoals(rows);
            })
            .catch((err) => console.error("Failed to refresh goals", err));
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

    const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const thisMonth = transactions.filter((t) => t.date.slice(0, 7) === currentMonthKey);
    const monthlyIncome = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      savings,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings: monthlyIncome - monthlyExpenses,
    };
  }, [transactions, goals]);

  const value: Store = {
    transactions,
    transactionsLoading,
    goals,
    goalsLoading,
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
    addGoal: async (draft) => {
      if (!userId) return;
      const created = await insertGoal(userId, draft);
      setGoals((prev) => [...prev, created]);
    },
    editGoal: async (id, patch) => {
      const updated = await updateGoalRow(id, patch);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    },
    deleteGoal: async (id) => {
      await deleteGoalRow(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    contribute: async (id, amount) => {
      const current = goals.find((g) => g.id === id);
      if (!current) return;
      const updated = await updateGoalRow(id, { saved: Math.min(current.target, current.saved + amount) });
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    },
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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/**
 * Buckets transactions into the last `months` calendar months (oldest
 * first), summing income/expenses per month. Months with no transactions
 * still appear with zero values, so charts always have a consistent shape.
 */
export function monthlySeries(transactions: Transaction[], months = 6) {
  const now = new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
      income: 0,
      expenses: 0,
    };
  });

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const t of transactions) {
    const bucket = byKey.get(t.date.slice(0, 7));
    if (!bucket) continue; // outside the window shown
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expenses += t.amount;
  }

  return buckets.map(({ key: _key, ...rest }) => rest);
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
