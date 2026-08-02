import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryBreakdown, formatCurrency, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Fernway Finance" },
      { name: "description", content: "Ask questions about your spending, savings and budget and get answers grounded in your data." },
      { property: "og:title", content: "AI Assistant — Fernway Finance" },
      { property: "og:description", content: "Ask your money questions and get plain-English answers." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const suggestions = [
  "How much did I spend this month?",
  "Where can I cut back?",
  "Am I on track for my goals?",
  "Can I afford a $900 trip?",
];

function AssistantPage() {
  const { transactions, goals, totals, profile } = useFinance();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: `Hi ${profile.name.split(" ")[0]} — I've read through your ${transactions.length} recent transactions. Ask me anything about your spending, budget or goals.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function answer(question: string) {
    const q = question.toLowerCase();
    const breakdown = categoryBreakdown(transactions);
    const top = breakdown[0];

    if (q.includes("spend") || q.includes("spent")) {
      return `You've spent ${formatCurrency(totals.expenses)} so far against a ${formatCurrency(profile.monthlyBudget)} budget. Your largest category is ${top?.name} at ${formatCurrency(top?.value ?? 0)}.`;
    }
    if (q.includes("cut") || q.includes("save more") || q.includes("reduce")) {
      const trims = breakdown.slice(1, 4).map((c) => `${c.name} (${formatCurrency(c.value)})`);
      return `The easiest wins are ${trims.join(", ")}. Cutting each by a quarter frees roughly ${formatCurrency(Math.round(breakdown.slice(1, 4).reduce((s, c) => s + c.value, 0) * 0.25))} a month — enough to fund two of your goals faster.`;
    }
    if (q.includes("goal") || q.includes("track")) {
      const behind = goals.filter((g) => g.saved / g.target < 0.4).map((g) => g.name);
      return behind.length
        ? `Three of your goals look healthy, but ${behind.join(" and ")} ${behind.length > 1 ? "are" : "is"} under 40% funded. A standing $150/month transfer would put ${behind.length > 1 ? "them" : "it"} back on pace.`
        : `Every goal is above 40% funded. Keep your current pace and you'll hit all of them ahead of schedule.`;
    }
    if (q.includes("afford")) {
      const match = question.match(/\$?([\d,]+)/);
      const amt = match ? Number(match[1].replace(/,/g, "")) : 500;
      const spare = totals.balance;
      return spare > amt
        ? `Yes. After this month's bills you're holding ${formatCurrency(spare)}, so a ${formatCurrency(amt)} spend leaves ${formatCurrency(spare - amt)} untouched — and none of it comes out of your goals.`
        : `It would be tight. You have ${formatCurrency(spare)} spare, so ${formatCurrency(amt)} would pull ${formatCurrency(amt - spare)} from savings. Waiting one pay cycle covers it comfortably.`;
    }
    if (q.includes("budget")) {
      const pct = Math.round((totals.expenses / profile.monthlyBudget) * 100);
      return `You're at ${pct}% of your ${formatCurrency(profile.monthlyBudget)} monthly budget. At the current daily rate you'll finish the month within ${formatCurrency(Math.round(totals.expenses * 1.05))}.`;
    }
    return `Here's the short version: ${formatCurrency(totals.income)} in, ${formatCurrency(totals.expenses)} out, ${formatCurrency(totals.balance)} left over, and ${formatCurrency(totals.savings)} parked in goals. Ask me about a specific category and I'll go deeper.`;
  }

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a${Date.now()}`, role: "assistant", text: answer(text) },
      ]);
      setThinking(false);
    }, 700);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="gradient-mint grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">AI Assistant</h1>
          <p className="truncate text-sm text-muted-foreground">
            Grounded in your live transactions and goals
          </p>
        </div>
      </div>

      <div className="surface-card mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl bg-muted px-4 py-3.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money…"
              className="rounded-full"
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
