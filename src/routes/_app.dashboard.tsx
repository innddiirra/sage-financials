import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sticker } from "@/components/Sticker";
import {
  categoryBreakdown,
  categoryColors,
  formatCurrency,
  monthlyTrend,
  useFinance,
} from "@/lib/finance-store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — piggy 🐷" },
      { name: "description", content: "See your balance, income, spending trends and savings progress at a glance." },
      { property: "og:title", content: "Dashboard — piggy 🐷" },
      { property: "og:description", content: "Balance, spending trends and savings progress at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { transactions, goals, totals, profile } = useFinance();
  const breakdown = categoryBreakdown(transactions);
  const budgetUsed = Math.min(100, Math.round((totals.expenses / profile.monthlyBudget) * 100));

  const stats = [
    { label: "Total balance", value: totals.balance, icon: Wallet, tone: "text-foreground", delta: "+8.4%" },
    { label: "Income", value: totals.income, icon: ArrowUpRight, tone: "text-success", delta: "+3.1%" },
    { label: "Expenses", value: totals.expenses, icon: ArrowDownRight, tone: "text-destructive", delta: "-2.4%" },
    { label: "Saved in goals", value: totals.savings, icon: PiggyBank, tone: "text-primary", delta: "+12%" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Your money, at a glance</h1>
          <p className="mt-1 text-sm text-muted-foreground">July 2026 overview</p>
        </div>
        <Sticker emoji="💸" variant="sunshine" size="sm" rotate={-8} className="hidden sm:grid" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 shrink-0 ${s.tone}`} />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(s.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.delta} vs. last month</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Income vs. expenses</h2>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <TrendingUp className="h-3 w-3" /> 6 months
            </Badge>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ left: -18, right: 6, top: 8 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#inc)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  fill="url(#exp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-bold">Where it went</h2>
          <div className="mt-2 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {breakdown.slice(0, 4).map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: categoryColors[i % categoryColors.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{c.name}</span>
                <span className="shrink-0 font-semibold">{formatCurrency(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="surface-card p-5">
          <h2 className="text-base font-bold">Monthly budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(totals.expenses)} of {formatCurrency(profile.monthlyBudget)} used
          </p>
          <Progress value={budgetUsed} className="mt-4 h-2.5" />
          <p className="mt-2 text-xs text-muted-foreground">{budgetUsed}% of the budget spent</p>

          <div className="mt-5 rounded-2xl bg-accent p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
              <Sparkles className="h-4 w-4" /> AI insight
            </p>
            <p className="mt-1.5 text-sm text-accent-foreground/85">
              Dining and shopping are up 19% this month. Trimming two takeout orders a week keeps
              you inside budget without touching your goals.
            </p>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-bold">Goal progress</h2>
          <ul className="mt-4 space-y-4">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.round((g.saved / g.target) * 100);
              return (
                <li key={g.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">
                      {g.emoji} {g.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">Recent activity</h2>
        </div>
        <ul className="divide-y divide-border">
          {transactions.slice(0, 6).map((t) => (
            <li key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
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
                <p className="truncate text-sm font-medium">{t.merchant}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.category} · {t.date}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  t.type === "income" ? "text-success" : "text-foreground"
                }`}
              >
                {t.type === "income" ? "+" : "−"}
                {formatCurrency(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
