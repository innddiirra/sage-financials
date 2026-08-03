import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Bot, PiggyBank, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/Sticker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "piggy 🐷" },
      { name: "description", content: "My personal spending tracker." },
    ],
  }),
  component: Landing,
});

const whatItDoes = [
  { icon: BarChart3, text: "See where my money actually goes each month" },
  { icon: PiggyBank, text: "Save toward specific goals instead of vaguely" },
  { icon: Bot, text: "Ask AI about my spending instead of doing math" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2.5">
            <span className="gradient-mint grid h-8 w-8 place-items-center rounded-full text-base">🐷</span>
            <span className="text-base font-bold">piggy</span>
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Sticker emoji="✨" variant="sunshine" rotate={-12} className="absolute top-8 right-6 hidden sm:grid" />
        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">A personal money tracker, just for me. 🐷</h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          piggy is where I keep tabs on my spending, put money toward actual goals, and get a plain-English
          nudge from AI before I overspend. Nothing fancy, just mine.
        </p>
        <Button asChild size="lg" className="mt-7 rounded-full">
          <Link to="/login">Log in</Link>
        </Button>

        <ul className="mt-10 space-y-3">
          {whatItDoes.map((item) => (
            <li key={item.text} className="surface-card flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-sm">{item.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Setting this up on a new device?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create the account
          </Link>
        </div>
      </section>
    </div>
  );
}
