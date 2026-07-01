import React, { useState, useMemo, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Heart, MessageCircle, Repeat2, Share2, ArrowUpRight,
  ShieldCheck, Mail, Phone, MapPin, Globe, BadgeCheck, Radio,
  Briefcase, Layers, LayoutGrid, AtSign,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { LightBankPage } from "./LightBank";

/*
  Aon Hassan, personal site. Dark neon direction.
  Reads posts live from Supabase, falls back to the seed array so the page never renders empty.
  The daily job (supabase/functions/daily-post) writes new posts.
*/

const CATEGORIES = {
  ob:   { label: "Open Banking",     color: "#4E96FF" },
  ef:   { label: "Embedded Finance", color: "#A855F7" },
  ai:   { label: "AI / GenAI",       color: "#E9B44C" },
  news: { label: "Industry",         color: "#38BDF8" },
  tech: { label: "Tech Notes",       color: "#34D399" },
  lead: { label: "Leadership",       color: "#F472B6" },
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
    <svg className="cover" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${cat}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="0.26" />
          <stop offset="1" stopColor="#05070E" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="640" height="200" fill="#070B14" />
      <rect width="640" height="200" fill={`url(#g-${cat})`} />
      {[...Array(6)].map((_, i) => (
        <line key={i} x1="0" y1={26 + i * 30} x2="640" y2={26 + i * 30} stroke={c} strokeOpacity="0.08" strokeWidth="1" />
      ))}
      <g style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <circle cx="120" cy="104" r="6" fill={c} />
        <circle cx="330" cy="66"  r="4" fill={c} fillOpacity="0.8" />
        <circle cx="520" cy="140" r="8" fill={c} />
        <path d="M120 104 C 220 104, 250 66, 330 66 S 440 140, 520 140"
          fill="none" stroke={c} strokeWidth="2" strokeOpacity="0.8" strokeDasharray="2 8" strokeLinecap="round" />
      </g>
      <text x="28" y="178" fill={c} fillOpacity="0.9"
        style={{ font: "500 12px 'Poppins', sans-serif", letterSpacing: "0.18em" }}>
        {CATEGORIES[cat].label.toUpperCase()}
      </text>
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "feed", label: "Feed", icon: <Radio size={18} /> },
  { id: "work", label: "Work", icon: <Briefcase size={18} /> },
  { id: "stack", label: "Stack", icon: <Layers size={18} /> },
  { id: "projects", label: "Projects", icon: <LayoutGrid size={18} /> },
  { id: "contact", label: "Contact", icon: <AtSign size={18} /> },
];

const ORBS = [
  { c: "#4E96FF", size: 560, left: "2%",  top: "0%",  x: [0, 90, -30, 0],  y: [0, 40, 80, 0],  dur: 24 },
  { c: "#A855F7", size: 480, left: "60%", top: "8%",  x: [0, -70, 40, 0],  y: [0, 60, -30, 0], dur: 30 },
  { c: "#22C55E", size: 400, left: "20%", top: "55%", x: [0, 60, -50, 0],  y: [0, -40, 30, 0], dur: 34 },
  { c: "#38BDF8", size: 440, left: "72%", top: "62%", x: [0, -50, 30, 0],  y: [0, 30, -60, 0], dur: 27 },
];

function MovingBackground({ reduce }) {
  return (
    <div className="bg-field" aria-hidden="true">
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          className="orb"
          style={{
            width: o.size, height: o.size, left: o.left, top: o.top,
            background: `radial-gradient(circle, ${o.c} 0%, transparent 68%)`,
          }}
          animate={reduce ? {} : { x: o.x, y: o.y, scale: [1, 1.14, 0.96, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="bg-grain" />
    </div>
  );
}

function FloatCard({ children, className, index = 0, reduce }) {
  const dur = 5 + (index % 4) * 0.8;
  const delay = (index % 5) * 0.22;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={reduce ? undefined : { y: -10, transition: { duration: 0.3 } }}
    >
      <motion.div
        className={className}
        animate={reduce ? undefined : { y: [0, -9, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState(SEED_POSTS);
  const [view, setView] = useState(
    typeof window !== "undefined" && window.location.hash === "#light-bank" ? "lightbank" : "site"
  );
  const reduce = useReducedMotion();
  const [active, setActive] = useState("");

  useEffect(() => { loadPosts().then(setPosts); }, []);
  useEffect(() => {
    const onHash = () => setView(window.location.hash === "#light-bank" ? "lightbank" : "site");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (view !== "site") return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [view]);

  if (view === "lightbank") {
    return <LightBankPage onBack={() => { window.location.hash = ""; }} />;
  }

  const shown = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.cat === filter)),
    [filter, posts]
  );

  const tabs = [["all", "All"], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])];

  return (
    <div className="ah">
      <style>{CSS}</style>
      <MovingBackground reduce={reduce} />

      <nav className="sidenav" aria-label="Primary">
        <a href="#top" className="side-brand" aria-label="Back to top">
          <svg className="brand-glyph" viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
            <defs>
              <linearGradient id="lm-stroke" x1="11" y1="49" x2="54" y2="15" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#3E8BFF" /><stop offset="1" stopColor="#9AD0FF" />
              </linearGradient>
              <filter id="lm-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g fill="none" stroke="url(#lm-stroke)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#lm-glow)">
              <path d="M22 15 L13 49 M22 15 L31 49" />
              <path d="M37 15 V49 M53 15 V49" />
              <path d="M11 33 H55" />
            </g>
            <circle className="brand-node" cx="55" cy="33" r="3.3" fill="#EAF6FF" filter="url(#lm-glow)" />
          </svg>
        </a>
        <div className="side-sep" />
        <div className="side-items">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <a key={id} href={`#${id}`} className={"side-item" + (active === id ? " on" : "")} onClick={() => setActive(id)}>
              <span className="si-glow" aria-hidden="true" />
              <span className="si-icon">{icon}</span>
              <span className="si-label">{label}</span>
            </a>
          ))}
        </div>
        <div className="side-sep" />
        <a href="mailto:aon@aonhassan.com" className="side-item side-cta">
          <span className="si-icon"><Mail size={18} /></span>
          <span className="si-label">Email</span>
        </a>
      </nav>

      <main id="top">
        <section className="hero">
          <motion.div className="hero-copy"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="hero-brand">
              <svg viewBox="0 0 340 72" role="img" aria-label="Aon Hassan">
                <defs>
                  <linearGradient id="s3" x1="11" y1="49" x2="54" y2="15" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#3E8BFF" /><stop offset="1" stopColor="#9AD0FF" />
                  </linearGradient>
                  <radialGradient id="t3" cx="50%" cy="36%" r="72%">
                    <stop offset="0" stopColor="#14264A" /><stop offset="1" stopColor="#080C16" />
                  </radialGradient>
                  <filter id="g3" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="2.2" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <g transform="translate(8,4)">
                  <rect x="1.5" y="1.5" width="61" height="61" rx="16" fill="url(#t3)" />
                  <rect x="1.5" y="1.5" width="61" height="61" rx="16" fill="none" stroke="#4E96FF" strokeOpacity="0.30" />
                  <g fill="none" stroke="url(#s3)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#g3)">
                    <path d="M22 15 L13 49 M22 15 L31 49" />
                    <path d="M37 15 V49 M53 15 V49" />
                    <path d="M11 33 H55" />
                  </g>
                  <circle cx="55" cy="33" r="5.4" fill="#4E96FF" opacity="0.35" filter="url(#g3)" />
                  <circle cx="55" cy="33" r="3.1" fill="#EAF6FF" filter="url(#g3)" />
                </g>
                <text x="90" y="38" fontFamily="Poppins, 'Segoe UI', system-ui, sans-serif" fontWeight="300" fontSize="27" letterSpacing="0.5" fill="#EAF0FF">Aon Hassan</text>
                <text x="91" y="55" fontFamily="Poppins, 'Segoe UI', system-ui, sans-serif" fontWeight="400" fontSize="9.5" letterSpacing="3.2" fill="#7c88a8">ENGINEERING · OPEN BANKING</text>
              </svg>
            </div>
            <p className="eyebrow">Open Banking · Embedded Finance · AI-led delivery</p>
            <h1>
              I build the rails that move money between banks, fintechs,
              and the <span className="glow">apps people use every day.</span>
            </h1>
            <p className="lede">
              Twenty years turning product vision into regulated, live banking across the GCC.
              Five digital banks delivered end to end, conventional and Islamic, retail and corporate,
              now leading engineering and product at MENA&apos;s leading open banking platform.
            </p>
            <div className="pills">
              <span>MSc Finance · LSE</span>
              <span>BSc Computer Science · Western</span>
              <span>PfMP®</span>
              <span>ISC2 CC</span>
            </div>
            <div className="hero-cta">
              <motion.a href="mailto:aon@aonhassan.com" className="btn btn-solid"
                whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Mail size={16} /> Email me
              </motion.a>
              <motion.a href="#feed" className="btn btn-ghost"
                whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                Read the feed <ArrowUpRight size={16} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div className="hero-art" aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}>
            <svg viewBox="0 0 360 360">
              <defs>
                <linearGradient id="flow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4E96FF" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <circle cx="180" cy="180" r="150" fill="none" stroke="rgba(78,150,255,.12)" strokeWidth="1" />
              {[70, 150, 230, 310].map((y) => (
                <g key={`l${y}`} style={{ filter: "drop-shadow(0 0 4px rgba(78,150,255,.5))" }}>
                  <rect x="18" y={y - 16} width="66" height="32" rx="8" fill="#0A1120" stroke="#4E96FF" strokeOpacity="0.55" />
                  <text x="51" y={y + 4} textAnchor="middle" style={{ font: "300 11px 'Poppins'" }} fill="#8ea3cf">BANK</text>
                </g>
              ))}
              {[110, 250].map((y) => (
                <g key={`r${y}`} style={{ filter: "drop-shadow(0 0 4px rgba(168,85,247,.55))" }}>
                  <rect x="276" y={y - 18} width="66" height="36" rx="8" fill="#0A1120" stroke="#A855F7" strokeOpacity="0.6" />
                  <text x="309" y={y + 4} textAnchor="middle" style={{ font: "300 11px 'Poppins'" }} fill="#8ea3cf">APP</text>
                </g>
              ))}
              <circle cx="180" cy="180" r="30" fill="url(#flow)" fillOpacity="0.14" stroke="url(#flow)" strokeWidth="1.5"
                style={{ filter: "drop-shadow(0 0 10px rgba(78,150,255,.5))" }} />
              <text x="180" y="184" textAnchor="middle" style={{ font: "400 12px 'Poppins'" }} fill="#EAF0FF">API</text>
              {[
                "M84 70 C150 70 150 180 180 180", "M84 150 C150 150 150 180 180 180",
                "M84 230 C150 230 150 180 180 180", "M84 310 C150 310 150 180 180 180",
                "M180 180 C210 180 210 110 276 110", "M180 180 C210 180 210 250 276 250",
              ].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="url(#flow)" strokeWidth="1.6" strokeOpacity="0.6"
                  strokeDasharray="3 7" className="flow-path" style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </svg>
          </motion.div>
        </section>

        <section className="stats">
          {[
            ["20+", "years in fintech", "#4E96FF"],
            ["5", "digital banks delivered", "#A855F7"],
            ["$20M+", "revenue and new business", "#E9B44C"],
            ["70+", "engineers and PMs led", "#34D399"],
            ["3", "central banks: CBUAE, SAMA, CBB", "#F472B6"],
          ].map(([n, l, c], i) => (
            <motion.div key={l} className="stat" style={{ "--sc": c }}
              initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <span className="stat-n">{n}</span>
              <span className="stat-l">{l}</span>
            </motion.div>
          ))}
        </section>

        <section className="feed" id="feed">
          <div className="feed-head">
            <div>
              <h2>The Feed</h2>
              <p className="sub">Daily notes on open banking, embedded finance, and shipping with AI.</p>
            </div>
            <span className="live"><Radio size={13} /> Updated daily</span>
          </div>

          <div className="tabs" role="tablist">
            {tabs.map(([k, label]) => (
              <button key={k} className={`tab ${filter === k ? "on" : ""}`}
                onClick={() => setFilter(k)} role="tab" aria-selected={filter === k}>
                {label}
              </button>
            ))}
          </div>

          <div className="cards">
            {shown.map((p, i) => {
              const cat = CATEGORIES[p.cat] || CATEGORIES.news;
              return (
                <FloatCard key={p.id} className="card" index={i} reduce={reduce}>
                  <div className="card-top">
                    <span className="avatar">AH</span>
                    <div className="who">
                      <span className="who-name">Aon Hassan <BadgeCheck size={15} className="verified" /></span>
                      <span className="who-role">VP Engineering · Open Banking · Riyadh</span>
                      <span className="who-meta">
                        {p.time} · <i style={{ color: cat.color, textShadow: `0 0 8px ${cat.color}` }}>● </i>{cat.label}
                      </span>
                    </div>
                  </div>
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-body">{p.body}</p>
                  <div className="card-cover"><CoverArt cat={CATEGORIES[p.cat] ? p.cat : "news"} /></div>
                  <div className="card-actions">
                    <button><Heart size={16} /> {p.likes}</button>
                    <button><MessageCircle size={16} /> {p.comments}</button>
                    <button><Repeat2 size={16} /> {p.reposts}</button>
                    <button className="share"><Share2 size={16} /> Share</button>
                  </div>
                </FloatCard>
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
                    <p className="job-org">{j.org} <span className="place">· {j.place}</span></p>
                  </div>
                  <span className="job-dates">{j.dates}</span>
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
                <h4>{title}</h4>
                <div className="chips2">{items.map((c) => <span key={c} className="chip2">{c}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="projects" id="projects">
          <h2>Projects</h2>
          <p className="sub">Things I build to keep my hands in the product, not just the org chart.</p>
          <div className="proj-grid">
            <FloatCard className="proj-card" index={0} reduce={reduce}>
              <div className="proj-thumb" aria-hidden="true">
                <span className="proj-ring" />
                <span className="proj-bal">9,418</span>
              </div>
              <div className="proj-info">
                <span className="proj-tag">Design · React · Interaction study</span>
                <h3>Light Bank</h3>
                <p>
                  A working prototype of a luxury digital banking concept. Dark neon UI, a live account ring that
                  recolors as you switch accounts, a send-money flow, and a product configurator. Rebuilt in React
                  from the ground up, micro-interactions and all.
                </p>
                <motion.button className="btn btn-solid" onClick={() => { window.location.hash = "light-bank"; }}
                  whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  View prototype <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </FloatCard>
          </div>
        </section>
      </main>

      <footer className="contact" id="contact">
        <h2>Let&apos;s <span className="glow">talk.</span></h2>
        <p className="foot-lede">
          Open to VP and C-level engineering and product leadership in fintech and digital banking.
        </p>
        <div className="foot-links">
          <a href="mailto:aon@aonhassan.com"><Mail size={16} /> aon@aonhassan.com</a>
          <a href="tel:+966509641620"><Phone size={16} /> +966 509 641 620</a>
          <span><MapPin size={16} /> Riyadh, Saudi Arabia</span>
          <a href="https://aonhassan.com"><Globe size={16} /> aonhassan.com</a>
        </div>
        <a href="mailto:aon@aonhassan.com" className="btn btn-solid foot-btn">
          <Mail size={16} /> Email me
        </a>
        <p className="copyright">© {new Date().getFullYear()} Aon Hassan · Built for the people doing the hiring.</p>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap');

.ah{
  --bg:#05070E; --text:#EAF0FF; --muted:#93A1C4; --faint:#5f6c8c;
  --line:rgba(255,255,255,.08); --blue:#4E96FF; --blue2:#8ec5ff;
  --glass:rgba(255,255,255,.03); --glassbrd:rgba(255,255,255,.08);
  background:var(--bg); color:var(--text);
  font-family:'Poppins',system-ui,sans-serif; font-weight:300; line-height:1.6;
  -webkit-font-smoothing:antialiased; overflow-x:hidden; box-sizing:border-box;
}
.ah *{box-sizing:border-box;}
.ah h1,.ah h2,.ah h3,.ah h4{font-weight:300; margin:0; letter-spacing:-.005em; line-height:1.15;}
.ah a{color:inherit; text-decoration:none;}
.ah section{padding:0 24px; position:relative;}
.ah > header, .ah > main, .ah > footer{position:relative; z-index:1;}
.ah .bg-field{position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none;}
.ah .orb{position:absolute; border-radius:50%; filter:blur(74px); opacity:.38; mix-blend-mode:screen; will-change:transform;}
.ah .bg-grain{position:absolute; inset:0; opacity:.35;
  background:radial-gradient(rgba(120,150,220,.08) 1px, transparent 1px); background-size:3px 3px;}
.ah .glow{color:#fff; text-shadow:0 0 20px rgba(78,150,255,.7), 0 0 46px rgba(78,150,255,.4);}

/* SIDE NAV */
.ah .sidenav{position:fixed; left:22px; top:50%; transform:translateY(-50%); z-index:40;
  display:flex; flex-direction:column; gap:5px; padding:12px 10px;
  background:rgba(8,12,22,.62); backdrop-filter:blur(16px); border:1px solid var(--glassbrd); border-radius:20px;
  box-shadow:0 24px 60px -26px rgba(0,0,0,.85), 0 0 34px -14px rgba(78,150,255,.3);}
.ah .side-brand{display:grid; place-items:center; width:44px; height:44px; margin:0 auto 2px; border-radius:12px;
  background:#0A1120; border:1px solid rgba(78,150,255,.4); box-shadow:0 0 16px rgba(78,150,255,.25);}
.ah .brand-glyph{display:block;}
.ah .brand-node{animation:nodeGlow 2.6s ease-in-out infinite; transform-box:fill-box; transform-origin:center;}
@keyframes nodeGlow{0%,100%{opacity:.6;} 50%{opacity:1;}}
.ah .side-sep{height:1px; background:var(--line); margin:5px 8px;}
.ah .side-items{display:flex; flex-direction:column; gap:5px;}
.ah .side-item{position:relative; display:flex; align-items:center; gap:11px; padding:10px 16px 10px 12px; border-radius:13px;
  color:var(--muted); font-size:13px; font-weight:300; letter-spacing:.01em; border:1px solid transparent; transition:.22s; cursor:pointer;}
.ah .side-item .si-icon{display:grid; place-items:center; width:24px; height:24px; flex:none; color:inherit; z-index:1;}
.ah .side-item .si-label{z-index:1; white-space:nowrap;}
.ah .side-item:hover{color:var(--blue2); background:rgba(78,150,255,.08); border-color:rgba(78,150,255,.25);}
.ah .side-item.on{color:#EAF0FF; background:linear-gradient(115deg, rgba(78,150,255,.30), rgba(78,150,255,.05));
  border-color:rgba(78,150,255,.6); box-shadow:0 0 24px rgba(78,150,255,.4), inset 0 0 16px rgba(78,150,255,.15);}
.ah .side-item.on .si-icon{color:#8ec5ff; filter:drop-shadow(0 0 6px #4E96FF);}
/* the glow that spills into the page from the active item */
.ah .si-glow{position:absolute; top:50%; left:100%; width:300px; height:210px;
  transform:translate(-42%,-50%) scale(.72); pointer-events:none; opacity:0; filter:blur(30px);
  background:radial-gradient(closest-side, rgba(78,150,255,.32), rgba(120,90,255,.10) 55%, transparent);
  transition:opacity .45s ease, transform .45s ease;}
.ah .side-item.on .si-glow{opacity:1; transform:translate(-42%,-50%) scale(1);}
.ah .side-cta{color:#cfe2ff; background:rgba(78,150,255,.1); border-color:rgba(78,150,255,.4);}
.ah .side-cta:hover{background:rgba(78,150,255,.18); color:#cfe2ff;}

.ah .btn{display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:400; padding:9px 17px;
  border-radius:11px; cursor:pointer; border:1px solid transparent; transition:.2s; font-family:'Poppins';}
.ah .btn-solid{background:rgba(78,150,255,.12); border-color:rgba(78,150,255,.5); color:#cfe2ff; box-shadow:0 0 18px rgba(78,150,255,.25);}
.ah .btn-solid:hover{background:rgba(78,150,255,.2); box-shadow:0 0 26px rgba(78,150,255,.45); transform:translateY(-1px);}
.ah .btn-ghost{border-color:var(--glassbrd); color:var(--text); background:transparent;}
.ah .btn-ghost:hover{border-color:var(--blue); color:var(--blue2);}

/* HERO */
.ah .hero{max-width:1160px; margin:0 auto; padding-top:70px; padding-bottom:56px;
  display:grid; grid-template-columns:1.25fr .9fr; gap:48px; align-items:center;}
.ah .hero::before{content:""; position:absolute; top:-40px; left:20%; width:520px; height:420px; z-index:-1;
  background:radial-gradient(circle, rgba(78,150,255,.18), transparent 68%); filter:blur(20px);}
.ah .hero-brand{margin-bottom:24px;}
.ah .hero-brand svg{width:330px; max-width:82%; height:auto; display:block;}
.ah .eyebrow{font-size:12px; letter-spacing:.06em; color:var(--blue2); text-transform:uppercase; margin:0 0 22px; font-weight:400;}
.ah .hero h1{font-size:clamp(2.3rem,5vw,3.9rem); font-weight:200; letter-spacing:-.01em;}
.ah .lede{margin:24px 0 0; max-width:48ch; color:var(--muted); font-size:16px; font-weight:300;}
.ah .pills{display:flex; flex-wrap:wrap; gap:8px; margin:26px 0 0;}
.ah .pills span{font-size:11.5px; padding:6px 12px; border:1px solid var(--glassbrd); border-radius:999px; color:var(--text); background:var(--glass);}
.ah .hero-cta{display:flex; flex-wrap:wrap; gap:12px; margin-top:30px;}
.ah .hero-art{display:grid; place-items:center;}
.ah .hero-art svg{width:100%; max-width:390px; height:auto; animation:float 7s ease-in-out infinite;}
.ah .flow-path{stroke-dashoffset:200; animation:dash 3.4s linear infinite;}
@keyframes dash{to{stroke-dashoffset:0;}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}

/* STATS */
.ah .stats{max-width:1160px; margin:0 auto; display:grid; grid-template-columns:repeat(5,1fr);
  gap:1px; background:var(--line); border:1px solid var(--line); border-radius:16px; overflow:hidden;}
.ah .stat{background:#080C16; padding:26px 20px; display:flex; flex-direction:column; gap:8px; position:relative;}
.ah .stat-n{font-size:34px; font-weight:200; color:#EAF0FF; text-shadow:0 0 20px rgba(78,150,255,.45); line-height:1;}
.ah .stat-l{font-size:11px; color:var(--muted); line-height:1.4;}

/* FEED */
.ah .feed{max-width:680px; margin:0 auto; padding-top:84px;}
.ah .feed-head{display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;}
.ah .feed h2,.ah .work h2,.ah .stack h2{font-size:clamp(1.7rem,3vw,2.3rem); font-weight:200;}
.ah .sub{font-size:12.5px; color:var(--muted); margin:9px 0 0;}
.ah .live{display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:var(--blue2);
  background:rgba(78,150,255,.1); padding:6px 12px; border-radius:999px; border:1px solid rgba(78,150,255,.25);}
.ah .live svg{animation:pulse 1.8s ease-in-out infinite;}
.ah .tabs{display:flex; gap:8px; flex-wrap:wrap; margin:24px 0 24px;}
.ah .tab{font-size:12px; padding:7px 14px; border-radius:999px; border:1px solid var(--glassbrd);
  background:transparent; color:var(--muted); cursor:pointer; transition:.2s; font-family:'Poppins'; font-weight:300;}
.ah .tab:hover{border-color:var(--blue); color:var(--blue2);}
.ah .tab.on{background:rgba(78,150,255,.16); color:#EAF0FF; border-color:rgba(78,150,255,.6); box-shadow:0 0 16px rgba(78,150,255,.3);}
.ah .cards{display:flex; flex-direction:column; gap:18px;}
.ah .card{background:var(--glass); border:1px solid var(--glassbrd); border-radius:18px; padding:20px 20px 8px; transition:border .25s, box-shadow .25s; backdrop-filter:blur(6px); box-shadow:0 26px 54px -30px rgba(0,0,0,.9), 0 8px 20px -14px rgba(0,0,0,.6);}
.ah .card:hover{border-color:rgba(78,150,255,.5); box-shadow:0 34px 66px -26px rgba(0,0,0,.95), 0 0 46px -12px rgba(78,150,255,.45);}
.ah .card-top{display:flex; gap:12px; align-items:center;}
.ah .avatar{display:grid; place-items:center; width:46px; height:46px; border-radius:12px; flex:none;
  background:linear-gradient(135deg,#4E96FF,#A855F7); color:#fff; font-weight:500; font-size:15px; box-shadow:0 0 18px rgba(78,150,255,.4);}
.ah .who{display:flex; flex-direction:column; line-height:1.35;}
.ah .who-name{display:flex; align-items:center; gap:5px; font-weight:400; font-size:14.5px;}
.ah .verified{color:var(--blue);}
.ah .who-role{font-size:11px; color:var(--muted);}
.ah .who-meta{font-size:11px; color:var(--muted); margin-top:1px;}
.ah .card-title{font-size:18px; font-weight:400; margin:15px 0 8px; color:#EAF0FF;}
.ah .card-body{font-size:14px; color:#AFBBD6; margin:0 0 15px; font-weight:300; line-height:1.62;}
.ah .card-cover{border-radius:12px; overflow:hidden; border:1px solid var(--glassbrd);}
.ah .cover{display:block; width:100%; height:170px;}
.ah .card-actions{display:flex; gap:6px; padding:6px 0; margin-top:6px; border-top:1px solid var(--line);}
.ah .card-actions button{display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted);
  background:transparent; border:none; cursor:pointer; padding:9px 12px; border-radius:9px; transition:.2s; font-family:'Poppins';}
.ah .card-actions button:hover{background:rgba(78,150,255,.1); color:var(--blue2);}
.ah .card-actions .share{margin-left:auto;}

/* WORK */
.ah .work{max-width:880px; margin:0 auto; padding-top:96px;}
.ah .timeline{list-style:none; margin:34px 0 0; padding:0;}
.ah .job{padding:26px 0; border-top:1px solid var(--line);}
.ah .job-head{display:flex; justify-content:space-between; gap:18px; flex-wrap:wrap; align-items:baseline;}
.ah .job h3{font-size:19px; font-weight:400;}
.ah .job-org{font-size:14px; color:var(--blue2); margin:5px 0 0; font-weight:400;}
.ah .job-org .place{color:var(--muted); font-weight:300;}
.ah .job-dates{font-size:12px; color:var(--muted); white-space:nowrap;}
.ah .job ul{margin:15px 0 0; padding-left:18px; display:flex; flex-direction:column; gap:8px;}
.ah .job ul li{font-size:14px; color:#AFBBD6; font-weight:300;}
.ah .edu{display:flex; gap:13px; align-items:flex-start; margin-top:30px; padding:20px 22px;
  background:var(--glass); border:1px solid rgba(78,150,255,.2); border-radius:16px; box-shadow:0 0 30px -18px rgba(78,150,255,.5);}
.ah .edu-icon{color:var(--blue); flex:none; margin-top:2px; filter:drop-shadow(0 0 6px rgba(78,150,255,.6));}
.ah .edu p{margin:0; font-size:13.5px; color:#AFBBD6; font-weight:300;}
.ah .edu strong{color:#EAF0FF; font-weight:400;}

/* STACK */
.ah .stack{max-width:1080px; margin:0 auto; padding-top:96px; padding-bottom:30px;}
.ah .stack-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:30px 48px; margin-top:34px;}
.ah .stack-col h4{font-size:12px; letter-spacing:.04em; color:var(--blue2); text-transform:uppercase; margin-bottom:14px; font-weight:400;}
.ah .chips2{display:flex; flex-wrap:wrap; gap:8px;}
.ah .chip2{font-size:12px; padding:7px 12px; border:1px solid var(--glassbrd); border-radius:9px; color:var(--text); background:var(--glass); transition:.2s;}
.ah .chip2:hover{border-color:rgba(78,150,255,.45); box-shadow:0 0 14px rgba(78,150,255,.25);}

/* PROJECTS */
.ah .projects{max-width:880px; margin:0 auto; padding-top:96px;}
.ah .projects .sub{font-size:12.5px; color:var(--muted); margin:9px 0 0;}
.ah .proj-grid{margin-top:28px;}
.ah .proj-card{display:grid; grid-template-columns:190px 1fr; gap:26px; align-items:center; padding:24px; background:var(--glass); border:1px solid var(--glassbrd); border-radius:18px; transition:border .25s, box-shadow .25s; box-shadow:0 26px 54px -30px rgba(0,0,0,.9);}
.ah .proj-card:hover{border-color:rgba(78,150,255,.5); box-shadow:0 34px 66px -26px rgba(0,0,0,.95), 0 0 46px -12px rgba(78,150,255,.45);}
.ah .proj-thumb{position:relative; height:150px; border-radius:14px; background:radial-gradient(circle at 50% 45%, #10203f, #05070E 72%); display:grid; place-items:center; overflow:hidden;}
.ah .proj-ring{width:96px; height:96px; border-radius:50%; border:1.5px solid rgba(78,150,255,.55); box-shadow:0 0 22px rgba(78,150,255,.4), inset 0 0 16px rgba(78,150,255,.2); animation:float 6s ease-in-out infinite;}
.ah .proj-bal{position:absolute; font-weight:200; font-size:22px; color:#EAF0FF; text-shadow:0 0 16px rgba(78,150,255,.6);}
.ah .proj-tag{font-size:11px; letter-spacing:.04em; color:var(--blue2); text-transform:uppercase;}
.ah .proj-info h3{font-size:20px; font-weight:400; margin:8px 0 8px;}
.ah .proj-info p{font-size:14px; color:#AFBBD6; font-weight:300; margin:0 0 16px; max-width:54ch; line-height:1.6;}

/* CONTACT */
.ah .contact{margin-top:96px; padding:90px 24px 46px; text-align:center; position:relative;
  background:linear-gradient(180deg, transparent, rgba(78,150,255,.05)); border-top:1px solid var(--line);}
.ah .contact::before{content:""; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:560px; height:300px; z-index:0;
  background:radial-gradient(circle, rgba(78,150,255,.16), transparent 70%); filter:blur(24px);}
.ah .contact > *{position:relative; z-index:1;}
.ah .contact h2{font-size:clamp(2rem,5vw,3.4rem); font-weight:200; color:#EAF0FF;}
.ah .foot-lede{max-width:46ch; margin:18px auto 0; color:var(--muted); font-size:15px; font-weight:300;}
.ah .foot-links{display:flex; flex-wrap:wrap; justify-content:center; gap:10px 26px; margin:34px 0; font-size:13px; color:var(--muted);}
.ah .foot-links a,.ah .foot-links span{display:inline-flex; align-items:center; gap:8px; transition:.2s;}
.ah .foot-links a:hover{color:var(--blue2); text-shadow:0 0 12px rgba(78,150,255,.6);}
.ah .foot-btn{margin-top:4px;}
.ah .copyright{margin-top:42px; font-size:11px; color:var(--faint);}

@media (min-width:1024px){
  .ah{padding-left:196px;}
}
@media (min-width:1200px){
  .ah{padding-right:214px;}
  .ah .stats{position:fixed; right:22px; top:50%; transform:translateY(-50%); z-index:40;
    max-width:none; width:196px; margin:0; display:flex; flex-direction:column; gap:6px; padding:12px;
    background:rgba(8,12,22,.62); backdrop-filter:blur(16px); border:1px solid var(--glassbrd); border-radius:20px;
    box-shadow:0 24px 60px -26px rgba(0,0,0,.85), 0 0 34px -14px rgba(78,150,255,.22); overflow:visible;}
  .ah .stat{background:rgba(255,255,255,.015); padding:12px 14px; border-radius:13px; border:1px solid transparent; gap:4px;
    transition:border .25s, box-shadow .25s, background .25s;}
  .ah .stat-n{font-size:27px; transition:text-shadow .25s, color .25s;}
  .ah .stat-l{font-size:10px;}
  .ah .stat:hover{border-color:var(--sc); background:rgba(255,255,255,.045);
    box-shadow:0 0 26px -6px var(--sc), inset 0 0 18px -9px var(--sc);}
  .ah .stat:hover .stat-n{color:#fff; text-shadow:0 0 18px var(--sc);}
  .ah .stat::after{content:""; position:absolute; top:50%; right:100%; width:250px; height:150px;
    transform:translateY(-50%) scale(.7); pointer-events:none; opacity:0; filter:blur(30px);
    background:radial-gradient(closest-side, var(--sc), transparent); transition:opacity .4s ease, transform .4s ease;}
  .ah .stat:hover::after{opacity:0.42; transform:translateY(-50%) scale(1);}
}
@media (max-width:1023px){
  .ah .sidenav{left:50%; right:auto; top:auto; bottom:16px; transform:translateX(-50%);
    flex-direction:row; gap:4px; padding:8px; border-radius:16px;}
  .ah .side-brand{display:none;}
  .ah .side-sep{display:none;}
  .ah .si-label{display:none;}
  .ah .side-item{padding:11px;}
  .ah .si-glow{display:none;}
}
@media (max-width:860px){
  .ah .hero{grid-template-columns:1fr; padding-top:48px; gap:32px;}
  .ah .hero-art{order:-1; max-width:300px; margin:0 auto;}
  .ah .stats{grid-template-columns:repeat(2,1fr);}
  .ah .stack-grid{grid-template-columns:1fr;}
  .ah .proj-card{grid-template-columns:1fr;}
}
@media (prefers-reduced-motion:reduce){
  .ah *{animation:none !important;}
}
`;
