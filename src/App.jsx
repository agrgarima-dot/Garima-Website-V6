import { useState, useEffect } from "react";

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
  bg:     "#FFFFFF",
  bg2:    "#F9FAFB",
  card:   "#FFFFFF",
  border: "#E5E7EB",
  text:   "#111827",
  muted:  "#1F2937",
  dim:    "#9CA3AF",
  lime:   "#5B4FDB",
  blue:   "#2563EB",
  purple: "#7C3AED",
  pink:   "#DB2777",
  green:  "#059669",
  yellow: "#D97706",
};


// ─── CALCULATOR DATA ──────────────────────────────────────────────────────────
const INDUSTRIES = {
  "SaaS / Tech":            { rev:[6,12],  ebitda:[18,35], gp:1.4 },
  "Fintech":                { rev:[5,10],  ebitda:[15,28], gp:1.3 },
  "E-commerce":             { rev:[1.5,3.5],ebitda:[10,18],gp:1.2 },
  "Manufacturing":          { rev:[0.8,1.8],ebitda:[6,12], gp:1.0 },
  "Healthcare":             { rev:[2,5],   ebitda:[12,22], gp:1.2 },
  "Real Estate":            { rev:[1.2,2.5],ebitda:[8,14], gp:1.0 },
  "FMCG / Retail":          { rev:[1,2.5], ebitda:[8,15],  gp:1.1 },
  "Professional Services":  { rev:[1.5,3], ebitda:[8,14],  gp:1.1 },
  "Media / Content":        { rev:[2,5],   ebitda:[10,20], gp:1.2 },
  "Infra / Logistics":      { rev:[1,2.2], ebitda:[7,13],  gp:1.0 },
};
const STAGES = {
  "Pre-revenue / Idea":       0.3,
  "Early Revenue (<₹1 Cr)":  0.6,
  "Growth Stage (₹1–10 Cr)": 1.0,
  "Scale Stage (₹10–50 Cr)": 1.2,
  "Established (₹50 Cr+)":   1.1,
};
const GROWTH = {
  "Declining (<0%)":   0.6,
  "Flat (0–10%)":      0.85,
  "Moderate (10–30%)": 1.0,
  "Strong (30–60%)":   1.25,
  "Hyper (60%+)":      1.5,
};

const fmtCr = v => v>=100 ? `₹${(v/100).toFixed(1)} Cr` : v>=1 ? `₹${v.toFixed(1)} Cr` : `₹${(v*100).toFixed(0)} L`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:"8px 16px", borderRadius:10,
    border: active ? "none" : `1px solid ${T.border}`,
    cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif",
    fontSize:12, fontWeight:600, letterSpacing:"0.02em",
    background: active ? T.lime : T.card,
    color: active ? T.bg : T.muted, transition:"all 0.2s ease",
  }}>{children}</button>
);

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:"7px 14px", borderRadius:100, border:"none", cursor:"pointer",
    fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:12, fontWeight:700,
    background: active ? T.lime : "transparent",
    color: active ? T.bg : T.muted,
    outline: active ? "none" : `1.5px solid ${T.border}`,
    transition:"all 0.15s",
  }}>{children}</button>
);

const Input = ({ value, onChange, placeholder, type="text" }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{
      width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.border}`,
      background:"rgba(255,255,255,0.03)", color:T.text, fontSize:14,
      fontFamily:"'Inter Tight','Inter',sans-serif", outline:"none", boxSizing:"border-box",
      transition:"border-color 0.2s",
    }}
    onFocus={e=>e.target.style.borderColor=T.lime}
    onBlur={e=>e.target.style.borderColor=T.border}
  />
);

const Label = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
    {children}
  </div>
);

const Section = ({ children, style={} }) => (
  <section style={{ padding:"100px 24px", maxWidth:1100, margin:"0 auto", ...style }}>
    {children}
  </section>
);

const SectionHead = ({ eyebrow, title, sub, center=true }) => (
  <div style={{ textAlign:center?"center":"left", marginBottom:56 }}>
    {eyebrow && <div style={{ fontSize:11, fontWeight:700, color:T.lime, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>{eyebrow}</div>}
    <h2 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:T.text, margin:"0 0 14px", lineHeight:1.1 }}>{title}</h2>
    {sub && <p style={{ fontSize:16, color:T.muted, lineHeight:1.7, maxWidth:520, margin:center?"0 auto":"0" }}>{sub}</p>}
  </div>
);

// ─── LOGO ─────────────────────────────────────────────────────────────────────
// dark=true → dark text (light backgrounds: hero, footer)
// dark=false → white text (dark nav background when scrolled)
const FinzzupIcon = ({ size=44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="icon-grad-web" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2563EB"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
    <rect width="44" height="44" rx="11" fill="url(#icon-grad-web)"/>
    <path d="M11 9h22v5.5H17.5v6.5H26v5.5h-8.5V35H11V9Z" fill="white"/>
  </svg>
);

const Logo = ({ dark=false }) => (
  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
    <FinzzupIcon size={44}/>
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:0 }}>
        <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:34, color: dark ? "#111827" : "#ffffff", letterSpacing:"-0.03em", lineHeight:1 }}>Finz</span>
        <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:34, background:"linear-gradient(90deg,#2563EB,#7C3AED)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-0.03em", lineHeight:1 }}>zup</span>
        <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:400, fontSize:14, color: dark ? "#7C3AED" : "rgba(255,255,255,0.7)", marginLeft:1, alignSelf:"flex-start", marginTop:2 }}>™</span>
      </div>
      <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:600, fontSize:12, color: dark ? "#7C3AED" : "rgba(255,255,255,0.7)", letterSpacing:"0.12em", textTransform:"uppercase", lineHeight:1 }}>Build. Value. Scale.</span>
    </div>
  </div>
);

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { id:"calculator", label:"Calculator" },
    { id:"cases", label:"Case Studies" },
    { id:"blog", label:"Insights" },
    { id:"contact", label:"Contact" },
  ];

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        background: scrolled ? "rgba(8,9,15,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "none",
        transition:"all 0.3s",
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:84, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center" }}>
            <Logo dark={!scrolled}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:4 }} className="deskav">
            {links.map(l=>(
              <button key={l.id} onClick={()=>setPage(l.id)} style={{
                background:"none", border:"none", cursor:"pointer", padding:"8px 14px",
                borderRadius:8, fontSize:14, fontWeight:600, fontFamily:"'Inter Tight','Inter',sans-serif",
                color: page===l.id ? T.lime : scrolled ? "rgba(255,255,255,0.85)" : T.muted, transition:"color 0.2s",
              }}>{l.label}</button>
            ))}
            <button onClick={()=>window.open("https://finzzup-portal-v4.vercel.app","_blank")} style={{
              marginLeft:8, padding:"9px 20px", borderRadius:100, border:`1.5px solid ${T.lime}`,
              background: scrolled ? "transparent" : `${T.lime}15`, cursor:"pointer", fontSize:13, fontWeight:700,
              color:T.lime, fontFamily:"'Inter Tight','Inter',sans-serif", letterSpacing:"0.02em",
            }}>Client Login →</button>
          </div>
          <button onClick={()=>setOpen(o=>!o)} className="hamb" style={{ background:"none", border:"none", cursor:"pointer", display:"none", padding:4 }}>
            <div style={{ width:22, height:2, background: scrolled ? "white" : T.muted, marginBottom:5, borderRadius:2 }}/>
            <div style={{ width:22, height:2, background: scrolled ? "white" : T.muted, marginBottom:5, borderRadius:2 }}/>
            <div style={{ width:22, height:2, background: scrolled ? "white" : T.muted, borderRadius:2 }}/>
          </button>
        </div>
      </nav>
      {open && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:199, background:"rgba(8,9,15,0.98)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${T.border}`, padding:"16px 24px 24px" }}>
          {links.map(l=>(
            <button key={l.id} onClick={()=>{setPage(l.id);setOpen(false);}} style={{
              display:"block", width:"100%", textAlign:"left", background:"none", border:"none",
              cursor:"pointer", padding:"13px 0", fontSize:15, fontWeight:600, fontFamily:"'Inter Tight','Inter',sans-serif",
              color:T.muted, borderBottom:`1px solid ${T.border}`,
            }}>{l.label}</button>
          ))}
          <button onClick={()=>window.open("https://finzzup-portal-v4.vercel.app","_blank")} style={{
            marginTop:16, width:"100%", padding:13, borderRadius:12, border:`1.5px solid ${T.lime}`,
            background:"transparent", cursor:"pointer", fontSize:14, fontWeight:700,
            color:T.lime, fontFamily:"'Inter Tight','Inter',sans-serif",
          }}>Client Login →</button>
        </div>
      )}
      <style>{`
        @media(max-width:640px){.deskav{display:none!important}.hamb{display:block!important}}
        @media(min-width:641px){.hamb{display:none!important}}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};color:${T.text};font-family:'Space Grotesk',sans-serif;}
        ::selection{background:${T.lime};color:${T.bg}}
        a{color:inherit;text-decoration:none}
        button:hover{opacity:0.88}
      `}</style>
    </>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ setPage }) {
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const t = setInterval(()=>setTicker(n=>(n+1)%4), 2200);
    return ()=>clearInterval(t);
  }, []);

  const rotating = ["fundraising ready.", "FEMA compliant.", "investor ready.", "audit proof."];

  const services = [
    { icon:"📈", label:"Valuation", title:"IBBI-Certified Valuations", desc:"DCF and NAV reports for fundraising, FEMA, Section 56, ESOP, NCLT. Delivered in 5–7 days.", accent:T.lime },
    { icon:"🧠", label:"Fractional CFO", title:"Fractional CFO", desc:"Monthly financial clarity for SMEs. MIS, cash flow forecasts, board packs, and strategic decisions — without the full-time cost.", accent:T.blue },
    { icon:"⚖️", label:"Ind AS", title:"Ind AS Advisory", desc:"Impairment testing (Ind AS 36), PPA, and financial instrument valuations for listed and unlisted entities.", accent:T.purple },
    { icon:"🌍", label:"Gulf / FEMA", title:"Gulf & FEMA Compliance", desc:"Cross-border investment valuations for NRI founders and India-Gulf structures. RBI-compliant, hassle-free.", accent:T.pink },
  ];

  const stats = [
    { n:"₹2,100 Cr+", l:"Largest single valuation" },
    { n:"150+",       l:"Reports delivered" },
    { n:"5–7 days",   l:"Average turnaround" },
    { n:"10 Years", l:"Cross-border experience" },
  ];

  return (
    <div>
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", position:"relative", overflow:"hidden", padding:"120px 24px 80px" }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 80% 60% at 60% 40%, rgba(200,255,0,0.06) 0%, transparent 60%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"20%", right:"8%", width:360, height:360, borderRadius:"50%", background:`radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:100, border:`1px solid ${T.lime}30`, background:`${T.lime}0A`, marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:T.lime, display:"inline-block" }}/>
            <span style={{ fontSize:12, fontWeight:700, color:T.lime, letterSpacing:"0.08em" }}>GARIMA AGARWAL · CA · IBBI REGISTERED VALUER</span>
          </div>
          <h1 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:"clamp(38px,6vw,76px)", lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:20, maxWidth:820 }}>
            Know what your<br/>
            <span style={{ color:T.lime }}>business is worth.</span><br/>
            <span style={{ color:T.muted, fontSize:"0.75em", fontWeight:700 }}>Get </span>
            <span style={{ color:T.text, fontSize:"0.75em", display:"inline-block", minWidth:300, borderBottom:`3px solid ${T.lime}`, transition:"opacity 0.3s" }}>
              {rotating[ticker]}
            </span>
          </h1>
          <p style={{ fontSize:18, color:T.muted, lineHeight:1.7, maxWidth:540, marginBottom:40 }}>
            Finzzup combines 10 years of cross-border financial expertise with AI-powered workflows — delivering IBBI-certified valuations and Fractional CFO services faster, sharper, and more accurately than traditional practice.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button onClick={()=>setPage("calculator")} style={{
              padding:"14px 28px", borderRadius:12, border:"none", cursor:"pointer",
              fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:15, background:T.lime,
              color:T.bg, letterSpacing:"0.01em",
            }}>Try Free Calculator →</button>
            <button onClick={()=>setPage("contact")} style={{
              padding:"14px 28px", borderRadius:12, cursor:"pointer",
              fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:15, background:"transparent",
              color:T.muted, border:`1.5px solid ${T.border}`,
            }}>Talk to Garima</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginTop:80, borderRadius:16, overflow:"hidden", border:`1px solid ${T.border}` }} className="stats-grid">
            {stats.map((s,i)=>(
              <div key={i} style={{ padding:"24px 20px", background:T.card, borderRight:i<3?`1px solid ${T.border}`:"none", textAlign:"center" }}>
                <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:28, fontWeight:800, color:T.lime, letterSpacing:"-0.02em" }}>{s.n}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:4, fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:T.bg2, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:"80px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }} className="about-grid">
          <div style={{ position:"relative", display:"flex", justifyContent:"center" }}>
            <div style={{ width:260, height:260, borderRadius:24, overflow:"hidden", border:`3px solid ${T.lime}30`, position:"relative" }}>
              <img src="/garima.jpg" alt="Garima Agarwal" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e=>{ e.target.style.display="none"; e.target.parentNode.style.background=`linear-gradient(135deg,${T.bg2},${T.card})`; }}/>
            </div>
            <div style={{ position:"absolute", top:-12, right:"10%", padding:"8px 14px", borderRadius:100, background:T.lime, fontSize:11, fontWeight:800, color:T.bg, letterSpacing:"0.05em" }}>CA</div>
            <div style={{ position:"absolute", bottom:0, left:"5%", padding:"8px 14px", borderRadius:100, background:T.bg, border:`1.5px solid ${T.purple}`, fontSize:11, fontWeight:700, color:T.purple }}>IBBI/RV/14/2022/15038</div>
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:T.lime, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>The Person Behind Finzzup</div>
            <h2 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:"clamp(26px,3vw,36px)", color:T.text, marginBottom:16, lineHeight:1.1 }}>Garima Agarwal</h2>
            <p style={{ fontSize:15, color:T.muted, lineHeight:1.8, marginBottom:20 }}>
              10 years across Credit Suisse, NCR Corporation, and Allcargo Group — with active engagements in Saudi Arabia and the Gulf. CA and CFA Level II qualified, with a deep focus on valuations.
            </p>
            <p style={{ fontSize:15, color:T.muted, lineHeight:1.8, marginBottom:28 }}>
              I use AI heavily in my workflow — not to replace judgment, but to deliver faster turnarounds, sharper analysis, and more consistent outputs. Every report still carries my professional oversight, IBBI registration, and UDIN. Speed and rigour, not one or the other.
            </p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {["Chartered Accountant", "IBBI Registered Valuer", "Former Credit Suisse", "Cross-Border Experience"].map(c=>(
                <span key={c} style={{ padding:"6px 12px", borderRadius:8, background:T.card, border:`1px solid ${T.border}`, fontSize:12, fontWeight:600, color:T.muted }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section>
        <SectionHead eyebrow="What We Do" title="Finance, actually explained." sub="No jargon. No over-billing. Just the financial clarity your business needs to grow, raise, and stay compliant."/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }} className="services-grid">
          {services.map((s,i)=>(
            <div key={i} style={{ padding:28, borderRadius:20, background:T.card, border:`1px solid ${T.border}`, position:"relative", overflow:"hidden", cursor:"pointer", transition:"border-color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=s.accent+"60"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:s.accent, opacity:0.6 }}/>
              <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:s.accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:18, color:T.text, marginBottom:8 }}>{s.title}</div>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section style={{ padding:"0 24px 100px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:48, borderRadius:24, background:`linear-gradient(135deg,rgba(200,255,0,0.05),rgba(139,92,246,0.05))`, border:`1px solid ${T.lime}20`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
          <div>
            <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:28, color:T.text, marginBottom:8 }}>What's your business worth?</div>
            <p style={{ fontSize:15, color:T.muted }}>Get an indicative DCF range in 2 minutes. Free, no signup.</p>
          </div>
          <button onClick={()=>setPage("calculator")} style={{
            padding:"14px 32px", borderRadius:12, border:"none", cursor:"pointer",
            fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:15, background:T.lime,
            color:T.bg, flexShrink:0,
          }}>Try Calculator →</button>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .about-grid{grid-template-columns:1fr!important}
          .services-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </div>
  );
}

// ─── CALCULATOR PAGE ───────────────────────────────────────────────────────────
function Calculator() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ industry:"", stage:"", revenue:"", ebitda:"", growth:"", purpose:"", name:"", email:"", phone:"" });
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const calc = () => {
    const ind = INDUSTRIES[f.industry];
    const sm = STAGES[f.stage]||1;
    const ga = GROWTH[f.growth]||1;
    const rev = parseFloat(f.revenue)||0;
    const eb  = parseFloat(f.ebitda)||0;
    const rL = rev*ind.rev[0]*sm*ga;
    const rH = rev*ind.rev[1]*sm*ga*ind.gp;
    let low,high;
    if(eb>0){ low=Math.min(rL,eb*ind.ebitda[0]*sm*ga)*0.9; high=Math.max(rH,eb*ind.ebitda[1]*sm*ga)*1.1; }
    else { low=rL*0.85; high=rH*1.15; }
    setResult({ low, high, ind, confidence: eb>0?"Moderate":"Indicative" });
  };

  const ok = { 1:f.industry&&f.stage, 2:f.revenue&&f.growth, 3:f.purpose&&f.name&&f.email };
  const next = () => { if(step===3){calc();setStep(4);}else setStep(s=>s+1); };
  const steps = ["Business","Financials","Purpose","Result"];

  if(done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"120px 24px 80px" }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ width:72, height:84, borderRadius:20, background:T.lime, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 24px" }}>✓</div>
        <h2 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:28, color:T.text, marginBottom:12 }}>Got it, {f.name.split(" ")[0]}!</h2>
        <p style={{ fontSize:15, color:T.muted, lineHeight:1.7, marginBottom:24 }}>Garima will reach out within 24 hours with a scoped proposal for your IBBI-certified report.</p>
        <div style={{ padding:"10px 20px", borderRadius:100, background:`${T.lime}15`, border:`1px solid ${T.lime}30`, fontSize:12, fontWeight:700, color:T.lime, display:"inline-block" }}>
          Ref: VAL-{Date.now().toString().slice(-6)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.lime, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Free Indicative Tool</div>
          <h1 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:"clamp(28px,5vw,44px)", color:T.text, lineHeight:1.1, marginBottom:12 }}>What's your biz worth?</h1>
          <p style={{ fontSize:14, color:T.muted }}>2-minute indicative DCF range. Based on industry multiples and peer data.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
          {steps.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", flex:i<3?1:"auto" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, transition:"all 0.3s",
                  background: step>i+1 ? T.lime : step===i+1 ? T.lime : T.card,
                  color: step>=i+1 ? T.bg : T.muted,
                  outline: step<i+1 ? `1.5px solid ${T.border}` : "none",
                }}>{step>i+1?"✓":i+1}</div>
                <span style={{ fontSize:10, color:step>=i+1?T.lime:T.dim, fontWeight:700, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{s}</span>
              </div>
              {i<3&&<div style={{ flex:1, height:2, background:step>i+1?T.lime:T.border, margin:"0 6px 16px", transition:"all 0.4s" }}/>}
            </div>
          ))}
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:24, padding:"28px 24px" }}>
          {step===1&&(
            <div>
              <h3 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:20, color:T.text, marginBottom:20 }}>About your business</h3>
              <Label>Industry</Label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:24 }}>
                {Object.keys(INDUSTRIES).map(k=><Chip key={k} active={f.industry===k} onClick={()=>set("industry",k)}>{k}</Chip>)}
              </div>
              <Label>Company Stage</Label>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {Object.keys(STAGES).map(k=>(
                  <button key={k} onClick={()=>set("stage",k)} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                    borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif",
                    fontSize:13, fontWeight:600, textAlign:"left", transition:"all 0.15s",
                    background: f.stage===k ? `${T.lime}15` : T.card,
                    color: f.stage===k ? T.text : T.muted,
                    outline: f.stage===k ? `1.5px solid ${T.lime}` : `1.5px solid ${T.border}`,
                  }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:f.stage===k?T.lime:T.dim, flexShrink:0 }}/>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step===2&&(
            <div>
              <h3 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:20, color:T.text, marginBottom:6 }}>Financial snapshot</h3>
              <p style={{ fontSize:13, color:T.muted, marginBottom:24 }}>Ballpark figures are fine — this is indicative only.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                <div><Label>Revenue last 12 months (₹ Cr)</Label><Input value={f.revenue} onChange={e=>set("revenue",e.target.value)} placeholder="e.g. 4.2" type="number"/></div>
                <div><Label>EBITDA (₹ Cr) — optional</Label><Input value={f.ebitda} onChange={e=>set("ebitda",e.target.value)} placeholder="e.g. 0.8" type="number"/></div>
              </div>
              <Label>Revenue Growth Rate (YoY)</Label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:20 }}>
                {Object.keys(GROWTH).map(k=><Pill key={k} active={f.growth===k} onClick={()=>set("growth",k)}>{k}</Pill>)}
              </div>
              <div style={{ padding:"13px 15px", borderRadius:12, background:"rgba(79,142,247,0.06)", border:`1px solid rgba(79,142,247,0.15)`, fontSize:12, color:T.muted, lineHeight:1.7 }}>
                ℹ️ Uses indicative <span style={{ color:T.blue, fontWeight:700 }}>EV/Revenue and EV/EBITDA multiples</span> from comparable listed peers.
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              <h3 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:20, color:T.text, marginBottom:6 }}>Almost there 🎯</h3>
              <p style={{ fontSize:13, color:T.muted, marginBottom:20 }}>Your result is ready — just tell me why you need a valuation.</p>
              <Label>Purpose</Label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:20 }}>
                {["Fundraising","Angel / Pre-seed","FEMA / FDI","Section 56 (IT Act)","ESOP Grant","M&A","NCLT / IBC","Ind AS 36","General Curiosity"].map(p=>(
                  <Pill key={p} active={f.purpose===p} onClick={()=>set("purpose",p)}>{p}</Pill>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div><Label>Your Name</Label><Input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Arjun Sharma"/></div>
                <div><Label>Email</Label><Input value={f.email} onChange={e=>set("email",e.target.value)} placeholder="arjun@company.com" type="email"/></div>
              </div>
              <Label>Phone / WhatsApp — optional</Label>
              <Input value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 98765 43210"/>
              <p style={{ fontSize:12, color:T.dim, marginTop:12 }}>🔒 Only shared with Garima. Never sold.</p>
            </div>
          )}
          {step===4&&result&&(
            <div>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Indicative Enterprise Value</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:6 }}>
                  <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:40, fontWeight:800, color:T.lime }}>{fmtCr(result.low)}</span>
                  <span style={{ fontSize:22, color:T.dim }}>—</span>
                  <span style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:40, fontWeight:800, color:T.blue }}>{fmtCr(result.high)}</span>
                </div>
                <div style={{ fontSize:12, color:T.muted }}>Confidence: <span style={{ color:T.yellow, fontWeight:700 }}>{result.confidence}</span> · {f.industry}</div>
              </div>
              <div style={{ position:"relative", height:10, borderRadius:5, background:T.border, margin:"0 0 40px" }}>
                <div style={{ position:"absolute", left:"20%", width:"50%", height:"100%", borderRadius:5, background:`linear-gradient(90deg,${T.lime},${T.blue})` }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
                {[
                  ["Rev Multiple", `${result.ind.rev[0]}x – ${result.ind.rev[1]}x`],
                  ["EBITDA Multiple", `${result.ind.ebitda[0]}x – ${result.ind.ebitda[1]}x`],
                  ["Stage Factor", `${STAGES[f.stage]}x`],
                  ["Growth Factor", `${GROWTH[f.growth]}x`],
                ].map(([l,v],i)=>(
                  <div key={i} style={{ padding:"12px 14px", borderRadius:10, background:T.card, border:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:10, color:T.dim, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18, fontWeight:600, color:T.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"13px 15px", borderRadius:12, background:"rgba(251,191,36,0.06)", border:`1px solid rgba(251,191,36,0.2)`, marginBottom:20, fontSize:12, color:T.muted, lineHeight:1.7 }}>
                <span style={{ color:T.yellow, fontWeight:700 }}>⚠️ Indicative only.</span> For regulatory filings you need a full DCF signed by an <strong style={{ color:T.yellow }}>IBBI Registered Valuer.</strong>
              </div>
              <div style={{ padding:20, borderRadius:16, background:`linear-gradient(135deg,rgba(200,255,0,0.05),rgba(79,142,247,0.05))`, border:`1px solid ${T.lime}20`, marginBottom:12 }}>
                <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:16, color:T.text, marginBottom:6 }}>Want the real report?</div>
                <p style={{ fontSize:13, color:T.muted, marginBottom:14 }}>Starts at ₹30,000 · 5–7 working days · Holds up to IT scrutiny and FEMA filings.</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={()=>setDone(true)} style={{ flex:1, minWidth:140, padding:12, borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:13, background:T.lime, color:T.bg }}>
                    Get Formal Valuation →
                  </button>
                  <a href="https://wa.me/919833585810" target="_blank" rel="noopener" style={{ flex:1, minWidth:120, padding:12, borderRadius:10, fontWeight:700, fontSize:13, background:"rgba(16,185,129,0.1)", border:`1.5px solid rgba(16,185,129,0.25)`, color:T.green, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    💬 WhatsApp
                  </a>
                </div>
              </div>
              <button onClick={()=>{setStep(1);setResult(null);setF({industry:"",stage:"",revenue:"",ebitda:"",growth:"",purpose:"",name:"",email:"",phone:""});}}
                style={{ width:"100%", padding:10, borderRadius:10, border:`1.5px solid ${T.border}`, background:"transparent", color:T.dim, fontSize:12, cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif" }}>
                ← Start over
              </button>
            </div>
          )}
          {step<4&&(
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
              {step>1
                ? <button onClick={()=>setStep(s=>s-1)} style={{ padding:"10px 20px", borderRadius:10, border:`1.5px solid ${T.border}`, background:"transparent", color:T.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif" }}>← Back</button>
                : <div/>
              }
              <button onClick={next} disabled={!ok[step]} style={{
                padding:"12px 28px", borderRadius:12, border:"none", cursor:ok[step]?"pointer":"not-allowed",
                fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:14, transition:"all 0.2s",
                background: ok[step] ? T.lime : T.card,
                color: ok[step] ? T.bg : T.dim,
                outline: ok[step] ? "none" : `1.5px solid ${T.border}`,
              }}>
                {step===3?"Calculate →":"Continue →"}
              </button>
            </div>
          )}
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:T.dim, lineHeight:1.8 }}>
          <strong style={{ color:T.muted }}>Garima Agarwal</strong> · CA · IBBI Registered Valuer<br/>
          IBBI/RV/14/2022/15038 · agrgarima@gmail.com
        </p>
      </div>
    </div>
  );
}

// ─── CASE STUDIES ─────────────────────────────────────────────────────────────
function Cases() {
  const cases = [
    {
      tag:"Real Estate · Ind AS 36",
      title:"₹2,100 Cr township valuation for impairment testing",
      client:"Large real estate developer, 2,800+ residential units, 9 lenders",
      challenge:"Ind AS 36 impairment testing required across two large township projects with complex multi-lender structure and project-level vs company-level cashflow modelling.",
      method:"DCF at project level and company level. WACC computed across 9 different lenders. Sensitivity analysis on absorption rates and collection efficiency.",
      result:"Delivered in 6 days. Zero queries from statutory auditors. Report accepted without revision.",
      metrics:[{ l:"Enterprise Value", v:"₹2,100 Cr+" },{ l:"Turnaround", v:"6 days" },{ l:"Auditor queries", v:"Zero" }],
      accent:T.blue,
    },
    {
      tag:"Fintech · Section 56(2)(viib)",
      title:"Series A valuation — ₹65 Cr fundraise, IT compliance",
      client:"B2B payments startup, pre-profit, 300% YoY growth",
      challenge:"Company had used revenue multiples in a previous valuation. Income Tax had queried the methodology. New valuation needed to be Rule 11UA compliant and defensible.",
      method:"DCF using 5-year projections with milestone-based revenue assumptions. WACC built from scratch. Comparable listed fintech companies used for terminal value cross-check.",
      result:"IT scrutiny passed. Investors accepted the report. Funding closed successfully.",
      metrics:[{ l:"Round Size", v:"₹65 Cr" },{ l:"Method", v:"DCF (Rule 11UA)" },{ l:"IT Result", v:"Passed" }],
      accent:T.purple,
    },
    {
      tag:"Fractional CFO · SME",
      title:"Burn rate reduced 18% through MIS restructuring",
      client:"D2C brand, ₹8 Cr ARR, 6 revenue streams, no finance team",
      challenge:"Founder was making pricing and expansion decisions on gut feel. No live MIS. Accountant delivered P&L 3 weeks late each month.",
      method:"Built live MIS dashboard with revenue by stream, unit economics, and 90-day cash flow forecast. Identified two revenue streams with negative contribution margin.",
      result:"Two underperforming streams shut down in month 2. Gross margin improved from 34% to 41% in 90 days.",
      metrics:[{ l:"Burn Reduction", v:"18%" },{ l:"Margin Lift", v:"+7pp" },{ l:"Timeline", v:"90 days" }],
      accent:T.green,
    },
    {
      tag:"FEMA · NRI Investment",
      title:"FEMA-compliant valuation for Gulf NRI investment into Indian startup",
      client:"NRI founder, Saudi Arabia-based, investing ₹3.2 Cr into Indian entity",
      challenge:"FDI filing required IBBI-compliant valuation. Previous CA had used book value — which is not valid under FEMA. RBI rejected the first filing.",
      method:"Fair market value DCF per FEMA regulations. Board resolution reviewed. FDI form cross-checked before submission.",
      result:"RBI filing accepted on second attempt. Investment successfully structured.",
      metrics:[{ l:"Investment", v:"₹3.2 Cr" },{ l:"Filing", v:"RBI Accepted" },{ l:"Attempt", v:"2nd (our report)" }],
      accent:T.pink,
    },
  ];

  const [active, setActive] = useState(0);
  const c = cases[active];

  return (
    <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <SectionHead eyebrow="Case Studies" title="Real work. Real results." sub="Specific numbers. Actual outcomes. Because 'we do valuations' doesn't tell you anything."/>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:36 }}>
          {cases.map((cs,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{
              padding:"9px 16px", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:13, fontWeight:700, transition:"all 0.2s",
              background: active===i ? cases[i].accent : T.card,
              color: active===i ? T.bg : T.muted,
              outline: active===i ? "none" : `1.5px solid ${T.border}`,
            }}>{cs.tag.split(" · ")[0]}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }} className="case-grid">
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:c.accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{c.tag}</div>
            <h2 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:"clamp(20px,3vw,28px)", color:T.text, marginBottom:16, lineHeight:1.2 }}>{c.title}</h2>
            <p style={{ fontSize:13, color:T.muted, marginBottom:20, padding:"12px 14px", borderRadius:10, background:T.card, border:`1px solid ${T.border}` }}>
              <strong style={{ color:T.text }}>Client: </strong>{c.client}
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {c.metrics.map((m,i)=>(
                <div key={i} style={{ padding:"14px 12px", borderRadius:12, background:T.card, border:`1px solid ${c.accent}30`, textAlign:"center" }}>
                  <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:20, fontWeight:800, color:c.accent }}>{m.v}</div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:3, fontWeight:600 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { label:"The Challenge", content:c.challenge },
              { label:"Our Approach", content:c.method },
              { label:"The Result", content:c.result, highlight:true },
            ].map((s,i)=>(
              <div key={i} style={{ padding:"16px 18px", borderRadius:14, background:s.highlight?`${c.accent}10`:T.card, border:`1px solid ${s.highlight?c.accent+"30":T.border}` }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.highlight?c.accent:T.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{s.label}</div>
                <p style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.case-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────
function Blog() {
  const posts = [
    {
      tag:"UAE / Valuation", title:"Business Valuation Methods for UAE Free Zone Companies",
      excerpt:"Free zone companies in the UAE have unique structures that most standard valuation frameworks weren't built for. Here's how to get it right.",
      mins:5, accent:T.yellow,
      body:`If you own a company registered in JAFZA, DMCC, DIFC, ADGM, or any of the UAE's 40+ free zones, you've probably been asked for a valuation — and received a number that felt either too low or impossible to justify. The problem usually isn't the business; it's that the valuation wasn't built for a free zone structure.

**Why Free Zone Companies Are Different**
Free zone entities aren't just offshore shells. Many have real operations, multi-currency revenues, 0% corporate tax (under legacy arrangements), and investors across UAE, India, and the GCC. That combination creates genuine complexity. A valuation model built for a UK LLP or an Indian private limited company will miss the mark.

**The Right Methodology Depends on Your Purpose**
Valuation isn't one-size-fits-all. The method depends on why you need the number.

For fundraising or share transfers between investors, the Discounted Cash Flow (DCF) method is the most defensible. You forecast free cash flows, apply a discount rate that reflects your business risk and the UAE market, and arrive at an enterprise value. The strength of a DCF is that it captures future earnings potential — which is usually where the value actually sits in a growing business.

For acquisitions or mergers, a Market Comparable approach works well alongside DCF. You look at transaction multiples from similar businesses in the GCC or comparable emerging markets. EBITDA multiples in the UAE's trading and professional services sectors typically range from 4x to 8x, though tech-enabled businesses command more.

For businesses with significant physical assets — real estate, equipment, inventory — the Asset-Based (NAV) approach anchors the valuation in tangible value. This is common for holding companies and asset-heavy free zone entities.

**The DIFC/ADGM Premium**
Companies registered in DIFC (Dubai International Financial Centre) or ADGM (Abu Dhabi Global Market) often attract a structural premium. These are common law jurisdictions with robust corporate governance frameworks, making them far more legible to international investors. A DIFC SPV holding a UAE operating business will typically command a higher multiple than an equivalent mainland or standard free zone entity, all else being equal.

**What Buyers and Investors Actually Look For**
When a serious buyer or investor reviews a UAE free zone company, they want clarity on three things: revenue quality (recurring vs. one-off), regulatory status (is the licence current, are there any pending violations), and cross-border exposure (does the company have Indian, Saudi, or GCC clients with concentration risk). Address these upfront in your valuation narrative.

**Key Takeaway**
A credible valuation for a UAE free zone company needs to account for your specific licence type, tax status, jurisdiction, and the purpose of the valuation — not just your revenue. If you're preparing for a funding round, acquisition, or shareholder change, get a valuation that was built for your structure, not adapted from a template.`,
    },
    {
      tag:"Regulation", title:"SEBI's IPEV circular: what it means for AIF-backed startups",
      excerpt:"In September 2024, SEBI mandated that all AIFs must value unlisted securities using IPEV guidelines. Here's what it means for your next funding round.",
      mins:4, accent:T.blue,
      body:`SEBI's September 2024 circular changed how Alternative Investment Funds must value their unlisted portfolio companies. If you've raised from a VC, angel fund, or any SEBI-registered AIF, this affects your company.

**What changed**
Previously, AIFs could use a range of methodologies. The new circular mandates IPEV guidelines specifically.

**What this means for founders**
Your investor's fund must revalue your shares using the new methodology. If you're raising your next round, the valuation basis needs to be consistent with IPEV.

**Bottom line**
This is a compliance issue, not just a methodology preference. Get your valuation updated before your next round closes.`,
    },
    {
      tag:"Founders", title:"The Section 56 trap that costs founders ₹10–40L in tax",
      excerpt:"Revenue multiples look great in a pitch deck but they're not valid under Rule 11UA of the Income Tax Act. Here's what actually holds up.",
      mins:5, accent:T.purple,
      body:`This is the most common and expensive mistake I see founders make.

**The problem**
Section 56(2)(viib) taxes the excess amount received over the fair market value of shares as income in the hands of the company.

**What's valid under Rule 11UA**
Only two methodologies are valid: DCF (Discounted Cash Flow) method and NAV / Book Value method.

**What's NOT valid**
Revenue multiples, EBITDA multiples, comparable transaction analysis. These are valid commercially but have zero legal standing for Income Tax.

**How to protect yourself**
Always use an IBBI Registered Valuer. Ensure the report explicitly references Rule 11UA methodology using DCF.`,
    },
    {
      tag:"SME / CFO", title:"When does your SME actually need a Fractional CFO?",
      excerpt:"Most SME owners hire a Fractional CFO either too early or too late. Here's the inflection point to watch for.",
      mins:6, accent:T.green,
      body:`The most common question I get: do I need a CFO or is my CA enough?

**What a CA does**
Your CA handles compliance — GST, income tax, TDS, audit. They look backwards.

**What a CFO does**
A CFO looks forward. Cash flow forecasting, working capital, unit economics, investor reporting, board packs.

**The 5 signs you need a CFO now**
1. You don't know your runway.
2. You're making decisions on last month's numbers.
3. You're raising or about to raise.
4. Revenue is above ₹3–5 Cr and growing.
5. You have multiple revenue streams with no contribution margin visibility.`,
    },
    {
      tag:"Gulf / FEMA", title:"NRI investing in India? 3 FEMA mistakes that get your filing rejected",
      excerpt:"RBI has specific requirements for inbound FDI valuations. Most rejected filings come down to three avoidable mistakes.",
      mins:4, accent:T.pink,
      body:`I work with many NRI founders and investors in the Gulf investing back into Indian entities.

**Mistake 1: Using book value instead of fair market value**
FEMA requires fair market value determined by an IBBI Registered Valuer using DCF or NAV. Book value is not fair market value.

**Mistake 2: Wrong valuer**
The valuation must be signed by a Merchant Banker or IBBI Registered Valuer. A regular CA's report does not satisfy this requirement.

**Mistake 3: Wrong valuation date**
The valuation date must be close to the date of allotment — typically within 6 months.`,
    },
  ];

  const [active, setActive] = useState(null);

  if(active!==null) {
    const p = posts[active];
    return (
      <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <button onClick={()=>setActive(null)} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 14px", color:T.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif", marginBottom:32 }}>← Back to Insights</button>
          <div style={{ fontSize:11, fontWeight:700, color:p.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{p.tag} · {p.mins} min read</div>
          <h1 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,36px)", color:T.text, lineHeight:1.15, marginBottom:24 }}>{p.title}</h1>
          <div style={{ fontSize:13, color:T.muted, marginBottom:32, padding:"12px 16px", borderRadius:10, background:T.card, border:`1px solid ${T.border}` }}>
            By <strong style={{ color:T.text }}>Garima Agarwal</strong> · CA · IBBI Registered Valuer
          </div>
          {p.body.split("\n\n").map((para,i)=>{
            if(para.startsWith("**") && para.endsWith("**")) {
              return <h3 key={i} style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:18, color:T.text, margin:"28px 0 10px" }}>{para.replace(/\*\*/g,"")}</h3>;
            }
            const bold = para.replace(/\*\*(.*?)\*\*/g,"BOLD:$1");
            const parts = bold.split("BOLD:");
            return <p key={i} style={{ fontSize:15, color:T.muted, lineHeight:1.8, marginBottom:16 }}>
              {parts.map((pt,k)=>k%2===1?<strong key={k} style={{ color:T.text }}>{pt}</strong>:<span key={k}>{pt}</span>)}
            </p>;
          })}
          <div style={{ marginTop:48, padding:24, borderRadius:16, background:`${p.accent}10`, border:`1px solid ${p.accent}30` }}>
            <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:18, color:T.text, marginBottom:8 }}>Have a question about this?</div>
            <a href="https://wa.me/919833585810" target="_blank" rel="noopener" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, background:T.green+"15", border:`1.5px solid ${T.green}30`, color:T.green, fontSize:13, fontWeight:700 }}>
              💬 WhatsApp Garima
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <SectionHead eyebrow="Insights" title="Finance, demystified." sub="No jargon. No filler. Real guidance on valuations, compliance, and financial strategy."/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20 }} className="blog-grid">
          {posts.map((p,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{
              background:T.card, border:`1px solid ${T.border}`, borderRadius:20,
              padding:24, textAlign:"left", cursor:"pointer", fontFamily:"'Inter Tight','Inter',sans-serif",
              transition:"border-color 0.2s", position:"relative", overflow:"hidden",
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=p.accent+"50"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.accent, opacity:0.7 }}/>
              <div style={{ fontSize:11, fontWeight:700, color:p.accent, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{p.tag} · {p.mins} min read</div>
              <h3 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:18, color:T.text, lineHeight:1.25, marginBottom:10 }}>{p.title}</h3>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.6 }}>{p.excerpt}</p>
              <div style={{ marginTop:16, fontSize:13, fontWeight:700, color:p.accent }}>Read article →</div>
            </button>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:640px){.blog-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const [f, setF] = useState({ name:"", email:"", company:"", service:"", message:"" });
  const [sent, setSent] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const ok = f.name && f.email && f.service && f.message;

  if(sent) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"120px 24px 80px" }}>
      <div style={{ textAlign:"center", maxWidth:380 }}>
        <div style={{ width:72, height:84, borderRadius:20, background:T.lime, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 24px" }}>✓</div>
        <h2 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:28, color:T.text, marginBottom:12 }}>Message sent!</h2>
        <p style={{ fontSize:15, color:T.muted, lineHeight:1.7 }}>Garima will respond within 24 hours. If it's urgent, WhatsApp is faster.</p>
        <a href="https://wa.me/919833585810" target="_blank" rel="noopener" style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:20, padding:"10px 20px", borderRadius:10, background:T.green+"15", border:`1.5px solid ${T.green}30`, color:T.green, fontSize:13, fontWeight:700 }}>
          💬 WhatsApp Garima
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <SectionHead eyebrow="Contact" title="Let's talk numbers." sub="For a scoped proposal, a quick question, or to book a discovery call."/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:40, alignItems:"start" }} className="contact-grid">
          <div>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.lime, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Garima Agarwal</div>
              <div style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:22, color:T.text, marginBottom:10 }}>CA · IBBI Registered Valuer</div>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>IBBI/RV/14/2022/15038<br/>agrgarima@gmail.com</p>
            </div>
            {[
              { icon:"📊", l:"Valuations", d:"Section 56, FEMA, ESOP, NCLT, Ind AS 36. From ₹30,000." },
              { icon:"🧠", l:"Fractional CFO", d:"Monthly retainer for SMEs. From ₹50,000/month." },
              { icon:"⚡", l:"Typical turnaround", d:"Valuations: 5–7 days. CFO onboarding: 2 weeks." },
            ].map((item,idx)=>(
              <div key={idx} style={{ display:"flex", gap:12, marginBottom:20 }}>
                <div style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:T.text, fontSize:14, marginBottom:3 }}>{item.l}</div>
                  <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>{item.d}</div>
                </div>
              </div>
            ))}
            <a href="https://wa.me/919833585810" target="_blank" rel="noopener" style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"11px 18px", borderRadius:12, background:T.green+"10", border:`1.5px solid ${T.green}25`, color:T.green, fontSize:14, fontWeight:700, width:"fit-content" }}>
              💬 WhatsApp Garima
            </a>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:24, padding:"28px 24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><Label>Name</Label><Input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Arjun Sharma"/></div>
              <div><Label>Email</Label><Input value={f.email} onChange={e=>set("email",e.target.value)} placeholder="arjun@startup.com" type="email"/></div>
            </div>
            <div style={{ marginBottom:14 }}><Label>Company</Label><Input value={f.company} onChange={e=>set("company",e.target.value)} placeholder="NexPay Technologies"/></div>
            <div style={{ marginBottom:14 }}>
              <Label>I need help with</Label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {["Valuation","Fractional CFO","FEMA / FDI","Ind AS 36","ESOP","Other"].map(s=>(
                  <Pill key={s} active={f.service===s} onClick={()=>set("service",s)}>{s}</Pill>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <Label>Message</Label>
              <textarea value={f.message} onChange={e=>set("message",e.target.value)}
                placeholder="Tell me about your situation..."
                rows={4} style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.border}`, background:"rgba(255,255,255,0.03)", color:T.text, fontSize:14, fontFamily:"'Inter Tight','Inter',sans-serif", resize:"vertical", outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=T.lime}
                onBlur={e=>e.target.style.borderColor=T.border}
              />
            </div>
            <button onClick={()=>setSent(true)} disabled={!ok} style={{
              width:"100%", padding:13, borderRadius:12, border:"none", cursor:ok?"pointer":"not-allowed",
              fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:14,
              background: ok ? T.lime : T.card,
              color: ok ? T.bg : T.dim,
              outline: ok ? "none" : `1.5px solid ${T.border}`,
              transition:"all 0.2s",
            }}>Send Message →</button>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:640px){.contact-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}


// ─── LEGAL ────────────────────────────────────────────────────────────────────
function Legal({ tab="terms" }) {
  const [active, setActive] = useState(tab);

  const sections = {
    terms: {
      title: "Terms & Conditions",
      updated: "January 2026",
      content: [
        {
          heading: "1. Acceptance of Terms",
          body: "By accessing or using the Finzzup website (finzzup.com) or any services provided by Garima Agarwal (CA, IBBI Registered Valuer, Membership No. 160944), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this website or our services."
        },
        {
          heading: "2. Services",
          body: "Finzzup provides valuation advisory, Fractional CFO services, and related financial consulting. All valuation reports are signed by Garima Agarwal, IBBI Registered Valuer (IBBI/RV/14/2022/15038). Services are governed by separate engagement letters agreed upon before commencement of work."
        },
        {
          heading: "3. Indicative Calculator",
          body: "The free valuation calculator on this website provides indicative estimates only. Results are not legally valid for any regulatory filing, tax purpose, or investment decision. They are based on industry averages and publicly available multiples. For any regulatory or compliance purpose, a formal IBBI-certified report is required."
        },
        {
          heading: "4. No Professional Relationship",
          body: "Use of this website or the free calculator does not create a professional, advisory, or fiduciary relationship between you and Garima Agarwal or Finzzup. A formal engagement is established only through a signed engagement letter."
        },
        {
          heading: "5. Accuracy of Information",
          body: "While we endeavour to keep information on this website accurate and up to date, we make no warranties regarding the completeness, accuracy, or suitability of any content. Regulatory frameworks and tax laws change — always verify current requirements with a qualified professional."
        },
        {
          heading: "6. Intellectual Property",
          body: "All content on this website — including text, case studies, blog articles, and the calculator — is the intellectual property of Garima Agarwal / Finzzup. You may not reproduce, distribute, or use any content without prior written permission."
        },
        {
          heading: "7. Limitation of Liability",
          body: "To the maximum extent permitted by law, Finzzup and Garima Agarwal shall not be liable for any indirect, incidental, or consequential damages arising from use of this website or reliance on any information herein. Our liability for any formal engagement is governed by the relevant engagement letter."
        },
        {
          heading: "8. Governing Law",
          body: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra."
        },
        {
          heading: "9. Changes to Terms",
          body: "We reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the revised terms. The date of last update is noted above."
        },
        {
          heading: "10. Contact",
          body: "For any questions regarding these terms, please contact: agrgarima@gmail.com"
        },
      ]
    },
    privacy: {
      title: "Privacy Policy",
      updated: "January 2026",
      content: [
        {
          heading: "1. Information We Collect",
          body: "When you use the contact form or valuation calculator on this website, we collect: your name, email address, phone number (optional), company name, and the details you provide about your business. We do not collect any payment information on this website."
        },
        {
          heading: "2. How We Use Your Information",
          body: "Information you provide is used solely to: respond to your enquiry, prepare a scoped proposal for our services, and communicate with you about your engagement. We do not use your information for marketing to third parties."
        },
        {
          heading: "3. Data Sharing",
          body: "We do not sell, trade, or rent your personal information to third parties. Information may be shared with professional advisors (e.g. co-valuers, legal counsel) only where necessary for your engagement, and only with your knowledge."
        },
        {
          heading: "4. Data Storage",
          body: "Information submitted through this website is stored securely. We retain client information for a period of 7 years as required under applicable professional and tax regulations in India."
        },
        {
          heading: "5. Cookies",
          body: "This website may use basic cookies for functionality (e.g. remembering your navigation state). We do not use tracking cookies or third-party advertising cookies. You can disable cookies in your browser settings without affecting core functionality."
        },
        {
          heading: "6. Your Rights",
          body: "You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, contact us at agrgarima@gmail.com. We will respond within 30 days."
        },
        {
          heading: "7. Third-Party Links",
          body: "This website may contain links to third-party websites. We are not responsible for the privacy practices of those websites and encourage you to review their privacy policies."
        },
        {
          heading: "8. WhatsApp Communication",
          body: "If you contact us via WhatsApp, your messages are subject to WhatsApp's own privacy policy. We use WhatsApp only for direct client communication and do not add you to any broadcast lists without consent."
        },
        {
          heading: "9. Changes to This Policy",
          body: "We may update this privacy policy from time to time. The date of last revision is noted above. Continued use of the website constitutes acceptance of the updated policy."
        },
        {
          heading: "10. Contact",
          body: "For any privacy-related queries: agrgarima@gmail.com | Garima Agarwal, CA | IBBI/RV/14/2022/15038 | Membership No. 160944"
        },
      ]
    },
    disclaimer: {
      title: "Disclaimer",
      updated: "January 2026",
      content: [
        {
          heading: "Valuation Disclaimer",
          body: "All formal valuation reports issued by Garima Agarwal are prepared in accordance with applicable standards (IBBI Valuation Standards, Rule 11UA of the Income Tax Rules, FEMA regulations, or Ind AS as applicable). Each report is signed with UDIN and IBBI registration. The opinions expressed in reports represent professional judgment based on information provided by the client and publicly available data."
        },
        {
          heading: "Calculator Disclaimer",
          body: "The free indicative calculator on this website is for informational purposes only. It does not constitute a valuation report, financial advice, or legal opinion. Results should not be used for any regulatory filing, investment decision, or tax compliance purpose. Industry multiples used are indicative averages and may not reflect current market conditions."
        },
        {
          heading: "Blog & Insights Disclaimer",
          body: "Articles and insights published on this website are for general informational purposes only. They reflect the author's understanding at the time of writing and do not constitute legal, tax, or financial advice. Laws and regulations change — always consult a qualified professional before acting on any information."
        },
        {
          heading: "No Guarantee of Outcomes",
          body: "Case studies and results described on this website reflect specific past engagements. Past results do not guarantee future outcomes. Every valuation and advisory engagement is unique and results will vary based on the specific facts and circumstances."
        },
        {
          heading: "Regulatory Compliance",
          body: "Garima Agarwal is a Practising Chartered Accountant (Membership No. 160944) and IBBI Registered Valuer (IBBI/RV/14/2022/15038). Professional conduct is governed by the Institute of Chartered Accountants of India (ICAI) and the Insolvency and Bankruptcy Board of India (IBBI)."
        },
      ]
    }
  };

  const active_doc = sections[active];
  const tabs = [
    { id:"terms", label:"Terms & Conditions" },
    { id:"privacy", label:"Privacy Policy" },
    { id:"disclaimer", label:"Disclaimer" },
  ];

  return (
    <div style={{ padding:"120px 24px 80px", minHeight:"100vh" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        {/* Tab switcher */}
        <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActive(t.id)} style={{
              padding:"10px 20px", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:"'Inter Tight','Inter',sans-serif", fontSize:13, fontWeight:700,
              background: active===t.id ? T.lime : T.card,
              color: active===t.id ? T.bg : T.muted,
              outline: active===t.id ? "none" : `1.5px solid ${T.border}`,
              transition:"all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Document */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"40px 36px" }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:800, fontSize:32, color:T.text, marginBottom:8 }}>{active_doc.title}</h1>
            <p style={{ fontSize:13, color:T.dim }}>Last updated: {active_doc.updated} · Finzzup / Garima Agarwal</p>
          </div>
          {active_doc.content.map((s, i) => (
            <div key={i} style={{ marginBottom:28, paddingBottom:28, borderBottom: i < active_doc.content.length-1 ? `1px solid ${T.border}` : "none" }}>
              <h3 style={{ fontFamily:"'Inter Tight','Inter',sans-serif", fontWeight:700, fontSize:16, color:T.text, marginBottom:10 }}>{s.heading}</h3>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.8 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop:32, padding:"16px 20px", borderRadius:12, background:`${T.lime}08`, border:`1px solid ${T.lime}20`, fontSize:13, color:T.muted }}>
            Questions? Email <strong style={{ color:T.text }}>agrgarima@gmail.com</strong> or WhatsApp <a href="https://wa.me/919833585810" style={{ color:T.lime, fontWeight:700 }}>+91 98335 85810</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ borderTop:`1px solid ${T.border}`, padding:"48px 24px 32px", marginTop:40 }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", gap:40 }} className="footer-grid">
        <div>
          <Logo size={28} dark={true}/>
          <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginTop:14, maxWidth:260 }}>
            Know what's up with your finances. IBBI-certified valuations and Fractional CFO for startups, SMEs, and corporates.
          </p>
        </div>
        {[
          { head:"Services", links:[["Valuations","calculator"],["Fractional CFO","contact"],["Ind AS Advisory","contact"],["FEMA / Gulf","contact"]] },
          { head:"Company", links:[["Case Studies","cases"],["Insights","blog"],["Contact","contact"]] },
          { head:"Legal", links:[["Terms & Conditions","legal"],["Privacy Policy","legal"],["Disclaimer","legal"],["IBBI Reg: IBBI/RV/14/2022/15038",null],["CA Membership: 160944",null]] },
        ].map((col,i)=>(
          <div key={i}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>{col.head}</div>
            {col.links.map(([l,p],j)=>(
              <div key={j} style={{ marginBottom:8 }}>
                {p ? (
                  <button onClick={()=>setPage(p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:T.dim, fontFamily:"'Inter Tight','Inter',sans-serif", padding:0 }}>{l}</button>
                ) : (
                  <span style={{ fontSize:12, color:T.dim }}>{l}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth:1100, margin:"28px auto 0", paddingTop:20, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:12, color:T.dim }}>© 2026 Finzzup™ · Garima Agarwal</span>
        <span style={{ fontSize:12, color:T.dim }}>Know what's up with your finances.</span>
      </div>
      <style>{`@media(max-width:640px){.footer-grid{grid-template-columns:1fr 1fr!important}}`}</style>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  useEffect(() => { window.scrollTo({ top:0, behavior:"smooth" }); }, [page]);
  const pages = { home:<Home setPage={setPage}/>, calculator:<Calculator/>, cases:<Cases/>, blog:<Blog/>, contact:<Contact/>, legal:<Legal/> };
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"'Space Grotesk',sans-serif" }}>
      <Nav page={page} setPage={setPage}/>
      {pages[page] || pages.home}
      <Footer setPage={setPage}/>
    </div>
  );
}


