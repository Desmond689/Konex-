/**
 * Server-only: uses API.video API key from secrets.
 * Client calls this with the user JWT, then uploads the file to the returned upload URL.
 * Deploy: supabase functions deploy api-video-create --no-verify-jwt (or with jwt)
 * Secret: supabase secrets set API_VIDEO_KEY=...
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_DURATION = 90;

const API_VIDEO_KEY =
  Deno.env.get('API_VIDEO_KEY') ||
  // Fallback only for initial server deploy — rotate and move to secrets
  'CKgMLCAfVYIaSKIUGRvVzWmtEfzkqsogFSg9AlwE736';

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://ws.api.video/auth/api-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_VIDEO_KEY }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`api.video auth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ ok: false, message: 'Authentication required' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ ok: false, message: 'Invalid session' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || `konex_${userData.user.id}_${Date.now()}`;
    const fileSize = Number(body.file_size || 0);
    const durationSec = body.duration_sec != null ? Number(body.duration_sec) : null;

    if (fileSize > MAX_BYTES) {
      return json(
        { ok: false, message: 'This file is too large. The maximum allowed size is 50 MB.' },
        400
      );
    }
    if (durationSec != null && durationSec > MAX_DURATION) {
      return json(
        { ok: false, message: `Video exceeds maximum duration of ${MAX_DURATION} seconds.` },
        400
      );
    }

    const accessToken = await getAccessToken();

    const createRes = await fetch('https://ws.api.video/videos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description: `user:${userData.user.id}`,
        mp4Support: true,
      }),
    });

    if (!createRes.ok) {
      const t = await createRes.text();
      return json({ ok: false, message: `Create video failed: ${t}` }, 502);
    }

    const video = await createRes.json();
    // Source upload endpoint (authenticated with same access token for a short window)
    const uploadUrl = `https://ws.api.video/videos/${video.videoId}/source`;

    return json({
      ok: true,
      video_id: video.videoId,
      upload_url: uploadUrl,
      access_token: accessToken,
      // Client may use token only for this upload; not the long-lived API key
    });
  } catch (e) {
    return json({ ok: false, message: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
