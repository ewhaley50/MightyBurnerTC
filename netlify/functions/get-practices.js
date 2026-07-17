import { getSupabase, json } from "./supabase-client.js";
export async function handler(event){
  if(event.httpMethod==="OPTIONS")return json(200,{});
  try{
    const {data,error}=await getSupabase().from("practice_plans").select("*").order("practice_date",{ascending:false}).order("created_at",{ascending:false});
    if(error)throw error;
    return json(200,{practices:data||[]});
  }catch(err){return json(500,{error:err.message})}
}
