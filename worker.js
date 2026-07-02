/*
  Cloudflare WORKER entry for aonhassan.com (Workers + Static Assets model).

  This replaces the Pages-style functions/_middleware.js. On a Workers project the
  functions/ folder is ignored, so the tracking lives here instead. With
  run_worker_first = true in wrangler.jsonc, this runs on every request, logs it,
  then serves your built site through the ASSETS binding.

  Tracking is fire-and-forget via ctx.waitUntil, so it never slows the page. If
  Supabase is unreachable or the secrets are missing, the site still serves fine.

  Runtime variables / secrets to set on the Worker (see notes at the bottom):
    SUPABASE_URL          e.g. https://xxxx.supabase.co        (plain var is fine)
    SUPABASE_SERVICE_KEY  the service_role key                  (set as a Secret)
    VISIT_SALT            any long random string                (set as a Secret)
*/

const AI_BOTS = [
  ["OpenAI GPTBot",        /GPTBot/i],
  ["OpenAI ChatGPT-User",  /ChatGPT-User/i],
  ["OpenAI SearchBot",     /OAI-SearchBot/i],
  ["Anthropic ClaudeBot",  /ClaudeBot/i],
  ["Anthropic Claude-Web", /Claude-Web/i],
  ["Anthropic anthropic-ai",/anthropic-ai/i],
  ["Perplexity Bot",       /PerplexityBot/i],
  ["Perplexity User",      /Perplexity-User/i],
  ["Google Extended (Gemini)", /Google-Extended/i],
  ["Google Vertex",        /Google-CloudVertexBot/i],
  ["Apple Intelligence",   /Applebot-Extended/i],
  ["Apple Bot",            /Applebot(?!-Extended)/i],
  ["Amazon Bot",           /Amazonbot/i],
  ["Meta AI",              /Meta-ExternalAgent|FacebookBot|meta-externalagent/i],
  ["Bytedance Spider",     /Bytespider/i],
  ["Common Crawl",         /CCBot/i],
  ["Cohere",               /cohere-ai/i],
  ["DuckDuckGo Assist",    /DuckAssistBot/i],
  ["Mistral",              /MistralAI/i],
  ["You.com",              /YouBot/i],
  ["Diffbot",              /Diffbot/i],
  ["Timpi",                /Timpibot/i],
  ["AI2",                  /AI2Bot/i],
];

const SEARCH_BOTS = [
  ["Googlebot",  /Googlebot/i],
  ["Bingbot",    /bingbot/i],
  ["DuckDuckGo", /DuckDuckBot/i],
  ["Yandex",     /YandexBot/i],
  ["Baidu",      /Baiduspider/i],
];

const ASSET_RE = /\.(?:js|css|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|map|json|xml|txt)$/i;

function classify(ua) {
  if (!ua) return { kind: "unknown", name: "unknown" };
  for (const [name, re] of AI_BOTS)     if (re.test(ua)) return { kind: "ai",     name };
  for (const [name, re] of SEARCH_BOTS) if (re.test(ua)) return { kind: "search", name };
  if (/bot|crawler|spider|crawl|slurp/i.test(ua)) return { kind: "other-bot", name: "Other bot" };
  return { kind: "human", name: "human" };
}

async function hashIp(ip, salt) {
  if (!ip) return null;
  const data = new TextEncoder().encode(salt + "|" + ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

async function logVisit(env, row) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (_) {
    // Never let tracking break the site.
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ua = request.headers.get("user-agent") || "";
    const cf = request.cf || {};
    const { kind, name } = classify(ua);

    const isAsset = ASSET_RE.test(url.pathname);
    const isBot = kind !== "human" && kind !== "unknown";
    const shouldLog = isBot || (!isAsset && request.method === "GET");

    if (shouldLog) {
      const ip = request.headers.get("cf-connecting-ip") || "";
      const row = {
        ts: new Date().toISOString(),
        path: url.pathname + (url.hash || ""),
        query: url.search || null,
        method: request.method,
        kind,
        bot_name: isBot ? name : null,
        ua: ua.slice(0, 512),
        referer: (request.headers.get("referer") || "").slice(0, 512) || null,
        country: cf.country || request.headers.get("cf-ipcountry") || null,
        city: cf.city || null,
        region: cf.region || null,
        org: cf.asOrganization || null,
        asn: cf.asn ? String(cf.asn) : null,
        ip_hash: await hashIp(ip, env.VISIT_SALT || "aonhassan-default-salt"),
      };
      ctx.waitUntil(logVisit(env, row));
    }

    // Serve your built site (Vite dist) through the assets binding.
    return env.ASSETS.fetch(request);
  },
};