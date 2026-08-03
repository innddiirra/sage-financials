import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  PiggyBank,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
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
  monthlySeries,
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

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
};

function ChartEmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="max-w-[220px] text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Dashboard() {
  const { transactions, transactionsLoading, goals, totals, profile } = useFinance();
  const breakdown = categoryBreakdown(transactions);
  const series = monthlySeries(transactions);
  const hasAnyTransactions = transactions.length > 0;
  const hasSeriesData = series.some((m) => m.income > 0 || m.expenses > 0);
  const budgetUsed = Math.min(100, Math.round((totals.expenses / profile.monthlyBudget) * 100));

  const stats = [
    { label: "Current balance", value: totals.balance, icon: Wallet, tone: "text-foreground", caption: "All-time" },
    { label: "Total income", value: totals.income, icon: ArrowUpRight, tone: "text-success", caption: "All-time" },
    { label: "Total expenses", value: totals.expenses, icon: ArrowDownRight, tone: "text-destructive", caption: "All-time" },
    {
      label: "Monthly savings",
      value: totals.monthlySavings,
      icon: PiggyBank,
      tone: totals.monthlySavings >= 0 ? "text-primary" : "text-destructive",
      caption: "This month",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Your money, at a glance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} overview
          </p>
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
            {transactionsLoading ? (
              <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <p className={`mt-2 text-2xl font-extrabold ${s.label === "Monthly savings" ? s.tone : ""}`}>
                {formatCurrency(s.value)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{s.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Income vs. expenses</h2>
            <Badge variant="secondary" className="shrink-0">
              Last 6 months
            </Badge>
          </div>
          <div className="mt-4 h-64 w-full">
            {transactionsLoading ? (
              <div className="grid h-full place-items-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasSeriesData ? (
              <ChartEmptyState emoji="📊" text="Add a transaction to see income vs. expenses by month." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ left: -18, right: 6, top: 8 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-bold">Where it went</h2>
          <div className="mt-2 h-44 w-full">
            {transactionsLoading ? (
              <div className="grid h-full place-items-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : breakdown.length === 0 ? (
              <ChartEmptyState emoji="🍩" text="No expenses yet — add one to see the breakdown." />
            ) : (
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
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {breakdown.length > 0 && (
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
          )}
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-base font-bold">Monthly spending</h2>
        <p className="mt-1 text-sm text-muted-foreground">Total expenses per month, last 6 months</p>
        <div className="mt-4 h-56 w-full">
          {transactionsLoading ? (
            <div className="grid h-full place-items-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasSeriesData ? (
            <ChartEmptyState emoji="🧾" text="No spending yet — it'll show up here once you add a transaction." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -18, right: 6, top: 8 }}>
                <defs>
                  <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Spending"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  fill="url(#spend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
              const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
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
            {goals.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">
                No goals yet — create one on the Savings Goals page. 🎯
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-bold">Recent transactions</h2>
        </div>
        <ul className="divide-y divide-border">
          {transactionsLoading && (
            <li className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions…
            </li>
          )}
          {!transactionsLoading &&
            transactions.slice(0, 6).map((t) => (
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
          {!transactionsLoading && !hasAnyTransactions && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No transactions yet — add your first one on the Transactions page. 💸
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
