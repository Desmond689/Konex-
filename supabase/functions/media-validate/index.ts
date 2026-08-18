// Deploy: supabase functions deploy media-validate
// Secrets: set in Supabase dashboard — never ship service role to the app
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MAX = 50 * 1024 * 1024;

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) {
      return new Response(JSON.stringify({ ok: false, message: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const fileSize = Number(body.file_size || 0);
    const duration = body.duration_sec != null ? Number(body.duration_sec) : null;

    if (!fileSize || fileSize > MAX) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'This file is too large. The maximum allowed size is 50 MB.',
        }),
        { status: 400 }
      );
    }

    if (duration != null && duration > 90) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Video exceeds maximum duration of 90 seconds.' }),
        { status: 400 }
      );
    }

    // Optional: verify object exists via service role (server only)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const url = Deno.env.get('SUPABASE_URL');
    if (serviceKey && url && body.bucket && body.path) {
      const admin = createClient(url, serviceKey);
      const { data, error } = await admin.storage.from(body.bucket).list(
        body.path.includes('/') ? body.path.split('/').slice(0, -1).join('/') : '',
        { search: body.path.split('/').pop() }
      );
      if (error) {
        return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 400 });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, message: String(e) }), { status: 500 });
  }
});
