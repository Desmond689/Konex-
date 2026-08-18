/**
 * Client-side image URL helpers. Prefer uploading compressed device files via storage.
 */
export function getOptimizedImageUrl(url: string, width = 400): string {
  if (!url) return url;
  // Supabase transform (if enabled on project): /storage/v1/render/image/public/...
  try {
    if (url.includes('/storage/v1/object/public/')) {
      return url.replace(
        '/storage/v1/object/public/',
        `/storage/v1/render/image/public/`
      ) + (url.includes('?') ? '&' : '?') + `width=${width}&resize=contain`;
    }
  } catch {
    /* keep original */
  }
  return url;
}
