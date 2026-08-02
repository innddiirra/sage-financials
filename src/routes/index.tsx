import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fernway — AI Personal Finance Tracker" },
      {
        name: "description",
        content:
          "Track spending, grow savings goals and get plain-English money advice from an AI assistant that understands your accounts.",
      },
      { property: "og:title", content: "Fernway — AI Personal Finance Tracker" },
      {
        property: "og:description",
        content: "Track spending, grow savings and get AI money advice in plain English.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BarChart3,
    title: "Live spending clarity",
    body: "Every transaction categorised automatically, with monthly trends you can actually read.",
  },
  {
    icon: PiggyBank,
    title: "Goals that finish",
    body: "Set a target, get a weekly contribution plan, and watch the progress bar fill up.",
  },
  {
    icon: Bot,
    title: "An assistant on call",
    body: "Ask “can I afford Tokyo in April?” and get an answer grounded in your real numbers.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Bank-grade encryption, read-only connections, and data you can delete in one tap.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="gradient-mint grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
              <Wallet className="h-4.5 w-4.5" />
            </span>
            <span className="truncate text-lg font-bold">Fernway</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="gradient-hero relative overflow-hidden text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> AI money coach included
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
              Your money, finally making sense.
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-foreground/75 sm:text-lg">
              Fernway watches your spending, protects your goals, and tells you exactly what to do
              next — in language you don't need a finance degree to understand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/register">
                  Create free account <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/25 bg-transparent text-ink-foreground hover:bg-primary-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/dashboard">View live demo</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-foreground/70">
              {["No card required", "Cancel anytime", "Read-only bank sync"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 shadow-lift backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-wide text-ink-foreground/60 uppercase">
              This month
            </p>
            <p className="mt-1 text-4xl font-extrabold">$6,220.00</p>
            <p className="text-sm text-primary">+8.4% vs. last month</p>
            <div className="mt-6 space-y-3">
              {[
                { label: "Housing", value: 45 },
                { label: "Groceries", value: 22 },
                { label: "Travel", value: 14 },
                { label: "Everything else", value: 19 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-foreground/80">{row.label}</span>
                    <span className="font-semibold">{row.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-primary-foreground/15">
                    <div
                      className="gradient-mint h-2 rounded-full"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-primary-foreground/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> AI insight
              </p>
              <p className="mt-1.5 text-ink-foreground/75">
                Move $180 from checking to your Japan trip goal and you'll hit the target six weeks
                early.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          Everything a spreadsheet promised, without the spreadsheet.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="gradient-hero flex flex-col items-start gap-6 rounded-3xl px-6 py-12 text-ink-foreground sm:px-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Start with your next paycheck.</h2>
            <p className="mt-2 max-w-md text-ink-foreground/75">
              Set up in under three minutes. Your first AI review lands the same day.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/register">
              Get started free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Fernway Finance</p>
          <p>Built for people who'd rather not think about budgets.</p>
        </div>
      </footer>
    </div>
  );
}
