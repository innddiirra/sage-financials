import { supabase } from "@/lib/supabase";

/** Shape of a row exactly as stored in public.savings_goals. */
type GoalRow = {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  emoji: string;
  created_at: string;
};

/** App-facing shape, kept close to the existing mock data so the UI doesn't change. */
export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** ISO date string ("YYYY-MM-DD"), or "" if no deadline was set. */
  deadline: string;
  emoji: string;
};

export type GoalDraft = {
  name: string;
  target: number;
  saved: number;
  deadline: string;
  emoji: string;
};

function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.goal_name,
    target: Number(row.target_amount),
    saved: Number(row.saved_amount),
    deadline: row.deadline ?? "",
    emoji: row.emoji,
  };
}

function draftToRow(userId: string, draft: GoalDraft) {
  return {
    user_id: userId,
    goal_name: draft.name,
    target_amount: draft.target,
    saved_amount: draft.saved,
    deadline: draft.deadline || null,
    emoji: draft.emoji || "🎯",
  } as const;
}

const SELECT_COLUMNS = "id, user_id, goal_name, target_amount, saved_amount, deadline, emoji, created_at";

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("savings_goals")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as GoalRow[]).map(rowToGoal);
}

export async function insertGoal(userId: string, draft: GoalDraft): Promise<Goal> {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert(draftToRow(userId, draft))
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToGoal(data as GoalRow);
}

export async function updateGoal(id: string, patch: Partial<GoalDraft>): Promise<Goal> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.goal_name = patch.name;
  if (patch.target !== undefined) update.target_amount = patch.target;
  if (patch.saved !== undefined) update.saved_amount = patch.saved;
  if (patch.deadline !== undefined) update.deadline = patch.deadline || null;
  if (patch.emoji !== undefined) update.emoji = patch.emoji || "🎯";

  const { data, error } = await supabase
    .from("savings_goals")
    .update(update)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToGoal(data as GoalRow);
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  if (error) throw error;
}
