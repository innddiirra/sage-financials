import type { WishlistItem } from "@/lib/wishlist";

export type WishlistCategory = "affordable" | "save_more" | "move_to_goal";

export type CategorizedWishlistItem = WishlistItem & { category: WishlistCategory };

export type WishlistBudget = {
  balance: number;
  /** A month's income — the line past which something isn't a "this month" purchase. */
  salary: number;
  /** True when there's no income logged this month, so `salary` is an average instead. */
  salaryIsEstimate: boolean;
  savingsReserve: number;
  groceryReserve: number;
  groceryPercent: number;
  availableThisMonth: number;
};

const SAVINGS_PERCENT = 0.2;

/**
 * Splits the current balance the way the user described: 20% locked away in
 * savings (untouched), a grocery percentage reserved next, and whatever's
 * left is what's actually free to spend on wishlist items this month.
 */
export function computeWishlistBudget(
  balance: number,
  monthlyIncome: number,
  incomeHistory: { income: number }[],
  groceryPercent: number,
): WishlistBudget {
  let salary = monthlyIncome;
  let salaryIsEstimate = false;

  if (salary <= 0) {
    const nonZeroMonths = incomeHistory.filter((m) => m.income > 0);
    salary = nonZeroMonths.length
      ? nonZeroMonths.reduce((sum, m) => sum + m.income, 0) / nonZeroMonths.length
      : 0;
    salaryIsEstimate = true;
  }

  const safeBalance = Math.max(0, balance);
  const savingsReserve = safeBalance * SAVINGS_PERCENT;
  const afterSavings = Math.max(0, safeBalance - savingsReserve);
  const groceryReserve = afterSavings * (groceryPercent / 100);
  const availableThisMonth = Math.max(0, afterSavings - groceryReserve);

  return { balance, salary, salaryIsEstimate, savingsReserve, groceryReserve, groceryPercent, availableThisMonth };
}

/**
 * Buckets wishlist items into three groups:
 * - `move_to_goal`: costs more than a month's salary — needs multi-month saving.
 * - `affordable`: fits within what's free to spend this month (cheapest items
 *   claim the budget first, so two items that both "fit" alone but not together
 *   don't both get marked affordable).
 * - `save_more`: within a normal month's salary, just not free cash right now.
 */
export function categorizeWishlistItems(
  items: WishlistItem[],
  budget: WishlistBudget,
): CategorizedWishlistItem[] {
  const cheapestFirst = [...items].sort((a, b) => a.cost - b.cost);
  let runningAvailable = budget.availableThisMonth;

  return cheapestFirst.map((item) => {
    let category: WishlistCategory;
    if (budget.salary > 0 && item.cost > budget.salary) {
      category = "move_to_goal";
    } else if (item.cost <= runningAvailable) {
      category = "affordable";
      runningAvailable -= item.cost;
    } else {
      category = "save_more";
    }
    return { ...item, category };
  });
}
