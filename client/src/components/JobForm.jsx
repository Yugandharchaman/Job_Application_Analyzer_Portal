import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// ─────────────────────────────────────────────
// GK QUESTION BANK — with MCQ options
// ─────────────────────────────────────────────
const GK_QUESTIONS = [
  { q: "What is the national animal of India?", options: ["Snow Leopard", "Bengal Tiger", "Indian Lion", "One-horned Rhino"], correct: 1, cat: "India" },
  { q: "Which is the longest river in India?", options: ["Yamuna", "Brahmaputra", "Ganga (Ganges)", "Godavari"], correct: 2, cat: "India" },
  { q: "What is the capital of India?", options: ["Mumbai", "Kolkata", "Chennai", "New Delhi"], correct: 3, cat: "India" },
  { q: "Which state has the largest area in India?", options: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh"], correct: 1, cat: "India" },
  { q: "What is the national bird of India?", options: ["Indian Robin", "Sarus Crane", "Indian Peacock", "Great Hornbill"], correct: 2, cat: "India" },
  { q: "Which is the highest peak in India?", options: ["Nanda Devi", "K2", "Kangchenjunga", "Siachen Peak"], correct: 2, cat: "India" },
  { q: "What is the national flower of India?", options: ["Marigold", "Rose", "Jasmine", "Lotus"], correct: 3, cat: "India" },
  { q: "Which city is known as the Pink City of India?", options: ["Jodhpur", "Jaipur", "Udaipur", "Bikaner"], correct: 1, cat: "India" },
  { q: "What is the national fruit of India?", options: ["Banana", "Jackfruit", "Guava", "Mango"], correct: 3, cat: "India" },
  { q: "Which is the smallest state of India by area?", options: ["Sikkim", "Tripura", "Goa", "Nagaland"], correct: 2, cat: "India" },
  { q: "Which Indian state has the longest coastline?", options: ["Kerala", "Tamil Nadu", "Andhra Pradesh", "Gujarat"], correct: 3, cat: "India" },
  { q: "Which city is called the 'Silicon Valley of India'?", options: ["Hyderabad", "Pune", "Bengaluru", "Chennai"], correct: 2, cat: "India" },
  { q: "Who is called the 'Father of the Nation' of India?", options: ["Jawaharlal Nehru", "Sardar Patel", "Mahatma Gandhi", "B.R. Ambedkar"], correct: 2, cat: "India" },
  { q: "Who was the first Prime Minister of India?", options: ["Sardar Patel", "Jawaharlal Nehru", "Lal Bahadur Shastri", "Indira Gandhi"], correct: 1, cat: "India" },
  { q: "Who was the first President of India?", options: ["S. Radhakrishnan", "Zakir Husain", "Dr. Rajendra Prasad", "V.V. Giri"], correct: 2, cat: "India" },
  { q: "In which year did India gain independence?", options: ["1945", "1947", "1948", "1950"], correct: 1, cat: "India" },
  { q: "Who wrote the Indian National Anthem 'Jana Gana Mana'?", options: ["Bankim Chandra", "Rabindranath Tagore", "Sarojini Naidu", "Subhas Chandra Bose"], correct: 1, cat: "India" },
  { q: "Who was the first female Prime Minister of India?", options: ["Pratibha Patil", "Sushma Swaraj", "Smriti Irani", "Indira Gandhi"], correct: 3, cat: "India" },
  { q: "India's first satellite was named?", options: ["Bhaskara", "Rohini", "Aryabhata", "Apple"], correct: 2, cat: "India" },
  { q: "Who is known as the 'Missile Man of India'?", options: ["Vikram Sarabhai", "Homi Bhabha", "Dr. A.P.J. Abdul Kalam", "K. Sivan"], correct: 2, cat: "India" },
  { q: "What is the largest continent in the world?", options: ["Africa", "Asia", "Europe", "North America"], correct: 1, cat: "World" },
  { q: "Which is the longest river in the world?", options: ["Amazon", "Yangtze", "Nile River", "Mississippi"], correct: 2, cat: "World" },
  { q: "What is the highest mountain in the world?", options: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"], correct: 1, cat: "World" },
  { q: "Which is the largest ocean in the world?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correct: 3, cat: "World" },
  { q: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2, cat: "World" },
  { q: "Which is the largest country by area?", options: ["Canada", "China", "USA", "Russia"], correct: 3, cat: "World" },
  { q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2, cat: "World" },
  { q: "Which is the tallest waterfall in the world?", options: ["Niagara Falls", "Iguazu Falls", "Angel Falls", "Victoria Falls"], correct: 2, cat: "World" },
  { q: "What is the capital of Brazil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 2, cat: "World" },
  { q: "Which country has the most time zones?", options: ["Russia", "USA", "China", "France"], correct: 3, cat: "World" },
  { q: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, cat: "Science" },
  { q: "How many bones are in the adult human body?", options: ["198", "206", "214", "220"], correct: 1, cat: "Science" },
  { q: "What planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, cat: "Science" },
  { q: "What is the hardest natural substance on Earth?", options: ["Quartz", "Corundum", "Topaz", "Diamond"], correct: 3, cat: "Science" },
  { q: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide (CO₂)", "Hydrogen"], correct: 2, cat: "Science" },
  { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Golgi body", "Mitochondria"], correct: 3, cat: "Science" },
  { q: "Who developed the theory of relativity?", options: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Max Planck"], correct: 2, cat: "Science" },
  { q: "What is the full form of DNA?", options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinucleotide Acid", "Double Nucleic Acid"], correct: 1, cat: "Science" },
  { q: "Which planet has the most moons?", options: ["Jupiter", "Uranus", "Neptune", "Saturn"], correct: 3, cat: "Science" },
  { q: "Who discovered Penicillin?", options: ["Louis Pasteur", "Robert Koch", "Alexander Fleming", "Joseph Lister"], correct: 2, cat: "Science" },
  { q: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, cat: "History" },
  { q: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Alan Shepard"], correct: 1, cat: "History" },
  { q: "In which year did the Berlin Wall fall?", options: ["1985", "1987", "1989", "1991"], correct: 2, cat: "History" },
  { q: "Who was the first woman to win a Nobel Prize?", options: ["Rosalind Franklin", "Lise Meitner", "Marie Curie", "Dorothy Hodgkin"], correct: 2, cat: "History" },
  { q: "In which year did the French Revolution begin?", options: ["1776", "1783", "1789", "1799"], correct: 2, cat: "History" },
  { q: "How many players are in a cricket team?", options: ["9", "10", "11", "12"], correct: 2, cat: "Sports" },
  { q: "Which country has won the most FIFA World Cups?", options: ["Germany", "Argentina", "Italy", "Brazil"], correct: 3, cat: "Sports" },
  { q: "How many rings are in the Olympic flag?", options: ["4", "5", "6", "7"], correct: 1, cat: "Sports" },
  { q: "Who is known as the 'God of Cricket'?", options: ["Brian Lara", "Ricky Ponting", "Sachin Tendulkar", "Vivian Richards"], correct: 2, cat: "Sports" },
  { q: "In which year did India win its first Cricket World Cup?", options: ["1979", "1983", "1987", "1992"], correct: 1, cat: "Sports" },
  { q: "What does 'www' stand for?", options: ["World Wide Web", "Web World Wide", "Wide World Web", "World Web Wire"], correct: 0, cat: "Tech" },
  { q: "Who founded Microsoft?", options: ["Steve Jobs", "Mark Zuckerberg", "Bill Gates & Paul Allen", "Larry Page"], correct: 2, cat: "Tech" },
  { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Dennis Ritchie"], correct: 2, cat: "Tech" },
  { q: "In which year was Facebook founded?", options: ["2002", "2003", "2004", "2005"], correct: 2, cat: "Tech" },
  { q: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Botticelli"], correct: 2, cat: "Arts" },
  { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Homer"], correct: 1, cat: "Arts" },
  { q: "Who is the author of 'Harry Potter'?", options: ["Roald Dahl", "C.S. Lewis", "J.R.R. Tolkien", "J.K. Rowling"], correct: 3, cat: "Arts" },
  { q: "What percentage of Earth's surface is covered by water?", options: ["61%", "65%", "71%", "75%"], correct: 2, cat: "Environment" },
  { q: "Which gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, cat: "Environment" },
  { q: "What is the largest rainforest in the world?", options: ["Congo Rainforest", "Amazon Rainforest", "Daintree Rainforest", "Tongass"], correct: 1, cat: "Environment" },
  { q: "How many states are there in India?", options: ["25 States", "26 States", "28 States", "30 States"], correct: 2, cat: "India" },
];

const CURRENT_AFFAIRS = [
  { q: "Chandrayaan-3 landed on the moon's south pole in which year?", options: ["2021", "2022", "2023", "2024"], correct: 2, cat: "Current Affairs" },
  { q: "Which country hosted the G20 Summit in 2023?", options: ["Japan", "USA", "India (New Delhi)", "Germany"], correct: 2, cat: "Current Affairs" },
  { q: "Which Indian athlete won gold at 2024 Paris Olympics in Javelin Throw?", options: ["Bajrang Punia", "Neeraj Chopra", "Vinesh Phogat", "PV Sindhu"], correct: 1, cat: "Current Affairs" },
  { q: "What is the name of India's first indigenous aircraft carrier?", options: ["INS Virat", "INS Vikramaditya", "INS Vikrant", "INS Sindhuraj"], correct: 2, cat: "Current Affairs" },
  { q: "Who became the new Chief Justice of India in 2024?", options: ["Justice D.Y. Chandrachud", "Justice Sanjiv Khanna", "Justice N.V. Ramana", "Justice U.U. Lalit"], correct: 1, cat: "Current Affairs" },
  { q: "India's first Semiconductor chip plant is being set up in which state?", options: ["Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu"], correct: 2, cat: "Current Affairs" },
  { q: "India's UPI crossed how many billion monthly transactions in 2024?", options: ["Over 5 billion", "Over 8 billion", "Over 10 billion", "Over 13 billion"], correct: 3, cat: "Current Affairs" },
];

// ─── Seeded RNG ───
function seededRng(seed) {
  let s = seed >>> 0;
  return () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 4294967296; };
}
function shuffleWithSeed(array, seed) {
  const arr = [...array];
  const rng = seededRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const APP_EPOCH = new Date("2025-01-01T00:00:00Z");
function getDayIndex(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return Math.floor((d - APP_EPOCH) / 86400000);
}
function getEpochAndSlot(dayIndex, bankSize, qpd) {
  const dpe = Math.floor(bankSize / qpd);
  return { epochIndex: Math.floor(dayIndex / dpe), slotStart: (dayIndex % dpe) * qpd };
}
function getDailyQuestions(date = new Date()) {
  const di = getDayIndex(date);
  const { epochIndex: ge, slotStart: gs } = getEpochAndSlot(di, GK_QUESTIONS.length, 2);
  const gkShuffled = shuffleWithSeed(GK_QUESTIONS, (ge * 2654435761 + 1234567) >>> 0);
  const { epochIndex: ce, slotStart: cs } = getEpochAndSlot(di, CURRENT_AFFAIRS.length, 1);
  const caShuffled = shuffleWithSeed(CURRENT_AFFAIRS, (ce * 3141592653 + 9876543) >>> 0);
  return [gkShuffled[gs], gkShuffled[gs + 1], caShuffled[cs]];
}
function getDaysUntilSunday() { const d = new Date().getDay(); return d === 0 ? 0 : 7 - d; }
function isSunday() { return new Date().getDay() === 0; }

// ─── AI MCQ Generator ───
async function generateAIMCQQuestions() {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 5000,
        messages: [{ role: "user", content: `Generate exactly 30 unique multiple-choice GK quiz questions covering India GK, world geography, science, history, sports, tech, current affairs 2024. Return ONLY a JSON array, no markdown. Format: [{"q":"question","options":["A","B","C","D"],"correct":0,"cat":"India","explanation":"one sentence"}]. Rules: correct is 0-indexed (0=A), all 4 options plausible, mix: 8 India, 5 World, 5 Science, 4 History, 3 Sports, 3 Tech, 2 Current Affairs.` }]
      })
    });
    const data = await r.json();
    const text = data.content?.[0]?.text || "[]";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch { return []; }
}

// ─── Colors ───
const CATS = {
  India: { bg: "#FFF3E0", border: "#FFCC80", text: "#BF360C", dot: "#FF6D00" },
  World: { bg: "#E3F2FD", border: "#90CAF9", text: "#0D47A1", dot: "#1565C0" },
  Science: { bg: "#E8F5E9", border: "#A5D6A7", text: "#1B5E20", dot: "#2E7D32" },
  History: { bg: "#F3E5F5", border: "#CE93D8", text: "#4A148C", dot: "#6A1B9A" },
  Sports: { bg: "#FCE4EC", border: "#F48FB1", text: "#880E4F", dot: "#AD1457" },
  Tech: { bg: "#E1F5FE", border: "#81D4FA", text: "#01579B", dot: "#0277BD" },
  Arts: { bg: "#FDE7F3", border: "#F48FB1", text: "#880E4F", dot: "#C2185B" },
  Environment: { bg: "#E8F5E9", border: "#A5D6A7", text: "#1B5E20", dot: "#388E3C" },
  "Current Affairs": { bg: "#FFFDE7", border: "#FFE082", text: "#E65100", dot: "#FF8F00" },
  default: { bg: "#EDE7F6", border: "#B39DDB", text: "#311B92", dot: "#4527A0" },
};
const clr = (cat) => CATS[cat] || CATS.default;

// ─── CONFETTI ───
const Confetti = ({ active }) => {
  if (!active) return null;
  const cols = ["#4f46e5","#7c3aed","#ec4899","#f59e0b","#22c55e","#0ea5e9","#f43f5e"];
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:99998,overflow:"hidden" }}>
      {Array.from({length:55}).map((_,i)=>(
        <motion.div key={i}
          initial={{ y:-20, x:`${(i/55)*100}vw`, rotate:0, opacity:1 }}
          animate={{ y:"110vh", rotate:(Math.random()-0.5)*720, opacity:[1,1,0] }}
          transition={{ duration:1.8+Math.random()*1.5, delay:Math.random()*0.6, ease:"easeIn" }}
          style={{ position:"absolute", width:i%3===0?12:i%3===1?8:6, height:i%3===0?5:i%3===1?8:12, borderRadius:i%2===0?2:"50%", background:cols[i%cols.length] }}
        />
      ))}
    </div>
  );
};

// ─── SCORE OVERLAY ───
const ScoreOverlay = ({ score, total, onDone }) => {
  const pct = total > 0 ? Math.round((score/total)*100) : 0;
  const [count, setCount] = useState(0);
  useEffect(()=>{
    let n=0; const iv=setInterval(()=>{ n++; setCount(n); if(n>=pct) clearInterval(iv); },18);
    const t=setTimeout(onDone, 4200);
    return ()=>{ clearInterval(iv); clearTimeout(t); };
  },[]);
  const tier = pct>=80?{e:"🏆",l:"Outstanding!",c:"#059669"} : pct>=60?{e:"🎯",l:"Well Done!",c:"#D97706"} : {e:"📚",l:"Keep Practicing!",c:"#7C3AED"};
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      {[1,2,3].map(r=>(
        <motion.div key={r} initial={{scale:0,opacity:0.5}} animate={{scale:r*3,opacity:0}} transition={{duration:1.3,delay:r*0.15}}
          style={{position:"absolute",width:80,height:80,borderRadius:"50%",border:`2px solid ${tier.c}`}} />
      ))}
      <motion.div initial={{scale:0,rotate:-180}} animate={{scale:1,rotate:0}}
        transition={{type:"spring",stiffness:180,damping:14,delay:0.3}}
        style={{width:148,height:148,borderRadius:"50%",background:`linear-gradient(135deg,${tier.c}22,${tier.c}44)`,border:`3px solid ${tier.c}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:28,boxShadow:`0 0 70px ${tier.c}66`}}>
        <div style={{fontSize:42}}>{tier.e}</div>
        <div style={{color:"#fff",fontWeight:900,fontSize:28,fontFamily:"monospace"}}>{count}%</div>
      </motion.div>
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.7}} style={{textAlign:"center"}}>
        <div style={{color:"#fff",fontSize:26,fontWeight:800,marginBottom:6}}>{tier.l}</div>
        <div style={{color:"rgba(255,255,255,0.55)",fontSize:15}}>{score} of {total} questions correct</div>
      </motion.div>
    </motion.div>
  );
};

// ─── PROCTORING BAR ───
const ProctoringBar = ({timeLeft,totalTime,current,total})=>{
  const m=String(Math.floor(timeLeft/60)).padStart(2,"0"), s=String(timeLeft%60).padStart(2,"0");
  const pct=(timeLeft/totalTime)*100; const urg=timeLeft<300;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#0f172a",borderBottom:"1px solid #1e293b",height:50,display:"flex",alignItems:"center",gap:10,padding:"0 14px"}}>
      <div style={{color:"#6366f1",fontWeight:800,fontSize:13,whiteSpace:"nowrap",letterSpacing:0.5}}>◆ GK PULSE</div>
      <div style={{flex:1,height:5,background:"rgba(255,255,255,0.07)",borderRadius:50,overflow:"hidden"}}>
        <motion.div style={{height:"100%",background:urg?"linear-gradient(90deg,#ef4444,#f87171)":"linear-gradient(90deg,#4f46e5,#7c3aed)",borderRadius:50}} animate={{width:`${pct}%`}} transition={{duration:1}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,background:urg?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${urg?"#ef444430":"#ffffff15"}`,borderRadius:7,padding:"3px 9px",color:urg?"#f87171":"#e2e8f0",fontWeight:800,fontSize:13,fontFamily:"monospace"}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {m}:{s}
      </div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,whiteSpace:"nowrap"}}>{current}/{total}</div>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <motion.div animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:2}} style={{width:6,height:6,borderRadius:"50%",background:"#4ade80"}}/>
        <span style={{color:"#4ade80",fontSize:10,fontWeight:700}}>LIVE</span>
      </div>
      <div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.35)",color:"#f87171",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>🔴 PROCTORED</div>
    </div>
  );
};

// ─── OPTION BUTTON ───
const Opt = ({label,text,selected,correct,wrong,onClick,disabled})=>(
  <motion.button whileTap={!disabled?{scale:0.97}:{}} onClick={onClick}
    style={{
      width:"100%",padding:"13px 15px",borderRadius:13,border:"none",cursor:disabled?"default":"pointer",
      background: wrong?"#FEE2E2":correct?"#DCFCE7":selected?"#EEF2FF":"#F8FAFF",
      outline: wrong?"2px solid #EF4444":correct?"2px solid #22C55E":selected?"2px solid #4F46E5":"2px solid #E8ECF4",
      display:"flex",alignItems:"center",gap:11,textAlign:"left",
      transition:"all 0.15s",fontFamily:"'DM Sans',sans-serif",
      boxShadow: selected&&!wrong&&!correct?"0 3px 14px rgba(79,70,229,0.17)":"0 1px 3px rgba(0,0,0,0.04)",
    }}>
    <span style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:wrong?"#EF4444":correct?"#22C55E":selected?"#4F46E5":"#E8ECF4",color:(selected||correct||wrong)?"#fff":"#64748B",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,transition:"all 0.15s"}}>
      {label}
    </span>
    <span style={{fontWeight:selected?700:500,fontSize:14,color:wrong?"#991B1B":correct?"#166534":selected?"#312E81":"#1E293B",lineHeight:1.4,flex:1}}>
      {text}
    </span>
    {(correct||wrong)&&<span style={{marginLeft:"auto",fontSize:15}}>{correct?"✅":"❌"}</span>}
  </motion.button>
);

// ─── NOTIFICATION MODAL ───
const NotifModal = ({onAllow,onDeny})=>(
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
    <motion.div initial={{scale:0.88,y:24}} animate={{scale:1,y:0}} exit={{scale:0.88,y:24}}
      style={{background:"#fff",borderRadius:24,padding:"28px 24px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,0.18)"}}>
      <motion.div animate={{rotate:[-5,5,-5,5,0]}} transition={{duration:0.6,delay:0.3}}
        style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:30,boxShadow:"0 8px 24px rgba(79,70,229,0.35)"}}>
        🔔
      </motion.div>
      <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800,color:"#0F172A",margin:"0 0 10px"}}>Daily Brain Boost</h3>
      <p style={{color:"#64748B",fontSize:13.5,lineHeight:1.65,margin:"0 0 20px"}}>
        Get <strong>3 fresh GK questions</strong> every morning at <strong>6:00 AM</strong> — just like Duolingo. Build your knowledge streak! 🧠
      </p>
      <div style={{background:"#F8FAFF",border:"1.5px solid #E2E8F0",borderRadius:12,padding:"11px 14px",marginBottom:20,display:"flex",gap:10,textAlign:"left"}}>
        {["📅 Daily at 6 AM","🧠 3 new questions","🔕 Cancel anytime"].map((t,i)=>(
          <div key={i} style={{flex:1,textAlign:"center",fontSize:11,color:"#64748B",fontWeight:600,lineHeight:1.4}}>{t}</div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onDeny} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#F8FAFF",color:"#64748B",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          Not Now
        </button>
        <button onClick={onAllow} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(79,70,229,0.4)",fontFamily:"'DM Sans',sans-serif"}}>
          Allow 🔔
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function GKDailyNotifications() {
  const [sessionUser, setSessionUser] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [todayQs, setTodayQs] = useState([]);
  const [todayAns, setTodayAns] = useState({});
  const [todaySubmitted, setTodaySubmitted] = useState(false);
  const [todayScore, setTodayScore] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [testQs, setTestQs] = useState([]);
  const [testAns, setTestAns] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [scores, setScores] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45*60);
  const [curQ, setCurQ] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [overlayData, setOverlayData] = useState({score:0,total:0});
  const [notifSupported, setNotifSupported] = useState(true);
  const timerRef = useRef(null);
  const daysLeft = getDaysUntilSunday();
  const todayIsSunday = isSunday();

  useEffect(()=>{
    setNotifSupported("Notification" in window);
    setTodayQs(getDailyQuestions());
    const init = async()=>{
      const {data:{user}} = await supabase.auth.getUser();
      setSessionUser(user);
      if (!user){setIsLoading(false);return;}
      const {data:p} = await supabase.from("gk_prefs").select("*").eq("user_id",user.id).single();
      if(p) setNotifEnabled(p.notifications_enabled||false);
      const {data:sc} = await supabase.from("gk_scores").select("*").eq("user_id",user.id).order("taken_at",{ascending:false}).limit(20);
      if(sc) setScores(sc);
      const today = new Date().toISOString().split("T")[0];
      const {data:ds} = await supabase.from("gk_daily_seen").select("answers,score").eq("user_id",user.id).eq("seen_date",today).single();
      if(ds){
        setTodaySubmitted(true);
        setTodayScore(ds.score);
        if(ds.answers) try{setTodayAns(JSON.parse(ds.answers));}catch{}
      }
      setIsLoading(false);
    };
    init();
  },[]);

  // Timer
  useEffect(()=>{
    if(isFullscreen && !testSubmitted){
      timerRef.current = setInterval(()=>{
        setTimeLeft(t=>{ if(t<=1){clearInterval(timerRef.current);handleSubmitTest(true);return 0;} return t-1;});
      },1000);
    }
    return ()=>clearInterval(timerRef.current);
  },[isFullscreen,testSubmitted]);

  // Tab-switch guard
  useEffect(()=>{
    if(!isFullscreen) return;
    const h=()=>toast.error("⚠️ Do not switch tabs during the exam!",{duration:2500});
    window.addEventListener("blur",h);
    return ()=>window.removeEventListener("blur",h);
  },[isFullscreen]);

  // ─── Notifications ───
  const handleToggleNotif = ()=>{
    if(!sessionUser){toast.error("Please log in first");return;}
    if(!notifEnabled) setShowNotifModal(true);
    else{
      supabase.from("gk_prefs").upsert({user_id:sessionUser.id,notifications_enabled:false,updated_at:new Date().toISOString()},{onConflict:"user_id"});
      setNotifEnabled(false);
      toast("🔕 Notifications disabled",{icon:"ℹ️"});
    }
  };

  const doAllowNotif = async()=>{
    setShowNotifModal(false);
    if(!notifSupported){toast.error("Not supported in this browser");return;}
    const perm = await Notification.requestPermission();
    if(perm!=="granted"){
      toast.error("Permission denied — enable in browser Settings → Notifications",{duration:4500});
      return;
    }
    if("serviceWorker" in navigator){
      try{
        const reg = await navigator.serviceWorker.register("/gk-sw.js");
        if("periodicSync" in reg) await reg.periodicSync.register("daily-gk-6am",{minInterval:24*60*60*1000});
      }catch(e){console.log("SW:",e);}
    }
    // Immediate welcome notification
    if(Notification.permission==="granted"){
      new Notification("🔔 Knowledge Pulse",{
        body:"3 GK questions every morning at 6 AM. Starting tomorrow!",
        icon:"/icons/icon-192.png",
        badge:"/icons/icon-72.png",
      });
    }
    await supabase.from("gk_prefs").upsert({user_id:sessionUser.id,notifications_enabled:true,updated_at:new Date().toISOString()},{onConflict:"user_id"});
    setNotifEnabled(true);
    toast.success("🔔 Daily 6 AM notifications enabled!",{duration:3000});
  };

  // ─── Today MCQ ───
  const selectTodayAns = (qi,oi)=>{ if(todaySubmitted) return; setTodayAns(a=>({...a,[qi]:oi})); };

  const submitTodayQuiz = async()=>{
    if(Object.keys(todayAns).length<todayQs.length){toast.error("Answer all 3 questions first! 📝");return;}
    let correct=0;
    todayQs.forEach((q,i)=>{ if(todayAns[i]===q.correct) correct++; });
    const score={correct,total:todayQs.length,pct:Math.round((correct/todayQs.length)*100)};
    setTodayScore(score); setTodaySubmitted(true);
    setOverlayData({score:correct,total:todayQs.length});
    setShowOverlay(true);
    setShowConfetti(correct>0);
    setTimeout(()=>setShowConfetti(false),3200);
    if(sessionUser){
      const today=new Date().toISOString().split("T")[0];
      await supabase.from("gk_daily_seen").upsert({user_id:sessionUser.id,seen_date:today,answers:JSON.stringify(todayAns),score},{onConflict:["user_id","seen_date"]});
      await supabase.from("gk_scores").insert({user_id:sessionUser.id,score:correct,total:todayQs.length,percentage:score.pct,type:"daily",taken_at:new Date().toISOString()});
      const {data:sc}=await supabase.from("gk_scores").select("*").eq("user_id",sessionUser.id).order("taken_at",{ascending:false}).limit(20);
      if(sc) setScores(sc);
    }
  };

  // ─── Test ───
  const startTest = async()=>{
    if(!todayIsSunday){toast.error(`⏳ Test opens Sundays. ${daysLeft}d to go!`);return;}
    setActiveTab("test"); setTestSubmitted(false); setTestAns({}); setTestScore(null); setCurQ(0); setTimeLeft(45*60); setLoadingAI(true);
    const aiQs = await generateAIMCQQuestions();
    setTestQs(aiQs.slice(0,30)); setLoadingAI(false);
    try{await document.documentElement.requestFullscreen();}catch{}
    setIsFullscreen(true);
  };

  const handleSubmitTest = useCallback(async(auto=false)=>{
    clearInterval(timerRef.current);
    let correct=0;
    testQs.forEach((q,i)=>{ if(testAns[i]===q.correct) correct++; });
    const pct=testQs.length>0?Math.round((correct/testQs.length)*100):0;
    setTestScore({correct,total:testQs.length,pct}); setTestSubmitted(true); setIsFullscreen(false);
    try{await document.exitFullscreen();}catch{}
    setOverlayData({score:correct,total:testQs.length});
    setShowOverlay(true);
    setShowConfetti(pct>=60);
    setTimeout(()=>setShowConfetti(false),3500);
    if(sessionUser){
      await supabase.from("gk_scores").insert({user_id:sessionUser.id,score:correct,total:testQs.length,percentage:pct,type:"weekly",taken_at:new Date().toISOString()});
      const {data:sc}=await supabase.from("gk_scores").select("*").eq("user_id",sessionUser.id).order("taken_at",{ascending:false}).limit(20);
      if(sc) setScores(sc);
    }
  },[testQs,testAns,sessionUser]);

  // ─── LOADING ───
  if(isLoading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#F8FAFF"}}>
      <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:"linear"}}
        style={{width:34,height:34,borderRadius:"50%",border:"3px solid #EEF2FF",borderTopColor:"#4F46E5"}}/>
    </div>
  );

  // ─── FULLSCREEN TEST ───
  if(isFullscreen){
    const q=testQs[curQ]; if(!q) return null;
    const cs=clr(q.cat); const answered=Object.keys(testAns).length;
    return(
      <div style={{minHeight:"100vh",background:"#F8FAFF",paddingTop:50,fontFamily:"'DM Sans',sans-serif"}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');`}</style>
        <ProctoringBar timeLeft={timeLeft} totalTime={45*60} current={curQ+1} total={testQs.length}/>
        <div style={{maxWidth:680,margin:"0 auto",padding:"18px 16px"}}>
          {/* Navigator */}
          <div style={{background:"#fff",border:"1.5px solid #E8ECF4",borderRadius:14,padding:"11px 14px",marginBottom:14,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
            {testQs.map((_,i)=>(
              <button key={i} onClick={()=>setCurQ(i)}
                style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:i===curQ?"#4F46E5":testAns[i]!==undefined?"#22C55E":"#E8ECF4",color:(i===curQ||testAns[i]!==undefined)?"#fff":"#94A3B8",fontWeight:700,fontSize:10,transition:"all 0.15s",transform:i===curQ?"scale(1.15)":"scale(1)",boxShadow:i===curQ?"0 2px 8px rgba(79,70,229,0.4)":"none"}}>
                {i+1}
              </button>
            ))}
            <div style={{marginLeft:"auto",color:"#94A3B8",fontSize:12,fontWeight:600}}>{answered}/{testQs.length}</div>
          </div>
          {/* Q Card */}
          <AnimatePresence mode="wait">
            <motion.div key={curQ} initial={{opacity:0,x:28}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-28}} transition={{duration:0.2}}
              style={{background:"#fff",border:"1.5px solid #E8ECF4",borderRadius:20,padding:"22px 20px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{background:cs.bg,color:cs.text,border:`1.5px solid ${cs.border}`,padding:"3px 11px",borderRadius:50,fontSize:11,fontWeight:800,letterSpacing:0.3}}>{q.cat.toUpperCase()}</span>
                <span style={{marginLeft:"auto",color:"#CBD5E1",fontSize:12,fontWeight:600}}>Q {curQ+1} / {testQs.length}</span>
              </div>
              <p style={{fontSize:17,fontWeight:700,color:"#0F172A",lineHeight:1.55,margin:"0 0 18px"}}>{q.q}</p>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {q.options?.map((opt,oi)=>(
                  <Opt key={oi} label={["A","B","C","D"][oi]} text={opt}
                    selected={testAns[curQ]===oi} correct={false} wrong={false}
                    onClick={()=>{ if(!testSubmitted) setTestAns(a=>({...a,[curQ]:oi})); }}/>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Nav buttons */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setCurQ(q=>Math.max(0,q-1))} disabled={curQ===0}
              style={{padding:"13px 18px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontWeight:700,cursor:curQ===0?"not-allowed":"pointer",opacity:curQ===0?0.4:1,fontFamily:"'DM Sans',sans-serif"}}>
              ← Prev
            </button>
            {curQ<testQs.length-1?(
              <button onClick={()=>setCurQ(q=>q+1)}
                style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(79,70,229,0.35)"}}>
                Next →
              </button>
            ):(
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>handleSubmitTest(false)}
                style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(5,150,105,0.4)"}}>
                Submit Test 🚀
              </motion.button>
            )}
          </div>
          {answered<testQs.length&&(
            <div style={{marginTop:10,background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:10,padding:"8px 13px",color:"#92400E",fontSize:12,fontWeight:600}}>
              ⚠️ {testQs.length-answered} question{testQs.length-answered!==1?"s":""} unanswered
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── NORMAL UI ───
  return(
    <div style={{minHeight:"100vh",background:"#F8FAFF",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#F8FAFF;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:50px;}
      `}</style>

      <Toaster position="top-center" toastOptions={{style:{borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,boxShadow:"0 8px 30px rgba(0,0,0,0.12)"}}}/>

      <AnimatePresence>
        {showNotifModal&&<NotifModal onAllow={doAllowNotif} onDeny={()=>setShowNotifModal(false)}/>}
        {showOverlay&&<ScoreOverlay score={overlayData.score} total={overlayData.total} onDone={()=>setShowOverlay(false)}/>}
      </AnimatePresence>
      <Confetti active={showConfetti}/>

      {/* ── HEADER ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #EEF2F7",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(0,0,0,0.05)"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"0 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0 10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 3px 10px rgba(79,70,229,0.35)"}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:"#0F172A",lineHeight:1.2}}>Knowledge Pulse</div>
                <div style={{fontSize:11,color:"#94A3B8",fontWeight:600}}>Daily GK · Sunday Tests</div>
              </div>
            </div>
            <div style={{background:scores.length>0?"#EEF2FF":"#F8FAFF",border:`1.5px solid ${scores.length>0?"#C7D2FE":"#E2E8F0"}`,borderRadius:10,padding:"5px 12px",fontSize:13,fontWeight:800,color:scores.length>0?"#4338CA":"#94A3B8"}}>
              {scores.length>0?`Best: ${Math.max(...scores.map(s=>s.percentage))}%`:"No tests yet"}
            </div>
          </div>
          <div style={{display:"flex",borderTop:"1px solid #F1F5F9"}}>
            {[["today","📅 Today"],["test","🏆 Test"],["scores","📊 Scores"]].map(([k,label])=>(
              <button key={k} onClick={()=>setActiveTab(k)}
                style={{flex:1,padding:"11px 6px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:activeTab===k?800:600,fontSize:13,color:activeTab===k?"#4F46E5":"#94A3B8",borderBottom:`2.5px solid ${activeTab===k?"#4F46E5":"transparent"}`,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"18px 16px 80px"}}>

        {/* STATS */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {[
            {val:new Date().toLocaleDateString("en-IN",{weekday:"short"}),icon:"📅",label:"Today",color:"#4F46E5"},
            {val:todayIsSunday?"Now!":daysLeft+"d",icon:todayIsSunday?"📝":"⏳",label:"Until Sunday",color:todayIsSunday?"#059669":"#D97706"},
            {val:String(scores.length),icon:"🏆",label:"Tests",color:"#0EA5E9"},
          ].map((s,i)=>(
            <motion.div key={i} whileHover={{y:-2}}
              style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:14,padding:"13px 10px",textAlign:"center",boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:20,marginBottom:2}}>{s.icon}</div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:s.color,lineHeight:1.2}}>{s.val}</div>
              <div style={{color:"#94A3B8",fontSize:11,fontWeight:600,marginTop:3}}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* NOTIFICATION TOGGLE */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}
          style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:14,padding:"13px 15px",marginBottom:18,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:notifEnabled?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",color:notifEnabled?"#fff":"#94A3B8",transition:"all 0.3s",flexShrink:0}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill={notifEnabled?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Daily 6 AM Notifications</div>
              <div style={{fontSize:12,color:notifEnabled?"#059669":"#94A3B8",marginTop:1,fontWeight:600}}>
                {notifEnabled?"🟢 Active — like Duolingo reminders!":"Off — tap to enable daily GK alerts"}
              </div>
            </div>
            <button onClick={handleToggleNotif}
              style={{width:50,height:27,background:notifEnabled?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#E2E8F0",borderRadius:50,position:"relative",border:"none",cursor:"pointer",transition:"all 0.3s",flexShrink:0}}>
              <div style={{position:"absolute",top:3.5,left:notifEnabled?25:3.5,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.3s",boxShadow:"0 1px 5px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>
        </motion.div>

        {/* TABS */}
        <AnimatePresence mode="wait">

          {/* TODAY */}
          {activeTab==="today"&&(
            <motion.div key="today" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div style={{textAlign:"center",color:"#94A3B8",fontSize:11,fontWeight:700,marginBottom:14,letterSpacing:0.5}}>
                {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}
              </div>

              {todayQs.map((item,qi)=>{
                const cs=clr(item.cat); const sel=todayAns[qi]; const sub=todaySubmitted;
                return(
                  <motion.div key={qi} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:qi*0.07}}
                    style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:18,padding:"18px 16px",marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3.5,background:`linear-gradient(90deg,${cs.dot},${cs.border})`,borderRadius:"18px 18px 0 0"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13,marginTop:4}}>
                      <span style={{background:cs.bg,color:cs.text,border:`1.5px solid ${cs.border}`,padding:"3px 11px",borderRadius:50,fontSize:11,fontWeight:800,letterSpacing:0.3}}>
                        {qi===2?"📰 CURRENT AFFAIRS":`Q${qi+1} · ${item.cat.toUpperCase()}`}
                      </span>
                      <div style={{marginLeft:"auto",width:24,height:24,borderRadius:"50%",background:cs.dot,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:900}}>{qi+1}</div>
                    </div>
                    <p style={{fontWeight:700,fontSize:15,color:"#0F172A",lineHeight:1.55,marginBottom:14}}>{item.q}</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {item.options?.map((opt,oi)=>{
                        const isSel=sel===oi;
                        const isCorrect=sub&&oi===item.correct;
                        const isWrong=sub&&isSel&&oi!==item.correct;
                        return <Opt key={oi} label={["A","B","C","D"][oi]} text={opt}
                          selected={isSel&&!sub} correct={isCorrect} wrong={isWrong}
                          onClick={()=>selectTodayAns(qi,oi)} disabled={sub}/>;
                      })}
                    </div>
                    {sub&&(
                      <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                        style={{marginTop:11,background:"#F0FDF4",border:"1.5px solid #BBF7D0",borderRadius:10,padding:"9px 13px"}}>
                        <div style={{fontSize:12,color:"#166534",fontWeight:700}}>
                          ✅ Correct: <span style={{color:"#15803D"}}>{item.options[item.correct]}</span>
                          {todayAns[qi]!==item.correct&&<span style={{color:"#DC2626",fontWeight:600,marginLeft:8}}>· Your answer: {item.options[todayAns[qi]]}</span>}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {!todaySubmitted?(
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.25}}>
                  <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:12}}>
                    {todayQs.map((_,i)=>(
                      <div key={i} style={{width:9,height:9,borderRadius:"50%",background:todayAns[i]!==undefined?"#4F46E5":"#E2E8F0",transition:"background 0.25s"}}/>
                    ))}
                  </div>
                  <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={submitTodayQuiz}
                    disabled={Object.keys(todayAns).length<todayQs.length}
                    style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:Object.keys(todayAns).length===todayQs.length?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#E2E8F0",color:Object.keys(todayAns).length===todayQs.length?"#fff":"#94A3B8",fontWeight:800,fontSize:15,cursor:Object.keys(todayAns).length===todayQs.length?"pointer":"not-allowed",boxShadow:Object.keys(todayAns).length===todayQs.length?"0 5px 18px rgba(79,70,229,0.35)":"none",fontFamily:"'DM Sans',sans-serif",transition:"all 0.3s"}}>
                    {Object.keys(todayAns).length===todayQs.length?"Submit Answers 🚀":`Answer all 3 to submit (${Object.keys(todayAns).length}/3)`}
                  </motion.button>
                </motion.div>
              ):todayScore&&(
                <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                  style={{background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)",border:"1.5px solid #C7D2FE",borderRadius:18,padding:"22px",textAlign:"center"}}>
                  <div style={{fontSize:34,marginBottom:6}}>{todayScore.pct===100?"🏆":todayScore.pct>=67?"🎯":"📚"}</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:"#312E81"}}>{todayScore.correct}/{todayScore.total}</div>
                  <div style={{color:"#6366F1",fontWeight:700,fontSize:14,marginTop:4}}>
                    {todayScore.pct===100?"Perfect Score! 🌟":todayScore.pct>=67?"Great job! 💪":"Keep practicing! 📖"}
                  </div>
                  <div style={{color:"#94A3B8",fontSize:12,marginTop:5}}>
                    Come back tomorrow · {todayIsSunday?"Take Sunday Test →":daysLeft+"d until Sunday test"}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TEST */}
          {activeTab==="test"&&(
            <motion.div key="test" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              {loadingAI?(
                <div style={{textAlign:"center",padding:"56px 0"}}>
                  <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:"linear"}}
                    style={{width:42,height:42,borderRadius:"50%",border:"3px solid #EEF2FF",borderTopColor:"#4F46E5",margin:"0 auto 14px"}}/>
                  <div style={{color:"#64748B",fontWeight:600}}>AI is generating 30 questions...</div>
                </div>
              ):testSubmitted&&testScore?(
                <>
                  <div style={{background:"linear-gradient(135deg,#0F172A,#1E1B4B)",borderRadius:22,padding:"28px 22px",textAlign:"center",marginBottom:14,boxShadow:"0 12px 40px rgba(79,70,229,0.25)"}}>
                    <div style={{fontSize:44,marginBottom:8}}>{testScore.pct>=80?"🏆":testScore.pct>=60?"🎯":"📚"}</div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontSize:48,fontWeight:800,color:"#fff",lineHeight:1}}>{testScore.pct}%</div>
                    <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,margin:"6px 0 18px"}}>{testScore.correct}/{testScore.total} correct</div>
                    <div style={{height:6,background:"rgba(255,255,255,0.1)",borderRadius:50,overflow:"hidden"}}>
                      <motion.div initial={{width:0}} animate={{width:`${testScore.pct}%`}} transition={{duration:1.4,delay:0.3}}
                        style={{height:"100%",background:"linear-gradient(90deg,#4F46E5,#8B5CF6,#EC4899)",borderRadius:50}}/>
                    </div>
                  </div>
                  <div style={{color:"#94A3B8",fontSize:11,fontWeight:700,letterSpacing:0.5,marginBottom:10}}>QUESTION REVIEW</div>
                  {testQs.map((q,i)=>{
                    const isCorrect=testAns[i]===q.correct;
                    return(
                      <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
                        style={{background:"#fff",border:`1.5px solid ${isCorrect?"#BBF7D0":"#FECDD3"}`,borderRadius:13,padding:"12px 14px",marginBottom:9,boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
                        <div style={{display:"flex",gap:9}}>
                          <div style={{width:24,height:24,borderRadius:"50%",background:isCorrect?"#DCFCE7":"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{isCorrect?"✅":"❌"}</div>
                          <div>
                            <div style={{fontWeight:600,fontSize:13,color:"#0F172A",marginBottom:3}}>{q.q}</div>
                            <div style={{fontSize:12}}>
                              <span style={{color:"#16A34A",fontWeight:700}}>✓ {q.options?.[q.correct]}</span>
                              {!isCorrect&&testAns[i]!==undefined&&<span style={{color:"#DC2626",fontWeight:600}}> · Your: {q.options?.[testAns[i]]}</span>}
                            </div>
                            {q.explanation&&<div style={{fontSize:11,color:"#64748B",marginTop:3,fontStyle:"italic"}}>💡 {q.explanation}</div>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              ):todayIsSunday?(
                <div>
                  <div style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",borderRadius:22,padding:"28px 22px",textAlign:"center",color:"#fff",marginBottom:14,boxShadow:"0 10px 36px rgba(79,70,229,0.35)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-45,right:-45,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
                    <div style={{position:"absolute",bottom:-35,left:-35,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
                    <motion.div animate={{scale:[1,1.08,1]}} transition={{repeat:Infinity,duration:2.2}} style={{fontSize:48,marginBottom:10,position:"relative"}}>📝</motion.div>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,margin:"0 0 7px"}}>Sunday Weekly Test</h2>
                    <p style={{opacity:0.75,fontSize:13,margin:"0 0 18px"}}>30 AI questions · 45 min · MNC-style proctored</p>
                    <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
                      {["30 MCQs","45 Min","Proctored","Auto-Score"].map(t=>(
                        <span key={t} style={{background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:50,padding:"4px 11px",fontSize:11,fontWeight:700}}>{t}</span>
                      ))}
                    </div>
                    <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={startTest}
                      style={{background:"#fff",color:"#4F46E5",border:"none",padding:"13px 36px",borderRadius:50,fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 18px rgba(0,0,0,0.18)",fontFamily:"'DM Sans',sans-serif",position:"relative"}}>
                      Start Exam 🚀
                    </motion.button>
                  </div>
                  {[["🎯","30 MCQ Questions","AI-generated across all GK categories"],["🎥","Proctored Mode","Fullscreen + cam/mic indicators"],["⏱️","45 Minutes","Auto-submits on timeout"],["📊","Instant Results","Detailed review with explanations"]].map(([icon,title,desc],i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                      style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:13,padding:"13px 15px",marginBottom:9,display:"flex",gap:12,alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                      <span style={{fontSize:22,width:34,textAlign:"center",flexShrink:0}}>{icon}</span>
                      <div><div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>{title}</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>{desc}</div></div>
                    </motion.div>
                  ))}
                </div>
              ):(
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:22,padding:"32px 22px",textAlign:"center",boxShadow:"0 4px 18px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:52,marginBottom:10}}>⏳</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontSize:68,fontWeight:800,color:"#0F172A",lineHeight:1}}>{daysLeft}</div>
                  <div style={{fontSize:17,fontWeight:700,color:"#4F46E5",marginTop:7}}>day{daysLeft!==1?"s":""} until Sunday Test</div>
                  <div style={{color:"#94A3B8",fontSize:13,margin:"6px 0 22px"}}>Weekly exam · 30 AI MCQs · 45 minutes</div>
                  <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:18}}>
                    {["M","T","W","T","F","S","S"].map((d,i)=>{
                      const isSun=i===daysLeft, isToday=i===0;
                      return(
                        <div key={i} style={{width:34,height:34,borderRadius:9,background:isSun?"#4F46E5":isToday?"#EEF2FF":"#F8FAFF",border:`1.5px solid ${isSun?"#4F46E5":isToday?"#C7D2FE":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",color:isSun?"#fff":isToday?"#4338CA":"#94A3B8",fontWeight:isSun||isToday?800:600,fontSize:12,boxShadow:isSun?"0 3px 10px rgba(79,70,229,0.35)":"none"}}>
                          {d}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{background:"#F8FAFF",border:"1.5px dashed #C7D2FE",borderRadius:11,padding:"10px 13px",color:"#4338CA",fontSize:13,fontWeight:600}}>
                    📚 Practice today's daily questions meanwhile!
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SCORES */}
          {activeTab==="scores"&&(
            <motion.div key="scores" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              {scores.length===0?(
                <div style={{textAlign:"center",padding:"52px 0"}}>
                  <div style={{width:58,height:58,borderRadius:18,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px",fontSize:26}}>🏆</div>
                  <div style={{color:"#64748B",fontSize:14,fontWeight:600}}>No tests taken yet</div>
                  <div style={{color:"#94A3B8",fontSize:13,marginTop:4}}>Start with today's 3 daily questions!</div>
                </div>
              ):(
                <>
                  <div style={{background:"linear-gradient(135deg,#0F172A,#1E1B4B)",borderRadius:18,padding:"18px 20px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>PERSONAL BEST</div>
                      <div style={{fontFamily:"'Sora',sans-serif",color:"#fff",fontSize:34,fontWeight:800,lineHeight:1}}>{Math.max(...scores.map(s=>s.percentage))}%</div>
                    </div>
                    <div style={{fontSize:40}}>🥇</div>
                  </div>
                  <div style={{color:"#94A3B8",fontSize:10,fontWeight:700,letterSpacing:0.5,marginBottom:9}}>HISTORY ({scores.length})</div>
                  {scores.map((s,i)=>(
                    <motion.div key={s.id||i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:14,padding:"14px 16px",marginBottom:9,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <div style={{fontWeight:800,fontSize:14,color:"#0F172A"}}>{s.score}/{s.total}</div>
                            {s.type&&<span style={{background:s.type==="daily"?"#EEF2FF":"#F0FDF4",color:s.type==="daily"?"#4338CA":"#166534",border:`1px solid ${s.type==="daily"?"#C7D2FE":"#BBF7D0"}`,borderRadius:50,padding:"1px 7px",fontSize:9,fontWeight:800}}>{s.type==="daily"?"DAILY":"WEEKLY"}</span>}
                          </div>
                          <div style={{color:"#94A3B8",fontSize:11}}>{new Date(s.taken_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                        </div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:s.percentage>=80?"#059669":s.percentage>=60?"#D97706":"#DC2626"}}>{s.percentage}%</div>
                      </div>
                      <div style={{height:6,background:"#F1F5F9",borderRadius:50,overflow:"hidden"}}>
                        <motion.div initial={{width:0}} animate={{width:`${s.percentage}%`}} transition={{duration:0.8,delay:i*0.05}}
                          style={{height:"100%",borderRadius:50,background:s.percentage>=80?"linear-gradient(90deg,#059669,#34D399)":s.percentage>=60?"linear-gradient(90deg,#D97706,#FBBF24)":"linear-gradient(90deg,#DC2626,#F87171)"}}/>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}