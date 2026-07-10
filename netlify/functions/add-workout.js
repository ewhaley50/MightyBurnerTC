import { getSupabase, json } from "./supabase-client.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.name || !body.category || !body.rep_scheme) {
      return json(400, { error: "name, category, and rep_scheme are required." });
    }

    const workout = {
      name: String(body.name).trim(),
      category: String(body.category).trim(),
      subcategory: body.subcategory || null,
      event_group: body.event_group || null,
      events: Array.isArray(body.events) ? body.events : [],
      phase: body.phase || null,
      phases: Array.isArray(body.phases) ? body.phases : [],
      level: body.level || null,
      total_volume_m: body.total_volume_m == null ? null : Number(body.total_volume_m),
      intensity_min: body.intensity_min == null ? null : Number(body.intensity_min),
      intensity_max: body.intensity_max == null ? null : Number(body.intensity_max),
      rep_scheme: String(body.rep_scheme).trim(),
      segments: Array.isArray(body.segments) ? body.segments : [],
      rest: body.rest || null,
      details: body.details || null,
      coaching_cues: body.coaching_cues || null,
      source: body.source || "Mighty Burner Custom Builder",
      source_reference: body.source_reference || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      is_active: true
    };

    const { data, error } = await getSupabase()
      .from("workout_library")
      .upsert(workout, { onConflict: "source,name,rep_scheme" })
      .select("*")
      .single();

    if (error) throw error;
    return json(200, { workout: data });
  } catch (err) {
    return json(500, { error: err.message || "Failed to save workout." });
  }
}
