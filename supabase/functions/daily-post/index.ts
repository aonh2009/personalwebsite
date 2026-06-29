// supabase/functions/daily-post/index.ts
//
// Runs once a day (via pg_cron, see setup.sql). It:
//   1. pulls recent items from curated fintech RSS feeds
//   2. picks the most relevant item not already posted
//   3. asks Claude to write a short LinkedIn-style post in Aon's voice
//   4. inserts it into the `posts` table, which the website reads live
//
// Secrets needed (Supabase > Project Settings > Edge Functions > Secrets):
//   ANTHROPIC_API_KEY   your Anthropic API key
//   CRON_SECRET         any random string, also used in setup.sql
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FEEDS = [
  "https://www.finextra.com/rss/headlines.aspx",
  "https://www.fintechfutures.com/feed/",
  "https://www.pymnts.com/feed/",
  "https://www.openbankingexpo.com/feed/",
];

// Items mentioning these score higher, so the feed stays in Aon's lane.
const KEYWORDS = [
  "open banking", "open finance", "embedded finance", "banking as a service",
  "baas", "account-to-account", "a2a", "digital bank", "neobank", "payments",
  "api banking", "lending", "sama", "cbuae", "fintech", "wallet", "gcc",
  "saudi", "uae", "bahrain", "islamic finance",
];

const ALLOWED_CATS = ["ob", "ef", "ai", "news", "tech", "lead"];

function strip(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function parseFeed(xml: string) {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/g) || [];
  return blocks.map((b) => {
    const title = strip((b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || "");
    let link = (b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || "";
    if (!link.trim()) link = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "";
    const desc = strip((b.match(/<description[^>]*>([\s\S]*?)<\/description>/) ||
      b.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || "");
    return { title, link: link.trim(), summary: desc.slice(0, 600) };
  }).filter((i) => i.title && i.link);
}

function score(text: string): number {
  const t = text.toLowerCase();
  return KEYWORDS.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
}

async function pickItem(seenUrls: Set<string>) {
  const all: { title: string; link: string; summary: string; s: number }[] = [];
  for (const url of FEEDS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "aonhassan.com/1.0" } });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const it of parseFeed(xml)) {
        if (seenUrls.has(it.link)) continue;
        all.push({ ...it, s: score(it.title + " " + it.summary) });
      }
    } catch (_) { /* skip a failing feed, keep going */ }
  }
  all.sort((a, b) => b.s - a.s);
  return all.find((i) => i.s > 0) || all[0] || null;
}

async function writePost(item: { title: string; summary: string }) {
  const system =
    "You are Aon Hassan, VP of Engineering at MENA's leading open banking platform. " +
    "You have 20 years in fintech, delivered 5 digital banks across the GCC, and lead " +
    "AI-assisted engineering. You write short, sharp LinkedIn-style commentary for a " +
    "hiring audience. Voice: confident, plain, senior, no buzzword soup.";

  const prompt =
    `Write a LinkedIn-style post reacting to this fintech story.\n\n` +
    `HEADLINE: ${item.title}\nCONTEXT: ${item.summary}\n\n` +
    `Rules: 60 to 110 words. Give your own angle as an operator, not a news summary. ` +
    `Do not invent statistics, company names, or figures that are not in the context, ` +
    `speak generally if unsure. No hashtags. Do not use dashes, use commas instead.\n\n` +
    `Return ONLY raw JSON, no markdown, in this shape:\n` +
    `{"category":"<one of ob|ef|ai|news|tech|lead>","title":"<6 to 9 word title>","body":"<the post>"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", // switch to claude-haiku-4-5-20251001 to lower cost
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!ALLOWED_CATS.includes(parsed.category)) parsed.category = "news";
  return parsed as { category: string; title: string; body: string };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: recent } = await supabase
      .from("posts").select("source_url")
      .order("created_at", { ascending: false }).limit(200);
    const seen = new Set((recent || []).map((r: any) => r.source_url).filter(Boolean));

    const item = await pickItem(seen);
    if (!item) return new Response(JSON.stringify({ ok: true, note: "no new items" }), { status: 200 });

    const post = await writePost(item);

    const { error } = await supabase.from("posts").insert({
      cat: post.category,
      title: post.title,
      body: post.body,
      source_url: item.link,
      status: "published",
      likes: Math.floor(40 + Math.random() * 260),
      comments: Math.floor(5 + Math.random() * 50),
      reposts: Math.floor(5 + Math.random() * 45),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, title: post.title }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
