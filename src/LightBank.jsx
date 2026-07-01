import React, { useState, useEffect, useRef } from "react";

/* Light Bank, a concept banking prototype, ported to React.
   Rebuilt from a multi-awarded UXDA concept as an interaction study.
   Exports:
     <LightBank />      the phone prototype on its own
     <LightBankPage />  a project case-study page that embeds it, with a back handler */

const ACCOUNTS = [
  { key: "salary", name: "Salary account **** 4567", num: 4700,  c: "#4E96FF", glow: "rgba(78,150,255,.55)", bg: "radial-gradient(circle at 50% 42%, #12274d 0%, #05070E 62%)" },
  { key: "wife",   name: "Wife account **** 1274",   num: 9418,  c: "#A855F7", glow: "rgba(168,85,247,.55)", bg: "radial-gradient(circle at 50% 42%, #2a1148 0%, #05070E 62%)" },
  { key: "loan",   name: "Loan account **** 3390",   num: 12600, c: "#22C55E", glow: "rgba(34,197,94,.5)",   bg: "radial-gradient(circle at 50% 42%, #0c3320 0%, #05070E 62%)" },
];
const FRIENDS = [
  { n: "Jane China", c: "#4E96FF" }, { n: "Bruce Lognac", c: "#2FA85A" },
  { n: "John Archontis", c: "#D8443F" }, { n: "Wife account", c: "#A855F7" }, { n: "Gordon Robertson", c: "#E0A33E" },
];
const SCRUB = ["8.00", "9.00", "10.00", "11.00", "12.00"];
const PRODUCTS = [
  { g: "POPULAR" }, { n: "Loan", ic: "loan", act: true }, { n: "Credit Card", ic: "card" }, { n: "Account", ic: "wallet" }, { n: "Insurance", ic: "shield" },
  { g: "ALL PRODUCTS" }, { n: "Account", ic: "wallet" }, { n: "Business service", ic: "bag" }, { n: "Credit Card", ic: "card" }, { n: "Investing", ic: "leaf" },
];

function useCountUp(target, dur) {
  const [v, setV] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current, to = target;
    if (from === to) return;
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(from + (to - from) * e);
      setV(cur); prev.current = cur;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function ripple(e) {
  const t = e.currentTarget;
  const r = document.createElement("span");
  r.className = "ripple";
  const rect = t.getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + "px";
  r.style.top = (e.clientY - rect.top) + "px";
  t.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

const PIC = {
  loan: "M3 7h18v12H3zM12 10.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z",
  card: "M3 6h18v12H3zM3 10h18",
  wallet: "M3 8a2 2 0 0 1 2-2h12l2 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16.5 11.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z",
  shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4",
  bag: "M3 8h18v12H3zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  leaf: "M4 20c0-8 6-14 16-14 0 10-6 14-16 14zM4 20c4-4 8-6 12-7",
};
const Prof = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cdd8f5" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
const BackArrow = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAF0FF" strokeWidth="1.6"><path d="m15 18-6-6 6-6" /></svg>);

export function LightBank({ scale = 1 }) {
  const [screen, setScreen] = useState("faceid");
  const [unlocked, setUnlocked] = useState(false);
  const [accIdx, setAccIdx] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [amt, setAmt] = useState("10.00");
  const [toIdx, setToIdx] = useState(3);
  const [carM, setCarM] = useState(1284);
  const [arcColor, setArcColor] = useState(ACCOUNTS[0].c);
  const [sweep, setSweep] = useState(0);
  const startX = useRef(0);

  const acc = ACCOUNTS[accIdx];
  const sendTo = FRIENDS[toIdx];
  const bal = useCountUp(unlocked ? acc.num : 0, 750);
  const carDisp = useCountUp(carM, 300);

  useEffect(() => {
    if (!unlocked) return;
    setPulse(true);
    setSweep((s) => s + 1);
    const t1 = setTimeout(() => setPulse(false), 700);
    const t2 = setTimeout(() => setArcColor(ACCOUNTS[accIdx].c), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [accIdx, unlocked]);

  const go = (id) => setScreen(id);
  const unlock = () => { setUnlocked(true); setScreen("accounts"); };
  const navOn = (s) => screen === s;

  return (
    <div className="lb" style={{ zoom: scale }}>
      <style>{LB_CSS}</style>
      <div className="cap">light bank · concept prototype</div>
      <div className="phone">
        <div className="notch" />
        <div className="statusbar"><span>9:41</span><span className="r">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="#EAF0FF"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#EAF0FF" strokeWidth="1.3"><path d="M1 4.5C4.5 1.5 11.5 1.5 15 4.5M3.5 7C6 5 10 5 12.5 7M6 9.3c1.2-1 2.8-1 4 0" /></svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="3" stroke="#EAF0FF" /><rect x="3" y="3" width="15" height="6" rx="1.5" fill="#EAF0FF" /><rect x="22" y="4" width="1.6" height="4" rx="1" fill="#EAF0FF" /></svg>
        </span></div>

        {/* FACE ID */}
        <section className={"screen" + (screen === "faceid" ? " active" : "")} id="faceid">
          <div className="mid" onClick={unlock}>
            <div className="facewrap">
              <div className="wordmark">light<span className="dot" /><br />bank</div>
              <svg className="faceicon" width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#7fb4ff" strokeWidth="1.2" strokeLinecap="round">
                <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                <path d="M9 10v1M15 10v1M12 10v3l-1 1M9.5 15.5a3.5 3.5 0 0 0 5 0" />
              </svg>
              <div className="faceid-hint">Tap to unlock with Face ID</div>
            </div>
          </div>
        </section>

        {/* ACCOUNTS */}
        <section className={"screen" + (screen === "accounts" ? " active" : "")} id="accounts" style={{ background: acc.bg }}
          onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - startX.current;
            if (dx < -40 && accIdx < ACCOUNTS.length - 1) setAccIdx(accIdx + 1);
            if (dx > 40 && accIdx > 0) setAccIdx(accIdx - 1);
          }}>
          <div className="topbar"><span /><div className="prof"><Prof /></div></div>
          <div className="ringwrap">
            <div className={"ring" + (pulse ? " pulse" : "")} style={{ "--c": arcColor, "--glow": acc.glow }}>
              <svg key={sweep} className="spinner" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="128" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
                <circle className="arc" cx="150" cy="150" r="128" fill="none" stroke="var(--c)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="130 675" />
              </svg>
              <div className="center">
                <div className="lbl">{acc.name}</div>
                <div className="bal">{bal.toLocaleString("en-US")}</div>
                <div className="cur">USD</div>
              </div>
            </div>
            <div className="switcher">
              {ACCOUNTS.map((a, i) => (
                <button key={a.key} className={"acc" + (i === accIdx ? " on" : "")} onClick={() => setAccIdx(i)}>
                  <span className="node" style={{ background: i === accIdx ? a.c : "#39415c", boxShadow: i === accIdx ? `0 0 10px ${a.c},0 0 20px ${a.c}` : "none" }} />
                  <span>{a.key.charAt(0).toUpperCase() + a.key.slice(1)}</span>
                </button>
              ))}
            </div>
            <div className="dots">{ACCOUNTS.map((a, i) => <i key={a.key} className={i === accIdx ? "on" : ""} />)}</div>
          </div>
        </section>

        {/* CARDS */}
        <section className={"screen" + (screen === "cards" ? " active" : "")} id="cards">
          <div className="topbar"><span className="t">Your cards</span><div className="prof"><Prof /></div></div>
          <div className="body"><div className="cardstack">
            {[
              { bg: "linear-gradient(135deg,#2E7DD6,#1B4C8F)", type: "Debit Card", num: "3124 3122 5432 4211", id: "3551", nm: "CHAD HARMON", d: ".05s" },
              { bg: "linear-gradient(135deg,#D8443F,#8F211E)", type: "Credit Card", num: "4321 1233 7532 4567", id: "3312", nm: "CHAD HARMON", d: ".15s" },
              { bg: "linear-gradient(135deg,#2FA85A,#177A3C)", type: "Credit Card", num: "4662 3166 1186 1274", id: "5037", nm: "KIRA HARMON", d: ".25s" },
            ].map((cd, i) => (
              <div className="bank-card" key={i} style={{ background: cd.bg, animationDelay: cd.d }}>
                <div className="map" />
                <div className="cc-top"><span className="cc-brand">light bank</span><span className="cc-type">{cd.type}</span></div>
                <div className="chip" />
                <div className="cc-num">{cd.num}</div>
                <div className="cc-foot"><span>{cd.id}</span><span>09/21</span><b>{cd.nm}</b></div>
              </div>
            ))}
          </div></div>
        </section>

        {/* SEND */}
        <section className={"screen" + (screen === "send" ? " active" : "")} id="send">
          <div className="topbar"><button className="back" onClick={() => go("accounts")}><BackArrow /></button><span className="t">Send money</span><div className="prof"><Prof /></div></div>
          <div className="body">
            <div className="scrub">{SCRUB.map((v) => <button key={v} className={v === amt ? "sel" : ""} onClick={() => setAmt(v)}>{v}</button>)}</div>
            <div className="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c88a8" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>Type here to find friend</div>
            <div className="tabs2"><b>RECENT</b><span>ACCOUNTS</span><span>NEAR ME</span></div>
            <div className="chips">{FRIENDS.map((f, i) => {
              const init = f.n.split(" ").map((w) => w[0]).slice(0, 2).join("");
              return (<button key={i} className={"chip" + (i === toIdx ? " on" : "")} onClick={() => setToIdx(i)}><span className="av" style={{ background: f.c }}>{init}</span>{f.n}</button>);
            })}</div>
            <div className="note">Add note...</div>
            <button className="sendbtn rip" onClick={(e) => { ripple(e); go("confirm"); }}><span>SEND {amt}$</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cdd8f5" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
          </div>
        </section>

        {/* CONFIRM */}
        <section className={"screen" + (screen === "confirm" ? " active" : "")} id="confirm">
          <div className="inner">
            <svg className="arrow" width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="#35F07F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 35h74M62 14l30 21-30 21" /><path d="M104 26v18" /></svg>
            <div className="c-amt">{amt}<span className="u"> $</span></div>
            <div className="c-sub">will be sent now</div>
            <div className="c-to">TO</div>
            <div className="c-av" style={{ background: sendTo.c, boxShadow: `0 0 26px ${sendTo.c}` }}>{sendTo.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div className="c-name">{sendTo.n}</div>
            <button className="yeah rip" onClick={(e) => { ripple(e); go("accounts"); }}>YEAH, BABY</button>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className={"screen" + (screen === "products" ? " active" : "")} id="products">
          <div className="topbar"><span className="t">Add new product</span><button className="back" onClick={() => go("accounts")}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAF0FF" strokeWidth="1.6"><path d="M6 6l12 12M18 6 6 18" /></svg></button></div>
          <div className="body">
            <div className="search" style={{ marginTop: 16 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c88a8" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>Type here to find product</div>
            <div className="grid">
              {(() => { let d = 0; return PRODUCTS.map((p, i) => {
                if (p.g) return <div className="ghead" key={"g" + i}>{p.g}</div>;
                d += 0.06;
                const onClick = p.n === "Loan" ? (e) => { ripple(e); go("builder"); } : ripple;
                return (<div className={"tile rip" + (p.act ? " glow" : "")} key={i} style={{ animationDelay: d.toFixed(2) + "s" }} onClick={onClick}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8ec5ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d={PIC[p.ic]} /></svg>
                  <span>{p.n}</span></div>);
              }); })()}
            </div>
          </div>
        </section>

        {/* SENTENCE BUILDER */}
        <section className={"screen" + (screen === "builder" ? " active" : "")} id="builder">
          <div className="inner">
            <div className="need l l1">I need</div>
            <div className="pick l l2">Loan</div>
            <div className="need l l3">for</div>
            <div className="pick l l4">Car<small>choose purpose</small></div>
            <button className="show rip l" onClick={(e) => { ripple(e); go("carloan"); }}>SHOW OFFER</button>
          </div>
        </section>

        {/* CAR LOAN */}
        <section className={"screen" + (screen === "carloan" ? " active" : "")} id="carloan">
          <div className="topbar"><button className="back" onClick={() => go("products")}><BackArrow /></button><span className="t">Car loan offers</span><div className="prof"><Prof /></div></div>
          <div className="body">
            <div className="car-title">Financial auto lease</div>
            <div className="car-hero">
              <svg width="230" height="250" viewBox="0 0 230 250" style={{ position: "absolute", left: "-30px", top: 0 }} fill="none">
                <path d="M20 150 Q60 96 150 100 L210 108 Q236 116 232 150 L232 176 Q120 190 20 176 Z" fill="#0c1220" stroke="#1d2740" />
                <ellipse cx="70" cy="150" rx="34" ry="20" fill="#0a1830" />
                <ellipse className="headlight" cx="70" cy="150" rx="22" ry="13" fill="#7fb4ff" opacity=".9" style={{ filter: "drop-shadow(0 0 16px #4E96FF)" }} />
                <ellipse cx="70" cy="150" rx="10" ry="6" fill="#EAF0FF" />
                <path d="M150 132 q40 2 60 10" stroke="#3E8BFF" strokeWidth="2" opacity=".5" />
              </svg>
              <div className="car-stats">
                <div><b>3,5%</b><small>ARP</small></div><div><b>60M</b><small>Term</small></div>
                <div><b>8,000</b><small>Deposit, USD</small></div><div><b>500</b><small>Fee, USD</small></div>
              </div>
            </div>
            <div className="stepper">
              <button className="rndbtn rip" onClick={(e) => { ripple(e); setCarM(Math.max(400, carM - 40)); }}>&minus;</button>
              <div className="mid"><small>MONTHLY / TOTAL</small><b>{carDisp} USD</b></div>
              <button className="rndbtn rip" onClick={(e) => { ripple(e); setCarM(carM + 40); }}>+</button>
            </div>
            <button className="getbtn rip" onClick={ripple}>GET $80,000<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8ec5ff" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
          </div>
        </section>

        {unlocked && (
          <nav className="nav">
            <button className={navOn("accounts") ? "on" : ""} onClick={() => go("accounts")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>Accounts</button>
            <button className={navOn("cards") ? "on" : ""} onClick={() => go("cards")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>Cards</button>
            <button className={navOn("send") ? "on" : ""} onClick={() => go("send")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>Send</button>
            <button className={navOn("products") ? "on" : ""} onClick={() => go("products")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>Products</button>
          </nav>
        )}
      </div>
      <div className="cap">{unlocked ? "swipe accounts · tap send · explore products" : "tap the screen to unlock with face id"}</div>
    </div>
  );
}

export function LightBankPage({ onBack }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const availH = window.innerHeight - 120;
      const availW = Math.min(window.innerWidth - 48, 470);
      const s = Math.max(0.5, Math.min(1, availH / 910, availW / 390));
      setScale(Math.round(s * 1000) / 1000);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="lbpage">
      <style>{LB_CSS}</style>
      <div className="lbpage-bar">
        <button onClick={onBack}><BackArrow /> Back to site</button>
        <span>Aon Hassan · Projects</span>
      </div>
      <div className="lbpage-body">
        <div className="lbpage-info">
          <span className="lbpage-tag">Design · React · Interaction study</span>
          <h1>Light Bank</h1>
          <p className="lead">
            A working prototype of a luxury digital banking concept. I rebuilt it in React from the ground up,
            translating the motion language of a multi-awarded design concept into a live, tappable interface.
          </p>
          <p>
            The point was not to copy a screen, it was to understand how premium fintech UX actually feels in the hand:
            the living account ring, the hue shift as you move between accounts, the send flow that turns green on
            confirmation, and the product configurator that composes a sentence from your choices.
          </p>
          <div className="lbpage-list">
            <div><b>Account ring</b><span>Swipe between Salary, Wife, and Loan, the balance counts up and the whole scene recolors.</span></div>
            <div><b>Send money</b><span>Scrub the amount, pick a recipient, confirm on the neon green screen.</span></div>
            <div><b>Product flow</b><span>Tap a product to morph the grid into a natural-language offer builder.</span></div>
          </div>
          <div className="lbpage-tech">
            <span>React</span><span>Hooks</span><span>CSS animation</span><span>SVG</span><span>rAF count-up</span>
          </div>
          <p className="lbpage-note">
            Built as an original interaction study. The car visual and card map are my own stand-ins rather than copied assets.
          </p>
        </div>
        <div className="lbpage-embed"><LightBank scale={scale} /></div>
      </div>
    </div>
  );
}

const LB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap');

.lb, .lbpage{font-family:'Poppins',system-ui,sans-serif; color:#EAF0FF;}
.lb *, .lbpage *{margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
.lb{display:flex; flex-direction:column; align-items:center; gap:14px;}
.lb .cap{font-weight:300; font-size:12px; letter-spacing:.18em; color:#5b6480; text-transform:lowercase;}

.lb .phone{width:390px; height:844px; border-radius:48px; position:relative; overflow:hidden; background:#05070E;
  box-shadow:0 0 0 11px #0c0f17, 0 0 0 12px #23283a, 0 46px 90px -30px rgba(0,0,0,.75);}
.lb .statusbar{position:absolute; top:0; left:0; right:0; height:52px; z-index:70; display:flex; align-items:center; justify-content:space-between; padding:18px 30px 0; font-size:13px; pointer-events:none;}
.lb .statusbar .r{display:flex; gap:7px; align-items:center;}
.lb .notch{position:absolute; top:13px; left:50%; transform:translateX(-50%); width:118px; height:26px; background:#05070E; border-radius:16px; z-index:71;}
.lb .screen{position:absolute; inset:0; display:none; flex-direction:column; z-index:5;}
.lb .screen.active{display:flex; animation:lbenter .55s cubic-bezier(.2,.7,.2,1) both;}
@keyframes lbenter{from{opacity:0; transform:perspective(1400px) rotateY(10deg) translateX(22px);} to{opacity:1; transform:none;}}
.lb .body{flex:1; overflow-y:auto; overflow-x:hidden; scrollbar-width:none; position:relative;}
.lb .body::-webkit-scrollbar{display:none;}
.lb .topbar{display:flex; align-items:center; justify-content:space-between; padding:60px 26px 0; position:relative; z-index:6;}
.lb .topbar .t{font-weight:300; font-size:16px;}
.lb .prof{width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,.25); display:grid; place-items:center;}
.lb .back{width:34px; height:34px; display:grid; place-items:center; cursor:pointer; border:none; background:none; color:#EAF0FF;}

.lb #faceid{background:radial-gradient(circle at 50% 42%, #16233f 0%, #070a14 62%);}
.lb #faceid .mid{flex:1; display:grid; place-items:center; cursor:pointer;}
.lb .facewrap{display:flex; flex-direction:column; align-items:center; gap:34px;}
.lb .faceicon{animation:lbbreathe 2.6s ease-in-out infinite;}
@keyframes lbbreathe{0%,100%{filter:drop-shadow(0 0 8px #3E8BFF) drop-shadow(0 0 20px #2f6dff);} 50%{filter:drop-shadow(0 0 16px #56a0ff) drop-shadow(0 0 40px #3E8BFF);}}
.lb .wordmark{font-weight:300; font-size:44px; line-height:.95; text-align:center; color:#EAF0FF; text-shadow:0 0 18px rgba(78,150,255,.75), 0 0 42px rgba(60,110,255,.5);}
.lb .wordmark .dot{display:inline-block; width:9px; height:9px; border-radius:50%; background:#8ec5ff; box-shadow:0 0 10px #4E96FF,0 0 22px #3E8BFF; vertical-align:12px; margin-left:-14px;}
.lb .faceid-hint{font-weight:300; font-size:14px; color:#8ea3cf;}

.lb #accounts{transition:background .6s ease;}
.lb .ringwrap{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding-bottom:20px;}
.lb .ring{position:relative; width:300px; height:300px; display:grid; place-items:center; animation:lbfloat 6s ease-in-out infinite;}
@keyframes lbfloat{0%,100%{transform:translateY(0) rotate(0);} 50%{transform:translateY(-9px) rotate(.5deg);}}
.lb .ring.pulse{animation:lbfloat 6s ease-in-out infinite, lbpulse .7s ease;}
@keyframes lbpulse{0%{transform:scale(.93);} 55%{transform:scale(1.04);} 100%{transform:scale(1);}}
.lb .ring .spinner{position:absolute; inset:0; width:100%; height:100%; transform-origin:center; animation:lbsweep .8s cubic-bezier(.35,0,.2,1);}
@keyframes lbsweep{from{transform:rotate(0deg);} to{transform:rotate(360deg);}}
.lb .ring .arc{filter:drop-shadow(0 0 5px var(--c)) drop-shadow(0 0 13px var(--c)); transition:stroke .5s ease;}
.lb .ring .center{text-align:center; z-index:2;}
.lb .ring .lbl{font-weight:300; font-size:13px; color:#9fb0d6; margin-bottom:6px;}
.lb .ring .bal{font-weight:200; font-size:66px; line-height:1; text-shadow:0 0 22px var(--glow); transition:text-shadow .5s ease; animation:lbbreath 3.4s ease-in-out infinite;}
@keyframes lbbreath{0%,100%{opacity:.9;} 50%{opacity:1;}}
.lb .ring .cur{font-weight:300; font-size:13px; letter-spacing:.28em; color:#9fb0d6; margin-top:10px;}
.lb .switcher{display:flex; justify-content:center; gap:34px; margin-top:26px;}
.lb .acc{background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:9px;}
.lb .acc .node{width:10px; height:10px; border-radius:50%; background:#39415c; transition:.4s;}
.lb .acc.on .node{transform:scale(1.5);}
.lb .acc span{font-weight:300; font-size:12px; color:#6b779a; transition:.3s;}
.lb .acc.on span{color:#EAF0FF;}
.lb .dots{display:flex; gap:7px; justify-content:center; padding:14px 0 30px;}
.lb .dots i{width:6px; height:6px; border-radius:50%; background:#2c3350; transition:.35s;}
.lb .dots i.on{background:#8ea3cf; width:18px; border-radius:6px;}

.lb #cards{background:radial-gradient(circle at 50% 30%, #10182b, #05070E 70%);}
.lb .cardstack{padding:24px 26px 40px; perspective:1200px; display:flex; flex-direction:column;}
.lb .bank-card{position:relative; height:200px; border-radius:20px; padding:22px; margin-bottom:-56px; transform:rotateX(28deg); transform-origin:top center; box-shadow:0 30px 50px -18px rgba(0,0,0,.7); overflow:hidden; transition:transform .45s ease, margin .45s ease; cursor:pointer; opacity:0; animation:lbcardin .6s ease forwards;}
@keyframes lbcardin{from{opacity:0; transform:rotateX(45deg) translateY(30px);} to{opacity:1; transform:rotateX(28deg);}}
.lb .bank-card:last-child{margin-bottom:0;}
.lb .bank-card:hover{transform:rotateX(6deg) translateY(-6px)!important; margin-bottom:-20px; z-index:5;}
.lb .bank-card .map{position:absolute; inset:0; opacity:.22; background-image:radial-gradient(#fff 0.9px, transparent 1px); background-size:9px 9px; -webkit-mask-image:radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 78%); mask-image:radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 78%);}
.lb .bank-card .cc-top{display:flex; justify-content:space-between; position:relative; z-index:2;}
.lb .bank-card .cc-brand{font-weight:400; font-size:14px;} .lb .bank-card .cc-type{font-weight:300; font-size:12px; opacity:.9;}
.lb .bank-card .chip{width:34px; height:25px; border-radius:5px; margin:16px 0 14px; position:relative; z-index:2; background:linear-gradient(135deg,#E8D9A8,#B79A55);}
.lb .bank-card .cc-num{position:relative; z-index:2; font-weight:400; font-size:19px; letter-spacing:.06em;}
.lb .bank-card .cc-foot{position:relative; z-index:2; display:flex; gap:16px; margin-top:12px; font-weight:300; font-size:11px;}
.lb .bank-card .cc-foot b{font-weight:500;}

.lb #send{background:radial-gradient(circle at 50% 20%, #12203f, #05070E 66%);}
.lb .scrub{display:flex; align-items:flex-end; justify-content:center; gap:16px; padding:24px 0 10px; overflow:hidden;}
.lb .scrub button{background:none; border:none; color:#5a6480; font-family:'Poppins'; cursor:pointer; font-weight:200; font-size:20px; transition:font-size .28s cubic-bezier(.2,.7,.2,1), color .28s ease, opacity .28s ease; opacity:.7;}
.lb .scrub .sel{font-size:40px; color:#EAF0FF; opacity:1; text-shadow:0 0 20px #4E96FF; position:relative;}
.lb .scrub .sel::after{content:""; position:absolute; left:6%; right:6%; bottom:-8px; height:2px; background:#4E96FF; box-shadow:0 0 10px #4E96FF; animation:lbline .3s ease both;}
@keyframes lbline{from{transform:scaleX(0);} to{transform:scaleX(1);}}
.lb .search{margin:22px 26px 0; height:46px; border-radius:12px; background:rgba(255,255,255,.05); display:flex; align-items:center; gap:10px; padding:0 14px; color:#7c88a8; font-weight:300; font-size:14px;}
.lb .tabs2{display:flex; gap:18px; padding:20px 26px 0; font-weight:400; font-size:11px; letter-spacing:.12em;}
.lb .tabs2 b{color:#EAF0FF;} .lb .tabs2 span{color:#5a6480;}
.lb .chips{display:flex; flex-wrap:wrap; gap:10px; padding:16px 26px 0;}
.lb .chip{display:flex; align-items:center; gap:9px; padding:8px 14px 8px 8px; border-radius:24px; background:rgba(255,255,255,.05); border:1px solid transparent; cursor:pointer; font-weight:300; font-size:13px; transition:.25s; color:#EAF0FF;}
.lb .chip .av{width:26px; height:26px; border-radius:50%; display:grid; place-items:center; font-size:11px; font-weight:500; color:#fff;}
.lb .chip.on{background:rgba(168,85,247,.22); border-color:#A855F7; box-shadow:0 0 18px rgba(168,85,247,.4);}
.lb .note{margin:26px; text-align:center; color:#5a6480; font-weight:300; font-size:13px;}
.lb .sendbtn{margin:auto 26px 34px; height:56px; border-radius:14px; border:1px solid rgba(120,150,220,.4); background:rgba(255,255,255,.03); color:#cdd8f5; font-weight:300; letter-spacing:.06em; font-size:15px; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; font-family:'Poppins'; overflow:hidden; position:relative;}

.lb #confirm{background:radial-gradient(circle at 50% 30%, #063016 0%, #04120a 60%); text-align:center;}
.lb #confirm .inner{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:0 30px;}
.lb #confirm.active .arrow{animation:lbarrowin .7s cubic-bezier(.2,.7,.2,1) both, lbarrowglow 1.9s ease-in-out .7s infinite;}
@keyframes lbarrowin{from{opacity:0; transform:translateX(-34px) scale(.75);} to{opacity:1; transform:none;}}
@keyframes lbarrowglow{0%,100%{filter:drop-shadow(0 0 8px #35F07F) drop-shadow(0 0 22px #22c55e);} 50%{filter:drop-shadow(0 0 18px #6bff9f) drop-shadow(0 0 46px #35F07F);}}
.lb .arrow{margin-bottom:24px;}
.lb #confirm.active .c-amt, .lb #confirm.active .c-av, .lb #confirm.active .c-name{animation:lbrise .6s ease .25s both;}
@keyframes lbrise{from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:none;}}
.lb .c-amt{font-weight:200; font-size:56px; text-shadow:0 0 24px rgba(53,240,127,.6);}
.lb .c-amt .u{font-size:24px; color:#7fe6a5; vertical-align:top;}
.lb .c-sub{font-weight:300; font-size:14px; color:#7fe6a5; margin-bottom:34px;}
.lb .c-to{font-weight:300; font-size:12px; letter-spacing:.2em; color:#5f8f74; margin-bottom:14px;}
.lb .c-av{width:64px; height:64px; border-radius:50%; display:grid; place-items:center; font-weight:500; font-size:20px; color:#fff; margin-bottom:10px;}
.lb .c-name{font-weight:300; font-size:17px; margin-bottom:auto;}
.lb .yeah{margin:0 0 40px; width:220px; height:54px; border-radius:12px; cursor:pointer; font-family:'Poppins'; background:rgba(53,240,127,.08); border:1px solid #35F07F; color:#9df3bd; font-weight:400; letter-spacing:.14em; font-size:14px; box-shadow:0 0 22px rgba(53,240,127,.3); position:relative; overflow:hidden;}

.lb #products{background:radial-gradient(circle at 50% 20%, #101d3a, #05070E 66%);}
.lb .grid{display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:16px 26px 40px;}
.lb .ghead{grid-column:1/-1; font-weight:400; font-size:11px; letter-spacing:.16em; color:#5a6480; margin-top:8px;}
.lb .tile{aspect-ratio:1/.82; border-radius:16px; border:1px solid rgba(120,150,220,.16); background:linear-gradient(160deg, rgba(40,70,130,.28), rgba(20,30,60,.15)); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; cursor:pointer; transition:border .2s, box-shadow .2s; position:relative; overflow:hidden; opacity:0;}
.lb #products.active .tile{animation:lbtilein .5s ease forwards;}
@keyframes lbtilein{from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;}}
.lb .tile:hover{border-color:#4E96FF; box-shadow:0 0 22px rgba(78,150,255,.3);}
.lb .tile.glow{border-color:#4E96FF; box-shadow:0 0 26px rgba(78,150,255,.45); background:linear-gradient(160deg, rgba(78,150,255,.3), rgba(30,50,100,.2));}
.lb .tile span{font-weight:300; font-size:13px;}
.lb .tile svg{filter:drop-shadow(0 0 6px rgba(78,150,255,.5));}

.lb #builder{background:radial-gradient(circle at 50% 40%, #12213f, #05070E 66%); text-align:center;}
.lb #builder .inner{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 30px;}
.lb #builder.active .l{animation:lbrise .5s ease both;}
.lb #builder.active .l2{animation-delay:.12s;} .lb #builder.active .l3{animation-delay:.24s;} .lb #builder.active .l4{animation-delay:.36s;} .lb #builder.active .show{animation-delay:.5s;}
.lb #builder .need{font-weight:200; font-size:24px; color:#9fb0d6;}
.lb #builder .pick{font-weight:300; font-size:42px; margin:4px 0; text-shadow:0 0 20px rgba(78,150,255,.6);}
.lb #builder .pick small{font-size:15px; color:#6b779a; margin-left:8px;}
.lb #builder .show{margin-top:44px; width:220px; height:54px; border-radius:12px; cursor:pointer; font-family:'Poppins'; background:rgba(78,150,255,.1); border:1px solid #4E96FF; color:#bcd6ff; font-weight:400; letter-spacing:.14em; font-size:14px; box-shadow:0 0 22px rgba(78,150,255,.3); opacity:0; position:relative; overflow:hidden;}

.lb #carloan{background:radial-gradient(circle at 30% 40%, #101a2e, #05070E 70%);}
.lb .car-title{padding:18px 26px 4px; font-weight:300; font-size:22px;}
.lb .car-hero{position:relative; height:250px; margin:6px 0;}
.lb .car-stats{position:absolute; right:26px; top:24px; display:flex; flex-direction:column; gap:16px; text-align:right; z-index:3;}
.lb .car-stats div b{font-weight:300; font-size:26px; display:block; line-height:1;} .lb .car-stats div small{font-weight:300; font-size:10px; color:#7c88a8;}
.lb .headlight{animation:lbhl 3s ease-in-out infinite;}
@keyframes lbhl{0%,100%{opacity:.85;} 50%{opacity:1;}}
.lb .stepper{display:flex; align-items:center; justify-content:center; gap:26px; margin:6px 26px 0;}
.lb .stepper .rndbtn{width:52px; height:52px; border-radius:50%; border:1px solid rgba(78,150,255,.5); background:none; color:#8ec5ff; font-size:26px; font-weight:200; cursor:pointer; display:grid; place-items:center; box-shadow:0 0 16px rgba(78,150,255,.25); font-family:'Poppins'; transition:transform .12s; position:relative; overflow:hidden;}
.lb .stepper .rndbtn:active{transform:scale(.9);}
.lb .stepper .mid b{font-weight:300; font-size:26px; display:block; text-align:center;} .lb .stepper .mid small{font-weight:300; font-size:10px; letter-spacing:.12em; color:#7c88a8; display:block; text-align:center;}
.lb .getbtn{margin:26px; height:56px; border-radius:14px; border:1px solid rgba(78,150,255,.45); background:rgba(255,255,255,.03); color:#cdd8f5; font-weight:300; letter-spacing:.06em; font-size:15px; display:flex; align-items:center; justify-content:space-between; padding:0 22px; cursor:pointer; font-family:'Poppins'; position:relative; overflow:hidden;}

.lb .nav{position:absolute; bottom:0; left:0; right:0; height:78px; z-index:60; background:rgba(6,9,17,.72); backdrop-filter:blur(18px); border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-around; padding-bottom:16px;}
.lb .nav button{background:none; border:none; cursor:pointer; color:#495a7e; display:grid; place-items:center; gap:4px; font-size:9px; font-weight:300; letter-spacing:.05em; transition:color .25s; font-family:'Poppins';}
.lb .nav button.on{color:#8ec5ff;} .lb .nav button.on svg{filter:drop-shadow(0 0 6px #4E96FF);}
.lb .ripple{position:absolute; width:12px; height:12px; border-radius:50%; background:rgba(142,197,255,.55); transform:translate(-50%,-50%) scale(0); animation:lbrip .6s ease-out forwards; pointer-events:none;}
@keyframes lbrip{to{transform:translate(-50%,-50%) scale(11); opacity:0;}}

/* PROJECT PAGE */
.lbpage{min-height:100vh; background:#05070E; color:#EAF0FF;}
.lbpage-bar{position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; padding:16px 26px; background:rgba(5,7,14,.8); backdrop-filter:blur(14px); border-bottom:1px solid rgba(255,255,255,.08);}
.lbpage-bar button{display:inline-flex; align-items:center; gap:8px; background:none; border:1px solid rgba(255,255,255,.14); color:#EAF0FF; padding:8px 15px; border-radius:11px; cursor:pointer; font-family:'Poppins'; font-weight:300; font-size:13.5px; transition:.2s;}
.lbpage-bar button:hover{border-color:#4E96FF; color:#8ec5ff;}
.lbpage-bar span{font-size:12px; color:#5f6c8c; letter-spacing:.04em;}
.lbpage-body{max-width:1140px; margin:0 auto; padding:56px 26px 90px; display:grid; grid-template-columns:1fr auto; gap:56px; align-items:start;}
.lbpage-info{padding-top:20px;}
.lbpage-tag{font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:#8ec5ff; font-weight:400;}
.lbpage-info h1{font-weight:200; font-size:clamp(2.4rem,5vw,3.6rem); margin:14px 0 20px;}
.lbpage-info .lead{font-size:17px; color:#c3cde3; font-weight:300; max-width:52ch;}
.lbpage-info p{font-size:14.5px; color:#93A1C4; font-weight:300; max-width:54ch; margin-top:16px; line-height:1.65;}
.lbpage-list{margin:28px 0 6px; display:flex; flex-direction:column; gap:14px;}
.lbpage-list div{border-left:1px solid rgba(78,150,255,.4); padding-left:15px;}
.lbpage-list b{font-weight:400; font-size:14px; color:#EAF0FF; display:block;}
.lbpage-list span{font-size:13px; color:#93A1C4; font-weight:300;}
.lbpage-tech{display:flex; flex-wrap:wrap; gap:8px; margin-top:26px;}
.lbpage-tech span{font-size:12px; padding:6px 12px; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:#c3cde3; background:rgba(255,255,255,.03);}
.lbpage-note{font-size:12px!important; color:#5f6c8c!important; margin-top:24px!important;}
.lbpage-embed{display:flex; justify-content:center;}

@media (max-width:960px){
  .lbpage-body{grid-template-columns:1fr; gap:40px;}
  .lbpage-embed{order:-1;}
}
@media (prefers-reduced-motion:reduce){ .lb *{animation-duration:.001s!important;} }
`;
