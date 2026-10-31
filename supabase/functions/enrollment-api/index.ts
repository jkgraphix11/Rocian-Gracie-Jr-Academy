// Protected enrollment API foundation. Not connected to the public website.
// Supabase JWT validation is enabled on this function; user identity is checked again with Auth.
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
const json=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
Deno.serve(async(req:Request)=>{
  try {
    const token=req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if(!token) return json(401,{error:"Authentication required"});
    const url=Deno.env.get("SUPABASE_URL");
    const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url||!key) return json(503,{error:"Backend is not configured"});
    const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:{user},error}=await admin.auth.getUser(token);
    if(error||!user||!user.email_confirmed_at) return json(401,{error:"Verified account required"});
    const path=new URL(req.url).pathname.replace(/\/$/,"");
    if(req.method==="GET" && path.endsWith("/me")){
      const {data,error:dbError}=await admin.from("accounts").select("id,display_name,verified_email,created_at").eq("id",user.id).maybeSingle();
      if(dbError) return json(500,{error:"Could not read account"});
      return json(200,{account:data});
    }
    if(req.method==="POST" && path.endsWith("/accounts")){
      const origin=req.headers.get("origin");
      const allowed=(Deno.env.get("APP_ORIGIN")||"").split(",").map(x=>x.trim()).filter(Boolean);
      if(!origin||!allowed.includes(origin)) return json(403,{error:"Origin not allowed"});
      if((req.headers.get("content-type")||"").split(";")[0]!=="application/json") return json(415,{error:"JSON required"});
      if(Number(req.headers.get("content-length")||"0")>4096) return json(413,{error:"Request too large"});
      const body=await req.json().catch(()=>null);
      if(!body||typeof body.display_name!=="string")return json(400,{error:"Display name required"});
      const name=body.display_name.trim();
      if(name.length<2||name.length>120)return json(400,{error:"Invalid display name"});
      const {data,error:dbError}=await admin.from("accounts")
        .upsert({id:user.id,display_name:name,verified_email:user.email!},{onConflict:"id"})
        .select("id,display_name,verified_email,created_at").single();
      if(dbError)return json(500,{error:"Could not save account"});
      return json(200,{account:data});
    }
    return json(404,{error:"Route not found"});
  } catch {return json(400,{error:"Invalid request"});}
});
