import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Mic, MicOff, ChevronRight, RotateCcw, X, ChevronDown,
  CheckCircle, Volume2, VolumeX, Play, Upload, User,
  Camera, CameraOff, FileText, Home, Maximize, Minimize
} from "react-feather";

// ─── Constants ───────────────────────────────────────────────
const TOTAL_TIME_SEC       = 15 * 60;
const SILENCE_TIMEOUT_SEC  = 30;   // after 30s of no speech → auto submit
const ANSWER_PAUSE_SEC     = 5;    // 5s pause after speech ends → auto submit
const INTERVIEWS_PER_MONTH = 3;

const SKILLS = [
  { key: "HTML",       icon: "🌐", color: "#e34c26", bg: "#fff3f0", border: "#f9a98d" },
  { key: "CSS",        icon: "🎨", color: "#264de4", bg: "#f0f3ff", border: "#a3b4f9" },
  { key: "JavaScript", icon: "⚡", color: "#c9a800", bg: "#fffef0", border: "#f0d84a" },
  { key: "Python",     icon: "🐍", color: "#3776ab", bg: "#f0f7ff", border: "#90c2e7" },
  { key: "Java",       icon: "☕", color: "#f89820", bg: "#fff8f0", border: "#fcd3a1" },
  { key: "SQL",        icon: "🗄️", color: "#00758f", bg: "#f0fbff", border: "#7ecde0" },
  { key: "Node.js",    icon: "🟢", color: "#3c873a", bg: "#f0fff4", border: "#86efac" },
  { key: "React.js",   icon: "⚛️", color: "#0ea5e9", bg: "#f0f9ff", border: "#7dd3fc" },
  { key: "Bootstrap",  icon: "🅱️", color: "#7952b3", bg: "#f5f0ff", border: "#c4a9f7" },
  { key: "HR",         icon: "👔", color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" },
];

const AVATAR_TYPES = [
  { key: "female", label: "Priya", title: "Ms. Priya Sharma",  dept: "HR · Tech Recruiter" },
  { key: "male",   label: "Arjun", title: "Mr. Arjun Mehta",   dept: "Senior Technical Lead" },
];

// ─── Utilities ────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractKeywords(text) {
  if (!text) return [];
  const stop = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","to","of","in","for","on","with","at","by","from","up","about","into","through","it","its","this","that","these","those","and","but","or","so","if","then","we","you","they","he","she","i","my","your","our","their","his","her","used","use","using","also","which","when","where","what","how","why","not","no","yes","more","less","one","two","three","all","some","any","very","just","like","such","than","each","both","few","many"]);
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w.length>3&&!stop.has(w)))];
}

function keywordScore(userAnswer, storedAnswer) {
  if (!userAnswer || !storedAnswer) return { score: 0, matched: [], missed: [], total: [] };
  const kws     = extractKeywords(storedAnswer);
  if (!kws.length) return { score: 5, matched: [], missed: [], total: [] };
  const ua      = userAnswer.toLowerCase();
  const matched = kws.filter(k => ua.includes(k));
  const missed  = kws.filter(k => !ua.includes(k));
  return { score: Math.min(10, Math.round((matched.length / kws.length) * 13)), matched, missed, total: kws };
}

function analyseSpeech(transcript) {
  if (!transcript || transcript.length < 10) return { confidence: 0, fluency: 0, clarity: 0 };
  const words      = transcript.trim().split(/\s+/);
  const fillers    = (transcript.match(/\b(um|uh|like|you know|kind of|sort of|basically|actually|literally)\b/gi)||[]).length;
  const fillerRatio = fillers / Math.max(words.length, 1);
  const confidence  = Math.max(0, Math.min(10, Math.round((1 - fillerRatio * 3) * 10)));
  const fluency     = Math.max(0, Math.min(10, Math.round(Math.min(words.length / 15, 1) * 10)));
  const sentences   = (transcript.match(/[.!?]+/g)||[]).length || 1;
  const avgLen      = words.length / sentences;
  const clarity     = Math.max(0, Math.min(10, avgLen < 30 && avgLen > 3 ? 8 : 5));
  return { confidence, fluency, clarity };
}

// Light human-like AI analysis (not deep)
async function callClaudeAnalysis(question, userAnswer, storedAnswer) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: "You are a friendly interviewer giving quick, human feedback to a fresher. Keep it brief and encouraging. Return ONLY valid JSON, no markdown.",
        messages: [{ role: "user", content: `Question: "${question}"\nCandidate said: "${userAnswer}"\n\nGive quick friendly feedback. Return ONLY: {"aiScore":<0-10>,"verdict":"<Excellent/Good/Fair/Weak>","strength":"<one short positive sentence>","gap":"<one short improvement sentence>","tip":"<one quick tip>"}` }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}

async function buildResumeQuestionsFromClaude(resumeTxt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: "Generate exactly 3 interview questions from this resume. Focus on their projects, skills and experience. Return ONLY a JSON array of 3 question strings. No markdown.",
        messages: [{ role: "user", content: `Resume:\n${resumeTxt}\n\nReturn: ["Q1?","Q2?","Q3?"]` }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "[]";
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      return arr.slice(0, 3).map(q => ({ question: q, answer: "", isResume: true }));
    }
    return [];
  } catch { return []; }
}

// ─── Interview limit helpers ──────────────────────────────────
// Requires columns in user_gamification: interview_count (int), interview_month (text)
async function getInterviewUsage(userId) {
  try {
    const { data, error } = await supabase
      .from("user_gamification")
      .select("interview_count, interview_month")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { interviewsThisMonth: 0 };
    const nowMonth = new Date().toISOString().slice(0, 7);
    const interviewsThisMonth = (data?.interview_month === nowMonth) ? (data?.interview_count || 0) : 0;
    return { interviewsThisMonth };
  } catch { return { interviewsThisMonth: 0 }; }
}

async function recordInterviewUsage(userId) {
  try {
    const nowMonth = new Date().toISOString().slice(0, 7);
    const { data } = await supabase
      .from("user_gamification")
      .select("interview_count, interview_month")
      .eq("user_id", userId)
      .maybeSingle();
    const currentCount = (data?.interview_month === nowMonth) ? (data?.interview_count || 0) : 0;
    if (currentCount >= INTERVIEWS_PER_MONTH) return { success: false, reason: "limit_reached" };
    await supabase.from("user_gamification").upsert({
      user_id: userId,
      interview_count: currentCount + 1,
      interview_month: nowMonth,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    return { success: true, interviewsLeft: INTERVIEWS_PER_MONTH - currentCount - 1 };
  } catch { return { success: false, reason: "error" }; }
}

// ─── Avatars ──────────────────────────────────────────────────
const FemaleAvatar = ({ isSpeaking, isListening }) => (
  <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <defs><radialGradient id="fg2" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#FDDBB4"/><stop offset="100%" stopColor="#E8A870"/></radialGradient></defs>
    <ellipse cx="100" cy="210" rx="70" ry="55" fill="#1e3a5f"/>
    <polygon points="82,170 100,205 118,170" fill="#fff" opacity="0.9"/>
    <rect x="88" y="165" width="24" height="28" rx="6" fill="#F5CBA7"/>
    <ellipse cx="100" cy="108" rx="48" ry="54" fill="url(#fg2)"/>
    <ellipse cx="100" cy="68" rx="48" ry="26" fill="#5a2d0c"/>
    <ellipse cx="55" cy="108" rx="13" ry="40" fill="#5a2d0c"/>
    <ellipse cx="145" cy="108" rx="13" ry="40" fill="#5a2d0c"/>
    <rect x="53" y="125" width="13" height="50" rx="6" fill="#5a2d0c"/>
    <rect x="134" y="125" width="13" height="50" rx="6" fill="#5a2d0c"/>
    <ellipse cx="52" cy="112" rx="7" ry="9" fill="#E8A870"/>
    <ellipse cx="148" cy="112" rx="7" ry="9" fill="#E8A870"/>
    <ellipse cx="83" cy="105" rx="9" ry="10" fill="white"/>
    <ellipse cx="117" cy="105" rx="9" ry="10" fill="white"/>
    <ellipse cx="84" cy="106" rx="6" ry="7" fill="#3D2B1F"/>
    <ellipse cx="118" cy="106" rx="6" ry="7" fill="#3D2B1F"/>
    <ellipse cx="85" cy="105" rx="3.5" ry="4" fill="#0a0500"/>
    <ellipse cx="119" cy="105" rx="3.5" ry="4" fill="#0a0500"/>
    <ellipse cx="87" cy="103" rx="1.2" ry="1.2" fill="white"/>
    <ellipse cx="121" cy="103" rx="1.2" ry="1.2" fill="white"/>
    <path d="M75 94 Q84 90 93 94" stroke="#4A3728" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M107 94 Q116 90 125 94" stroke="#4A3728" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M97 113 Q100 120 103 113" stroke="#C8845A" strokeWidth="1.5" fill="none"/>
    {isSpeaking?(<ellipse cx="100" cy="134" rx="12" ry="7" fill="#C0392B"><animate attributeName="ry" values="7;11;5;9;7" dur="0.5s" repeatCount="indefinite"/></ellipse>):(<path d="M89 133 Q100 141 111 133" stroke="#C0392B" strokeWidth="2.2" fill="none" strokeLinecap="round"/>)}
    <ellipse cx="70" cy="122" rx="9" ry="5" fill="#FFB6C1" opacity="0.4"/>
    <ellipse cx="130" cy="122" rx="9" ry="5" fill="#FFB6C1" opacity="0.4"/>
    {isListening&&<circle cx="100" cy="100" r="65" fill="none" stroke="#22c55e" strokeWidth="2.5" opacity="0.4"><animate attributeName="r" values="65;82;65" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="1.4s" repeatCount="indefinite"/></circle>}
    {isSpeaking&&<circle cx="100" cy="100" r="65" fill="none" stroke="#4f46e5" strokeWidth="2.5" opacity="0.35"><animate attributeName="r" values="65;80;65" dur="0.7s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.35;0;0.35" dur="0.7s" repeatCount="indefinite"/></circle>}
  </svg>
);

const MaleAvatar = ({ isSpeaking, isListening }) => (
  <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <defs><radialGradient id="mg2" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#F5C48A"/><stop offset="100%" stopColor="#D4956A"/></radialGradient></defs>
    <ellipse cx="100" cy="210" rx="70" ry="55" fill="#1a1a2e"/>
    <polygon points="82,170 100,205 118,170" fill="#fff" opacity="0.85"/>
    <rect x="88" y="165" width="24" height="28" rx="6" fill="#F0C48A"/>
    <ellipse cx="100" cy="108" rx="48" ry="54" fill="url(#mg2)"/>
    <ellipse cx="100" cy="66" rx="48" ry="20" fill="#2C1A0E"/>
    <rect x="50" y="60" width="13" height="18" rx="4" fill="#2C1A0E"/>
    <rect x="137" y="60" width="13" height="18" rx="4" fill="#2C1A0E"/>
    <ellipse cx="52" cy="112" rx="7" ry="9" fill="#D4A56A"/>
    <ellipse cx="148" cy="112" rx="7" ry="9" fill="#D4A56A"/>
    <ellipse cx="83" cy="105" rx="9" ry="9" fill="white"/>
    <ellipse cx="117" cy="105" rx="9" ry="9" fill="white"/>
    <ellipse cx="84" cy="106" rx="6" ry="7" fill="#2C1A0E"/>
    <ellipse cx="118" cy="106" rx="6" ry="7" fill="#2C1A0E"/>
    <ellipse cx="85" cy="105" rx="3" ry="3.5" fill="#0a0500"/>
    <ellipse cx="119" cy="105" rx="3" ry="3.5" fill="#0a0500"/>
    <ellipse cx="87" cy="103" rx="1.2" ry="1.2" fill="white"/>
    <ellipse cx="121" cy="103" rx="1.2" ry="1.2" fill="white"/>
    <path d="M74 93 Q84 88 93 93" stroke="#2C1A0E" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
    <path d="M107 93 Q116 88 126 93" stroke="#2C1A0E" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
    <path d="M95 112 Q100 120 105 112" stroke="#B07040" strokeWidth="2" fill="none"/>
    {isSpeaking?(<ellipse cx="100" cy="134" rx="13" ry="7" fill="#8B4513"><animate attributeName="ry" values="7;11;5;9;7" dur="0.5s" repeatCount="indefinite"/></ellipse>):(<path d="M88 133 Q100 141 112 133" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round"/>)}
    {isListening&&<circle cx="100" cy="100" r="65" fill="none" stroke="#22c55e" strokeWidth="2.5" opacity="0.4"><animate attributeName="r" values="65;82;65" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="1.4s" repeatCount="indefinite"/></circle>}
    {isSpeaking&&<circle cx="100" cy="100" r="65" fill="none" stroke="#4f46e5" strokeWidth="2.5" opacity="0.35"><animate attributeName="r" values="65;80;65" dur="0.7s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.35;0;0.35" dur="0.7s" repeatCount="indefinite"/></circle>}
  </svg>
);

// ─── Mini components ──────────────────────────────────────────
const SoundWave = ({ active, color="#4f46e5", bars=7 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:2.5, height:20 }}>
    {Array.from({length:bars}).map((_,i)=>{
      const h=[0.4,0.7,1,0.8,0.5,0.9,0.6][i%7];
      return <div key={i} style={{ width:2.5, borderRadius:2, background:color, height:active?`${h*100}%`:"20%", transition:`height ${0.12+i*0.04}s ease`, animation:active?`sw${i} ${0.5+i*0.08}s ease-in-out infinite alternate`:"none" }}/>;
    })}
    <style>{Array.from({length:bars}).map((_,i)=>`@keyframes sw${i}{from{transform:scaleY(.3)}to{transform:scaleY(1)}}`).join("")}</style>
  </div>
);

const TimerRing = ({ timeLeft, total }) => {
  const pct=timeLeft/total, r=28, circ=2*Math.PI*r;
  const color=pct>0.5?"#22c55e":pct>0.2?"#f59e0b":"#ef4444";
  const m=Math.floor(timeLeft/60), s=timeLeft%60;
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4"/>
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          strokeLinecap="round" transform="rotate(-90 35 35)"
          style={{ transition:"stroke-dashoffset 1s linear,stroke .3s" }}/>
      </svg>
      <div style={{ position:"absolute", textAlign:"center", lineHeight:1 }}>
        <div style={{ fontWeight:900, fontSize:"0.75rem", color }}>{m}:{String(s).padStart(2,"0")}</div>
        <div style={{ fontSize:"0.48rem", color:"#94a3b8", marginTop:1 }}>LEFT</div>
      </div>
    </div>
  );
};

const SilenceBar = ({ seconds, total }) => {
  const pct=Math.min(seconds/total,1);
  const color=pct<0.5?"#22c55e":pct<0.8?"#f59e0b":"#ef4444";
  return (
    <div style={{ width:"100%", marginTop:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:"0.58rem", color:"#94a3b8", fontWeight:700 }}>SILENCE TIMER</span>
        <span style={{ fontSize:"0.58rem", fontWeight:800, color }}>{total-seconds}s remaining</span>
      </div>
      <div style={{ height:4, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct*100}%`, background:color, borderRadius:10, transition:"width 1s linear,background .3s" }}/>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function MockInterview() {
  const [phase, setPhase]                   = useState("setup");
  const [candidateName, setCandidateName]   = useState("");
  const [avatarType, setAvatarType]         = useState("female");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [resumeText, setResumeText]         = useState("");
  const [resumeFile, setResumeFile]         = useState(null);

  // Coin/limit gating
  const [userId, setUserId]                 = useState(null);
  const [interviewsLeft, setInterviewsLeft] = useState(INTERVIEWS_PER_MONTH);
  const [loadingAccess, setLoadingAccess]   = useState(true);

  // Session state
  const [currentSkillIdx, setCurrentSkillIdx]   = useState(0);
  const [skillQuestions, setSkillQuestions]       = useState({});
  const [allSkillResults, setAllSkillResults]     = useState({});
  const [sessionQuestions, setSessionQuestions]   = useState([]);
  const [qIndex, setQIndex]                       = useState(0);
  const [currentQ, setCurrentQ]                   = useState(null);
  const [transcript, setTranscript]               = useState("");
  const [sessionResults, setSessionResults]       = useState([]);
  const [isLoading, setIsLoading]                 = useState(false);

  // AV
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraOn, setCameraOn]         = useState(true);
  const [cameraError, setCameraError]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabWarning, setTabWarning]     = useState(false);

  // Timer
  const [timeLeft, setTimeLeft]     = useState(TOTAL_TIME_SEC);
  const [silenceSec, setSilenceSec] = useState(0);

  // Feedback (shown AFTER interview, not during)
  const [feedback, setFeedback]           = useState(null);
  const [showFeedback, setShowFeedback]   = useState(false);
  const [isEvaluating, setIsEvaluating]   = useState(false);

  // Auto-advance pause state
  const [pauseSec, setPauseSec]   = useState(0);     // counts UP after speech stops
  const [hadSpeech, setHadSpeech] = useState(false); // did user speak at all yet?

  // Refs
  const recognitionRef  = useRef(null);
  const synthRef        = useRef(window.speechSynthesis);
  const timerRef        = useRef(null);
  const silenceRef      = useRef(null);
  const pauseRef        = useRef(null);
  const cameraRef       = useRef(null);
  const cameraStream    = useRef(null);
  const voiceRef        = useRef(voiceEnabled);
  voiceRef.current      = voiceEnabled;
  const transcriptRef   = useRef("");
  transcriptRef.current = transcript;
  const hadSpeechRef    = useRef(false);
  hadSpeechRef.current  = hadSpeech;
  const autoAdvanceRef  = useRef(null); // timeout for auto advance
  const interviewStartTimeRef = useRef(null); // timestamp when interview started

  const avatarMeta   = AVATAR_TYPES.find(a => a.key === avatarType);
  const currentSkill = selectedSkills[currentSkillIdx];

  // ── Load user + access check ──
  // Use onAuthStateChange so we reliably get the session even on first load
  useEffect(() => {
    setLoadingAccess(true);

    const loadUsage = async (uid) => {
      try {
        const { interviewsThisMonth } = await getInterviewUsage(uid);
        setInterviewsLeft(INTERVIEWS_PER_MONTH - interviewsThisMonth);
      } catch {}
      setLoadingAccess(false);
    };

    // First: try getUser() immediately (works if session already exists)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        loadUsage(user.id);
      }
    });

    // Second: also subscribe to auth state — fires when session hydrates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
      if (uid) {
        setUserId(uid);
        loadUsage(uid);
      } else {
        setLoadingAccess(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Running timer (never stops once started) ──
  useEffect(() => {
    if (phase !== "interview") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSkillFinish(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentSkillIdx]);

  // ── Silence timer (total silence — no speech at all) ──
  useEffect(() => {
    if (isListening && !showFeedback && phase === "interview") {
      silenceRef.current = setInterval(() => {
        setSilenceSec(s => {
          if (s + 1 >= SILENCE_TIMEOUT_SEC) {
            clearInterval(silenceRef.current);
            handleSilenceTimeout();
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      clearInterval(silenceRef.current);
      setSilenceSec(0);
    }
    return () => clearInterval(silenceRef.current);
  }, [isListening, showFeedback, phase]);

  // Reset silence when transcript grows
  useEffect(() => {
    setSilenceSec(0);
    if (transcript.trim()) {
      setHadSpeech(true);
      hadSpeechRef.current = true;
    }
  }, [transcript]);

  // ── Camera ──
  useEffect(() => {
    if (phase === "interview" && cameraOn) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [phase, cameraOn]);

  // ── Fullscreen change listener ──
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // ── Tab visibility warning ──
  useEffect(() => {
    if (phase !== "interview") return;
    const onVisChange = () => {
      if (document.hidden) {
        setTabWarning(true);
        synthRef.current?.cancel();
        speak("Warning! Please do not switch tabs during the interview.");
        toast.error("⚠️ Tab switch detected! Stay on this page.", { duration: 4000, id: "tab-warn" });
      } else {
        setTabWarning(false);
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [phase]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"user", width:320, height:240 }, audio: false });
      cameraStream.current = stream;
      if (cameraRef.current) cameraRef.current.srcObject = stream;
      setCameraError(false);
    } catch { setCameraError(true); }
  };
  const stopCamera = () => {
    cameraStream.current?.getTracks().forEach(t => t.stop());
    cameraStream.current = null;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // ── TTS with female/male voice ──
  const speak = useCallback((text, onEnd) => {
    if (!voiceRef.current || !window.speechSynthesis) { onEnd?.(); return; }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = 0.86;
    utt.volume = 1;
    const voices = synthRef.current.getVoices();

    // Female voice: try to find a real female voice
    if (avatarType === "female") {
      utt.pitch = 1.2;
      const femaleVoice =
        voices.find(v => v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.name.toLowerCase().includes("woman")) ||
        voices.find(v => /\b(zira|samantha|victoria|karen|moira|fiona|veena|allison|ava|susan|lisa|kate|hazel|tessa|nora|sara|heera|raveena)\b/i.test(v.name)) ||
        voices.find(v => v.lang === "en-IN" && v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.lang.startsWith("en-IN")) ||
        voices.find(v => v.lang.startsWith("en-GB")) ||
        voices.find(v => v.lang.startsWith("en"));
      if (femaleVoice) utt.voice = femaleVoice;
    } else {
      utt.pitch = 0.8;
      const maleVoice =
        voices.find(v => v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female")) ||
        voices.find(v => /\b(daniel|david|james|mark|alex|fred|jorge|diego|arthur|eddy|thomas|oliver)\b/i.test(v.name)) ||
        voices.find(v => v.lang.startsWith("en-IN")) ||
        voices.find(v => v.lang.startsWith("en"));
      if (maleVoice) utt.voice = maleVoice;
    }

    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => { setIsSpeaking(false); onEnd?.(); };
    utt.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    synthRef.current.speak(utt);
  }, [avatarType]);

  // ── Speech recognition ──
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome browser for speech recognition."); return; }
    try { recognitionRef.current?.stop(); } catch {}

    clearTimeout(autoAdvanceRef.current);
    setPauseSec(0);
    clearInterval(pauseRef.current);

    const recog = new SR();
    recog.continuous = true; recog.interimResults = true; recog.lang = "en-US";
    recog.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      if (final) {
        setTranscript(prev => prev + final);
        setSilenceSec(0);
        // Reset pause timer whenever new speech arrives
        clearTimeout(autoAdvanceRef.current);
        clearInterval(pauseRef.current);
        setPauseSec(0);
        // Start a new pause countdown
        startPauseCountdown();
      }
    };
    recog.onerror = () => setIsListening(false);
    recog.onend   = () => setIsListening(false);
    recognitionRef.current = recog;
    recog.start();
    setIsListening(true);
  }, []);

  const startPauseCountdown = useCallback(() => {
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);
    setPauseSec(0);
    let sec = 0;
    pauseRef.current = setInterval(() => {
      sec++;
      setPauseSec(sec);
      if (sec >= ANSWER_PAUSE_SEC) {
        clearInterval(pauseRef.current);
        // Auto-submit after pause
        autoAdvanceRef.current = setTimeout(() => {
          const t = transcriptRef.current;
          if (t.trim().length > 5) {
            handleSubmitAnswer();
          }
        }, 300);
      }
    }, 1000);
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);
    setPauseSec(0);
  }, []);

  // ── Silence timeout (no speech for 30s) ──
  const handleSilenceTimeout = () => {
    const t = transcriptRef.current;
    if (t.trim().length < 10) {
      speak("I notice you might need a moment. Shall I move to the next question?", () => {
        setTimeout(() => { if (!transcriptRef.current.trim()) autoSkip(); else startListening(); }, 3500);
      });
    } else {
      handleSubmitAnswer();
    }
  };

  const autoSkip = () => {
    stopListening();
    const result = buildSkippedResult(currentQ);
    setFeedback(result);
    setShowFeedback(true);
    setSessionResults(prev => [...prev, result]);
    // Auto move after 2s
    setTimeout(() => advanceQuestion(result), 2000);
  };

  const buildSkippedResult = (q) => ({
    question: q?.question || "", answer: "(Skipped)", score: 0, aiScore: 0,
    verdict: "Skipped", strength: "—", gap: "No answer given", tip: "Attempt every question",
    matched: [], missed: [], total: [], speech: { confidence:0, fluency:0, clarity:0 },
    storedAnswer: q?.answer || "", isSelfIntro: q?.isSelfIntro||false, isResume: q?.isResume||false, skipped: true,
  });

  // ── Resume upload ──
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    try {
      const text = await file.text();
      setResumeText(text.slice(0, 3000));
      toast.success("Resume uploaded! Resume & project questions will be asked.");
    } catch {
      setResumeText(`Resume: ${file.name}`);
      toast.success("Resume noted!");
    }
  };

  // ── Fetch questions from DB ──
  const fetchQuestionsForSkills = async (skills) => {
    const result = {};
    for (const skill of skills) {
      const isHR = skill === "HR";
      const { data, error } = await supabase
        .from("interview_questions")
        .select("id, question, answer, skill, type")
        .eq(isHR ? "type" : "skill", isHR ? "hr" : skill);
      result[skill] = (!error && data?.length) ? shuffle(data).slice(0, 8) : [];
    }
    return result;
  };

  // ── Save completed interview to Supabase ──
  const saveInterviewToSupabase = async (finalResultsMap, timeTaken) => {
    if (!userId) return;
    try {
      const allAnswers  = Object.values(finalResultsMap).flat();
      const totalQs     = allAnswers.length;
      const avgPct      = totalQs > 0
        ? Math.round(allAnswers.reduce((a, r) => a + (r.score || 0), 0) / (totalQs * 10) * 100)
        : 0;
      const verdict     = avgPct >= 80 ? "Outstanding" : avgPct >= 60 ? "Good" : avgPct >= 40 ? "Fair" : "Needs Work";

      // 1 — Insert the session row
      const { data: session, error: sessionError } = await supabase
        .from("mock_interviews")
        .insert({
          user_id:         userId,
          candidate_name:  candidateName.trim(),
          interviewer:     avatarType,
          skills:          selectedSkills,
          total_questions: totalQs,
          avg_score:       avgPct,
          overall_verdict: verdict,
          duration_sec:    timeTaken || 0,
          had_resume:      resumeText.length > 0,
        })
        .select("id")
        .single();

      if (sessionError) {
        console.error("Interview session save error:", sessionError.message);
        return;
      }

      const interviewId = session.id;

      // 2 — Insert all answer rows
      const answerRows = [];
      Object.entries(finalResultsMap).forEach(([skill, results]) => {
        results.forEach((r, idx) => {
          answerRows.push({
            interview_id:     interviewId,
            user_id:          userId,
            skill:            skill,
            question_index:   idx,
            question:         r.question || "",
            answer:           r.answer || "",
            reference_answer: r.storedAnswer || "",
            score:            r.score || 0,
            ai_score:         r.aiScore || 0,
            verdict:          r.verdict || "",
            strength:         r.strength || "",
            gap:              r.gap || "",
            tip:              r.tip || "",
            matched_keywords: r.matched || [],
            missed_keywords:  r.missed || [],
            confidence:       r.speech?.confidence || 0,
            fluency:          r.speech?.fluency || 0,
            clarity:          r.speech?.clarity || 0,
            is_skipped:       r.skipped || false,
            is_self_intro:    r.isSelfIntro || false,
            is_resume_q:      r.isResume || false,
          });
        });
      });

      if (answerRows.length > 0) {
        const { error: answersError } = await supabase
          .from("mock_interview_answers")
          .insert(answerRows);
        if (answersError) console.error("Answers save error:", answersError.message);
      }

      toast.success("Interview saved to your history! 📊", { duration: 3000 });
    } catch (err) {
      console.error("saveInterviewToSupabase error:", err);
    }
  };

  // ── Start interview ──
  const startInterview = async () => {
    if (!candidateName.trim()) { toast.error("Please enter your name"); return; }
    if (!selectedSkills.length) { toast.error("Select at least one skill"); return; }
    if (!userId) { toast.error("Please log in to start an interview"); return; }

    if (interviewsLeft <= 0) {
      toast.error("You have used all 3 interviews this month. Resets next month!");
      return;
    }

    setIsLoading(true);
    // Record interview usage
    const usage = await recordInterviewUsage(userId);
    if (!usage.success) {
      setIsLoading(false);
      if (usage.reason === "limit_reached") toast.error("Monthly interview limit reached! 3 per month.");
      else toast.error("Could not start interview. Try again.");
      return;
    }
    setInterviewsLeft(usage.interviewsLeft);
    toast.success(`Interview started! ${usage.interviewsLeft} interview${usage.interviewsLeft!==1?"s":""} left this month.`);

    const fetched = await fetchQuestionsForSkills(selectedSkills);
    const hasQ = Object.values(fetched).some(qs => qs.length > 0);
    if (!hasQ) { toast.error("No questions found in database."); setIsLoading(false); return; }

    // Build resume questions and inject into EVERY skill's queue
    let resumeQs = [];
    if (resumeText) {
      resumeQs = await buildResumeQuestionsFromClaude(resumeText);
    }

    // Inject resume questions into first skill
    if (resumeQs.length > 0) {
      const firstSkill = selectedSkills[0];
      if (fetched[firstSkill]) {
        fetched[firstSkill] = [...resumeQs, ...fetched[firstSkill]].slice(0, 10);
      }
    }

    setSkillQuestions(fetched);
    setAllSkillResults({});
    setCurrentSkillIdx(0);
    setIsLoading(false);

    // Auto fullscreen
    try { document.documentElement.requestFullscreen?.(); } catch {}

    beginSkillSession(0, fetched, selectedSkills, resumeQs);
  };

  const getTimeGreeting = () => { const h = new Date().getHours(); return h<12?"morning":h<17?"afternoon":"evening"; };

  const beginSkillSession = (skillIdx, questionsMap, skills, resumeQs = []) => {
    const skill = skills[skillIdx];
    const qs    = questionsMap[skill] || [];
    if (!qs.length) {
      if (skillIdx + 1 < skills.length) beginSkillSession(skillIdx + 1, questionsMap, skills, resumeQs);
      else setPhase("report");
      return;
    }
    const selfIntroQ = {
      question: "Please tell me about yourself — your background, key skills, any projects you have worked on, and what motivates you.",
      answer: "", isSelfIntro: true
    };
    const fullQueue = [selfIntroQ, ...qs];
    setSessionQuestions(fullQueue);
    setQIndex(0);
    setCurrentQ(fullQueue[0]);
    setSessionResults([]);
    setTranscript("");
    setFeedback(null);
    setShowFeedback(false);
    setTimeLeft(TOTAL_TIME_SEC);
    setSilenceSec(0);
    setHadSpeech(false);
    setPauseSec(0);
    setPhase("interview");
    // Record start time only for the first skill
    if (skillIdx === 0) interviewStartTimeRef.current = Date.now();

    const name = candidateName.trim();
    const resumeNote = resumeQs.length > 0 ? " I have also reviewed your resume and will ask a few questions about it." : "";
    const greeting = `Good ${getTimeGreeting()}! I am ${avatarMeta.title}, ${avatarMeta.dept}. ${name}, it is wonderful to meet you.${resumeNote} We will cover ${skill} in 15 minutes. Let us begin. ${selfIntroQ.question}`;
    speak(greeting, () => setTimeout(() => startListening(), 700));
  };

  // ── Submit answer ──
  const handleSubmitAnswer = async () => {
    if (isEvaluating) return;
    stopListening();
    clearInterval(silenceRef.current);
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);
    const answer = transcriptRef.current.trim();
    if (!answer) {
      autoSkip();
      return;
    }
    await evaluateAndShow(answer);
  };

  const evaluateAndShow = async (answer) => {
    setIsEvaluating(true);
    const kw     = keywordScore(answer, currentQ?.answer);
    const speech = analyseSpeech(answer);
    // Light AI analysis
    const ai = await callClaudeAnalysis(currentQ?.question, answer, currentQ?.answer || "Open-ended.");
    const finalScore = ai ? Math.round(kw.score * 0.4 + (ai.aiScore||0) * 0.6) : kw.score;
    const result = {
      question:    currentQ?.question || "",
      answer,
      score:       finalScore,
      aiScore:     ai?.aiScore || kw.score,
      verdict:     ai?.verdict || (finalScore>=8?"Excellent":finalScore>=6?"Good":finalScore>=4?"Fair":"Weak"),
      strength:    ai?.strength || "Answer provided",
      gap:         ai?.gap || "Could be more detailed",
      tip:         ai?.tip || "Practice structured answers",
      matched:     kw.matched,
      missed:      kw.missed,
      total:       kw.total,
      speech,
      storedAnswer: currentQ?.answer || "",
      isSelfIntro:  currentQ?.isSelfIntro||false,
      isResume:     currentQ?.isResume||false,
      skipped: false,
    };
    setFeedback(result);
    setShowFeedback(true);
    const updatedResults = [...sessionResults, result];
    setSessionResults(updatedResults);
    setIsEvaluating(false);

    // Speak short feedback + auto advance
    const fb = result.score >= 7 ? "Good answer!" : result.score >= 4 ? "Okay, let me move on." : "Let us move to the next question.";
    speak(fb, () => {
      setTimeout(() => advanceQuestion(result, updatedResults), 1200);
    });
  };

  // ── Advance to next question automatically ──
  const advanceQuestion = useCallback((latestResult = null, latestResults = null) => {
    const allResults = latestResults || sessionResults;
    const next = qIndex + 1;

    setShowFeedback(false);
    setFeedback(null);
    setTranscript("");
    setSilenceSec(0);
    setHadSpeech(false);
    setPauseSec(0);

    if (next >= sessionQuestions.length) {
      // Save results and finish skill
      setAllSkillResults(prev => ({ ...prev, [currentSkill]: allResults }));
      const nextIdx = currentSkillIdx + 1;
      if (nextIdx < selectedSkills.length) {
        const nextSkill = selectedSkills[nextIdx];
        speak(`${currentSkill} section done! Moving to ${nextSkill}.`, () => {
          setCurrentSkillIdx(nextIdx);
          beginSkillSession(nextIdx, skillQuestions, selectedSkills);
        });
      } else {
        const finalMap = { ...allSkillResults, [currentSkill]: allResults };
        const timeTaken = interviewStartTimeRef.current
          ? Math.round((Date.now() - interviewStartTimeRef.current) / 1000)
          : 0;
        saveInterviewToSupabase(finalMap, timeTaken);
        speak(`Great effort, ${candidateName}! That wraps up your interview. Preparing your report now.`);
        setTimeout(() => setPhase("report"), 2000);
      }
      return;
    }

    setQIndex(next);
    setCurrentQ(sessionQuestions[next]);
    speak(`Question ${next + 1}: ${sessionQuestions[next].question}`, () => {
      setTimeout(() => startListening(), 700);
    });
  }, [qIndex, sessionQuestions, sessionResults, currentSkill, currentSkillIdx, selectedSkills, skillQuestions, candidateName]);

  const handleSkip = () => {
    if (isEvaluating) return;
    stopListening();
    clearInterval(silenceRef.current);
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);
    const result = buildSkippedResult(currentQ);
    const updatedResults = [...sessionResults, result];
    setSessionResults(updatedResults);
    speak("Alright, moving on.", () => {
      setTimeout(() => advanceQuestion(result, updatedResults), 500);
    });
  };

  const handleSkillFinish = useCallback(() => {
    stopListening();
    synthRef.current?.cancel();
    clearInterval(timerRef.current);
    clearInterval(silenceRef.current);
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);

    const finalSessionResults = sessionResults;
    setAllSkillResults(prev => ({ ...prev, [currentSkill]: finalSessionResults }));

    const next = currentSkillIdx + 1;
    if (next < selectedSkills.length) {
      const nextSkill = selectedSkills[next];
      speak(`Time is up for ${currentSkill}. Moving to ${nextSkill}.`, () => {
        setCurrentSkillIdx(next);
        beginSkillSession(next, skillQuestions, selectedSkills);
      });
    } else {
      const finalMap = { ...allSkillResults, [currentSkill]: finalSessionResults };
      const timeTaken = interviewStartTimeRef.current
        ? Math.round((Date.now() - interviewStartTimeRef.current) / 1000)
        : 0;
      saveInterviewToSupabase(finalMap, timeTaken);
      speak(`Interview complete. Great effort, ${candidateName}!`);
      setTimeout(() => setPhase("report"), 2000);
    }
  }, [currentSkill, sessionResults, currentSkillIdx, selectedSkills, skillQuestions, candidateName]);

  useEffect(() => () => {
    synthRef.current?.cancel();
    try { recognitionRef.current?.stop(); } catch {}
    clearInterval(timerRef.current);
    clearInterval(silenceRef.current);
    clearInterval(pauseRef.current);
    clearTimeout(autoAdvanceRef.current);
    stopCamera();
    try { document.exitFullscreen?.(); } catch {}
  }, []);

  const toggleSkill = k => setSelectedSkills(prev => prev.includes(k) ? prev.filter(s => s !== k) : [...prev, k]);
  const resetAll = () => {
    try { document.exitFullscreen?.(); } catch {}
    setPhase("setup"); setAllSkillResults({}); setSessionResults([]);
    setQIndex(0); setCurrentQ(null); setTranscript(""); setFeedback(null);
    setShowFeedback(false); setSelectedSkills([]); setCurrentSkillIdx(0);
    setCandidateName(""); setResumeFile(null); setResumeText("");
    setHadSpeech(false); setPauseSec(0); setTabWarning(false);
  };

  // ════════════════════════════════════════════════════════════
  //  SETUP
  // ════════════════════════════════════════════════════════════
  if (phase === "setup") return (
    <div style={{ minHeight:"100vh", background:"#f7f8fc", fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"28px 16px" }}>
      <Toaster position="top-center"/>
      <style>{CSS}</style>
      <div style={{ maxWidth:700, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:30 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e2e8f0", borderRadius:24, padding:"6px 18px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", animation:"blink 1.2s ease-in-out infinite" }}/>
            <span style={{ fontSize:"0.68rem", fontWeight:800, color:"#334155", letterSpacing:"2px" }}>AI MOCK INTERVIEW</span>
          </div>
          <h1 style={{ fontWeight:900, fontSize:"clamp(1.7rem,4vw,2.3rem)", color:"#0f172a", margin:"0 0 8px", letterSpacing:"-0.5px" }}>Practice Like It's Real</h1>
          <p style={{ color:"#64748b", fontSize:"0.88rem", margin:0 }}>Voice-based professional mock interview · AI-powered analysis</p>
        </div>

        {/* Feature pills */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center", marginBottom:22 }}>
          {[["🎙️","Voice-only"],["📹","Face camera"],["🤖","AI analysis"],["⏱️","15 min/skill"],["📄","Resume Qs"],["🔇","30s silence alert"]].map(([ic,lb],i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1px solid #e2e8f0", borderRadius:20, padding:"6px 14px", boxShadow:"0 1px 5px rgba(0,0,0,0.06)", fontSize:"0.72rem", fontWeight:700, color:"#475569" }}>
              <span style={{ fontSize:"1rem" }}>{ic}</span>{lb}
            </div>
          ))}
        </div>

        {/* Interview limit info */}
        {!loadingAccess && (
          <div style={{ background:"#fff", borderRadius:14, padding:"12px 16px", border:"1px solid #e8ecf4", marginBottom:14, display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ textAlign:"center", minWidth:48 }}>
              <div style={{ fontWeight:900, fontSize:"1.4rem", color:interviewsLeft>0?"#22c55e":"#ef4444" }}>{interviewsLeft}</div>
              <div style={{ fontSize:"0.58rem", color:"#94a3b8", fontWeight:700 }}>INTERVIEWS LEFT</div>
            </div>
            <div style={{ width:1, height:28, background:"#e2e8f0" }}/>
            <div style={{ fontSize:"0.7rem", color:"#64748b", lineHeight:1.6 }}>
              {interviewsLeft <= 0
                ? <span style={{ color:"#ef4444", fontWeight:700 }}>Monthly limit reached. Resets next month.</span>
                : <span>You have <strong style={{ color:"#22c55e" }}>{interviewsLeft}</strong> free interview{interviewsLeft!==1?"s":""} left this month. <span style={{ color:"#94a3b8" }}>(3 max / month)</span></span>}
            </div>
          </div>
        )}

        {/* Name */}
        <div className="s-card">
          <div className="s-label">Your Name</div>
          <input className="name-inp" placeholder="Enter your full name" value={candidateName} onChange={e=>setCandidateName(e.target.value)}/>
        </div>

        {/* Interviewer */}
        <div className="s-card">
          <div className="s-label">Choose Interviewer</div>
          <div style={{ display:"flex", gap:12 }}>
            {AVATAR_TYPES.map(a=>(
              <button key={a.key} className={`av-pick ${avatarType===a.key?"av-on":""}`} onClick={()=>setAvatarType(a.key)}>
                <div style={{ width:72, height:90, margin:"0 auto 8px" }}>
                  {a.key==="female"?<FemaleAvatar isSpeaking={false} isListening={false}/>:<MaleAvatar isSpeaking={false} isListening={false}/>}
                </div>
                <div style={{ fontWeight:800, fontSize:"0.83rem", color:avatarType===a.key?"#4f46e5":"#334155" }}>{a.title}</div>
                <div style={{ fontSize:"0.63rem", color:"#94a3b8", marginTop:2 }}>{a.dept}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="s-card">
          <div className="s-label" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span>Select Skills (Multiple)</span>
            {selectedSkills.length>0&&<span className="pill-badge">{selectedSkills.length} selected · {selectedSkills.length*15} min total</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))", gap:8 }}>
            {SKILLS.map(s=>{
              const on=selectedSkills.includes(s.key);
              return (
                <button key={s.key} onClick={()=>toggleSkill(s.key)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"12px 6px", borderRadius:12, border:`2px solid ${on?s.color:"#e2e8f0"}`, background:on?`${s.color}18`:"#fff", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                  {on&&<div style={{ position:"absolute", top:5, right:5, width:14, height:14, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center" }}><CheckCircle size={9} color="#fff"/></div>}
                  <span style={{ fontSize:"1.25rem" }}>{s.icon}</span>
                  <span style={{ fontSize:"0.7rem", fontWeight:700, color:on?s.color:"#64748b" }}>{s.key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resume */}
        <div className="s-card">
          <div className="s-label">Upload Resume (Optional)</div>
          <label className="resume-drop">
            <input type="file" accept=".txt,.pdf,.doc,.docx" style={{ display:"none" }} onChange={handleResumeUpload}/>
            {resumeFile?(
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <FileText size={20} color="#4f46e5"/>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#0f172a" }}>{resumeFile.name}</div>
                  <div style={{ fontSize:"0.68rem", color:"#22c55e" }}>✅ Resume & project questions will be asked</div>
                </div>
              </div>
            ):(
              <div style={{ textAlign:"center" }}>
                <Upload size={22} color="#94a3b8" style={{ marginBottom:6 }}/>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:"#64748b" }}>Click to upload your resume</div>
                <div style={{ fontSize:"0.63rem", color:"#94a3b8" }}>TXT, PDF, DOC — interviewer asks questions from your projects & skills</div>
              </div>
            )}
          </label>
        </div>

        {/* Difficulty */}
        <div className="s-card">
          <div className="s-label">Difficulty</div>
          <div style={{ display:"flex", gap:10 }}>
            {[{k:"easy",l:"🌱 Fresher",d:"Entry level — ready now",a:true},{k:"medium",l:"🔧 Mid-Level",d:"Coming soon",a:false},{k:"hard",l:"🚀 Senior",d:"Coming soon",a:false}].map(d=>(
              <div key={d.k} style={{ flex:1, padding:"13px 12px", borderRadius:13, border:d.a?"2px solid #22c55e":"2px solid #e2e8f0", background:d.a?"#f0fdf4":"#fafafa", position:"relative", cursor:d.a?"pointer":"not-allowed", opacity:d.a?1:0.55 }}>
                <div style={{ fontWeight:800, fontSize:"0.85rem", color:d.a?"#16a34a":"#94a3b8" }}>{d.l}</div>
                <div style={{ fontSize:"0.63rem", color:d.a?"#86efac":"#cbd5e1", marginTop:3 }}>{d.d}</div>
                {!d.a&&<div style={{ position:"absolute", top:6, right:6, background:"#f1f5f9", color:"#94a3b8", fontSize:"0.5rem", fontWeight:800, padding:"2px 6px", borderRadius:8 }}>🚧 DEV</div>}
              </div>
            ))}
          </div>
        </div>

        <button className="start-btn" disabled={!candidateName.trim()||!selectedSkills.length||isLoading||loadingAccess||interviewsLeft<=0} onClick={startInterview}>
          {isLoading?<><div className="bspinner"/> Loading...</>
            :interviewsLeft<=0?<>No interviews left this month</>
            :<><Play size={17}/> Start Interview · {selectedSkills.length||0} Skill{selectedSkills.length!==1?"s":""}</>}
        </button>
        {(!candidateName.trim()||!selectedSkills.length)&&<p style={{ textAlign:"center", fontSize:"0.7rem", color:"#94a3b8", marginTop:8 }}>Enter your name and select at least one skill</p>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  //  INTERVIEW
  // ════════════════════════════════════════════════════════════
  if (phase === "interview") {
    const skillMeta = SKILLS.find(s => s.key === currentSkill) || SKILLS[0];
    const totalQs   = sessionQuestions.length;

    return (
      <div style={{ height:"100vh", background:"#f0f2f7", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <Toaster position="top-center"/>
        <style>{CSS}</style>

        {/* Tab switch warning banner */}
        {tabWarning && (
          <div style={{ background:"#ef4444", color:"#fff", textAlign:"center", padding:"8px", fontSize:"0.8rem", fontWeight:800, animation:"fadeUp .3s ease" }}>
            ⚠️ Tab switch detected! Please stay on this page during the interview.
          </div>
        )}

        {/* Top bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"9px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", animation:"blink 1.2s infinite" }}/>
            <span style={{ fontSize:"0.67rem", fontWeight:800, color:"#334155", letterSpacing:"1.5px" }}>LIVE INTERVIEW</span>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:skillMeta.bg, border:`1px solid ${skillMeta.border}`, borderRadius:20, padding:"3px 10px" }}>
              <span style={{ fontSize:"0.8rem" }}>{skillMeta.icon}</span>
              <span style={{ fontSize:"0.67rem", fontWeight:800, color:skillMeta.color }}>{currentSkill}</span>
            </div>
            {selectedSkills.length>1&&<span style={{ fontSize:"0.62rem", color:"#94a3b8", fontWeight:700 }}>{currentSkillIdx+1}/{selectedSkills.length} skills</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button className="ctrl-btn" onClick={()=>{setVoiceEnabled(v=>!v);synthRef.current?.cancel();}} title="Toggle voice">
              {voiceEnabled?<Volume2 size={13}/>:<VolumeX size={13}/>}
            </button>
            <button className="ctrl-btn" onClick={()=>setCameraOn(v=>!v)} title="Toggle camera">
              {cameraOn?<Camera size={13}/>:<CameraOff size={13}/>}
            </button>
            <button className="ctrl-btn" onClick={toggleFullscreen} title="Toggle fullscreen">
              {isFullscreen?<Minimize size={13}/>:<Maximize size={13}/>}
            </button>
            <TimerRing timeLeft={timeLeft} total={TOTAL_TIME_SEC}/>
            <button className="end-btn" onClick={handleSkillFinish}><X size={12}/> END</button>
          </div>
        </div>

        {/* 2-col layout */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"260px 1fr", overflow:"hidden" }}>

          {/* Left panel */}
          <div style={{ background:"#fff", borderRight:"1px solid #e8ecf4", display:"flex", flexDirection:"column", padding:"16px 14px", gap:14, overflowY:"auto" }}>

            {/* Interviewer avatar */}
            <div>
              <div style={{ fontSize:"0.58rem", fontWeight:800, color:"#94a3b8", letterSpacing:"1px", marginBottom:7 }}>INTERVIEWER</div>
              <div style={{ width:"100%", aspectRatio:"3/4", borderRadius:18, border:`2.5px solid ${isSpeaking?"#4f46e5":isListening?"#22c55e":"#e2e8f0"}`, background:"#f8f9fc", overflow:"hidden", position:"relative", boxShadow:isSpeaking?"0 0 18px rgba(79,70,229,.22)":isListening?"0 0 18px rgba(34,197,94,.18)":"0 4px 14px rgba(0,0,0,.07)", transition:"border-color .3s,box-shadow .3s" }}>
                {avatarType==="female"?<FemaleAvatar isSpeaking={isSpeaking} isListening={isListening}/>:<MaleAvatar isSpeaking={isSpeaking} isListening={isListening}/>}
                <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", background:"rgba(255,255,255,0.92)", borderRadius:20, padding:"4px 10px", display:"flex", alignItems:"center", gap:6, backdropFilter:"blur(8px)", whiteSpace:"nowrap" }}>
                  {isSpeaking?<><SoundWave active color="#4f46e5" bars={5}/><span style={{ fontSize:"0.58rem", fontWeight:800, color:"#4f46e5" }}>Speaking</span></>
                    :isListening?<><SoundWave active color="#22c55e" bars={5}/><span style={{ fontSize:"0.58rem", fontWeight:800, color:"#22c55e" }}>Listening</span></>
                    :<span style={{ fontSize:"0.58rem", fontWeight:700, color:"#94a3b8" }}>⏳ Waiting</span>}
                </div>
              </div>
              <div style={{ textAlign:"center", marginTop:7 }}>
                <div style={{ fontWeight:800, fontSize:"0.78rem", color:"#0f172a" }}>{avatarMeta.title}</div>
                <div style={{ fontSize:"0.6rem", color:"#64748b" }}>{avatarMeta.dept}</div>
              </div>
            </div>

            {/* Candidate camera */}
            <div>
              <div style={{ fontSize:"0.58rem", fontWeight:800, color:"#94a3b8", letterSpacing:"1px", marginBottom:7 }}>YOU — {candidateName}</div>
              <div style={{ width:"100%", aspectRatio:"4/3", borderRadius:13, overflow:"hidden", background:"#0f172a", border:`2px solid ${isListening?"#22c55e":"#e2e8f0"}`, position:"relative", transition:"border-color .3s" }}>
                {cameraOn&&!cameraError?(
                  <video ref={cameraRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}/>
                ):(
                  <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <User size={26} color="#475569"/>
                    <span style={{ fontSize:"0.62rem", color:"#64748b" }}>{cameraError?"Camera unavailable":"Camera off"}</span>
                  </div>
                )}
                {isListening&&<div style={{ position:"absolute", top:8, right:8, width:10, height:10, borderRadius:"50%", background:"#ef4444", animation:"blink 1s infinite" }}/>}
              </div>
            </div>

            {/* Progress dots */}
            <div>
              <div style={{ fontSize:"0.58rem", fontWeight:800, color:"#94a3b8", letterSpacing:"1px", marginBottom:7 }}>PROGRESS · {qIndex+1}/{totalQs}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {Array.from({length:totalQs}).map((_,i)=>(
                  <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:i<sessionResults.length?"#22c55e":i===qIndex?"#4f46e5":"#e2e8f0", transform:i===qIndex?"scale(1.5)":"scale(1)", transition:"all .3s", boxShadow:i===qIndex?"0 0 0 3px rgba(79,70,229,.2)":"none" }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Q&A */}
          <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:13, overflowY:"auto" }}>

            {/* Question card */}
            <div style={{ background:"#fff", borderRadius:18, padding:"18px 20px", border:"1.5px solid #e8ecf4", boxShadow:"0 2px 12px rgba(0,0,0,.05)", animation:"fadeUp .3s ease", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ background:skillMeta.bg, border:`1px solid ${skillMeta.border}`, borderRadius:8, padding:"3px 10px" }}>
                  <span style={{ fontSize:"0.58rem", fontWeight:800, color:skillMeta.color }}>
                    {currentQ?.isSelfIntro?"✨ INTRODUCTION":currentQ?.isResume?"📄 RESUME QUESTION":`Q${qIndex+1} · ${currentSkill}`}
                  </span>
                </div>
                {isEvaluating&&<div className="bspinner-dark"/>}
              </div>
              <p style={{ fontSize:"clamp(.9rem,2.2vw,1.06rem)", fontWeight:700, color:"#0f172a", lineHeight:1.7, margin:0 }}>
                {currentQ?.question||"Loading..."}
              </p>
            </div>

            {/* Answer display — no feedback shown during interview */}
            {!showFeedback ? (
              <>
                <div style={{ background:"#fff", borderRadius:15, padding:"14px 16px", border:`2px solid ${isListening?"#22c55e":"#e8ecf4"}`, minHeight:88, transition:"border-color .3s" }}>
                  <div style={{ fontSize:"0.58rem", fontWeight:800, color:"#94a3b8", letterSpacing:"1px", marginBottom:6, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span>YOUR ANSWER (VOICE)</span>
                    {isListening&&<SoundWave active color="#22c55e"/>}
                  </div>
                  {transcript?(
                    <p style={{ fontSize:"0.87rem", color:"#334155", lineHeight:1.65, margin:0 }}>{transcript}</p>
                  ):(
                    <p style={{ fontSize:"0.8rem", color:"#b0b8c8", margin:0, fontStyle:"italic" }}>
                      {isListening?"🎙️ Listening… speak your answer":"Mic auto-starts after the question."}
                    </p>
                  )}
                  {isListening && !hadSpeech && <SilenceBar seconds={silenceSec} total={SILENCE_TIMEOUT_SEC}/>}
                  {/* Pause countdown — shows after speech, before auto-submit */}
                  {isListening && hadSpeech && pauseSec > 0 && (
                    <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:3, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(pauseSec/ANSWER_PAUSE_SEC)*100}%`, background:"#4f46e5", borderRadius:10, transition:"width 1s linear" }}/>
                      </div>
                      <span style={{ fontSize:"0.58rem", color:"#4f46e5", fontWeight:700, whiteSpace:"nowrap" }}>Auto-submit in {ANSWER_PAUSE_SEC-pauseSec}s</span>
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button className={`mic-btn ${isListening?"mic-on":""}`} onClick={isListening?stopListening:startListening} disabled={isSpeaking||isEvaluating}>
                    {isListening?<><MicOff size={15}/> Stop</>:<><Mic size={15}/> {transcript?"Resume Mic":"Tap to Speak"}</>}
                  </button>
                  {transcript.trim()&&(
                    <button className="submit-btn" onClick={handleSubmitAnswer} disabled={isEvaluating||isSpeaking}>
                      {isEvaluating?<><div className="bspinner"/> Evaluating...</>:<><CheckCircle size={14}/> Submit</>}
                    </button>
                  )}
                  <button className="skip-btn" onClick={handleSkip} disabled={isSpeaking||isEvaluating}>Skip →</button>
                </div>

                {isSpeaking&&(
                  <div style={{ fontSize:"0.68rem", color:"#4f46e5", display:"flex", alignItems:"center", gap:6 }}>
                    <SoundWave active color="#4f46e5" bars={5}/> Interviewer speaking — mic will start after
                  </div>
                )}
              </>
            ) : (
              // Brief feedback shown during interview — NO suggested answer revealed
              <div style={{ background:"#fff", borderRadius:15, padding:"16px", border:"1.5px solid #e8ecf4", animation:"fadeUp .3s ease" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:54, height:54, borderRadius:"50%", border:`3px solid ${feedback.score>=7?"#22c55e":feedback.score>=4?"#f59e0b":"#ef4444"}`, background:feedback.score>=7?"#f0fdf4":feedback.score>=4?"#fffbeb":"#fff1f2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontWeight:900, fontSize:"1.1rem", color:feedback.score>=7?"#16a34a":feedback.score>=4?"#d97706":"#dc2626", lineHeight:1 }}>{feedback.score}</span>
                    <span style={{ fontSize:"0.44rem", color:"#94a3b8" }}>/10</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:"0.88rem", color:"#0f172a", marginBottom:4 }}>
                      {feedback.verdict} {feedback.score>=8?"🎉":feedback.score>=6?"💪":feedback.score>=4?"📖":"📚"}
                    </div>
                    <div style={{ fontSize:"0.73rem", color:"#64748b" }}>{feedback.strength}</div>
                    <div style={{ fontSize:"0.7rem", color:"#94a3b8", marginTop:4 }}>Moving to next question…</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`@media(max-width:680px){div[style*="grid-template-columns: 260px"]{display:flex!important;flex-direction:column!important;height:auto!important;overflow:visible!important;}}`}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  REPORT — Full analysis revealed here
  // ════════════════════════════════════════════════════════════
  if (phase === "report") {
    const finalResults = { ...allSkillResults };
    if (currentSkill && sessionResults.length > 0 && !finalResults[currentSkill]) finalResults[currentSkill] = sessionResults;
    const allR   = Object.values(finalResults).flat();
    const avgPct = allR.length ? Math.round(allR.reduce((a,r)=>a+(r.score||0),0)/(allR.length*10)*100) : 0;
    const tier   = avgPct>=80?{l:"Outstanding",e:"🏆",c:"#22c55e",bg:"#f0fdf4"}:avgPct>=60?{l:"Good",e:"🎯",c:"#f59e0b",bg:"#fffbeb"}:avgPct>=40?{l:"Fair",e:"📚",c:"#f97316",bg:"#fff7ed"}:{l:"Needs Work",e:"💪",c:"#ef4444",bg:"#fff1f2"};

    return (
      <div style={{ minHeight:"100vh", background:"#f7f8fc", padding:"24px 16px", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
        <Toaster position="top-center"/>
        <style>{CSS}</style>
        <div style={{ maxWidth:800, margin:"0 auto" }}>

          {/* Summary */}
          <div style={{ background:tier.bg, border:`1.5px solid ${tier.c}25`, borderRadius:22, padding:"26px 22px", textAlign:"center", marginBottom:22, boxShadow:"0 4px 16px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:"3rem", marginBottom:8 }}>{tier.e}</div>
            <h2 style={{ fontWeight:900, fontSize:"1.5rem", color:"#0f172a", margin:"0 0 5px" }}>Interview Complete, {candidateName}!</h2>
            <p style={{ color:"#64748b", fontSize:"0.84rem", margin:"0 0 16px" }}>{selectedSkills.map(s=>SKILLS.find(x=>x.key===s)?.icon+" "+s).join(" · ")} · {allR.length} questions</p>
            <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", background:"#fff", borderRadius:18, padding:"14px 40px", border:`2px solid ${tier.c}35`, marginBottom:18 }}>
              <div style={{ fontWeight:900, fontSize:"2.8rem", color:tier.c, lineHeight:1 }}>{avgPct}%</div>
              <div style={{ fontSize:"0.75rem", color:"#64748b", fontWeight:700 }}>{tier.l}</div>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", justifyContent:"center" }}>
              {allR.map((r,i)=>(
                <div key={i} style={{ background:"#fff", borderRadius:9, padding:"5px 10px", border:`1.5px solid ${r.score>=7?"#86efac":r.score>=4?"#fcd34d":"#fca5a5"}`, textAlign:"center" }}>
                  <div style={{ fontWeight:900, fontSize:"0.88rem", color:r.score>=7?"#16a34a":r.score>=4?"#d97706":"#dc2626" }}>{r.score}/10</div>
                  <div style={{ fontSize:"0.52rem", color:"#94a3b8", fontWeight:700 }}>Q{i+1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-skill breakdown — full analysis + suggested answers revealed here */}
          {Object.entries(finalResults).map(([skill, results]) => {
            const meta=SKILLS.find(s=>s.key===skill);
            const avg=results.length?Math.round(results.reduce((a,r)=>a+(r.score||0),0)/(results.length*10)*100):0;
            return (
              <div key={skill} style={{ marginBottom:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                  <span style={{ fontSize:"1.2rem" }}>{meta?.icon}</span>
                  <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#0f172a" }}>{skill}</span>
                  <span style={{ background:meta?.bg, color:meta?.color, border:`1px solid ${meta?.border}`, fontSize:"0.63rem", fontWeight:800, padding:"2px 9px", borderRadius:20 }}>{avg}%</span>
                </div>
                {results.map((r,i)=><ReportCard key={i} result={r} index={i}/>)}
              </div>
            );
          })}

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:20 }}>
            <button className="start-btn" style={{ flex:1 }} onClick={resetAll}>
              <RotateCcw size={15}/> Try Again
            </button>
            <button className="start-btn" style={{ flex:1, background:"#f1f5f9", color:"#475569", boxShadow:"none", border:"1.5px solid #e2e8f0" }}
              onClick={() => { try { document.exitFullscreen?.(); } catch {} window.location.href = "/"; }}>
              <Home size={15}/> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Report Card (full analysis + suggested answer revealed) ──
function ReportCard({ result, index }) {
  const [open, setOpen] = useState(false);
  const sc=result.score||0, color=sc>=7?"#16a34a":sc>=4?"#d97706":"#dc2626", bg=sc>=7?"#f0fdf4":sc>=4?"#fffbeb":"#fff1f2";
  return (
    <div style={{ background:"#fff", borderRadius:13, border:"1.5px solid #e8ecf4", borderLeft:`4px solid ${color}`, marginBottom:8, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 15px", cursor:"pointer", userSelect:"none" }} onClick={()=>setOpen(o=>!o)}>
        <div style={{ minWidth:42, height:42, borderRadius:9, background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:`1.5px solid ${color}22`, flexShrink:0 }}>
          <span style={{ fontWeight:900, fontSize:"0.88rem", color, lineHeight:1 }}>{sc}</span>
          <span style={{ fontSize:"0.46rem", color:"#94a3b8" }}>/10</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:"0.81rem", fontWeight:700, color:"#0f172a", lineHeight:1.4 }}>
            {result.isSelfIntro?"[Intro] ":result.isResume?"[Resume] ":""}Q{index+1}: {result.question}
          </div>
          <div style={{ fontSize:"0.6rem", color:"#94a3b8", marginTop:2 }}>
            {result.skipped?"Skipped":`${result.matched?.length||0}/${result.total?.length||0} keywords · Confidence: ${result.speech?.confidence||0}/10`}
          </div>
        </div>
        <div style={{ color:"#94a3b8", flexShrink:0 }}>{open?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</div>
      </div>
      {open&&(
        <div style={{ padding:"0 15px 15px", borderTop:"1px solid #f1f5f9" }}>
          {/* Speech metrics */}
          {!result.skipped&&result.speech&&(
            <div style={{ display:"flex", gap:7, marginTop:10, marginBottom:10, flexWrap:"wrap" }}>
              {[["Confidence",result.speech.confidence],["Fluency",result.speech.fluency],["Clarity",result.speech.clarity]].map(([l,v])=>(
                <div key={l} style={{ background:"#f8f9fc", border:"1px solid #e2e8f0", borderRadius:8, padding:"5px 11px", textAlign:"center" }}>
                  <div style={{ fontSize:"0.56rem", color:"#94a3b8", fontWeight:700 }}>{l.toUpperCase()}</div>
                  <div style={{ fontWeight:800, fontSize:"0.8rem", color:v>=7?"#16a34a":v>=4?"#f59e0b":"#ef4444" }}>{v}/10</div>
                </div>
              ))}
            </div>
          )}
          {/* Keywords */}
          {!result.skipped&&result.total?.length>0&&(
            <>
              <div style={{ fontSize:"0.6rem", fontWeight:800, color:"#94a3b8", marginBottom:5 }}>KEYWORDS</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                {(result.matched||[]).map(k=><span key={k} style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #86efac", fontSize:"0.58rem", fontWeight:700, padding:"2px 7px", borderRadius:20 }}>✓ {k}</span>)}
                {(result.missed||[]).slice(0,8).map(k=><span key={k} style={{ background:"#fff1f2", color:"#dc2626", border:"1px solid #fca5a5", fontSize:"0.58rem", fontWeight:700, padding:"2px 7px", borderRadius:20 }}>✗ {k}</span>)}
              </div>
            </>
          )}
          {/* Your answer */}
          {!result.skipped&&(
            <div style={{ background:"#f8fafc", borderRadius:9, padding:"9px 11px", border:"1px solid #e2e8f0", marginBottom:9 }}>
              <div style={{ fontSize:"0.56rem", fontWeight:800, color:"#94a3b8", marginBottom:3 }}>YOUR ANSWER</div>
              <div style={{ fontSize:"0.78rem", color:"#475569", lineHeight:1.6 }}>{result.answer}</div>
            </div>
          )}
          {/* AI feedback */}
          <div style={{ marginBottom:9 }}>
            <div style={{ fontSize:"0.73rem", color:"#16a34a", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:7, padding:"4px 9px", marginBottom:4 }}>✓ {result.strength}</div>
            <div style={{ fontSize:"0.73rem", color:"#dc2626", background:"#fff1f2", border:"1px solid #fecaca", borderRadius:7, padding:"4px 9px", marginBottom:4 }}>✗ {result.gap}</div>
            {result.tip&&<div style={{ fontSize:"0.71rem", color:"#92400e", background:"#fffbeb", borderLeft:"3px solid #f59e0b", borderRadius:"0 7px 7px 0", padding:"4px 9px" }}>💡 {result.tip}</div>}
          </div>
          {/* Suggested answer — ONLY shown in report, never during interview */}
          {result.storedAnswer&&(
            <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:11, padding:"11px 13px" }}>
              <div style={{ fontSize:"0.56rem", fontWeight:800, color:"#818cf8", marginBottom:5 }}>💡 REFERENCE ANSWER (from Resources)</div>
              <div style={{ fontSize:"0.79rem", color:"#e2e8f0", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{result.storedAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const CSS = `
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .s-card{background:#fff;border-radius:18px;padding:20px;border:1px solid #e8ecf4;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
  .s-label{font-size:0.67rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
  .pill-badge{background:#ede9ff;color:#4f46e5;font-size:0.62rem;font-weight:800;padding:3px 10px;border-radius:20px;border:1px solid #c4b5fd;}
  .name-inp{width:100%;padding:11px 14px;border-radius:11px;border:1.5px solid #e2e8f0;font-size:0.9rem;color:#0f172a;background:#f8fafc;outline:none;transition:border-color .2s;box-sizing:border-box;font-family:inherit;}
  .name-inp:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,.08);}
  .av-pick{flex:1;padding:14px 10px;border-radius:16px;border:2px solid #e2e8f0;background:#fff;cursor:pointer;transition:all .2s;text-align:center;}
  .av-pick:hover{border-color:#4f46e5;background:#f5f3ff;}
  .av-on{border-color:#4f46e5!important;background:#f5f3ff!important;box-shadow:0 0 0 3px rgba(79,70,229,.1);}
  .resume-drop{display:flex;align-items:center;justify-content:center;border:2px dashed #e2e8f0;border-radius:13px;padding:18px;cursor:pointer;transition:all .2s;background:#fafbff;min-height:68px;}
  .resume-drop:hover{border-color:#4f46e5;background:#f5f3ff;}
  .start-btn{width:100%;padding:14px;border-radius:13px;border:none;background:linear-gradient(135deg,#1e1b4b,#4f46e5);color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 5px 20px rgba(79,70,229,.28);transition:all .2s;margin-top:7px;font-family:inherit;}
  .start-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 9px 26px rgba(79,70,229,.36);}
  .start-btn:disabled{opacity:.45;cursor:not-allowed;}
  .bspinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .8s linear infinite;display:inline-block;flex-shrink:0;}
  .bspinner-dark{width:13px;height:13px;border-radius:50%;border:2px solid rgba(79,70,229,.2);border-top-color:#4f46e5;animation:spin .8s linear infinite;display:inline-block;flex-shrink:0;}
  .ctrl-btn{width:32px;height:32px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
  .ctrl-btn:hover{background:#f1f5f9;}
  .end-btn{display:flex;align-items:center;gap:4px;padding:5px 13px;border-radius:18px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;font-size:.7rem;font-weight:700;cursor:pointer;transition:.2s;font-family:inherit;}
  .end-btn:hover{background:#fee2e2;}
  .mic-btn{display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:24px;border:2px solid #fca5a5;background:#fff1f2;color:#dc2626;font-weight:800;font-size:.83rem;cursor:pointer;transition:all .2s;flex:1;justify-content:center;font-family:inherit;}
  .mic-on{border-color:#dc2626!important;background:#fef2f2!important;animation:mpulse 1s ease-in-out infinite;}
  @keyframes mpulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.3)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}
  .mic-btn:hover:not(:disabled){background:#fee2e2;}
  .mic-btn:disabled{opacity:.5;cursor:not-allowed;}
  .submit-btn{display:inline-flex;align-items:center;gap:6px;padding:11px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-weight:800;font-size:.83rem;cursor:pointer;box-shadow:0 4px 12px rgba(5,150,105,.25);transition:all .2s;flex:1;justify-content:center;font-family:inherit;}
  .submit-btn:hover:not(:disabled){transform:translateY(-1px);}
  .submit-btn:disabled{opacity:.6;cursor:not-allowed;}
  .skip-btn{padding:11px 15px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-weight:700;font-size:.79rem;cursor:pointer;transition:.2s;font-family:inherit;}
  .skip-btn:hover:not(:disabled){background:#f1f5f9;}
  .skip-btn:disabled{opacity:.5;cursor:not-allowed;}
  @media(max-width:680px){
    div[style*="grid-template-columns: 260px"]{display:flex!important;flex-direction:column!important;height:auto!important;overflow:visible!important;}
  }
`;