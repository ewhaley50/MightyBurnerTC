import { getSupabase, json } from "./supabase-client.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  try {
    const { data, error } = await getSupabase()
      .from("workout_library")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return json(200, { workouts: data || [] });
  } catch (err) {
    return json(500, { error: err.message || "Failed to load workouts." });
  }
}
