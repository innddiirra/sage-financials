import { supabase } from "@/lib/supabase";

type WishlistRow = {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  image_url: string | null;
  source_url: string | null;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  cost: number;
  imageUrl: string | null;
  sourceUrl: string | null;
  createdAt: string;
};

export type WishlistDraft = {
  name: string;
  cost: number;
  imageUrl: string;
  sourceUrl: string;
};

function rowToItem(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    cost: Number(row.cost),
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
  };
}

function draftToRow(userId: string, draft: WishlistDraft) {
  return {
    user_id: userId,
    name: draft.name,
    cost: draft.cost,
    image_url: draft.imageUrl || null,
    source_url: draft.sourceUrl || null,
  } as const;
}

const SELECT_COLUMNS = "id, user_id, name, cost, image_url, source_url, created_at";

export async function fetchWishlistItems(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("cost", { ascending: true });

  if (error) throw error;
  return (data as WishlistRow[]).map(rowToItem);
}

export async function insertWishlistItem(userId: string, draft: WishlistDraft): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert(draftToRow(userId, draft))
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToItem(data as WishlistRow);
}

export async function updateWishlistItem(id: string, patch: Partial<WishlistDraft>): Promise<WishlistItem> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.cost !== undefined) update.cost = patch.cost;
  if (patch.imageUrl !== undefined) update.image_url = patch.imageUrl || null;
  if (patch.sourceUrl !== undefined) update.source_url = patch.sourceUrl || null;

  const { data, error } = await supabase
    .from("wishlist_items")
    .update(update)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return rowToItem(data as WishlistRow);
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw error;
}
