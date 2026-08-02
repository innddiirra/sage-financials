import { supabase } from "@/lib/supabase";

/** Shape of a row exactly as stored in public.transactions. */
type TransactionRow = {
  id: string;
  user_id: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
};

/** App-facing shape, kept close to the existing mock data so the UI doesn't change. */
export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

export type TransactionDraft = {
  date: string;
  merchant: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.transaction_date,
    merchant: row.description,
    category: row.category,
    type: row.type === "Income" ? "income" : "expense",
    amount: Number(row.amount),
  };
}

function draftToRow(userId: string, draft: TransactionDraft) {
  return {
    user_id: userId,
    amount: draft.amount,
    type: draft.type === "income" ? "Income" : "Expense",
    category: draft.category,
    description: draft.merchant,
    transaction_date: draft.date,
  } as const;
}

const SELECT_COLUMNS = "id, user_id, amount, type, category, description, transaction_date, created_at";
const ORDER = { column: "transaction_date", ascending: false } as const;

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order(ORDER.column, { ascending: ORDER.ascending })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as TransactionRow[]).map(rowToTransaction);
}

export async function insertTransaction(userId: string, draft: TransactionDraft): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(draftToRow(userId, draft))
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToTransaction(data as TransactionRow);
}

export async function updateTransaction(
  id: string,
  patch: Partial<TransactionDraft>,
): Promise<Transaction> {
  const update: Record<string, unknown> = {};
  if (patch.merchant !== undefined) update.description = patch.merchant;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.type !== undefined) update.type = patch.type === "income" ? "Income" : "Expense";
  if (patch.date !== undefined) update.transaction_date = patch.date;
  if (patch.amount !== undefined) update.amount = patch.amount;

  const { data, error } = await supabase
    .from("transactions")
    .update(update)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToTransaction(data as TransactionRow);
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

/** Keeps a list sorted the same way the initial fetch is (newest first). */
export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
}
