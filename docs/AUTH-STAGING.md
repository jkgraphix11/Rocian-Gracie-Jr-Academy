# Supabase email verification — staging adapter

`src/auth-staging.js` provides requestCode(email), verifyCode(email, token), getAccessToken(), and signOut(). It uses the Supabase public publishable key and stores session tokens **only in memory**. Reload requires another verification. Do not put privileged keys or student data in the JavaScript bundle.

This adapter is not loaded by the generated website and no UI is connected. To use numeric verification codes, configure the Supabase email confirmation template with `{{ .Token }}` and verify redirects/provider settings; the default provider may otherwise send a magic link. The Supabase built-in email sender has delivery restrictions. Do not collect real student PII while this is untested.

Before integrating: implement transaction-bound payload validation and idempotency conflict detection, prevent repeated guardian impersonation, test OTP rate limits and CORS, obtain a staging email service, and add clear error/success states in English/Spanish. Confirm authenticated user identity server-side for each submission. The backend enrollment API draft is not deployed.
