import React, { useState, useMemo, useEffect } from "react";
import {
  Heart, MessageCircle, Repeat2, Share2, ArrowUpRight,
  ShieldCheck, Mail, Phone, MapPin, Globe, BadgeCheck, Radio,
} from "lucide-react";
import { supabase } from "./supabaseClient";

/*
  Aon Hassan, personal site + LinkedIn-style feed.
  Reads posts live from Supabase. Falls back to the seed array below when the
  backend is not connected yet, so the page never renders empty.
  The daily job (supabase/functions/daily-post) is what writes new posts.
*/

const CATEGORIES = {
  ob:   { label: "Open Banking",     color: "#15B7A6" },
  ef:   { label: "Embedded Finance", color: "#6C5CE7" },
  ai:   { label: "AI / GenAI",       color: "#E0A33E" },
  news: { label: "Industry",         color: "#3B82F6" },
  tech: { label: "Tech Notes",       color: "#2E9E6B" },
  lead: { label: "Leadership",       color: "#E0668A" },
};

const SEED_POSTS = [
  {
    id: "p1", cat: "ob", time: "Today",
    title: "Time to finance: from three weeks to one day",
    body:
      "The old account-to-finance path was a three week relay between forms, branches, and credit teams. We collapsed it to a single day by productising open banking and embedded lending into the partner's own journey. The customer never leaves the app they already trust. The bank still owns the risk decision, it just arrives in seconds instead of weeks.",
    likes: 412, comments: 47, reposts: 38,
  },
  {
    id: "p2", cat: "ai", time: "1d",
    title: "An AI-assisted SDLC that regulators can actually live with",
    body:
      "We rolled GenAI tooling and agentic workflows across the full delivery lifecycle, and shipping moved from multiple sprints to a single sprint on new banking features. The harder part was governance: prompt standards, RAG-backed knowledge, and guardrails that stay inside SAMA, NCA ECC, and ISO 27001 boundaries. Velocity is easy to demo, trustworthy velocity is the real product.",
    likes: 506, comments: 61, reposts: 72,
  },
  {
    id: "p3", cat: "ef", time: "2d",
    title: "Banking as a Service is a distribution strategy, not a feature",
    body:
      "Telcos, retailers, and super-apps do not want to become banks. They want account opening, payments, lending, and account-to-account flows living quietly inside journeys they already own. The job is to make the bank invisible and the experience native. Pricing, the integration model, and the certification pathway matter as much as the API.",
    likes: 298, comments: 33, reposts: 29,
  },
  {
    id: "p4", cat: "news", time: "3d",
    title: "FAPI 2.0, OAuth 2.0, OIDC: the boring backbone that makes open banking safe",
    body:
      "Open banking gets sold on experience, but it stands or falls on the security profile underneath it. FAPI 2.0 with OAuth 2.0 and OIDC, mTLS, and a zero trust posture are what let a regulator, a Tier-1 bank, and a fintech share a customer with confidence. Get the consent and identity layer right, and everything above it becomes possible.",
    likes: 221, comments: 24, reposts: 41,
  },
  {
    id: "p5", cat: "ob", time: "4d",
    title: "Islamic finance, built natively rather than retrofitted",
    body:
      "Murabaha, Ijara, Tawarruq, and Wakala are not conventional products with a label swapped on top. We built them as first class flows alongside conventional financing, so a single platform can serve both models without forcing one to imitate the other. That choice is what makes the same rails work across the UAE, KSA, and Bahrain.",
    likes: 187, comments: 19, reposts: 22,
  },
  {
    id: "p6", cat: "lead", time: "6d",
    title: "What it takes to run a 70 person engineering org across borders",
    body:
      "Five digital banks, multiple GCC countries, conventional and Islamic, retail and corporate. The thing that scaled was not headcount, it was the bridge between product intent and engineering reality. Product Managers, designers, and commercial teams on one side, platform and delivery on the other, and a shared language for trade-offs in the middle.",
    likes: 364, comments: 52, reposts: 31,
  },
  {
    id: "p7", cat: "tech", time: "1w",
    title: "The platform stack behind a regulated, multi-country fintech",
    body:
      "Kafka and RabbitMQ for movement, Keycloak and HashiCorp Vault for identity and secrets, Camunda for workflow, and Grafana, Prometheus, Datadog, and the Elastic stack for seeing what is actually happening. None of it is glamorous. All of it is what keeps Tier-1 banking customers online when it counts.",
    likes: 176, comments: 28, reposts: 18,
  },
  {
    id: "p8", cat: "news", time: "1w",
    title: "Before the banks, there was a trading desk",
    body:
      "Earlier chapter, same instinct for automation. As co-founder and portfolio manager of a Malta hedge fund, I designed risk-controlled automated trading systems on 20M dollars of investor funds, returned over 120 percent to clients, and doubled assets under management in a year. The fund was named the best performing in Malta in 2017. Markets teach you to respect both upside and the downside.",
    likes: 433, comments: 58, reposts: 64,
  },
];

function timeAgo(iso) {
  if (!iso) return "Today";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return "Today";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return Math.floor(s / 604800) + "w";
}

async function loadPosts() {
  if (!supabase) return SEED_POSTS;
  try {
    const { data } = await supabase
      .from("posts").select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(40);
    if (!data || !data.length) return SEED_POSTS;
    return data.map((r) => ({ ...r, time: timeAgo(r.created_at) }));
  } catch {
    return SEED_POSTS;
  }
}

function CoverArt({ cat }) {
  const c = CATEGORIES[cat].color;
  return (
    <svg className="cover" viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${cat}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="0.22" />
          <stop offset="1" stopColor="#0A111E" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="640" height="220" fill="#0A111E" />
      <rect width="640" height="220" fill={`url(#g-${cat})`} />
      {[...Array(7)].map((_, i) => (
        <line key={i} x1="0" y1={26 + i * 28} x2="640" y2={26 + i * 28}
          stroke={c} strokeOpacity="0.10" strokeWidth="1" />
      ))}
      <circle cx="120" cy="110" r="7" fill={c} />
      <circle cx="320" cy="70"  r="5" fill={c} fillOpacity="0.7" />
      <circle cx="520" cy="150" r="9" fill={c} />
      <path d="M120 110 C 220 110, 240 70, 320 70 S 440 150, 520 150"
        fill="none" stroke={c} strokeWidth="2" strokeOpacity="0.65" strokeDasharray="2 8" strokeLinecap="round" />
      <text x="28" y="200" fill={c} fillOpacity="0.85"
        style={{ font: "600 13px 'IBM Plex Mono', monospace", letterSpacing: "0.12em" }}>
        {CATEGORIES[cat].label.toUpperCase()}
      </text>
    </svg>
  );
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState(SEED_POSTS);

  useEffect(() => { loadPosts().then(setPosts); }, []);

  const shown = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.cat === filter)),
    [filter, posts]
  );

  const tabs = [["all", "All"], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])];

  return (
    <div className="ah">
      <style>{CSS}</style>

      <header className="nav">
        <a href="#top" className="brand">
          <span className="mono brand-mark">AH</span>
          <span className="brand-text">
            <strong>Aon Hassan</strong>
            <em className="mono">VP / C-Level Engineering &amp; Product</em>
          </span>
        </a>
        <nav className="nav-links mono">
          <a href="#feed">Feed</a>
          <a href="#work">Work</a>
          <a href="#stack">Stack</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="mailto:aon@aonhassan.com" className="btn btn-solid">
          <Mail size={15} /> Email me
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow mono">Open Banking · Embedded Finance · AI-led delivery</p>
            <h1>
              I build the rails that move money between banks, fintechs,
              and the apps people use every day.
            </h1>
            <p className="lede">
              Twenty years turning product vision into regulated, live banking across the GCC.
              Five digital banks delivered end to end, conventional and Islamic, retail and corporate,
              now leading engineering and product at MENA&apos;s leading open banking platform.
            </p>
            <div className="pills mono">
              <span>MSc Finance · LSE</span>
              <span>BSc Computer Science · Western</span>
              <span>PfMP®</span>
              <span>ISC2 CC</span>
            </div>
            <div className="hero-cta">
              <a href="mailto:aon@aonhassan.com" className="btn btn-solid">
                <Mail size={16} /> Email me
              </a>
              <a href="#feed" className="btn btn-ghost">
                Read the feed <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 360 360">
              <defs>
                <linearGradient id="flow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#15B7A6" />
                  <stop offset="1" stopColor="#6C5CE7" />
                </linearGradient>
              </defs>
              {[70, 150, 230, 310].map((y) => (
                <g key={`l${y}`}>
                  <rect x="20" y={y - 16} width="64" height="32" rx="7"
                    fill="#0F1A2B" stroke="#15B7A6" strokeOpacity="0.5" />
                  <text x="52" y={y + 4} textAnchor="middle"
                    style={{ font: "500 11px 'IBM Plex Mono',monospace" }} fill="#8FA0B8">BANK</text>
                </g>
              ))}
              {[110, 250].map((y) => (
                <g key={`r${y}`}>
                  <rect x="276" y={y - 18} width="64" height="36" rx="7"
                    fill="#0F1A2B" stroke="#6C5CE7" strokeOpacity="0.55" />
                  <text x="308" y={y + 4} textAnchor="middle"
                    style={{ font: "500 11px 'IBM Plex Mono',monospace" }} fill="#8FA0B8">APP</text>
                </g>
              ))}
              <circle cx="180" cy="180" r="30" fill="url(#flow)" fillOpacity="0.16"
                stroke="url(#flow)" strokeWidth="1.5" />
              <text x="180" y="184" textAnchor="middle"
                style={{ font: "600 12px 'IBM Plex Mono',monospace" }} fill="#E8EDF5">API</text>
              {[
                "M84 70 C150 70 150 180 180 180", "M84 150 C150 150 150 180 180 180",
                "M84 230 C150 230 150 180 180 180", "M84 310 C150 310 150 180 180 180",
                "M180 180 C210 180 210 110 276 110", "M180 180 C210 180 210 250 276 250",
              ].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="url(#flow)" strokeWidth="1.6"
                  strokeOpacity="0.5" strokeDasharray="3 7" className="flow-path"
                  style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </svg>
          </div>
        </section>

        <section className="stats">
          {[
            ["20+", "years in fintech"],
            ["5", "digital banks delivered"],
            ["$20M+", "revenue and new business"],
            ["70+", "engineers and PMs led"],
            ["3", "central banks: CBUAE, SAMA, CBB"],
          ].map(([n, l]) => (
            <div key={l} className="stat">
              <span className="stat-n">{n}</span>
              <span className="stat-l mono">{l}</span>
            </div>
          ))}
        </section>

        <section className="feed" id="feed">
          <div className="feed-head">
            <div>
              <h2>The Feed</h2>
              <p className="mono sub">Daily notes on open banking, embedded finance, and shipping with AI.</p>
            </div>
            <span className="live mono"><Radio size={13} /> Updated daily</span>
          </div>

          <div className="tabs mono" role="tablist">
            {tabs.map(([k, label]) => (
              <button key={k} className={`tab ${filter === k ? "on" : ""}`}
                onClick={() => setFilter(k)} role="tab" aria-selected={filter === k}>
                {label}
              </button>
            ))}
          </div>

          <div className="cards">
            {shown.map((p) => {
              const cat = CATEGORIES[p.cat] || CATEGORIES.news;
              return (
                <article className="card" key={p.id}>
                  <div className="card-top">
                    <span className="avatar">AH</span>
                    <div className="who">
                      <span className="who-name">
                        Aon Hassan <BadgeCheck size={15} className="verified" />
                      </span>
                      <span className="who-role mono">VP Engineering · Open Banking · Riyadh</span>
                      <span className="who-meta mono">
                        {p.time} · <i style={{ color: cat.color }}>● </i>{cat.label}
                      </span>
                    </div>
                  </div>
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-body">{p.body}</p>
                  <div className="card-cover"><CoverArt cat={CATEGORIES[p.cat] ? p.cat : "news"} /></div>
                  <div className="card-actions mono">
                    <button><Heart size={16} /> {p.likes}</button>
                    <button><MessageCircle size={16} /> {p.comments}</button>
                    <button><Repeat2 size={16} /> {p.reposts}</button>
                    <button className="share"><Share2 size={16} /> Share</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="work" id="work">
          <h2>Selected work</h2>
          <ol className="timeline">
            {[
              {
                role: "Vice President of Engineering", org: "Tarabut Gateway",
                place: "Riyadh, Saudi Arabia", dates: "May 2024 — Present",
                bullets: [
                  "Lead engineering and product for MENA's leading open banking platform, owning strategy and P&L for Open Banking, Open Finance, Embedded Finance, and BaaS used by Tier-1 banks and fintechs across the UAE, KSA, and Bahrain.",
                  "Cut time to finance from three weeks to one day by embedding account opening, payments, and lending into partner journeys.",
                  "Rolled out an enterprise AI-assisted delivery model, taking new banking features from multiple sprints to a single sprint.",
                ],
              },
              {
                role: "Chief Engineering & Solutions Officer", org: "Aion Digital",
                place: "Manama, Bahrain", dates: "Apr 2018 — Apr 2024",
                bullets: [
                  "Built and led a 70+ person engineering, product, and innovation org across the GCC.",
                  "Delivered five digital banks worth over 20M dollars in revenue, greenfield launches and legacy transformations.",
                  "Shipped a full financing suite, conventional and Shariah compliant, integrated with Temenos T24, Azentio iMAL, and ITS ETHIX.",
                ],
              },
              {
                role: "Co-Founder / Portfolio Manager", org: "Active Return Capital SICAV",
                place: "Sliema, Malta", dates: "Apr 2014 — Mar 2018",
                bullets: [
                  "MFSA-approved portfolio manager running automated, risk-controlled trading on 20M dollars of investor funds.",
                  "Returned over 120 percent to clients and doubled AUM in 2017, the best performing hedge fund in Malta that year.",
                ],
              },
              {
                role: "Co-Founder / Senior Consultant", org: "FocuSync UK Ltd",
                place: "London, UK", dates: "Apr 2003 — Mar 2014",
                bullets: [
                  "Built core Temenos T24 and Misys modules: Single Customer View, KYC, compliance, regulatory reporting, payments, and SWIFT integration.",
                  "Lead consultant on a UK bank's T24 R9 to R13 upgrade, owning migration design, test scenarios, and delivery.",
                ],
              },
            ].map((j) => (
              <li key={j.org} className="job">
                <div className="job-head">
                  <div>
                    <h3>{j.role}</h3>
                    <p className="job-org">{j.org} <span className="mono">· {j.place}</span></p>
                  </div>
                  <span className="job-dates mono">{j.dates}</span>
                </div>
                <ul>{j.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </li>
            ))}
          </ol>

          <div className="edu">
            <ShieldCheck size={18} className="edu-icon" />
            <p>
              <strong>MSc Finance, London School of Economics</strong> · {" "}
              <strong>BSc Computer Science, Western University</strong> · {" "}
              PfMP®, ISC2 Certified in Cybersecurity, MCSD (retired). British and Canadian citizen.
            </p>
          </div>
        </section>

        <section className="stack" id="stack">
          <h2>Technical stack</h2>
          <div className="stack-grid">
            {[
              ["Languages & Frameworks", [".NET Core", "Node.js", "Java / Spring Boot", "Angular", "React", "Python", "REST & GraphQL"]],
              ["AI / GenAI", ["LLM app design", "RAG", "Prompt engineering", "GitHub Copilot", "Cursor", "Claude Code", "Azure OpenAI", "AWS Bedrock", "Agentic workflows"]],
              ["Security & IAM", ["FAPI 2.0", "OAuth 2.0", "OIDC", "Zero Trust", "PKI", "mTLS", "ISO 27001", "PCI-DSS"]],
              ["Cloud & Data", ["Microsoft Azure", "AWS", "Power BI", "QuickSight", "Snowflake-style platforms"]],
              ["Platform & Observability", ["Kafka", "RabbitMQ", "IBM MQ", "Keycloak", "HashiCorp Vault", "Camunda", "Grafana", "Prometheus", "Datadog", "Elastic"]],
              ["Delivery", ["Azure DevOps", "Jenkins", "Kubernetes", "OpenShift", "Docker", "Jira"]],
            ].map(([title, items]) => (
              <div key={title} className="stack-col">
                <h4 className="mono">{title}</h4>
                <div className="chips">{items.map((c) => <span key={c} className="chip mono">{c}</span>)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="contact" id="contact">
        <h2>Let&apos;s talk.</h2>
        <p className="foot-lede">
          Open to VP and C-level engineering and product leadership in fintech and digital banking.
        </p>
        <div className="foot-links mono">
          <a href="mailto:aon@aonhassan.com"><Mail size={16} /> aon@aonhassan.com</a>
          <a href="tel:+966509641620"><Phone size={16} /> +966 509 641 620</a>
          <span><MapPin size={16} /> Riyadh, Saudi Arabia</span>
          <a href="https://aonhassan.com"><Globe size={16} /> aonhassan.com</a>
        </div>
        <a href="mailto:aon@aonhassan.com" className="btn btn-solid foot-btn">
          <Mail size={16} /> Email me
        </a>
        <p className="copyright mono">© {new Date().getFullYear()} Aon Hassan · Built for the people doing the hiring.</p>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.ah{
  --ink:#0A111E; --ink2:#0F1A2B; --paper:#F5F3EE; --paper2:#EAE6DD;
  --text:#0C1626; --muted:#55657A; --text-d:#E8EDF5; --muted-d:#8FA0B8;
  --accent:#15B7A6; --accent-d:#0E8C7F; --line:rgba(12,22,38,.12); --line-d:rgba(255,255,255,.12);
  background:var(--paper); color:var(--text);
  font-family:'Inter',system-ui,sans-serif; line-height:1.55; scroll-behavior:smooth;
  -webkit-font-smoothing:antialiased;
}
.ah *{box-sizing:border-box;}
.ah .mono{font-family:'IBM Plex Mono',monospace;}
.ah h1,.ah h2,.ah h3,.ah h4{font-family:'Space Grotesk',sans-serif; line-height:1.08; margin:0; letter-spacing:-.01em;}
.ah a{color:inherit; text-decoration:none;}
.ah section{padding:0 24px;}

.ah .nav{position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between;
  gap:16px; padding:14px 24px; background:rgba(245,243,238,.82); backdrop-filter:blur(12px);
  border-bottom:1px solid var(--line);}
.ah .brand{display:flex; align-items:center; gap:11px;}
.ah .brand-mark{display:grid; place-items:center; width:38px; height:38px; border-radius:9px;
  background:var(--ink); color:#fff; font-weight:600; font-size:14px; letter-spacing:.04em;}
.ah .brand-text{display:flex; flex-direction:column; line-height:1.15;}
.ah .brand-text strong{font-family:'Space Grotesk',sans-serif; font-size:15px;}
.ah .brand-text em{font-style:normal; font-size:10.5px; color:var(--muted); letter-spacing:.02em;}
.ah .nav-links{display:flex; gap:26px; font-size:13px; color:var(--muted);}
.ah .nav-links a:hover{color:var(--accent-d);}
.ah .btn{display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:500;
  padding:9px 16px; border-radius:9px; cursor:pointer; border:1px solid transparent; transition:.18s;}
.ah .btn-solid{background:var(--ink); color:#fff;}
.ah .btn-solid:hover{background:#16243A; transform:translateY(-1px);}
.ah .btn-ghost{border-color:var(--line); color:var(--text); background:transparent;}
.ah .btn-ghost:hover{border-color:var(--accent); color:var(--accent-d);}

.ah .hero{max-width:1160px; margin:0 auto; padding-top:74px; padding-bottom:60px;
  display:grid; grid-template-columns:1.25fr .9fr; gap:48px; align-items:center;}
.ah .eyebrow{font-size:12px; letter-spacing:.06em; color:var(--accent-d); text-transform:uppercase; margin:0 0 20px;}
.ah .hero h1{font-size:clamp(2.3rem,5vw,4rem); font-weight:600; letter-spacing:-.02em;}
.ah .lede{margin:24px 0 0; max-width:46ch; color:var(--muted); font-size:17px;}
.ah .pills{display:flex; flex-wrap:wrap; gap:8px; margin:26px 0 0;}
.ah .pills span{font-size:11.5px; padding:5px 11px; border:1px solid var(--line); border-radius:999px; color:var(--text);}
.ah .hero-cta{display:flex; flex-wrap:wrap; gap:12px; margin-top:30px;}
.ah .hero-art{display:grid; place-items:center;}
.ah .hero-art svg{width:100%; max-width:380px; height:auto;}
.ah .flow-path{stroke-dashoffset:200; animation:dash 3s linear infinite;}
@keyframes dash{to{stroke-dashoffset:0;}}

.ah .stats{max-width:1160px; margin:0 auto; display:grid; grid-template-columns:repeat(5,1fr);
  gap:1px; background:var(--line); border:1px solid var(--line); border-radius:14px; overflow:hidden;}
.ah .stat{background:var(--paper); padding:24px 20px; display:flex; flex-direction:column; gap:6px;}
.ah .stat-n{font-family:'Space Grotesk',sans-serif; font-size:30px; font-weight:600; color:var(--ink);}
.ah .stat-l{font-size:11px; color:var(--muted); line-height:1.35;}

.ah .feed{max-width:680px; margin:0 auto; padding-top:80px;}
.ah .feed-head{display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;}
.ah .feed h2,.ah .work h2,.ah .stack h2{font-size:clamp(1.7rem,3vw,2.3rem); font-weight:600;}
.ah .sub{font-size:12.5px; color:var(--muted); margin:8px 0 0;}
.ah .live{display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:var(--accent-d);
  background:rgba(21,183,166,.1); padding:6px 11px; border-radius:999px;}
.ah .live svg{animation:pulse 1.8s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
.ah .tabs{display:flex; gap:8px; flex-wrap:wrap; margin:22px 0 24px;}
.ah .tab{font-size:12px; padding:7px 13px; border-radius:999px; border:1px solid var(--line);
  background:transparent; color:var(--muted); cursor:pointer; transition:.15s;}
.ah .tab:hover{border-color:var(--accent);}
.ah .tab.on{background:var(--ink); color:#fff; border-color:var(--ink);}
.ah .cards{display:flex; flex-direction:column; gap:18px;}
.ah .card{background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px 20px 8px; transition:.2s;}
.ah .card:hover{border-color:rgba(21,183,166,.5); box-shadow:0 10px 40px -22px rgba(12,22,38,.4);}
.ah .card-top{display:flex; gap:12px; align-items:center;}
.ah .avatar{display:grid; place-items:center; width:46px; height:46px; border-radius:11px; flex:none;
  background:linear-gradient(135deg,var(--accent),#6C5CE7); color:#fff; font-family:'IBM Plex Mono',monospace;
  font-weight:600; font-size:15px;}
.ah .who{display:flex; flex-direction:column; line-height:1.3;}
.ah .who-name{display:flex; align-items:center; gap:5px; font-weight:600; font-size:14.5px; font-family:'Space Grotesk',sans-serif;}
.ah .verified{color:var(--accent);}
.ah .who-role{font-size:11px; color:var(--muted);}
.ah .who-meta{font-size:11px; color:var(--muted); margin-top:1px;}
.ah .card-title{font-size:18px; font-weight:600; margin:15px 0 8px;}
.ah .card-body{font-size:14.5px; color:#39485C; margin:0 0 15px;}
.ah .card-cover{border-radius:12px; overflow:hidden; border:1px solid var(--line);}
.ah .cover{display:block; width:100%; height:170px;}
.ah .card-actions{display:flex; gap:6px; padding:6px 0; margin-top:6px; border-top:1px solid var(--line);}
.ah .card-actions button{display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted);
  background:transparent; border:none; cursor:pointer; padding:9px 12px; border-radius:8px; transition:.15s;}
.ah .card-actions button:hover{background:var(--paper2); color:var(--accent-d);}
.ah .card-actions .share{margin-left:auto;}

.ah .work{max-width:880px; margin:0 auto; padding-top:96px;}
.ah .timeline{list-style:none; margin:34px 0 0; padding:0;}
.ah .job{padding:26px 0; border-top:1px solid var(--line);}
.ah .job-head{display:flex; justify-content:space-between; gap:18px; flex-wrap:wrap; align-items:baseline;}
.ah .job h3{font-size:19px; font-weight:600;}
.ah .job-org{font-size:14px; color:var(--accent-d); margin:5px 0 0; font-weight:500;}
.ah .job-org .mono{color:var(--muted); font-weight:400;}
.ah .job-dates{font-size:12px; color:var(--muted); white-space:nowrap;}
.ah .job ul{margin:15px 0 0; padding-left:18px; display:flex; flex-direction:column; gap:8px;}
.ah .job ul li{font-size:14px; color:#39485C;}
.ah .edu{display:flex; gap:13px; align-items:flex-start; margin-top:30px; padding:20px 22px;
  background:var(--ink); color:var(--text-d); border-radius:14px;}
.ah .edu-icon{color:var(--accent); flex:none; margin-top:2px;}
.ah .edu p{margin:0; font-size:13.5px; color:#C7D2E0;}
.ah .edu strong{color:#fff;}

.ah .stack{max-width:1080px; margin:0 auto; padding-top:96px; padding-bottom:30px;}
.ah .stack-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:30px 48px; margin-top:34px;}
.ah .stack-col h4{font-size:12px; letter-spacing:.04em; color:var(--accent-d); text-transform:uppercase; margin-bottom:14px;}
.ah .chips{display:flex; flex-wrap:wrap; gap:8px;}
.ah .chip{font-size:12px; padding:6px 11px; border:1px solid var(--line); border-radius:8px; color:var(--text); background:#fff;}

.ah .contact{margin-top:90px; background:var(--ink); color:var(--text-d); padding:80px 24px 44px; text-align:center;}
.ah .contact h2{font-size:clamp(2rem,5vw,3.4rem); font-weight:600; color:#fff;}
.ah .foot-lede{max-width:46ch; margin:18px auto 0; color:var(--muted-d); font-size:16px;}
.ah .foot-links{display:flex; flex-wrap:wrap; justify-content:center; gap:10px 26px; margin:34px 0; font-size:13px; color:var(--muted-d);}
.ah .foot-links a,.ah .foot-links span{display:inline-flex; align-items:center; gap:8px;}
.ah .foot-links a:hover{color:var(--accent);}
.ah .foot-btn{background:var(--accent); color:#04211D;}
.ah .foot-btn:hover{background:#1ad0bd;}
.ah .copyright{margin-top:40px; font-size:11px; color:var(--muted-d); opacity:.7;}

@media (max-width:860px){
  .ah .hero{grid-template-columns:1fr; padding-top:48px; gap:32px;}
  .ah .hero-art{order:-1; max-width:300px; margin:0 auto;}
  .ah .stats{grid-template-columns:repeat(2,1fr);}
  .ah .nav-links{display:none;}
  .ah .stack-grid{grid-template-columns:1fr;}
}
@media (prefers-reduced-motion:reduce){
  .ah *{animation:none !important; scroll-behavior:auto;}
}
`;
