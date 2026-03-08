import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

// ═══════════════════════════════════════════════════════════════════════════════
//  GENDER DETECTION — identical to InterviewExperience
// ═══════════════════════════════════════════════════════════════════════════════
const FEMALE_NAME_HINTS = [
  "priya","sneha","pooja","kavya","lakshmi","divya","ananya","swathi","deepa",
  "nithya","sravani","mounika","haritha","lavanya","sirisha","supriya","ramya",
  "madhuri","padma","gayathri","gayatri","anusha","bhavana","chandana","deepthi",
  "geeta","geetha","hema","indira","jyothi","kalyani","keerthi","komali","latha",
  "meena","mythili","nalini","nandini","pavithra","pushpa","radha","rekha","rohini",
  "rupa","sadhana","sarada","saritha","savitha","shanthi","shobha","sita","sridevi",
  "srilakshmi","sriya","sudha","sukanya","suma","sumathi","sunitha","swapna",
  "tulasi","usha","vani","vanitha","vasantha","vasudha","vidya","vijaya","vimala",
  "yamini","amrutha","aparna","aruna","archana","aswini","bhargavi","chaitra",
  "deeksha","dharani","durga","ganga","girija","jahnavi","jayalakshmi","kamala",
  "kavitha","kiran","komal","krishna","kumari","lipika","madhavi","malathi","malini",
  "mamatha","manasa","meghana","menaka","neha","niharika","nikitha","nimisha",
  "pallavi","prasanna","preeti","purnima","ragini","rajini","rajitha","rani",
  "ranjitha","raveena","revathi","roopa","sahithi","sandhya","sangeetha","sanjana",
  "shailaja","shakuntala","sharmila","shilpa","shreya","shruti","sindhu","smitha",
  "sowmya","spandana","sravanthi","sreeja","tejaswini","thulasi","umadevi","vasavi",
  "veda","vennela","vibha","vijayalakshmi","vishalakshi","fathima","fatima","zeenath",
  "esther","vaishnavi","valarmathi","taramati","taruna","tejasri","poornima",
];
const FEMALE_SUFFIXES = [
  "bai","vathi","mathi","latha","priya","devi","sri","shree","lakshmi",
  "kumari","rani","mala","vani","thi","itha","etha","nika","asha","isha",
];
function detectGender(name) {
  if (!name) return "male";
  const lower = name.toLowerCase().replace(/[^a-z\s]/g, "");
  const parts = lower.split(/\s+/);
  const first = parts[0] || "";
  const last  = parts[parts.length - 1] || "";
  if (FEMALE_NAME_HINTS.some(fn => first === fn || first.startsWith(fn))) return "female";
  if (FEMALE_NAME_HINTS.some(fn => last === fn)) return "female";
  if (FEMALE_SUFFIXES.some(s => first.endsWith(s) || last.endsWith(s))) return "female";
  return "male";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SVG AVATARS
// ═══════════════════════════════════════════════════════════════════════════════
const MaleAvatar = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="mBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#1d4ed8"/>
      </linearGradient>
      <linearGradient id="mBody" x1="0" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563eb"/><stop offset="1" stopColor="#1e40af"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="40" fill="url(#mBg)"/>
    <circle cx="40" cy="28" r="13" fill="#fcd34d"/>
    <ellipse cx="40" cy="18" rx="12" ry="7" fill="#92400e"/>
    <ellipse cx="29" cy="22" rx="4" ry="6" fill="#92400e"/>
    <ellipse cx="51" cy="22" rx="4" ry="6" fill="#92400e"/>
    <circle cx="35" cy="28" r="1.5" fill="#78350f"/>
    <circle cx="45" cy="28" r="1.5" fill="#78350f"/>
    <path d="M36 33 Q40 36 44 33" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 80 Q20 56 40 56 Q60 56 60 80Z" fill="url(#mBody)"/>
    <path d="M34 56 L40 64 L46 56" fill="white" opacity="0.9"/>
  </svg>
);
const FemaleAvatar = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="fBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ec4899"/><stop offset="1" stopColor="#be185d"/>
      </linearGradient>
      <linearGradient id="fBody" x1="0" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#db2777"/><stop offset="1" stopColor="#9d174d"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="40" fill="url(#fBg)"/>
    <ellipse cx="40" cy="42" rx="17" ry="22" fill="#7c2d12"/>
    <circle cx="40" cy="28" r="13" fill="#fcd34d"/>
    <ellipse cx="40" cy="17" rx="13" ry="8" fill="#7c2d12"/>
    <ellipse cx="28" cy="24" rx="4" ry="8" fill="#7c2d12"/>
    <ellipse cx="52" cy="24" rx="4" ry="8" fill="#7c2d12"/>
    <circle cx="35" cy="28" r="1.5" fill="#78350f"/>
    <circle cx="45" cy="28" r="1.5" fill="#78350f"/>
    <path d="M36 33 Q40 37 44 33" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="32" cy="31" r="3" fill="#f87171" opacity="0.35"/>
    <circle cx="48" cy="31" r="3" fill="#f87171" opacity="0.35"/>
    <path d="M18 80 Q18 54 40 54 Q62 54 62 80Z" fill="url(#fBody)"/>
    <path d="M30 54 Q40 62 50 54" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <circle cx="40" cy="62" r="2" fill="white" opacity="0.8"/>
  </svg>
);
function SmartAvatar({ name, size = 40 }) {
  const gender = detectGender(name || "");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      flexShrink: 0, display: "inline-flex",
      boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
    }}>
      {gender === "female" ? <FemaleAvatar size={size}/> : <MaleAvatar size={size}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

async function uploadMedia(file, userId) {
  const ext  = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("post-media")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(data.path);
  return publicUrl;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════════════════════════
const Ico = {
  Heart: ({ filled }) => (
    <svg width="18" height="18" viewBox="0 0 24 24"
      fill={filled ? "#e5484d" : "none"} stroke={filled ? "#e5484d" : "currentColor"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Comment: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Share: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  ),
  Send: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Photo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Video: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  PDF: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Pulse: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f4f6fc; --surface:#fff; --surface2:#eef1f9;
  --border:#e2e6f4; --border2:#edf0f9;
  --text:#0f172a; --text2:#334155; --muted:#94a3b8;
  --accent:#4f46e5; --accent-lt:#eef2ff; --accent-glow:rgba(79,70,229,0.16);
  --red:#ef4444; --red-lt:#fff1f2; --green:#22c55e;
  --radius:20px;
  --shadow:0 1px 4px rgba(79,70,229,0.07),0 4px 22px rgba(79,70,229,0.06);
  --shadow-up:0 8px 36px rgba(79,70,229,0.14);
  --font:'Sora',sans-serif; --serif:'Playfair Display',serif;
  --ease:cubic-bezier(0.4,0,0.2,1);
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased;}

/* ANIMATIONS */
@keyframes spin       {to{transform:rotate(360deg);}}
@keyframes fadeUp     {from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn    {from{opacity:0;transform:translateY(-14px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes expand     {from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
@keyframes menuPop    {from{opacity:0;transform:scale(0.85) translateY(-10px);}to{opacity:1;transform:scale(1) translateY(0);}}
@keyframes heartPop   {0%{transform:scale(1)}30%{transform:scale(1.7)}65%{transform:scale(0.8)}100%{transform:scale(1)}}
@keyframes shimmer    {to{background-position-x:-200%;}}
@keyframes rtPulse    {0%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);}70%{box-shadow:0 0 0 7px rgba(34,197,94,0);}100%{box-shadow:0 0 0 0 rgba(34,197,94,0);}}
@keyframes uploadPulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
@keyframes toastIn    {from{opacity:0;transform:translateX(-50%) translateY(28px) scale(0.9);}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}}
@keyframes toastOut   {from{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}to{opacity:0;transform:translateX(-50%) translateY(16px) scale(0.92);}}
@keyframes pageOverlayIn  {from{opacity:0;}to{opacity:1;}}
@keyframes pageOverlayOut {from{opacity:1;}to{opacity:0;}}
@keyframes overlaySlide   {from{transform:translateY(-100%);}to{transform:translateY(0);}}
@keyframes cardFloat  {0%{transform:translateY(0);}50%{transform:translateY(-3px);}100%{transform:translateY(0);}}

/* LAYOUT */
.nf-root{min-height:100vh;background:var(--bg);}
.nf-feed{max-width:620px;margin:0 auto;padding:28px 16px 100px;}

/* DESKTOP — wider centred layout with sidebar gutter */
@media(min-width:1024px){
  .nf-root{display:grid;grid-template-columns:1fr min(620px,100%) 1fr;grid-template-rows:auto 1fr;}
  .nf-nav{grid-column:1/-1;}
  .nf-feed{grid-column:2;padding:32px 0 120px;}
}

/* NAV */
.nf-nav{
  position:sticky;top:0;z-index:200;
  background:rgba(255,255,255,0.93);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-bottom:1.5px solid var(--border);
  height:64px;display:flex;align-items:center;
  padding:0 20px;gap:14px;
}
.nav-brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
.nav-logo-icon{
  width:40px;height:40px;border-radius:13px;flex-shrink:0;
  background:linear-gradient(135deg,#4f46e5,#7c3aed);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(79,70,229,0.36);
}
.nav-title{font-family:var(--serif);font-style:italic;font-size:1.3rem;color:var(--text);letter-spacing:-0.2px;line-height:1.1;}
.nav-sub{font-size:0.6rem;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.rt-badge{display:flex;align-items:center;gap:5px;font-size:0.68rem;font-weight:700;color:var(--muted);background:var(--surface2);border:1.5px solid var(--border);border-radius:50px;padding:4px 10px;}
.rt-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:rtPulse 2s ease infinite;}
.nav-user{display:flex;align-items:center;gap:9px;background:var(--surface2);border:1.5px solid var(--border);border-radius:50px;padding:5px 14px 5px 5px;}
.nav-user-name{font-size:0.78rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;}
.nav-user-tag{font-size:0.62rem;color:var(--muted);font-weight:600;}

/* FULL SCREEN */
.nf-center{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:var(--bg);}
.loading-ring{width:44px;height:44px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--accent);animation:spin 0.75s linear infinite;}
.loading-label{font-size:0.83rem;color:var(--muted);font-weight:600;font-family:var(--font);}
.error-card{background:var(--surface);border:1.5px solid #fecaca;border-radius:var(--radius);padding:30px;text-align:center;max-width:340px;}
.error-card h3{font-size:1rem;font-weight:700;color:var(--red);margin-bottom:7px;}
.error-card p{font-size:0.84rem;color:var(--muted);}

/* SKELETON */
.skeleton{background:linear-gradient(110deg,#e8ecf6 8%,#f2f5fd 18%,#e8ecf6 33%);background-size:200% 100%;animation:shimmer 1.4s linear infinite;border-radius:8px;}
.skel-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);}

/* COMPOSE */
.compose-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:18px;box-shadow:var(--shadow);margin-bottom:20px;animation:fadeUp 0.38s var(--ease) both;}
.compose-row{display:flex;gap:12px;align-items:flex-start;}
.compose-col{flex:1;display:flex;flex-direction:column;gap:8px;}
.compose-input{
  width:100%;background:var(--surface2);border:1.5px solid var(--border2);
  border-radius:13px;padding:12px 15px;font-family:var(--font);font-size:0.9rem;
  color:var(--text);resize:none;outline:none;min-height:54px;line-height:1.6;
  transition:border-color 0.18s var(--ease),box-shadow 0.18s var(--ease);
}
.compose-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow);background:var(--surface);}
.compose-input::placeholder{color:var(--muted);}
.char-row{display:flex;justify-content:flex-end;font-size:0.68rem;font-weight:700;color:var(--muted);}
.char-row.warn{color:#f59e0b;}.char-row.over{color:var(--red);}

.compose-footer{display:flex;align-items:center;gap:8px;padding-top:14px;border-top:1.5px solid var(--border2);flex-wrap:wrap;}
.attach-row{display:flex;gap:6px;flex:1;flex-wrap:wrap;}
.att-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:7px 12px;border-radius:9px;border:1.5px solid var(--border);
  background:var(--surface2);color:var(--muted);font-family:var(--font);
  font-size:0.74rem;font-weight:700;cursor:pointer;
  transition:all 0.16s var(--ease);position:relative;overflow:hidden;white-space:nowrap;
}
.att-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-lt);}
.att-btn.on{background:var(--accent);color:#fff;border-color:var(--accent);}
.att-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;}

/* POST BUTTON — with uploading state */
.post-btn{
  display:inline-flex;align-items:center;gap:7px;
  padding:10px 22px;border-radius:12px;border:none;cursor:pointer;
  background:linear-gradient(135deg,var(--accent),#7c3aed);
  color:#fff;font-family:var(--font);font-size:0.82rem;font-weight:800;
  white-space:nowrap;box-shadow:0 4px 16px rgba(79,70,229,0.38);
  transition:all 0.18s var(--ease);min-width:90px;justify-content:center;
}
.post-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 22px rgba(79,70,229,0.48);}
.post-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none;}
.post-btn.uploading{animation:uploadPulse 1.2s ease infinite;}

/* upload progress ring inside btn */
.btn-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;animation:spin 0.7s linear infinite;flex-shrink:0;}

.compose-preview{border-radius:12px;overflow:hidden;border:1.5px solid var(--border);position:relative;margin-top:10px;}
.compose-preview img,.compose-preview video{width:100%;max-height:250px;object-fit:cover;display:block;}
.file-chip{display:flex;align-items:center;gap:10px;padding:13px;background:var(--surface2);}
.file-chip-icon{width:38px;height:38px;border-radius:9px;background:#fff1f2;border:1.5px solid #fecdd3;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
.file-chip-name{font-size:0.83rem;font-weight:700;color:var(--text);}
.file-chip-sub{font-size:0.68rem;color:var(--muted);font-weight:700;margin-top:1px;}
.remove-btn{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.54);border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.78rem;transition:background 0.15s;}
.remove-btn:hover{background:rgba(239,68,68,0.88);}

/* DIVIDER */
.divider{display:flex;align-items:center;gap:12px;margin:22px 0 18px;font-size:0.67rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:2.2px;}
.divider::before,.divider::after{content:'';flex:1;height:1.5px;background:var(--border);}

/* POST CARD */
.post-card{
  background:var(--surface);border:1.5px solid var(--border);
  border-radius:var(--radius);overflow:hidden;
  box-shadow:var(--shadow);margin-bottom:18px;
  transition:box-shadow 0.25s var(--ease),transform 0.25s var(--ease),border-color 0.25s var(--ease);
}
@media(min-width:768px){
  .post-card:hover{box-shadow:var(--shadow-up);transform:translateY(-2px);border-color:rgba(79,70,229,0.18);}
}

/* NEW post gets slide-in animation */
.post-card.new-post{animation:slideIn 0.42s cubic-bezier(0.34,1.56,0.64,1) both;}
/* existing posts get fadeUp on initial load only */
.post-card.loaded{animation:fadeUp 0.44s var(--ease) both;}

/* optimistic (pending) post */
.post-card.pending{
  opacity:0.88;
  border-color:var(--accent);
  box-shadow:0 0 0 3px var(--accent-glow), var(--shadow);
  animation:slideIn 0.42s cubic-bezier(0.34,1.56,0.64,1) both;
}
.pending-badge{
  display:inline-flex;align-items:center;gap:5px;
  font-size:0.67rem;font-weight:800;color:var(--accent);
  background:var(--accent-lt);border:1px solid #c7d2fe;
  border-radius:6px;padding:2px 8px;
}
.pending-spinner{width:8px;height:8px;border-radius:50%;border:1.5px solid #c7d2fe;border-top-color:var(--accent);animation:spin 0.7s linear infinite;}

.post-header{display:flex;align-items:flex-start;gap:11px;padding:16px 16px 10px;}
.post-author{flex:1;min-width:0;padding-top:2px;}
.post-name{font-size:0.88rem;font-weight:700;color:var(--text);line-height:1.2;}
.post-meta{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:0.7rem;color:var(--muted);font-weight:500;flex-wrap:wrap;}
.edited-tag{display:inline-block;font-size:0.6rem;font-weight:800;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;border-radius:5px;padding:1px 6px;}
.post-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}

/* 3-dot */
.menu-wrap{position:relative;}
.dots-btn{width:34px;height:34px;border-radius:50%;border:1.5px solid transparent;background:transparent;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:900;letter-spacing:0.5px;transition:all 0.16s var(--ease);padding-bottom:5px;line-height:1;}
.dots-btn:hover{background:var(--surface2);border-color:var(--border);color:var(--text);}
.dropdown{position:absolute;right:0;top:38px;z-index:400;background:var(--surface);border:1.5px solid var(--border);border-radius:14px;min-width:172px;padding:6px;box-shadow:0 10px 40px rgba(79,70,229,0.16);animation:menuPop 0.2s cubic-bezier(0.34,1.56,0.64,1);}
.dd-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:600;color:var(--text2);border:none;background:none;width:100%;text-align:left;font-family:var(--font);transition:background 0.12s;}
.dd-item:hover{background:var(--surface2);}
.dd-item.copied{color:var(--green);}
.dd-item.danger{color:var(--red);}
.dd-item.danger:hover{background:var(--red-lt);}
.dd-sep{height:1.5px;background:var(--border2);margin:5px 0;}

/* caption */
.post-caption{padding:0 16px 13px;font-size:0.88rem;line-height:1.68;color:var(--text2);}

/* edit inline */
.edit-wrap{padding:0 16px 14px;}
.edit-area{width:100%;background:var(--surface2);border:1.5px solid var(--accent);border-radius:13px;padding:11px 14px;font-family:var(--font);font-size:0.88rem;color:var(--text);resize:none;outline:none;line-height:1.6;min-height:84px;box-shadow:0 0 0 3px var(--accent-glow);}
.edit-bar{display:flex;gap:8px;margin-top:10px;}
.btn-save{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--accent),#7c3aed);color:#fff;font-family:var(--font);font-size:0.78rem;font-weight:800;box-shadow:0 3px 10px rgba(79,70,229,0.3);transition:all 0.16s var(--ease);}
.btn-save:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(79,70,229,0.42);}
.btn-cancel{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface2);color:var(--muted);font-family:var(--font);font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.16s;}
.btn-cancel:hover{border-color:var(--text);color:var(--text);}

/* media */
.post-media{background:var(--surface2);overflow:hidden;position:relative;border-top:1.5px solid var(--border2);border-bottom:1.5px solid var(--border2);}
.post-media img{width:100%;display:block;max-height:490px;object-fit:cover;transition:transform 0.5s var(--ease);}
.post-media:hover img{transform:scale(1.013);}
.post-media video{width:100%;display:block;max-height:490px;background:#000;}
.pdf-row{display:flex;align-items:center;gap:14px;padding:18px 20px;}
.pdf-icon{width:48px;height:48px;border-radius:12px;background:#fff1f2;border:1.5px solid #fecdd3;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;}
.pdf-name{font-size:0.86rem;font-weight:700;color:var(--text);}
.pdf-sub{font-size:0.68rem;color:var(--muted);margin-top:2px;font-weight:700;}
.pdf-open{margin-left:auto;padding:7px 16px;border-radius:9px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-family:var(--font);font-size:0.76rem;font-weight:800;cursor:pointer;transition:all 0.16s;}
.pdf-open:hover{background:var(--accent);color:#fff;border-color:var(--accent);}

/* like strip */
.like-strip{padding:9px 16px 0;font-size:0.78rem;font-weight:700;color:var(--text2);display:flex;align-items:center;gap:5px;}

/* action bar */
.action-bar{display:flex;align-items:center;padding:5px 8px 9px;gap:2px;border-bottom:1.5px solid var(--border2);}
.act-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;border:none;cursor:pointer;background:transparent;color:var(--muted);font-family:var(--font);font-size:0.78rem;font-weight:700;transition:all 0.15s var(--ease);}
.act-btn:hover{background:var(--surface2);color:var(--text);}
.act-btn.liked{color:var(--red);}
.act-btn.hb svg{animation:heartPop 0.36s cubic-bezier(0.34,1.56,0.64,1);}
.act-space{flex:1;}

/* comments */
.cmts-section{animation:expand 0.24s var(--ease);}
.cmts-list{padding:12px 16px 4px;}
.no-cmt{font-size:0.78rem;color:var(--muted);padding-bottom:6px;font-weight:500;}
.cmt-item{display:flex;gap:9px;margin-bottom:11px;align-items:flex-start;}
.cmt-bubble{background:var(--surface2);border-radius:0 13px 13px 13px;padding:8px 13px;border:1.5px solid var(--border2);}
.cmt-author{font-size:0.74rem;font-weight:800;color:var(--text);margin-bottom:2px;}
.cmt-text{font-size:0.83rem;color:var(--text2);line-height:1.55;}
.cmt-time{font-size:0.67rem;color:var(--muted);margin-top:4px;padding-left:4px;font-weight:500;}
.cmt-input-row{display:flex;gap:9px;align-items:flex-end;padding:8px 16px 16px;}
.cmt-field{flex:1;background:var(--surface2);border:1.5px solid var(--border);border-radius:22px;padding:9px 16px;color:var(--text);font-family:var(--font);font-size:0.83rem;outline:none;resize:none;min-height:38px;max-height:100px;line-height:1.45;transition:border-color 0.18s,box-shadow 0.18s;}
.cmt-field:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow);}
.cmt-field::placeholder{color:var(--muted);}
.cmt-send{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,var(--accent),#7c3aed);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 10px rgba(79,70,229,0.35);transition:all 0.16s;}
.cmt-send:hover{transform:scale(1.1);box-shadow:0 5px 16px rgba(79,70,229,0.46);}

/* PAGE TRANSITION OVERLAY */
.page-overlay{
  position:fixed;inset:0;z-index:8888;pointer-events:none;
  background:rgba(255,255,255,0.7);
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity 0.28s var(--ease);
}
.page-overlay.active{opacity:1;pointer-events:all;}
.page-overlay-bar{
  position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#4f46e5,#7c3aed,#ec4899);
  box-shadow:0 0 12px rgba(79,70,229,0.7);
  transform-origin:left;animation:overlaySlide 0.4s var(--ease) both;
}
.page-overlay-spinner{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:44px;height:44px;border-radius:50%;
  border:3px solid rgba(79,70,229,0.15);border-top-color:var(--accent);
  animation:spin 0.75s linear infinite;
}

/* TOAST — responsive & animated */
.toast-wrap{
  position:fixed;z-index:9999;pointer-events:none;
  /* mobile: bottom center */
  bottom:24px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:8px;
  width:max-content;max-width:calc(100vw - 32px);
}
.toast{
  display:flex;align-items:center;gap:10px;
  padding:12px 22px;border-radius:50px;
  font-size:0.83rem;font-weight:700;font-family:var(--font);
  white-space:nowrap;pointer-events:none;
  box-shadow:0 8px 32px rgba(0,0,0,0.2),0 2px 8px rgba(0,0,0,0.1);
  opacity:0;
  animation:toastIn 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.toast.hiding{animation:toastOut 0.28s ease forwards;}
.toast-icon{font-size:1rem;flex-shrink:0;}
.t-default{background:#0f172a;color:#fff;}
.t-success{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 8px 24px rgba(34,197,94,0.35);}
.t-error  {background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 8px 24px rgba(239,68,68,0.35);}
.t-info   {background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;box-shadow:0 8px 24px rgba(59,130,246,0.35);}

/* desktop toast — bottom right */
@media(min-width:768px){
  .toast-wrap{bottom:32px;right:32px;left:auto;transform:none;align-items:flex-end;}
  .toast{border-radius:16px;padding:14px 22px;font-size:0.85rem;}
}

/* LIGHTBOX */
.lightbox{position:fixed;inset:0;z-index:7000;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;animation:pageOverlayIn 0.22s ease;cursor:zoom-out;}
.lightbox img{max-width:95vw;max-height:92vh;border-radius:10px;box-shadow:0 20px 80px rgba(0,0,0,0.8);object-fit:contain;}
.lightbox video{max-width:95vw;max-height:92vh;border-radius:10px;background:#000;}
.lightbox-close{position:absolute;top:18px;right:22px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
.lightbox-close:hover{background:rgba(255,255,255,0.24);}

/* COMMENT MENU */
.cmt-menu-wrap{position:relative;flex-shrink:0;}
.cmt-dots-btn{width:26px;height:26px;border-radius:50%;border:none;background:transparent;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:900;letter-spacing:0.4px;transition:all 0.14s;padding-bottom:4px;line-height:1;opacity:0;}
.cmt-item:hover .cmt-dots-btn{opacity:1;}
.cmt-dots-btn:hover{background:var(--border);color:var(--text);}
.cmt-dropdown{position:absolute;right:0;top:28px;z-index:500;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;min-width:150px;padding:5px;box-shadow:0 8px 30px rgba(79,70,229,0.14);animation:menuPop 0.18s cubic-bezier(0.34,1.56,0.64,1);}
.cmt-dd-item{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;color:var(--text2);border:none;background:none;width:100%;text-align:left;font-family:var(--font);transition:background 0.1s;}
.cmt-dd-item:hover{background:var(--surface2);}
.cmt-dd-item.danger{color:var(--red);}
.cmt-dd-item.danger:hover{background:var(--red-lt);}

/* COMMENT EDIT inline */
.cmt-edit-wrap{flex:1;}
.cmt-edit-field{width:100%;background:var(--surface2);border:1.5px solid var(--accent);border-radius:12px;padding:7px 12px;font-family:var(--font);font-size:0.83rem;color:var(--text);resize:none;outline:none;line-height:1.5;min-height:36px;box-shadow:0 0 0 3px var(--accent-glow);}
.cmt-edit-bar{display:flex;gap:6px;margin-top:6px;}
.cmt-edit-save{padding:5px 14px;border-radius:8px;border:none;cursor:pointer;background:var(--accent);color:#fff;font-family:var(--font);font-size:0.75rem;font-weight:800;}
.cmt-edit-cancel{padding:5px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface2);color:var(--muted);font-family:var(--font);font-size:0.75rem;font-weight:700;cursor:pointer;}

/* clickable media */
.post-media{cursor:zoom-in;}
.pdf-row{cursor:pointer;transition:background 0.15s;}
.pdf-row:hover{background:var(--surface2);}
.empty{text-align:center;padding:72px 20px;}
.empty-icon{font-size:3rem;margin-bottom:14px;}
.empty h3{font-family:var(--serif);font-style:italic;font-size:1.5rem;color:var(--text);margin-bottom:8px;}
.empty p{font-size:0.85rem;color:var(--muted);}

/* responsive */
@media(max-width:640px){
  .nf-feed{padding:14px 10px 90px;}
  .nf-nav{padding:0 12px;height:58px;}
  .nav-sub,.nav-user-tag,.rt-badge{display:none;}
  .compose-footer{flex-direction:column;align-items:stretch;}
  .attach-row{order:2;}
  .post-btn{order:1;justify-content:center;}
}
@media(max-width:380px){.att-btn span{display:none;}}
`;

// ═══════════════════════════════════════════════════════════════════════════════
//  SKELETON CARD
// ═══════════════════════════════════════════════════════════════════════════════
function SkelCard() {
  return (
    <div className="skel-card">
      <div style={{ display:"flex",gap:12,alignItems:"center",marginBottom:14 }}>
        <div className="skeleton" style={{ width:44,height:44,borderRadius:"50%" }}/>
        <div>
          <div className="skeleton" style={{ width:130,height:12,marginBottom:7 }}/>
          <div className="skeleton" style={{ width:80,height:10 }}/>
        </div>
      </div>
      <div className="skeleton" style={{ width:"70%",height:13,marginBottom:8 }}/>
      <div className="skeleton" style={{ width:"100%",height:88,borderRadius:12,marginBottom:14 }}/>
      <div style={{ display:"flex",gap:8 }}>
        <div className="skeleton" style={{ width:68,height:30,borderRadius:10 }}/>
        <div className="skeleton" style={{ width:90,height:30,borderRadius:10 }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE TRANSITION OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════
function PageOverlay({ active }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (active) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [active]);
  if (!visible) return null;
  return (
    <div className={`page-overlay ${active ? "active" : ""}`}>
      <div className="page-overlay-bar"/>
      <div className="page-overlay-spinner"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function NewsFeed() {

  // ── Auth (identical to InterviewExperience) ──────────────────────────────────
  const [sessionUser, setSessionUser] = useState(null);
  const [userName, setUserName]       = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError]     = useState("");

  // ── Feed ─────────────────────────────────────────────────────────────────────
  const [posts, setPosts]         = useState([]);
  const [likedIds, setLikedIds]   = useState(new Set());
  const [openCmts, setOpenCmts]   = useState(new Set());
  const [cmtInputs, setCmtInputs] = useState({});
  const [heartAnim, setHeartAnim] = useState(new Set());
  const [feedLoad, setFeedLoad]   = useState(true);
  const [pageLoad, setPageLoad]   = useState(false); // top bar progress

  // ── Compose ──────────────────────────────────────────────────────────────────
  const [caption, setCaption]   = useState("");
  const [media, setMedia]       = useState(null);
  const [posting, setPosting]   = useState(false);
  const [uploadStep, setUploadStep] = useState(""); // "uploading" | "saving" | ""

  // ── Lightbox / PDF Viewer ────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState(null); // { url, type }

  // ── Edit / Menu ──────────────────────────────────────────────────────────────
  const [editId, setEditId]         = useState(null);
  const [editText, setEditText]     = useState("");
  const [menuId, setMenuId]         = useState(null);
  const [copiedId, setCopiedId]     = useState(null);

  // ── Comment Edit / Delete ────────────────────────────────────────────────────
  const [cmtMenuId, setCmtMenuId]   = useState(null);  // which comment's menu is open
  const [cmtEditId, setCmtEditId]   = useState(null);  // which comment is being edited
  const [cmtEditText, setCmtEditText] = useState("");

  // ── Toast — queue-based, responsive ─────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);
  const showToast = useCallback((msg, kind="default") => {
    const id = ++toastCounter.current;
    const icons = { success:"✓", error:"✕", info:"ℹ", default:"" };
    setToasts(prev => [...prev.slice(-2), { id, msg, kind, icon: icons[kind]||"", hiding:false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id===id ? { ...t, hiding:true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id!==id)), 320);
    }, 2800);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  1. AUTH — same as InterviewExperience
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data:{ user }, error } = await supabase.auth.getUser();
        if (error || !user) { setAuthError("Please log in to view the feed."); setAuthLoading(false); return; }
        const fullName =
          user.user_metadata?.full_name    ||
          user.user_metadata?.display_name ||
          user.email?.split("@")[0]        ||
          "Anonymous";
        setSessionUser(user);
        setUserName(fullName);
      } catch {
        setAuthError("Authentication error. Please refresh.");
      } finally {
        setAuthLoading(false);
      }
    };
    init();
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setSessionUser(null); setUserName(""); }
    });
    return () => subscription?.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  2. FETCH POSTS (with top progress bar)
  // ─────────────────────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setPageLoad(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*, likes(user_id), comments(id,user_id,user_name,text,created_at)")
      .order("created_at", { ascending: false });
    setPageLoad(false);
    if (error) { showToast("Could not load posts", "error"); setFeedLoad(false); return; }
    setPosts(data || []);
    setFeedLoad(false);
  }, [showToast]);

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) { setFeedLoad(false); return; }
    loadPosts();
    supabase.from("likes").select("post_id").eq("user_id", sessionUser.id)
      .then(({ data }) => setLikedIds(new Set((data||[]).map(l => l.post_id))));
  }, [authLoading, sessionUser, loadPosts]);

  // ─────────────────────────────────────────────────────────────────────────────
  //  3. REALTIME — deduplicates against optimistic posts
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionUser) return;
    const ch = supabase.channel("nf-realtime")
      .on("postgres_changes",{ event:"INSERT", schema:"public", table:"posts" }, ({ new: row }) => {
        setPosts(p => {
          // Skip if we already have this id (optimistic) OR a temp post from same user with same caption
          if (p.find(x => x.id === row.id)) return p;
          // Replace the pending temp post from this user if it matches
          const hasPending = p.find(x => x._pending && x.user_id === row.user_id && x.caption === row.caption);
          if (hasPending) {
            return p.map(x => x._pending && x.user_id === row.user_id && x.caption === row.caption
              ? { ...row, likes:[], comments:[], _new:true }
              : x
            );
          }
          return [{ ...row, likes:[], comments:[], _new:true }, ...p];
        });
      })
      .on("postgres_changes",{ event:"UPDATE", schema:"public", table:"posts" }, ({ new: row }) => {
        setPosts(p => p.map(x => x.id === row.id ? { ...x, caption:row.caption, updated_at:row.updated_at } : x));
      })
      .on("postgres_changes",{ event:"DELETE", schema:"public", table:"posts" }, ({ old }) => {
        setPosts(p => p.filter(x => x.id !== old.id));
      })
      .on("postgres_changes",{ event:"INSERT", schema:"public", table:"likes" }, ({ new: row }) => {
        setPosts(p => p.map(x => x.id === row.post_id ? { ...x, likes:[...(x.likes||[]),{ user_id:row.user_id }] } : x));
      })
      .on("postgres_changes",{ event:"DELETE", schema:"public", table:"likes" }, ({ old }) => {
        setPosts(p => p.map(x => x.id === old.post_id ? { ...x, likes:(x.likes||[]).filter(l => l.user_id !== old.user_id) } : x));
      })
      .on("postgres_changes",{ event:"INSERT", schema:"public", table:"comments" }, ({ new: row }) => {
        setPosts(p => p.map(x => x.id === row.post_id ? { ...x, comments:[...(x.comments||[]),row] } : x));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [sessionUser]);

  // ─────────────────────────────────────────────────────────────────────────────
  //  4. CLOSE MENU
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (!e.target.closest(".menu-wrap")) setMenuId(null);
      if (!e.target.closest(".cmt-menu-wrap")) setCmtMenuId(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  5. HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleFile = (file, type) => {
    if (!file) return;
    const t = type || (
      file.type.startsWith("video") ? "video" :
      file.type === "application/pdf" ? "pdf" :
      file.type.startsWith("image") ? "image" : "file"
    );
    setMedia({ url:["image","video"].includes(t) ? URL.createObjectURL(file) : null, type:t, name:file.name, file });
  };

  // ── OPTIMISTIC POST — instant like Instagram ─────────────────────────────────
  const handlePost = async () => {
    if (!caption.trim() && !media) return;
    if (!sessionUser) { showToast("Please log in to post", "error"); return; }

    const tempId   = `temp_${Date.now()}`;
    const now      = new Date().toISOString();
    const localUrl = media?.url || null; // blob URL for instant preview

    // 1. INSERT OPTIMISTIC POST IMMEDIATELY — user sees it right away
    const optimisticPost = {
      id:         tempId,
      user_id:    sessionUser.id,
      user_name:  userName,
      caption:    caption.trim() || null,
      media_url:  localUrl,          // blob URL — shows image instantly
      media_type: media?.type || null,
      file_name:  media?.name || null,
      created_at: now,
      updated_at: now,
      likes:      [],
      comments:   [],
      _pending:   true,              // flag: still uploading to server
      _new:       true,
    };
    setPosts(prev => [optimisticPost, ...prev]);
    setCaption("");
    setMedia(null);
    setPosting(true);

    try {
      // 2. Upload media if needed (image, video, AND pdf)
      let mediaUrl = null;
      if (media?.file && ["image","video","pdf"].includes(media.type)) {
        setUploadStep("uploading");
        mediaUrl = await uploadMedia(media.file, sessionUser.id);
      }

      setUploadStep("saving");

      // 3. Insert into Supabase
      const { data, error } = await supabase.from("posts").insert([{
        user_id:    sessionUser.id,
        user_name:  userName,
        caption:    optimisticPost.caption,
        media_url:  mediaUrl,
        media_type: media?.type || null,
        file_name:  media?.name || null,
      }]).select("*, likes(user_id), comments(id,user_id,user_name,text,created_at)");

      if (error) throw error;

      // 4. Replace temp post with real server post (swap temp id → real id)
      setPosts(prev => prev.map(p =>
        p.id === tempId
          ? { ...data[0], likes:[], comments:[], _new:true, _pending:false }
          : p
      ));
      showToast("✓ Posted!", "success");

    } catch (e) {
      // 5. On failure — remove the optimistic post and show error
      setPosts(prev => prev.filter(p => p.id !== tempId));
      showToast("Post failed: " + e.message, "error");
    } finally {
      setPosting(false);
      setUploadStep("");
    }
  };

  const toggleLike = async postId => {
    if (!sessionUser || postId.startsWith("temp_")) return;
    const isLiked = likedIds.has(postId);
    setHeartAnim(p => new Set([...p, postId]));
    setTimeout(() => setHeartAnim(p => { const n=new Set(p); n.delete(postId); return n; }), 420);
    setLikedIds(p => { const n=new Set(p); isLiked?n.delete(postId):n.add(postId); return n; });
    if (isLiked) await supabase.from("likes").delete().eq("post_id",postId).eq("user_id",sessionUser.id);
    else          await supabase.from("likes").insert([{ post_id:postId, user_id:sessionUser.id }]);
  };

  const toggleCmts = id => {
    if (id.startsWith("temp_")) return;
    setOpenCmts(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  };

  const submitCmt = async postId => {
    const text = (cmtInputs[postId]||"").trim();
    if (!text || !sessionUser || postId.startsWith("temp_")) return;
    setCmtInputs(p => ({ ...p, [postId]:"" }));
    const { error } = await supabase.from("comments").insert([{
      post_id:postId, user_id:sessionUser.id, user_name:userName, text
    }]);
    if (error) showToast("Comment failed","error");
  };

  const handleShare = post => {
    // Build shareable URL — works with React Router, hash routing, and plain deployments
    const base = window.location.href.split("?")[0].split("#")[0];
    const url  = `${base}?post=${post.id}`;
    const doToast = () => {
      setCopiedId(post.id);
      setMenuId(null);
      showToast("🔗 Link copied!", "success");
      setTimeout(() => setCopiedId(null), 2700);
    };
    // Try Web Share API first (mobile native share sheet)
    if (navigator.share) {
      navigator.share({ title: "Check this post on Pulse", url }).then(doToast).catch(() => copyFallback(url, doToast));
    } else {
      copyFallback(url, doToast);
    }
  };

  const copyFallback = (url, cb) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(cb).catch(() => execCopy(url, cb));
    } else {
      execCopy(url, cb);
    }
  };

  const execCopy = (url, cb) => {
    const el = document.createElement("textarea");
    el.value = url; el.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(el);
    cb();
  };

  const startEdit = post => { setEditId(post.id); setEditText(post.caption||""); setMenuId(null); };

  const saveEdit = async id => {
    if (!editText.trim()) return;
    // optimistic
    setPosts(p => p.map(x => x.id === id ? { ...x, caption:editText.trim(), updated_at:new Date().toISOString() } : x));
    setEditId(null);
    const { error } = await supabase.from("posts").update({ caption:editText.trim(), updated_at:new Date().toISOString() }).eq("id",id);
    if (error) { showToast("Update failed","error"); loadPosts(); return; }
    showToast("✓ Post updated","success");
  };

  const deletePost = async (id, ownerId) => {
    if (String(ownerId) !== String(sessionUser?.id)) { showToast("Unauthorized","error"); return; }
    setMenuId(null);
    // optimistic remove
    setPosts(p => p.filter(x => x.id !== id));
    const { error } = await supabase.from("posts").delete().eq("id",id);
    if (error) { showToast("Delete failed","error"); loadPosts(); }
    else showToast("Post deleted","error");
  };

  const deleteComment = async (postId, cmtId, ownerId) => {
    if (String(ownerId) !== String(sessionUser?.id)) { showToast("Unauthorized","error"); return; }
    setCmtMenuId(null);
    // optimistic
    setPosts(p => p.map(x => x.id === postId
      ? { ...x, comments: (x.comments||[]).filter(c => c.id !== cmtId) }
      : x
    ));
    const { error } = await supabase.from("comments").delete().eq("id",cmtId);
    if (error) { showToast("Delete failed","error"); loadPosts(); }
    else showToast("Comment deleted","error");
  };

  const saveCmtEdit = async (postId, cmtId) => {
    const text = cmtEditText.trim();
    if (!text) return;
    setCmtEditId(null);
    // optimistic
    setPosts(p => p.map(x => x.id === postId
      ? { ...x, comments: (x.comments||[]).map(c => c.id === cmtId ? { ...c, text } : c) }
      : x
    ));
    const { error } = await supabase.from("comments").update({ text }).eq("id",cmtId);
    if (error) { showToast("Update failed","error"); loadPosts(); }
    else showToast("✓ Comment updated","success");
  };

  // ── ESC to close lightbox / pdf viewer ───────────────────────────────────────
  useEffect(() => {
    const h = e => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER GUARDS
  // ─────────────────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="nf-center">
        <div className="loading-ring"/>
        <span className="loading-label">Loading your feed…</span>
      </div>
    </>
  );

  if (authError) return (
    <>
      <style>{CSS}</style>
      <div className="nf-center">
        <div className="error-card">
          <h3>Authentication Required</h3>
          <p>{authError}</p>
        </div>
      </div>
    </>
  );

  const charLen = caption.length;
  const charCls = charLen > 450 ? "over" : charLen > 350 ? "warn" : "";

  // ─────────────────────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Page transition overlay — shows on feed load / page switch */}
      <PageOverlay active={pageLoad} />

      <div className="nf-root">

        {/* ══ NAV ══ */}
        <nav className="nf-nav">
          <div className="nav-brand">
            <div className="nav-logo-icon"><Ico.Pulse /></div>
            <div>
              <div className="nav-title">Pulse</div>
              <div className="nav-sub">Community Feed</div>
            </div>
          </div>
          <div className="nav-right">
            <div className="rt-badge">
              <span className="rt-dot"/> Live
            </div>
            <div className="nav-user">
              <SmartAvatar name={userName} size={30}/>
              <div>
                <div className="nav-user-name">{userName}</div>
                <div className="nav-user-tag">Signed in</div>
              </div>
            </div>
          </div>
        </nav>

        {/* ══ FEED ══ */}
        <div className="nf-feed">

          {/* COMPOSE */}
          <div className="compose-card">
            <div className="compose-row">
              <SmartAvatar name={userName} size={42}/>
              <div className="compose-col">
                <textarea
                  className="compose-input"
                  placeholder={`What's on your mind, ${userName.split(" ")[0]}?`}
                  value={caption}
                  rows={2}
                  maxLength={500}
                  onChange={e => setCaption(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter"&&(e.metaKey||e.ctrlKey)) handlePost(); }}
                />
                {charLen > 0 && (
                  <div className={`char-row ${charCls}`}>{500 - charLen} remaining</div>
                )}
              </div>
            </div>

            {media && (
              <div className="compose-preview">
                {media.type==="image" && media.url && <img src={media.url} alt="preview"/>}
                {media.type==="video" && media.url && <video src={media.url} controls/>}
                {(media.type==="pdf"||media.type==="file") && (
                  <div className="file-chip">
                    <div className="file-chip-icon">{media.type==="pdf"?"📄":"📎"}</div>
                    <div>
                      <div className="file-chip-name">{media.name}</div>
                      <div className="file-chip-sub">{media.type.toUpperCase()}</div>
                    </div>
                  </div>
                )}
                <button className="remove-btn" onClick={()=>setMedia(null)}>✕</button>
              </div>
            )}

            <div className="compose-footer">
              <div className="attach-row">
                <label className={`att-btn ${media?.type==="image"?"on":""}`}>
                  <Ico.Photo/><span>Photo</span>
                  <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0],"image")}/>
                </label>
                <label className={`att-btn ${media?.type==="video"?"on":""}`}>
                  <Ico.Video/><span>Video</span>
                  <input type="file" accept="video/*" onChange={e=>handleFile(e.target.files[0],"video")}/>
                </label>
                <label className={`att-btn ${media?.type==="pdf"?"on":""}`}>
                  <Ico.PDF/><span>PDF</span>
                  <input type="file" accept=".pdf" onChange={e=>handleFile(e.target.files[0],"pdf")}/>
                </label>
              </div>
              <button
                className={`post-btn ${posting ? "uploading" : ""}`}
                disabled={(!caption.trim()&&!media)||posting||charLen>500}
                onClick={handlePost}
              >
                {posting ? (
                  <>
                    <div className="btn-spinner"/>
                    {uploadStep === "uploading" ? "Uploading…" : "Saving…"}
                  </>
                ) : "Post"}
              </button>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="divider">Recent Posts</div>

          {/* POSTS */}
          {feedLoad ? (
            [1,2,3].map(i => <SkelCard key={i}/>)
          ) : posts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✍️</div>
              <h3>Nothing here yet</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : posts.map((post, idx) => {
            const isLiked    = likedIds.has(post.id);
            const isOpen     = openCmts.has(post.id);
            const isOwner    = String(post.user_id) === String(sessionUser?.id);
            const isEditing  = editId === post.id;
            const isCopied   = copiedId === post.id;
            const isPending  = !!post._pending;
            const isNew      = !!post._new;
            const wasEdited  = post.updated_at && post.updated_at !== post.created_at;
            const likeCount  = (post.likes||[]).length;
            const cmtCount   = (post.comments||[]).length;

            return (
              <div
                key={post.id}
                className={`post-card ${isPending ? "pending" : isNew ? "new-post" : "loaded"}`}
                style={{ animationDelay: isNew || isPending ? "0s" : `${Math.min(idx*0.05,0.25)}s` }}
              >
                {/* HEADER */}
                <div className="post-header">
                  <SmartAvatar name={post.user_name} size={44}/>
                  <div className="post-author">
                    <div className="post-name">{post.user_name}</div>
                    <div className="post-meta">
                      <span>{timeAgo(post.created_at)}</span>
                      {wasEdited && <span className="edited-tag">Edited</span>}
                      {isPending && (
                        <span className="pending-badge">
                          <span className="pending-spinner"/>
                          Posting…
                        </span>
                      )}
                    </div>
                  </div>
                  {/* 3-dot — disabled on pending posts */}
                  {!isPending && (
                    <div className="post-actions">
                      <div className="menu-wrap">
                        <button className="dots-btn" onClick={()=>setMenuId(menuId===post.id?null:post.id)}>···</button>
                        {menuId===post.id && (
                          <div className="dropdown">
                            <button className={`dd-item ${isCopied?"copied":""}`} onClick={()=>handleShare(post)}>
                              {isCopied ? <><Ico.Check/> Copied!</> : <><Ico.Copy/> Copy link</>}
                            </button>
                            {isOwner && (
                              <>
                                <div className="dd-sep"/>
                                <button className="dd-item" onClick={()=>startEdit(post)}><Ico.Edit/> Edit post</button>
                                <button className="dd-item danger" onClick={()=>deletePost(post.id,post.user_id)}><Ico.Trash/> Delete post</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CAPTION / EDIT */}
                {isEditing ? (
                  <div className="edit-wrap">
                    <textarea className="edit-area" rows={4} value={editText} onChange={e=>setEditText(e.target.value)} autoFocus/>
                    <div className="edit-bar">
                      <button className="btn-save" onClick={()=>saveEdit(post.id)}><Ico.Check/> Save</button>
                      <button className="btn-cancel" onClick={()=>setEditId(null)}><Ico.X/> Cancel</button>
                    </div>
                  </div>
                ) : (
                  post.caption && <div className="post-caption">{post.caption}</div>
                )}

                {/* MEDIA */}
                {!isEditing && post.media_url && post.media_type==="image" && (
                  <div className="post-media" onClick={()=>setLightbox({ url:post.media_url, type:"image" })} title="Click to expand">
                    <img src={post.media_url} alt="" loading={isNew||isPending?"eager":"lazy"}/>
                  </div>
                )}
                {!isEditing && post.media_url && post.media_type==="video" && (
                  <div className="post-media" onClick={()=>setLightbox({ url:post.media_url, type:"video" })} title="Click to expand">
                    <video src={post.media_url} controls onClick={e=>e.stopPropagation()}/>
                  </div>
                )}
                {!isEditing && post.media_type==="pdf" && (
                  <div className="post-media">
                    <div
                      className="pdf-row"
                      onClick={()=>{
                        if (!post.media_url) { showToast("PDF still uploading…","default"); return; }
                        const a = document.createElement("a");
                        a.href = post.media_url;
                        a.download = post.file_name || "Document.pdf";
                        a.target = "_blank";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        showToast("⬇ Downloading…","success");
                      }}
                    >
                      <div className="pdf-icon">📄</div>
                      <div>
                        <div className="pdf-name">{post.file_name||"Document.pdf"}</div>
                        <div className="pdf-sub">PDF Document · {post.media_url ? "Click to download" : "Uploading…"}</div>
                      </div>
                      <div style={{marginLeft:"auto",color:"var(--accent)",fontSize:"0.76rem",fontWeight:800,paddingRight:4,flexShrink:0}}>
                        {post.media_url ? "⬇ Download" : "⏳"}
                      </div>
                    </div>
                  </div>
                )}

                {/* LIKE STRIP */}
                {likeCount > 0 && (
                  <div className="like-strip">❤️ {likeCount} {likeCount===1?"like":"likes"}</div>
                )}

                {/* ACTION BAR — disabled on pending */}
                <div className="action-bar">
                  <button
                    className={`act-btn ${isLiked?"liked":""} ${heartAnim.has(post.id)?"hb":""}`}
                    onClick={()=>toggleLike(post.id)}
                    disabled={isPending}
                    style={isPending?{opacity:0.4,cursor:"not-allowed"}:{}}
                  >
                    <Ico.Heart filled={isLiked}/> Like
                  </button>
                  <button
                    className="act-btn"
                    onClick={()=>toggleCmts(post.id)}
                    disabled={isPending}
                    style={isPending?{opacity:0.4,cursor:"not-allowed"}:{}}
                  >
                    <Ico.Comment/>
                    Comment{cmtCount>0?` (${cmtCount})`:""}
                  </button>
                  <div className="act-space"/>
                  <button className="act-btn" onClick={()=>handleShare(post)} disabled={isPending} style={isPending?{opacity:0.4,cursor:"not-allowed"}:{}}>
                    <Ico.Share/> Share
                  </button>
                </div>

                {/* COMMENTS */}
                {isOpen && !isPending && (
                  <div className="cmts-section">
                    <div className="cmts-list">
                      {cmtCount===0 && <div className="no-cmt">No comments yet — be the first!</div>}
                      {(post.comments||[]).map(c => {
                        const isCmtOwner = String(c.user_id) === String(sessionUser?.id);
                        const isEditingCmt = cmtEditId === c.id;
                        return (
                          <div key={c.id} className="cmt-item">
                            <SmartAvatar name={c.user_name} size={30}/>
                            <div style={{flex:1,minWidth:0}}>
                              {isEditingCmt ? (
                                <div className="cmt-edit-wrap">
                                  <textarea
                                    className="cmt-edit-field"
                                    rows={2}
                                    value={cmtEditText}
                                    onChange={e=>setCmtEditText(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="cmt-edit-bar">
                                    <button className="cmt-edit-save" onClick={()=>saveCmtEdit(post.id,c.id)}>Save</button>
                                    <button className="cmt-edit-cancel" onClick={()=>setCmtEditId(null)}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="cmt-bubble">
                                    <div className="cmt-author">{c.user_name}</div>
                                    <div className="cmt-text">{c.text}</div>
                                  </div>
                                  <div className="cmt-time">{timeAgo(c.created_at)}</div>
                                </>
                              )}
                            </div>
                            {/* comment 3-dot — owner only */}
                            {isCmtOwner && !isEditingCmt && (
                              <div className="cmt-menu-wrap">
                                <button
                                  className="cmt-dots-btn"
                                  onClick={()=>setCmtMenuId(cmtMenuId===c.id?null:c.id)}
                                >···</button>
                                {cmtMenuId===c.id && (
                                  <div className="cmt-dropdown">
                                    <button className="cmt-dd-item" onClick={()=>{setCmtEditId(c.id);setCmtEditText(c.text);setCmtMenuId(null);}}>
                                      <Ico.Edit/> Edit
                                    </button>
                                    <button className="cmt-dd-item danger" onClick={()=>deleteComment(post.id,c.id,c.user_id)}>
                                      <Ico.Trash/> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="cmt-input-row">
                      <SmartAvatar name={userName} size={30}/>
                      <textarea
                        className="cmt-field"
                        placeholder="Write a comment…"
                        rows={1}
                        value={cmtInputs[post.id]||""}
                        onChange={e=>setCmtInputs(p=>({...p,[post.id]:e.target.value}))}
                        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitCmt(post.id);}}}
                      />
                      <button className="cmt-send" onClick={()=>submitCmt(post.id)}><Ico.Send/></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TOAST STACK — responsive, animated */}
        <div className="toast-wrap">
          {toasts.map(t => (
            <div key={t.id} className={`toast t-${t.kind} ${t.hiding?"hiding":""}`}>
              {t.icon && <span className="toast-icon">{t.icon}</span>}
              {t.msg}
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX — image / video fullscreen */}
      {lightbox && (
        <div className="lightbox" onClick={()=>setLightbox(null)}>
          <button className="lightbox-close" onClick={()=>setLightbox(null)}>✕</button>
          {lightbox.type==="video"
            ? <video src={lightbox.url} controls autoPlay onClick={e=>e.stopPropagation()}/>
            : <img src={lightbox.url} alt="" onClick={e=>e.stopPropagation()}/>
          }
        </div>
      )}

    </>
  );
}