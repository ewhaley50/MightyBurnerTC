import { getSupabase, json } from "./supabase-client.js";
export async function handler(event){
  if(event.httpMethod==="OPTIONS")return json(200,{});
  if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed"});
  try{
    const {id}=JSON.parse(event.body||"{}");
    if(!id)return json(400,{error:"id is required"});
    const {error}=await getSupabase().from("practice_plans").delete().eq("id",id);
    if(error)throw error;
    return json(200,{ok:true});
  }catch(err){return json(500,{error:err.message})}
}
