import { getSupabase, json } from "./supabase-client.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.id) return json(400, { error: "id is required." });

    const updates = {
      athlete: String(body.athlete || "").trim(),
      event_name: String(body.event_name || "").trim(),
      mark: String(body.mark || "").trim(),
      mark_value: body.mark_value == null ? null : Number(body.mark_value),
      month: body.month || null,
      year: body.year ? Number(body.year) : null,
      source: body.source || null,
      notes: body.notes || null
    };

    const { data, error } = await getSupabase()
      .from("performances")
      .update(updates)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw error;
    return json(200, { record: data });
  } catch (err) {
    return json(500, { error: err.message || "Failed to update record." });
  }
}
