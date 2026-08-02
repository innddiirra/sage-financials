import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bot, Check, PiggyBank, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/Sticker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "piggy 🐷 — money tracking that's actually cute" },
      {
        name: "description",
        content:
          "Track spending, hit savings goals, and get plain-English AI money advice from a tracker that doesn't feel like homework.",
      },
      { property: "og:title", content: "piggy 🐷 — money tracking that's actually cute" },
      {
        property: "og:description",
        content: "Track spending, hit savings goals, and get AI money advice — no cap.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BarChart3,
    title: "Spending, but make it clear",
    body: "Every purchase auto-sorted into categories, with monthly trends you can actually read at a glance.",
    sticker: "📊",
  },
  {
    icon: PiggyBank,
    title: "Goals that actually finish",
    body: "Set a target, get a weekly plan, and watch the progress bar fill up like a little dopamine hit.",
    sticker: "🎯",
  },
  {
    icon: Bot,
    title: "An assistant on speed dial",
    body: "Ask “can I afford Tokyo in April?” and get a real answer, grounded in your real numbers.",
    sticker: "🤖",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Bank-grade encryption, read-only connections, and data you can delete whenever you want.",
    sticker: "🔒",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="gradient-mint grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg">
              🐷
            </span>
            <span className="truncate text-lg font-bold">piggy</span>
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
        <Sticker
          emoji="✨"
          variant="sunshine"
          rotate={-14}
          wiggle
          className="absolute top-16 left-6 hidden sm:grid"
        />
        <Sticker
          emoji="💸"
          variant="mint"
          size="lg"
          rotate={10}
          className="absolute right-8 bottom-10 hidden lg:grid"
        />
        <Sticker emoji="🧋" variant="lavender" rotate={-8} className="absolute top-28 right-24 hidden lg:grid" />

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> your AI money bestie, included
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Your money, but make it cute. 🐷
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-foreground/75 sm:text-lg">
              piggy watches your spending, hypes up your goals, and tells you exactly what to do
              next — zero finance-bro jargon, zero boring spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/register">
                  Start for free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/25 bg-transparent text-ink-foreground hover:bg-primary-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/dashboard">Peek the demo</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-foreground/70">
              {["No card required", "Cancel anytime", "It's actually free"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 shadow-lift backdrop-blur-sm">
            <Sticker emoji="🎀" variant="sunshine" rotate={12} size="sm" className="absolute -top-4 -right-4 grid" />
            <p className="text-xs font-semibold tracking-wide text-ink-foreground/60 uppercase">
              This month
            </p>
            <p className="mt-1 text-4xl font-bold">$6,220.00</p>
            <p className="text-sm text-primary">+8.4% vs. last month, let's gooo</p>
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
                early. Secure the bag. ✈️
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Sticker emoji="🌈" variant="lavender" rotate={-10} className="absolute top-6 right-4 hidden sm:grid" />
        <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">
          Everything a spreadsheet promised, without the spreadsheet.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="surface-card relative overflow-visible p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <Sticker
                emoji={f.sticker}
                variant="sunshine"
                size="sm"
                rotate={10}
                className="absolute -top-3 -right-3 grid"
              />
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="gradient-hero relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl px-6 py-12 text-ink-foreground sm:px-12 md:flex-row md:items-center md:justify-between">
          <Sticker emoji="🐷" variant="cream" size="lg" rotate={-8} className="absolute -top-6 -right-6 hidden sm:grid" />
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Start with your next paycheck.</h2>
            <p className="mt-2 max-w-md text-ink-foreground/75">
              Set up in under three minutes. Your first AI check-in lands the same day.
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
          <p>© 2026 piggy 🐷</p>
          <p>Made for people who'd rather not think about budgets.</p>
        </div>
      </footer>
    </div>
  );
}
