import { getSupabase, json } from "./supabase-client.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("performances")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return json(200, { records: data || [] });
  } catch (err) {
    return json(500, { error: err.message || "Failed to load records." });
  }
}
