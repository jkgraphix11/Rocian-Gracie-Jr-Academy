// First protected account endpoint; student and waiver submissions remain disabled.
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
const allowedOrigins = new Set([
  "https://jkgraphix11.github.io",
  "https://rocian-gracie-tijuana.jkgraphix11.chatgpt.site"
]);
const headers=(origin:string|null):Record<string,string>=>({
 "content-type":"application/json","cache-control":"no-store","vary":"Origin",
 ...(origin&&allowedOrigins.has(origin)?{"access-control-allow-origin":origin,"access-control-allow-headers":"authorization, apikey, content-type, x-client-info","access-control-allow-methods":"GET, POST, OPTIONS"}:{})
});
const respond=(status:number,body:unknown,origin:string|null)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(req.method==="OPTIONS"){
   if(!origin||!allowedOrigins.has(origin)) return new Response(null,{status:403});
   return new Response(null,{status:204,headers:headers(origin)});
 }
 if(origin&&!allowedOrigins.has(origin))return respond(403,{error:"Origin not allowed"},origin);
 try{
   const token=req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
   if(!token)return respond(401,{error:"Authentication required"},origin);
   const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
   if(!url||!key)return respond(503,{error:"Backend not configured"},origin);
   const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
   const {data:{user},error}=await admin.auth.getUser(token);
   if(error||!user||!user.email||!user.email_confirmed_at)return respond(401,{error:"Verified email required"},origin);
   const path=new URL(req.url).pathname.replace(/\/$/,"");
   if(req.method==="GET"&&path.endsWith("/me")){
     const {data,error:e}=await admin.from("accounts").select("id,display_name,verified_email,created_at").eq("id",user.id).maybeSingle();
     return e?respond(500,{error:"Database error"},origin):respond(200,{account:data},origin);
   }
   if(req.method==="POST"&&path.endsWith("/accounts")){
     if(!origin||!allowedOrigins.has(origin))return respond(403,{error:"Browser origin required"},origin);
     if(req.headers.get("content-type")?.split(";")[0]!=="application/json")return respond(415,{error:"JSON required"},origin);
     const raw=await req.text();
     if(raw.length>4096)return respond(413,{error:"Too large"},origin);
     let body;try{body=JSON.parse(raw)}catch{return respond(400,{error:"Invalid JSON"},origin)}
     if(!body||typeof body.display_name!=="string")return respond(400,{error:"Display name required"},origin);
     const name=body.display_name.trim().replace(/\s+/g," ");
     if(name.length<2||name.length>120)return respond(400,{error:"Invalid name"},origin);
     const {data,error:e}=await admin.from("accounts").upsert({id:user.id,display_name:name,verified_email:user.email},{onConflict:"id"}).select("id,display_name,verified_email,created_at").single();
     return e?respond(500,{error:"Database error"},origin):respond(200,{account:data},origin);
   }
   return respond(404,{error:"Not found"},origin);
 }catch{return respond(400,{error:"Invalid request"},origin)}
});
