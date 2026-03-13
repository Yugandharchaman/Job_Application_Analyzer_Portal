import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// ─────────────────────────────────────────────
// GK QUESTION BANK
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

// ─── Sunday window helpers ───
// Exam is available ONLY on Sunday (day === 0), 12:00 AM – 11:59 PM
function isSundayNow() {
  return new Date().getDay() === 0;
}
function getDaysUntilSunday() {
  const d = new Date().getDay();
  return d === 0 ? 0 : 7 - d;
}
function getCountdownToSunday() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) {
    // Sunday — count down to end of day
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay - now;
    return {
      d: 0,
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      isSunday: true,
    };
  }
  let daysUntil = 7 - day;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntil);
  nextSunday.setHours(0, 0, 0, 0);
  const diff = nextSunday - now;
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, isSunday: false };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    isSunday: false,
  };
}

function getISOWeekNumber() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), 0, 1));
  return Math.floor((now - start) / (7 * 24 * 3600 * 1000)) + 1;
}

// ─── Topic pools ───
const TOPIC_POOLS = {
  India:   ["Indian rivers and dams","Indian presidents and prime ministers","Indian states and union territories","Indian freedom struggle leaders","Indian classical music and dance","Indian economy and Five Year Plans","Indian space missions ISRO","Indian national awards Bharat Ratna","Indian sports achievements Olympics","Indian constitution and amendments","Indian military history","Indian ancient history Maurya Gupta"],
  World:   ["European geography and capitals","South-East Asian countries","African nations and leaders","Latin American history","World heritage sites UNESCO","Nobel Prize winners","Major world rivers and lakes","International treaties and organizations","G7 G20 BRICS nations","Cold War history"],
  Science: ["Human anatomy and diseases","Solar system and space exploration","Periodic table elements","Laws of physics Newton Einstein","Genetics and DNA biology","Climate and environmental science","Famous scientists discoveries","Chemical reactions and compounds","Mathematics famous theorems","Computer science and internet history"],
  History: ["Ancient Indian civilizations Indus","Mughal empire history","British colonial India","World War I causes and events","World War II major battles","French and American revolutions","Famous historical explorers","Ancient Greece and Rome","Medieval European history","Post-independence India history"],
  Sports:  ["Cricket World Cup history","Olympic Games records","Football FIFA tournaments","Indian sports stars achievements","Tennis Grand Slam winners","Commonwealth Games India","Badminton world champions","Formula 1 racing history","Hockey World Cup","Athletics world records"],
  Tech:    ["Famous technology company founders","History of computers and internet","Artificial intelligence milestones","Space technology satellites","Smartphone evolution history","Social media platforms history","Cybersecurity basics","Renewable energy technology","Biotechnology breakthroughs","Electric vehicles and future tech"],
  CA:      ["India budget 2024-25 highlights","International summits 2024","Scientific discoveries 2023-24","Sports world championships 2024","India economic milestones 2025","Space missions 2024-2025","India foreign policy 2024","New laws and policies India 2024"],
};
function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

async function generateAIMCQQuestions() {
  const nonce = Math.floor(Math.random() * 9999999);
  const ts = Date.now();
  const indiaTopics  = pickRandom(TOPIC_POOLS.India,   3).join(", ");
  const worldTopics  = pickRandom(TOPIC_POOLS.World,   2).join(", ");
  const sciTopics    = pickRandom(TOPIC_POOLS.Science, 2).join(", ");
  const histTopics   = pickRandom(TOPIC_POOLS.History, 2).join(", ");
  const sportsTopics = pickRandom(TOPIC_POOLS.Sports,  2).join(", ");
  const techTopics   = pickRandom(TOPIC_POOLS.Tech,    2).join(", ");
  const caTopics     = pickRandom(TOPIC_POOLS.CA,      2).join(", ");

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const fallback = shuffle([
    ...GK_QUESTIONS.map(q => ({ ...q, explanation: "Standard GK fact." })),
    ...CURRENT_AFFAIRS.map(q => ({ ...q, explanation: "Current affairs." })),
    { q: "Who is the 15th President of India?", options: ["Ram Nath Kovind","Draupadi Murmu","Pratibha Patil","Pranab Mukherjee"], correct: 1, cat: "India", explanation: "Draupadi Murmu became President in 2022." },
    { q: "Which is the largest planet in the solar system?", options: ["Saturn","Neptune","Uranus","Jupiter"], correct: 3, cat: "Science", explanation: "Jupiter is the largest planet." },
    { q: "Who won FIFA World Cup 2022?", options: ["France","Brazil","Argentina","England"], correct: 2, cat: "Sports", explanation: "Argentina won the 2022 FIFA World Cup." },
    { q: "What is the full name of ISRO?", options: ["Indian Space Research Organisation","Indian Satellite Research Organisation","International Space Research Organisation","Indian Space Rocket Organisation"], correct: 0, cat: "India", explanation: "ISRO stands for Indian Space Research Organisation." },
    { q: "Which is the longest National Highway in India?", options: ["NH 44","NH 27","NH 48","NH 52"], correct: 0, cat: "India", explanation: "NH 44 is the longest at 3,745 km." },
    { q: "Who invented the telephone?", options: ["Thomas Edison","Nikola Tesla","Alexander Graham Bell","Guglielmo Marconi"], correct: 2, cat: "Science", explanation: "Alexander Graham Bell invented the telephone in 1876." },
    { q: "What is the capital of Japan?", options: ["Osaka","Kyoto","Tokyo","Hiroshima"], correct: 2, cat: "World", explanation: "Tokyo is the capital and largest city of Japan." },
    { q: "Who wrote 'The Discovery of India'?", options: ["Mahatma Gandhi","Jawaharlal Nehru","Rabindranath Tagore","B.R. Ambedkar"], correct: 1, cat: "India", explanation: "Jawaharlal Nehru wrote it while in prison." },
  ]).slice(0, 30);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        messages: [{
          role: "user",
          content: `SESSION_ID:${nonce}_${ts}. You are a GK quiz master. Generate a COMPLETELY FRESH set of 30 unique MCQ questions. NEVER repeat common textbook questions like national animal/bird/flower. Use these SPECIFIC subtopics to ensure variety:
- India (8 questions): ${indiaTopics}
- World (5 questions): ${worldTopics}
- Science (5 questions): ${sciTopics}
- History (4 questions): ${histTopics}
- Sports (3 questions): ${sportsTopics}
- Tech (3 questions): ${techTopics}
- Current Affairs (2 questions): ${caTopics}

Return ONLY a raw JSON array. No markdown, no explanation, no text before or after the array.
Format: [{"q":"question text","options":["Option A","Option B","Option C","Option D"],"correct":0,"cat":"India","explanation":"one sentence explanation"}]
Rules: correct is 0-indexed integer. All 4 options must be plausible. All facts must be accurate.`,
        }],
      }),
    });
    if (!r.ok) { console.warn("AI API error:", r.status); return fallback; }
    const data = await r.json();
    const text = data.content?.[0]?.text || "";
    if (!text) return fallback;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length < 10) return fallback;
    return parsed.slice(0, 30);
  } catch (e) {
    console.warn("AI generation failed, using fallback:", e.message);
    return fallback;
  }
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
const ProctoringBar = ({timeLeft,totalTime,current,total,tabSwitchCount,cameraOn,micOn})=>{
  const m=String(Math.floor(timeLeft/60)).padStart(2,"0"), s=String(timeLeft%60).padStart(2,"0");
  const pct=(timeLeft/totalTime)*100; const urg=timeLeft<300;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#0f172a",borderBottom:"1px solid #1e293b",height:54,display:"flex",alignItems:"center",gap:8,padding:"0 12px"}}>
      <div style={{color:"#6366f1",fontWeight:800,fontSize:13,whiteSpace:"nowrap",letterSpacing:0.5}}>◆ GK PULSE</div>
      <div style={{flex:1,height:5,background:"rgba(255,255,255,0.07)",borderRadius:50,overflow:"hidden"}}>
        <motion.div style={{height:"100%",background:urg?"linear-gradient(90deg,#ef4444,#f87171)":"linear-gradient(90deg,#4f46e5,#7c3aed)",borderRadius:50}} animate={{width:`${pct}%`}} transition={{duration:1}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,background:urg?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${urg?"#ef444430":"#ffffff15"}`,borderRadius:7,padding:"3px 9px",color:urg?"#f87171":"#e2e8f0",fontWeight:800,fontSize:13,fontFamily:"monospace"}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {m}:{s}
      </div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,whiteSpace:"nowrap"}}>{current}/{total}</div>
      <div style={{display:"flex",alignItems:"center",gap:3,background:cameraOn?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",border:`1px solid ${cameraOn?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:5,padding:"2px 6px"}}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={cameraOn?"#4ade80":"#f87171"} strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        <span style={{color:cameraOn?"#4ade80":"#f87171",fontSize:9,fontWeight:700}}>{cameraOn?"ON":"OFF"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:3,background:micOn?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",border:`1px solid ${micOn?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:5,padding:"2px 6px"}}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={micOn?"#4ade80":"#f87171"} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        <span style={{color:micOn?"#4ade80":"#f87171",fontSize:9,fontWeight:700}}>{micOn?"ON":"OFF"}</span>
      </div>
      {tabSwitchCount > 0 && (
        <div style={{background:"rgba(239,68,68,0.18)",border:"1px solid rgba(239,68,68,0.45)",color:"#f87171",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>
          ⚠️ {tabSwitchCount}/3
        </div>
      )}
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
        Get <strong>3 fresh GK questions</strong> every morning at <strong>6:00 AM</strong> 🧠
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

// ─── WEEK COMPLETED CARD ───
const WeekCompletedCard = ({ score }) => {
  const now = new Date();
  const nextSunday = new Date(now);
  const day = now.getDay();
  // Always point to the NEXT Sunday (never today even if today is Sunday)
  const daysUntilNextSunday = day === 0 ? 7 : 7 - day;
  nextSunday.setDate(now.getDate() + daysUntilNextSunday);
  const dateStr = nextSunday.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
      style={{background:"linear-gradient(135deg,#0F172A,#1E1B4B)",borderRadius:22,padding:"32px 24px",textAlign:"center",boxShadow:"0 16px 48px rgba(79,70,229,0.3)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,borderRadius:"50%",background:"rgba(99,102,241,0.08)"}}/>
      <div style={{position:"absolute",bottom:-40,left:-40,width:140,height:140,borderRadius:"50%",background:"rgba(139,92,246,0.07)"}}/>
      <motion.div animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:2.5}}
        style={{fontSize:52,marginBottom:12,position:"relative"}}>🏆</motion.div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#fff",marginBottom:8,position:"relative"}}>
        This Week Exam Complete!
      </div>
      {score && (
        <div style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:14,padding:"14px 20px",marginBottom:18,position:"relative"}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:42,fontWeight:800,color:"#fff",lineHeight:1}}>{score.percentage}%</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginTop:4}}>{score.score}/{score.total} correct</div>
          <div style={{height:5,background:"rgba(255,255,255,0.1)",borderRadius:50,overflow:"hidden",marginTop:10}}>
            <motion.div initial={{width:0}} animate={{width:`${score.percentage}%`}} transition={{duration:1.2,delay:0.4}}
              style={{height:"100%",background:"linear-gradient(90deg,#4F46E5,#8B5CF6,#EC4899)",borderRadius:50}}/>
          </div>
        </div>
      )}
      <div style={{color:"rgba(255,255,255,0.55)",fontSize:13,marginBottom:10,position:"relative",lineHeight:1.6}}>
        You've completed this week's exam.<br/>Only one attempt is allowed per week.
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:12,padding:"10px 16px",position:"relative"}}>
        <span style={{fontSize:18}}>📅</span>
        <div style={{textAlign:"left"}}>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,fontWeight:700,letterSpacing:0.4}}>NEXT EXAM OPENS</div>
          <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{dateStr}</div>
        </div>
      </div>
    </motion.div>
  );
};

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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [countdown, setCountdown] = useState(getCountdownToSunday());
  const [isMobile, setIsMobile] = useState(false);
  const [visitedQs, setVisitedQs] = useState(new Set());
  // ── One-attempt-per-week state ──
  const [weekTestTaken, setWeekTestTaken] = useState(false);
  const [weekTestScore, setWeekTestScore] = useState(null);

  const timerRef       = useRef(null);
  const countdownRef   = useRef(null);
  const mediaStreamRef = useRef(null);

  const todayIsSunday = isSundayNow();
  const daysLeft      = getDaysUntilSunday();

  useEffect(()=>{
    setNotifSupported("Notification" in window);
    setTodayQs(getDailyQuestions());
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    countdownRef.current = setInterval(()=>{ setCountdown(getCountdownToSunday()); }, 1000);

    const init = async()=>{
      const {data:{user}} = await supabase.auth.getUser();
      setSessionUser(user);
      if (!user){ setIsLoading(false); return; }

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

      // ── Check if this week's Sunday exam is already taken ──
      const wn = getISOWeekNumber();
      const yr = new Date().getFullYear();
      const {data:wt} = await supabase
        .from("gk_scores")
        .select("score,total,percentage")
        .eq("user_id", user.id)
        .eq("type", "weekly")
        .eq("week_number", wn)
        .eq("year", yr)
        .order("taken_at", { ascending: false })
        .limit(1)
        .single();
      if(wt){
        setWeekTestTaken(true);
        setWeekTestScore({ score: wt.score, total: wt.total, percentage: wt.percentage });
      }

      setIsLoading(false);
    };
    init();
    return ()=>{ clearInterval(countdownRef.current); window.removeEventListener("resize", ()=>{}); };
  },[]);

  // Exam countdown timer
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
    const h=()=>{
      setTabSwitchCount(prev=>{
        const newCount = prev + 1;
        if(newCount >= 3){
          toast.error("🚫 3 tab switches detected! Exam auto-submitted.",{duration:3500});
          setTimeout(()=>handleSubmitTest(true), 1500);
        } else {
          toast.error(`⚠️ Warning ${newCount}/3: Do not switch tabs!`,{duration:3000});
        }
        return newCount;
      });
    };
    window.addEventListener("blur",h);
    return ()=>window.removeEventListener("blur",h);
  },[isFullscreen]);

  // Fullscreen exit = tab switch violation
  useEffect(()=>{
    if(!isFullscreen) return;
    const onFsChange = ()=>{
      if(!document.fullscreenElement && isFullscreen){
        setTabSwitchCount(prev=>{
          const newCount = prev + 1;
          if(newCount >= 3){
            toast.error("🚫 Fullscreen exited 3 times! Exam auto-submitted.",{duration:3500});
            setTimeout(()=>handleSubmitTest(true), 1500);
          } else {
            toast.error(`⚠️ Warning ${newCount}/3: Fullscreen exit detected! Re-entering...`,{duration:3000});
            setTimeout(()=>{ try{document.documentElement.requestFullscreen();}catch{} },800);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return ()=>document.removeEventListener("fullscreenchange", onFsChange);
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

  // ─── Start Exam ───
  const startTest = async()=>{
    // Guard 1: Only on Sunday
    if(!todayIsSunday){
      toast.error(`⏳ Exam opens only on Sundays. ${daysLeft}d to go!`);
      return;
    }
    // Guard 2: Already taken this week
    if(weekTestTaken){
      toast.error("✅ You've already completed this week's exam. See you next Sunday!");
      return;
    }
    // Guard 3: Mobile not supported
    if(window.innerWidth < 768){
      toast.error("🖥️ Please open on a laptop/desktop. Mobile not supported.",{duration:4000});
      return;
    }

    setActiveTab("test"); setTestSubmitted(false); setTestAns({}); setTestScore(null);
    setCurQ(0); setTimeLeft(45*60); setTabSwitchCount(0); setLoadingAI(true);
    setVisitedQs(new Set([0]));

    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      mediaStreamRef.current = stream;
      setCameraOn(true); setMicOn(true);
      toast.success("📷 Camera & 🎤 Mic activated — Proctoring LIVE",{duration:2500});
    }catch(e){
      toast.error("⚠️ Camera/Mic denied. Exam proceeds without proctoring media.",{duration:3500});
      setCameraOn(false); setMicOn(false);
    }

    toast("🤖 Generating fresh questions...",{icon:"⚡",duration:2000});
    const finalQs = await generateAIMCQQuestions();
    setTestQs(finalQs.slice(0,30)); setLoadingAI(false);

    try{await document.documentElement.requestFullscreen();}catch{}
    setIsFullscreen(true);
  };

  const handleSubmitTest = useCallback(async(auto=false)=>{
    clearInterval(timerRef.current);
    if(mediaStreamRef.current){
      mediaStreamRef.current.getTracks().forEach(t=>t.stop());
      mediaStreamRef.current = null;
    }
    setCameraOn(false); setMicOn(false);
    let correct=0;
    testQs.forEach((q,i)=>{ if(testAns[i]===q.correct) correct++; });
    const pct=testQs.length>0?Math.round((correct/testQs.length)*100):0;
    const scoreObj = { score: correct, total: testQs.length, percentage: pct };
    setTestScore(scoreObj); setTestSubmitted(true); setIsFullscreen(false);
    try{await document.exitFullscreen();}catch{}
    setOverlayData({score:correct,total:testQs.length});
    setShowOverlay(true);
    setShowConfetti(pct>=60);
    setTimeout(()=>setShowConfetti(false),3500);

    if(sessionUser){
      const wn=getISOWeekNumber(); const yr=new Date().getFullYear();
      const timeTaken=45*60-timeLeft;
      await supabase.from("gk_scores").insert({
        user_id:sessionUser.id, score:correct, total:testQs.length,
        percentage:pct, type:"weekly",
        week_number:wn, year:yr,
        tab_switches:tabSwitchCount,
        time_taken:timeTaken,
        taken_at:new Date().toISOString()
      });
      // Mark week as done
      setWeekTestTaken(true);
      setWeekTestScore(scoreObj);

      const {data:sc}=await supabase.from("gk_scores").select("*").eq("user_id",sessionUser.id).order("taken_at",{ascending:false}).limit(20);
      if(sc) setScores(sc);
    }
  },[testQs,testAns,sessionUser,tabSwitchCount,timeLeft]);

  // ─── LOADING ───
  if(isLoading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#F8FAFF"}}>
      <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:"linear"}}
        style={{width:34,height:34,borderRadius:"50%",border:"3px solid #EEF2FF",borderTopColor:"#4F46E5"}}/>
    </div>
  );

  // ─── FULLSCREEN EXAM ───
  if(isFullscreen){
    const q=testQs[curQ]; if(!q) return null;
    const cs=clr(q.cat); const answered=Object.keys(testAns).length;
    return(
      <div style={{minHeight:"100vh",background:"#F0F2F5",paddingTop:54,fontFamily:"'DM Sans',sans-serif"}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
          nav, aside, [class*="sidebar"], [class*="Sidebar"], [class*="side-nav"], [class*="SideNav"],
          [class*="drawer"], [class*="Drawer"], [class*="nav-rail"], [class*="NavRail"] { display: none !important; }
          [class*="layout"], [class*="Layout"], [class*="main-content"], [class*="MainContent"] {
            padding-left: 0 !important; margin-left: 0 !important; max-width: 100% !important;
          }
          body { overflow: hidden; }
        `}</style>

        <ProctoringBar timeLeft={timeLeft} totalTime={45*60} current={curQ+1} total={testQs.length}
          tabSwitchCount={tabSwitchCount} cameraOn={cameraOn} micOn={micOn}/>

        <div style={{maxWidth:740,margin:"0 auto",padding:"16px 20px"}}>
          {/* Navigator */}
          <div style={{background:"#fff",border:"1.5px solid #E8ECF4",borderRadius:14,padding:"10px 13px",marginBottom:12,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
            {testQs.map((_,i)=>{
              const isActive   = i === curQ;
              const isAnswered = testAns[i] !== undefined;
              const isVisited  = visitedQs.has(i);
              const bg  = isActive?"#4F46E5":isAnswered?"#22C55E":isVisited?"#F59E0B":"#E8ECF4";
              const col = (isActive||isAnswered||isVisited)?"#fff":"#94A3B8";
              return(
                <button key={i} onClick={()=>{ setCurQ(i); setVisitedQs(v=>{const n=new Set(v);n.add(i);return n;}); }}
                  style={{width:28,height:28,borderRadius:7,border:"none",cursor:"pointer",background:bg,color:col,fontWeight:700,fontSize:10,transition:"all 0.12s",transform:isActive?"scale(1.15)":"scale(1)",boxShadow:isActive?"0 2px 8px rgba(79,70,229,0.4)":isAnswered?"0 1px 4px rgba(34,197,94,0.3)":"none"}}>
                  {i+1}
                </button>
              );
            })}
            <span style={{marginLeft:"auto",color:"#94A3B8",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{answered}/{testQs.length} answered</span>
          </div>

          {/* Legend */}
          <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
            {[{color:"#4F46E5",label:"Current"},{color:"#22C55E",label:"Answered"},{color:"#F59E0B",label:"Visited"},{color:"#E8ECF4",label:"Not Visited",border:"1.5px solid #CBD5E1"}].map((l,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:12,height:12,borderRadius:3,background:l.color,border:l.border||"none",flexShrink:0}}/>
                <span style={{fontSize:11,color:"#64748B",fontWeight:500}}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Question card */}
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

          {/* Prev / Next / Submit */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <button
              onClick={()=>{ setCurQ(q=>{ const nq=Math.max(0,q-1); setVisitedQs(v=>{const n=new Set(v);n.add(nq);return n;}); return nq; }); }}
              disabled={curQ===0}
              style={{padding:"12px 26px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#fff",color:"#64748B",fontWeight:700,fontSize:14,cursor:curQ===0?"not-allowed":"pointer",opacity:curQ===0?0.35:1,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              ← Prev
            </button>
            {curQ<testQs.length-1?(
              <button
                onClick={()=>{ setCurQ(q=>{ setVisitedQs(v=>{const n=new Set(v);n.add(q+1);return n;}); return q+1; }); }}
                style={{padding:"12px 30px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(79,70,229,0.3)"}}>
                Next →
              </button>
            ):(
              <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.97}} onClick={()=>handleSubmitTest(false)}
                style={{padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(5,150,105,0.3)"}}>
                Submit Test 🚀
              </motion.button>
            )}
          </div>

          {tabSwitchCount > 0 && (
            <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
              style={{marginTop:10,background:"#FEF2F2",border:"1.5px solid #FECACA",borderRadius:10,padding:"10px 13px",color:"#991B1B",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🚨</span>
              <span>Tab switch: <strong>{tabSwitchCount}/3</strong> — {3-tabSwitchCount} more will auto-submit.</span>
            </motion.div>
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

      {/* HEADER */}
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
            {val:todayIsSunday?"Open!":daysLeft+"d",icon:todayIsSunday?"📝":"⏳",label:"Sunday Exam",color:todayIsSunday?"#059669":"#D97706"},
            {val:String(scores.filter(s=>s.type==="weekly").length),icon:"🏆",label:"Exams Done",color:"#0EA5E9"},
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
          style={{background:"#fff",border:`1.5px solid ${notifEnabled?"#C7D2FE":"#EEF2F7"}`,borderRadius:14,padding:"12px 14px",marginBottom:18,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:notifEnabled?"#EEF2FF":"#F8FAFF",border:`1.5px solid ${notifEnabled?"#C7D2FE":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifEnabled?"#4F46E5":"#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Daily 6 AM Reminders</div>
              <div style={{fontSize:12,color:notifEnabled?"#059669":"#94A3B8",fontWeight:500,marginTop:1}}>
                {notifEnabled?"🟢 Active — 3 questions every morning":"Tap to enable daily GK alerts"}
              </div>
            </div>
            <button onClick={handleToggleNotif} aria-label="Toggle notifications"
              style={{width:48,height:26,borderRadius:50,border:"none",cursor:"pointer",padding:0,flexShrink:0,
                background:notifEnabled?"#4F46E5":"#D1D5DB",position:"relative",transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:3,left:notifEnabled?25:3,width:20,height:20,borderRadius:"50%",
                background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.25)",transition:"left 0.2s"}}/>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* TODAY TAB */}
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
                    Come back tomorrow · {todayIsSunday?"Exam is open today →":daysLeft+"d until Sunday exam"}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TEST TAB */}
          {activeTab==="test"&&(
            <motion.div key="test" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              {loadingAI?(
                <div style={{textAlign:"center",padding:"56px 0"}}>
                  <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:"linear"}}
                    style={{width:42,height:42,borderRadius:"50%",border:"3px solid #EEF2FF",borderTopColor:"#4F46E5",margin:"0 auto 14px"}}/>
                  <div style={{color:"#64748B",fontWeight:600}}>AI is generating 30 fresh questions...</div>
                </div>

              // ── Already taken this week (before starting a new attempt) ──
              ):weekTestTaken&&!testSubmitted?(
                <WeekCompletedCard score={weekTestScore}/>

              // ── Just finished the exam ──
              ):testSubmitted&&testScore?(
                <>
                  <div style={{marginBottom:16}}>
                    <WeekCompletedCard score={testScore}/>
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

              // ── It IS Sunday and not taken yet ──
              ):todayIsSunday?(
                <div>
                  {isMobile&&(
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                      style={{background:"#FEF3C7",border:"1.5px solid #FCD34D",borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:24,flexShrink:0}}>🖥️</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:14,color:"#92400E",marginBottom:3}}>Laptop/Desktop Required</div>
                        <div style={{fontSize:12,color:"#78350F",lineHeight:1.5}}>
                          This exam requires a full-screen proctored environment. Please open on a <strong>laptop or desktop</strong>.
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",borderRadius:22,padding:"28px 22px",textAlign:"center",color:"#fff",marginBottom:14,boxShadow:"0 10px 36px rgba(79,70,229,0.35)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-45,right:-45,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
                    <div style={{position:"absolute",bottom:-35,left:-35,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
                    <motion.div animate={{scale:[1,1.08,1]}} transition={{repeat:Infinity,duration:2.2}} style={{fontSize:48,marginBottom:10,position:"relative"}}>📝</motion.div>
                    <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,margin:"0 0 7px"}}>Sunday Weekly Exam</h2>
                    <p style={{opacity:0.75,fontSize:13,margin:"0 0 4px"}}>30 AI questions · 45 min · Proctored</p>
                    <p style={{opacity:0.55,fontSize:12,margin:"0 0 18px"}}>Window: 12:00 AM – 11:59 PM today only · 1 attempt</p>
                    <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
                      {["30 MCQs","45 Min","Proctored","1 Attempt/Week"].map(t=>(
                        <span key={t} style={{background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:50,padding:"4px 11px",fontSize:11,fontWeight:700}}>{t}</span>
                      ))}
                    </div>
                    <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={startTest}
                      style={{background:"#fff",color:"#4F46E5",border:"none",padding:"13px 36px",borderRadius:50,fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 18px rgba(0,0,0,0.18)",fontFamily:"'DM Sans',sans-serif"}}>
                      Start Exam 🚀
                    </motion.button>
                  </div>
                  {[
                    ["🎯","30 Fresh MCQ Questions","AI-generated unique topics every session"],
                    ["🎥","Camera & Mic Proctoring","Real-time audio/video monitoring"],
                    ["⏱️","45 Minutes","Auto-submits on timeout"],
                    ["🔒","One Attempt Per Week","Sunday 12:00 AM – 11:59 PM only"],
                  ].map(([icon,title,desc],i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                      style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:13,padding:"13px 15px",marginBottom:9,display:"flex",gap:12,alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                      <span style={{fontSize:22,width:34,textAlign:"center",flexShrink:0}}>{icon}</span>
                      <div><div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>{title}</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>{desc}</div></div>
                    </motion.div>
                  ))}
                </div>

              // ── Not Sunday yet — countdown ──
              ):(
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  style={{background:"#fff",border:"1.5px solid #EEF2F7",borderRadius:22,padding:"32px 22px",textAlign:"center",boxShadow:"0 4px 18px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:52,marginBottom:10}}>⏳</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:8}}>
                    {[
                      {val:String(countdown.d).padStart(2,"0"),label:"Days"},
                      {val:String(countdown.h).padStart(2,"0"),label:"Hours"},
                      {val:String(countdown.m).padStart(2,"0"),label:"Min"},
                      {val:String(countdown.s).padStart(2,"0"),label:"Sec"},
                    ].map((u,i)=>(
                      <React.Fragment key={u.label}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:800,color:"#0F172A",lineHeight:1,fontVariantNumeric:"tabular-nums",minWidth:42,background:"#F1F5F9",borderRadius:10,padding:"6px 8px"}}>{u.val}</div>
                          <div style={{fontSize:10,color:"#94A3B8",fontWeight:700,marginTop:4}}>{u.label}</div>
                        </div>
                        {i<3&&<div style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:"#CBD5E1",alignSelf:"flex-start",marginTop:8}}>:</div>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{fontSize:17,fontWeight:700,color:"#4F46E5",marginTop:4}}>until Sunday Exam</div>
                  <div style={{color:"#94A3B8",fontSize:13,margin:"6px 0 22px"}}>Weekly exam · 30 AI MCQs · 45 minutes · 1 attempt only</div>
                  <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:18}}>
                    {[{label:"M",dayIdx:1},{label:"T",dayIdx:2},{label:"W",dayIdx:3},{label:"T",dayIdx:4},{label:"F",dayIdx:5},{label:"S",dayIdx:6},{label:"S",dayIdx:0}].map((d,i)=>{
                      const todayJsDay = new Date().getDay();
                      const isTodayDay = todayJsDay === d.dayIdx;
                      const isSunDay   = d.dayIdx === 0;
                      const bg = (isTodayDay&&isSunDay)||isSunDay?"#059669":isTodayDay?"#4F46E5":"#F8FAFF";
                      const bc = (isTodayDay&&isSunDay)||isSunDay?"#059669":isTodayDay?"#4F46E5":"#E2E8F0";
                      const col = (isSunDay||isTodayDay)?"#fff":"#94A3B8";
                      const sh  = isSunDay?"0 3px 10px rgba(5,150,105,0.4)":isTodayDay?"0 3px 10px rgba(79,70,229,0.35)":"none";
                      return(
                        <div key={i} style={{width:34,height:34,borderRadius:9,background:bg,border:`1.5px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",color:col,fontWeight:(isSunDay||isTodayDay)?800:600,fontSize:12,boxShadow:sh,position:"relative"}}>
                          {d.label}
                          {isSunDay&&!isTodayDay&&<span style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",fontSize:8,color:"#059669"}}>●</span>}
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

          {/* SCORES TAB */}
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
                            {s.type&&<span style={{background:s.type==="daily"?"#EEF2FF":"#F0FDF4",color:s.type==="daily"?"#4338CA":"#166634",border:`1px solid ${s.type==="daily"?"#C7D2FE":"#BBF7D0"}`,borderRadius:50,padding:"1px 7px",fontSize:9,fontWeight:800}}>{s.type==="daily"?"DAILY":"WEEKLY"}</span>}
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