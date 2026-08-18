/**
 * Returns playback + thumbnail URLs once api.video processing finishes.
 */
const API_VIDEO_KEY =
  Deno.env.get('API_VIDEO_KEY') ||
  'CKgMLCAfVYIaSKIUGRvVzWmtEfzkqsogFSg9AlwE736';

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://ws.api.video/auth/api-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_VIDEO_KEY }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).access_token;
}

Deno.serve(async (req) => {
  try {
    if (!req.headers.get('Authorization')) {
      return new Response(JSON.stringify({ ok: false, message: 'Unauthorized' }), { status: 401 });
    }
    const { video_id } = await req.json();
    if (!video_id) {
      return new Response(JSON.stringify({ ok: false, message: 'video_id required' }), { status: 400 });
    }
    const token = await getAccessToken();
    const res = await fetch(`https://ws.api.video/videos/${video_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, message: await res.text() }), { status: 502 });
    }
    const video = await res.json();
    const assets = video.assets || {};
    const status =
      video.ingest?.status === 'uploaded' || assets.mp4 || assets.hls
        ? assets.mp4 || assets.hls
          ? 'ready'
          : 'processing'
        : video.ingest?.status || 'processing';

    return new Response(
      JSON.stringify({
        ok: true,
        status: status === 'ready' || assets.mp4 ? 'ready' : 'processing',
        video_id,
        mp4_url: assets.mp4 || null,
        hls_url: assets.hls || null,
        thumbnail_url: assets.thumbnail || null,
        player_url: assets.player || null,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, message: String(e) }), { status: 500 });
  }
});
