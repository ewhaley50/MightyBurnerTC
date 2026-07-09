import { getSupabase, json } from "./supabase-client.js";

function parseBody(event) {
  try { return JSON.parse(event.body || "{}"); }
  catch { return {}; }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = parseBody(event);
    const record = {
      athlete: String(body.athlete || "Sean Williams").trim(),
      event_name: String(body.event_name || "").trim(),
      mark: String(body.mark || "").trim(),
      mark_value: body.mark_value === "" || body.mark_value == null ? null : Number(body.mark_value),
      month: body.month || null,
      year: body.year ? Number(body.year) : null,
      source: body.source || null,
      notes: body.notes || null
    };

    if (!record.event_name || !record.mark) {
      return json(400, { error: "event_name and mark are required." });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("performances")
      .insert(record)
      .select("*")
      .single();

    if (error) throw error;
    return json(200, { record: data });
  } catch (err) {
    return json(500, { error: err.message || "Failed to save record." });
  }
}
