# Security

You pasted SUPABASE_SERVICE_ROLE_KEY in chat. Treat it as compromised:

1. Supabase Dashboard → Project Settings → API → Reset service_role if available
2. Never add service_role to EXPO_PUBLIC_* or ship it in the app
3. Store service_role only in Edge Function secrets / CI server

The mobile .env in this project contains only URL + anon/publishable key.
