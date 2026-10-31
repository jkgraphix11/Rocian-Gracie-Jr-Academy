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

   if(req.method==="POST"&&path.endsWith("/enrollments")){
     if(!origin||!allowedOrigins.has(origin))return respond(403,{error:"Browser origin required"},origin);
     if(req.headers.get("content-type")?.split(";")[0]!=="application/json")return respond(415,{error:"JSON required"},origin);
     const raw=await req.text();
     if(raw.length>8192)return respond(413,{error:"Request too large"},origin);
     let b:Record<string,unknown>;try{b=JSON.parse(raw)}catch{return respond(400,{error:"Invalid JSON"},origin)}
     if(!b||Array.isArray(b)||typeof b!=="object")return respond(400,{error:"Invalid input"},origin);
     const s=(v:unknown,n=120)=>typeof v==="string"&&v.trim().length>0&&v.trim().length<=n?v.trim():null;
     const first=s(b.firstName),last=s(b.lastName),email=s(b.email,254),phone=s(b.phone,25);
     const emergencyName=s(b.emergencyName),emergencyRelation=s(b.emergencyRelation),emergencyPhone=s(b.emergencyPhone,25);
     const dob=s(b.dob,10),plan=b.plan,language=b.language;
     const interests=b.interests;
     const permittedInterests=new Set(["jiujitsu","judo","kickboxing","boxing","selfdefense","yoga","explore"]);
     if(!first||!last||!email||!phone||!emergencyName||!emergencyRelation||!emergencyPhone||!dob||
       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\+\d{10,15}$/.test(phone)||!/^\+\d{10,15}$/.test(emergencyPhone)||
       !["intro","monthly"].includes(String(plan))||!["en","es"].includes(String(language))||
       !Array.isArray(interests)||!interests.length||interests.length>7||interests.some((x:unknown)=>!permittedInterests.has(String(x))))
       return respond(400,{error:"Invalid enrollment details"},origin);
     if(user.email.toLowerCase()!==email.toLowerCase())return respond(403,{error:"Contact email must match verified account"},origin);
     const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
     if(!m)return respond(400,{error:"Invalid birth date"},origin);
     const yy=Number(m[1]),mm=Number(m[2]),dd=Number(m[3]),date=new Date(Date.UTC(yy,mm-1,dd));
     if(date.getUTCFullYear()!==yy||date.getUTCMonth()!==mm-1||date.getUTCDate()!==dd)return respond(400,{error:"Invalid birth date"},origin);
     const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Tijuana",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
     const [ty,tm,td]=today.split("-").map(Number);
     const years=ty-yy-(tm<mm||(tm===mm&&td<dd)?1:0);
     if(dob>today||years<0||years>110)return respond(400,{error:"Invalid birth date"},origin);
     const minor=years<18;
     const guardianName=s(b.guardianName),guardianRelation=s(b.guardianRelation),guardianEmail=s(b.guardianEmail,254),guardianPhone=s(b.guardianPhone,25);
     if(minor&&(!guardianName||!guardianRelation||!guardianEmail||!guardianPhone||
       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)||!/^\+\d{10,15}$/.test(guardianPhone)||
       guardianEmail.toLowerCase()!==user.email.toLowerCase()))
       return respond(400,{error:"Verified guardian details required"},origin);
     // A draft is not a signed waiver, active membership, or academy-approved registration.
     const {data:acct,error:ae}=await admin.from("accounts").upsert({id:user.id,display_name:minor?guardianName!:first+" "+last,verified_email:user.email},{onConflict:"id"}).select("id").single();
     if(ae||!acct)return respond(500,{error:"Could not prepare account"},origin);
     const {data:student,error:se}=await admin.from("students").insert({account_id:user.id,first_name:first,last_name:last,date_of_birth:dob,email,phone,preferred_language:language,status:"pending"}).select("id").single();
     if(se||!student)return respond(500,{error:"Could not create student draft"},origin);
     const {error:ee}=await admin.from("enrollments").insert({student_id:student.id,account_id:user.id,enrollment_type:plan==="intro"?"intro":"membership",status:"started"});
     const {error:ce}=await admin.from("emergency_contacts").insert({student_id:student.id,full_name:emergencyName,relationship:emergencyRelation,phone:emergencyPhone});
     let ge=null;
     if(minor){const parts=guardianName!.split(/\s+/);const {error}=await admin.from("guardians").insert({student_id:student.id,auth_user_id:user.id,first_name:parts[0],last_name:parts.slice(1).join(" ")||parts[0],relationship:guardianRelation,email:guardianEmail,phone:guardianPhone,is_legal_guardian:true});ge=error;}
     if(ee||ce||ge)return respond(500,{error:"Student draft created but related records need reconciliation",student_id:student.id});
     return respond(201,{status:"draft",student_id:student.id,waiver_archived:false,payment_processed:false},origin);
   }
   return respond(404,{error:"Not found"},origin);
 }catch{return respond(400,{error:"Invalid request"},origin)}
});
