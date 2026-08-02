import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

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

const seedTransactions: Transaction[] = [
  { id: "t1", date: "2026-07-30", merchant: "Monthly salary", category: "Income", type: "income", amount: 5400 },
  { id: "t2", date: "2026-07-29", merchant: "Whole Foods Market", category: "Groceries", type: "expense", amount: 142.35 },
  { id: "t3", date: "2026-07-28", merchant: "Northline Apartments", category: "Housing", type: "expense", amount: 1850 },
  { id: "t4", date: "2026-07-27", merchant: "Lyft", category: "Transport", type: "expense", amount: 24.8 },
  { id: "t5", date: "2026-07-26", merchant: "Freelance design", category: "Income", type: "income", amount: 820 },
  { id: "t6", date: "2026-07-25", merchant: "Spotify", category: "Subscriptions", type: "expense", amount: 11.99 },
  { id: "t7", date: "2026-07-24", merchant: "Blue Bottle Coffee", category: "Dining", type: "expense", amount: 18.4 },
  { id: "t8", date: "2026-07-22", merchant: "Con Edison", category: "Utilities", type: "expense", amount: 96.2 },
  { id: "t9", date: "2026-07-20", merchant: "Nike Store", category: "Shopping", type: "expense", amount: 210 },
  { id: "t10", date: "2026-07-18", merchant: "Delta Airlines", category: "Travel", type: "expense", amount: 348.6 },
  { id: "t11", date: "2026-07-15", merchant: "Trader Joe's", category: "Groceries", type: "expense", amount: 88.15 },
  { id: "t12", date: "2026-07-12", merchant: "Equinox", category: "Health", type: "expense", amount: 132 },
];

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
  goals: Goal[];
  profile: Profile;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  contribute: (id: string, amount: number) => void;
  updateProfile: (p: Partial<Profile>) => void;
  totals: { income: number; expenses: number; balance: number; savings: number };
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [profile, setProfile] = useState<Profile>({
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    currency: "USD",
    monthlyBudget: 4500,
    aiInsights: true,
    alerts: true,
  });

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const savings = goals.reduce((s, g) => s + g.saved, 0);
    return { income, expenses, balance: income - expenses, savings };
  }, [transactions, goals]);

  const value: Store = {
    transactions,
    goals,
    profile,
    totals,
    addTransaction: (t) =>
      setTransactions((prev) => [{ ...t, id: `t${Date.now()}` }, ...prev]),
    deleteTransaction: (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
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
