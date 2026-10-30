/**
 * /api/substack  -  Cloudflare Pages Function
 *
 * Fetches David's Substack RSS feed and serves it from dbgdocent.com itself,
 * so the homepage "latest essay" card and the Writing page no longer depend
 * on outside proxy services. Runs free on Cloudflare (100,000 requests/day).
 *
 * The feed is cached at Cloudflare's edge for 30 minutes, so a new Substack
 * post appears on the site within about half an hour of publishing.
 */
const FEED_URL = 'https://davidkirktheprguy.substack.com/feed';
const CACHE_SECONDS = 1800;

export async function onRequestGet() {
  try {
    const upstream = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'dbgdocent.com feed reader (+https://dbgdocent.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
    });

    if (!upstream.ok) {
      return new Response('Feed unavailable', { status: 502 });
    }

    const xml = await upstream.text();
    if (!xml.includes('<item')) {
      return new Response('Feed empty', { status: 502 });
    }

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`
      }
    });
  } catch (err) {
    return new Response('Feed error', { status: 502 });
  }
}
