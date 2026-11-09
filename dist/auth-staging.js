// Staging-only authentication adapter. No personal information is persisted in browser storage.
// UI integration is intentionally deferred until enrollment submission is safe to enable.
window.RGJAuth = (() => {
 const base = "https://hqbbwxysbsqnnhlxjgxs.supabase.co";
 const key = "sb_publishable_krIOdjj0qxlg9p8RxNue_Q_F97CTIP0"; // Public publishable key, never a service role key.
 let accessToken = null;
 let expiresAt = 0;
 const headers = {apikey:key,"content-type":"application/json"};
 const request = async (path,body) => {
   const response = await fetch(base+"/auth/v1/"+path,{
     method:"POST",headers,body:JSON.stringify(body),cache:"no-store"
   });
   const data = await response.json().catch(()=>({}));
   if(!response.ok) throw new Error(data.msg || data.error_description || data.message || "Authentication failed");
   return data;
 };
 const validEmail = e => typeof e==="string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) && e.length<=254;
 async function requestCode(email) {
   if(!validEmail(email)) throw new Error("Enter a valid email address.");
   // Supabase's confirmation template must contain {{ .Token }} for a numeric code.
   await request("otp",{email:email.trim(),create_user:true});
   return {sent:true};
 }
 async function verifyCode(email,token) {
   if(!validEmail(email) || !/^\d{6,8}$/.test(String(token))) throw new Error("Invalid verification code.");
   const result = await request("verify",{type:"email",email:email.trim(),token:String(token)});
   if(!result.access_token || !result.user?.email_confirmed_at)throw new Error("Email verification incomplete.");
   accessToken=result.access_token;
   expiresAt=Date.now()+Math.max(0,Number(result.expires_in||3600)-60)*1000;
   return {email:result.user.email,verified:true};
 }
 function getAccessToken(){return accessToken&&Date.now()<expiresAt?accessToken:null;}
 function signOut(){accessToken=null;expiresAt=0;}
 return {requestCode,verifyCode,getAccessToken,signOut};
})();
