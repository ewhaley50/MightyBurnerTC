import { getSupabase, json } from "./supabase-client.js";
export async function handler(event){
  if(event.httpMethod==="OPTIONS")return json(200,{});
  if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed"});
  try{
    const b=JSON.parse(event.body||"{}");
    if(!b.name)return json(400,{error:"Practice name is required"});
    const record={
      practice_date:b.practice_date||null,start_time:b.start_time||null,name:b.name,
      event_group:b.event_group||null,focus:b.focus||null,phase:b.phase||null,level:b.level||null,
      duration_minutes:b.duration_minutes||null,days_to_meet:b.days_to_meet||null,group_size:b.group_size||null,
      athletes:b.athletes||[],equipment:b.equipment||[],notes:b.notes||null,
      workout_id:b.workout_id||null,workout_name:b.workout_name||null,plan_blocks:b.plan_blocks||[]
    };
    const {data,error}=await getSupabase().from("practice_plans").insert(record).select("*").single();
    if(error)throw error;
    return json(200,{practice:data});
  }catch(err){return json(500,{error:err.message})}
}
