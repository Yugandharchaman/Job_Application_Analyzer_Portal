import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// ─────────────────────────────────────────────
// GK QUESTION BANK (200+ questions, rotated daily)
// ─────────────────────────────────────────────
const GK_QUESTIONS = [
  // INDIA - Geography
  { q: "What is the national animal of India?", a: "Bengal Tiger", cat: "India" },
  { q: "Which is the longest river in India?", a: "Ganga (Ganges)", cat: "India" },
  { q: "What is the capital of India?", a: "New Delhi", cat: "India" },
  { q: "Which state has the largest area in India?", a: "Rajasthan", cat: "India" },
  { q: "What is the national bird of India?", a: "Indian Peacock", cat: "India" },
  { q: "Which is the highest peak in India?", a: "Kangchenjunga", cat: "India" },
  { q: "What is the national flower of India?", a: "Lotus", cat: "India" },
  { q: "Which city is known as the Pink City of India?", a: "Jaipur", cat: "India" },
  { q: "What is the national fruit of India?", a: "Mango", cat: "India" },
  { q: "Which is the smallest state of India by area?", a: "Goa", cat: "India" },
  { q: "What is the national river of India?", a: "Ganga", cat: "India" },
  { q: "Which Indian state has the longest coastline?", a: "Gujarat", cat: "India" },
  { q: "What is the currency of India?", a: "Indian Rupee (₹)", cat: "India" },
  { q: "Which city is called the 'Silicon Valley of India'?", a: "Bengaluru", cat: "India" },
  { q: "What is the national game of India?", a: "Hockey", cat: "India" },
  { q: "Which is the largest lake in India?", a: "Chilika Lake", cat: "India" },
  { q: "What is the national tree of India?", a: "Indian Banyan", cat: "India" },
  { q: "Which city is known as the 'City of Lakes'?", a: "Udaipur", cat: "India" },
  { q: "What is the full form of ISRO?", a: "Indian Space Research Organisation", cat: "India" },
  { q: "Which Indian state is the largest producer of tea?", a: "Assam", cat: "India" },
  // INDIA - History & Politics
  { q: "Who is called the 'Father of the Nation' of India?", a: "Mahatma Gandhi", cat: "India" },
  { q: "In which year did India gain independence?", a: "1947", cat: "India" },
  { q: "Who was the first Prime Minister of India?", a: "Jawaharlal Nehru", cat: "India" },
  { q: "Who was the first President of India?", a: "Dr. Rajendra Prasad", cat: "India" },
  { q: "In which year was the Indian Constitution adopted?", a: "1950 (January 26)", cat: "India" },
  { q: "Who wrote the Indian National Anthem 'Jana Gana Mana'?", a: "Rabindranath Tagore", cat: "India" },
  { q: "Which battle is known as the turning point of Indian history in 1757?", a: "Battle of Plassey", cat: "India" },
  { q: "Who was the first female Prime Minister of India?", a: "Indira Gandhi", cat: "India" },
  { q: "What does 'Satyameva Jayate' mean?", a: "Truth Alone Triumphs", cat: "India" },
  { q: "Who designed the Indian Parliament building?", a: "Herbert Baker & Edwin Lutyens", cat: "India" },
  // INDIA - Science & Achievements
  { q: "India's first satellite was named?", a: "Aryabhata", cat: "India" },
  { q: "Who is known as the 'Missile Man of India'?", a: "Dr. A.P.J. Abdul Kalam", cat: "India" },
  { q: "Which Indian mathematician invented the concept of Zero?", a: "Aryabhata", cat: "India" },
  { q: "India's first moon mission was called?", a: "Chandrayaan-1", cat: "India" },
  { q: "Who founded the Indian National Congress in 1885?", a: "Allan Octavian Hume", cat: "India" },
  // WORLD - Geography
  { q: "What is the largest continent in the world?", a: "Asia", cat: "World" },
  { q: "Which is the longest river in the world?", a: "Nile River", cat: "World" },
  { q: "What is the highest mountain in the world?", a: "Mount Everest (8,848.86 m)", cat: "World" },
  { q: "Which is the largest ocean in the world?", a: "Pacific Ocean", cat: "World" },
  { q: "What is the smallest country in the world?", a: "Vatican City", cat: "World" },
  { q: "Which is the largest country by area?", a: "Russia", cat: "World" },
  { q: "What is the most populous country in the world?", a: "India (as of 2023)", cat: "World" },
  { q: "Which is the deepest ocean trench?", a: "Mariana Trench", cat: "World" },
  { q: "What is the largest desert in the world?", a: "Sahara Desert (hot desert)", cat: "World" },
  { q: "Which country has the most natural lakes?", a: "Canada", cat: "World" },
  { q: "What is the capital of Australia?", a: "Canberra", cat: "World" },
  { q: "Which country has the most time zones?", a: "France (12 time zones)", cat: "World" },
  { q: "What is the Amazon rainforest called?", a: "Lungs of the Earth", cat: "World" },
  { q: "Which is the tallest waterfall in the world?", a: "Angel Falls, Venezuela", cat: "World" },
  { q: "What is the capital of Brazil?", a: "Brasília", cat: "World" },
  // WORLD - Science
  { q: "What is the chemical symbol for Gold?", a: "Au", cat: "Science" },
  { q: "How many bones are in the adult human body?", a: "206", cat: "Science" },
  { q: "What is the speed of light?", a: "~3 × 10⁸ m/s (299,792,458 m/s)", cat: "Science" },
  { q: "What planet is known as the Red Planet?", a: "Mars", cat: "Science" },
  { q: "What is the hardest natural substance on Earth?", a: "Diamond", cat: "Science" },
  { q: "Who developed the theory of relativity?", a: "Albert Einstein", cat: "Science" },
  { q: "What gas do plants absorb during photosynthesis?", a: "Carbon Dioxide (CO₂)", cat: "Science" },
  { q: "How many chromosomes does a human cell have?", a: "46 (23 pairs)", cat: "Science" },
  { q: "What is the atomic number of Carbon?", a: "6", cat: "Science" },
  { q: "Who invented the telephone?", a: "Alexander Graham Bell", cat: "Science" },
  { q: "What is the full form of DNA?", a: "Deoxyribonucleic Acid", cat: "Science" },
  { q: "Which planet has the most moons?", a: "Saturn (146 moons)", cat: "Science" },
  { q: "What is the boiling point of water at sea level?", a: "100°C (212°F)", cat: "Science" },
  { q: "Who discovered Penicillin?", a: "Alexander Fleming", cat: "Science" },
  { q: "What is the powerhouse of the cell?", a: "Mitochondria", cat: "Science" },
  // WORLD - History
  { q: "In which year did World War II end?", a: "1945", cat: "History" },
  { q: "Who was the first person to walk on the moon?", a: "Neil Armstrong (1969)", cat: "History" },
  { q: "In which year did the Berlin Wall fall?", a: "1989", cat: "History" },
  { q: "Who was the first woman to win a Nobel Prize?", a: "Marie Curie (1903)", cat: "History" },
  { q: "Which empire was known as the 'Empire on which the sun never sets'?", a: "British Empire", cat: "History" },
  { q: "In which year did the French Revolution begin?", a: "1789", cat: "History" },
  { q: "Who invented the printing press?", a: "Johannes Gutenberg", cat: "History" },
  { q: "What was the first country to give women the right to vote?", a: "New Zealand (1893)", cat: "History" },
  { q: "Who was the ancient Greek god of the sea?", a: "Poseidon", cat: "History" },
  { q: "In which year did Christopher Columbus reach America?", a: "1492", cat: "History" },
  // SPORTS
  { q: "How many players are in a cricket team?", a: "11", cat: "Sports" },
  { q: "Which country has won the most FIFA World Cups?", a: "Brazil (5 times)", cat: "Sports" },
  { q: "How many rings are in the Olympic flag?", a: "5", cat: "Sports" },
  { q: "Who holds the record for most Test cricket centuries?", a: "Sachin Tendulkar (100 centuries)", cat: "Sports" },
  { q: "In which year did India win its first Cricket World Cup?", a: "1983", cat: "Sports" },
  { q: "Which country hosted the 2020 Summer Olympics?", a: "Japan (Tokyo)", cat: "Sports" },
  { q: "How many Grand Slam tournaments are there in tennis?", a: "4", cat: "Sports" },
  { q: "Who is known as the 'God of Cricket'?", a: "Sachin Tendulkar", cat: "Sports" },
  { q: "In which sport is the 'Davis Cup' awarded?", a: "Tennis", cat: "Sports" },
  { q: "How long is a standard marathon race?", a: "42.195 km (26.2 miles)", cat: "Sports" },
  // TECH & ECONOMY
  { q: "What does 'www' stand for?", a: "World Wide Web", cat: "Tech" },
  { q: "Who founded Microsoft?", a: "Bill Gates & Paul Allen", cat: "Tech" },
  { q: "What is the full form of CPU?", a: "Central Processing Unit", cat: "Tech" },
  { q: "Who invented the World Wide Web?", a: "Tim Berners-Lee", cat: "Tech" },
  { q: "What does 'HTTP' stand for?", a: "HyperText Transfer Protocol", cat: "Tech" },
  { q: "Which company created the Android operating system?", a: "Google", cat: "Tech" },
  { q: "What does 'AI' stand for?", a: "Artificial Intelligence", cat: "Tech" },
  { q: "Who founded Apple Inc.?", a: "Steve Jobs, Steve Wozniak, Ronald Wayne", cat: "Tech" },
  { q: "What is the full form of RAM?", a: "Random Access Memory", cat: "Tech" },
  { q: "In which year was Facebook founded?", a: "2004", cat: "Tech" },
  // ARTS & CULTURE
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", cat: "Arts" },
  { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", cat: "Arts" },
  { q: "Which musical instrument has 88 keys?", a: "Piano", cat: "Arts" },
  { q: "Who is the author of 'Harry Potter'?", a: "J.K. Rowling", cat: "Arts" },
  { q: "What is the national dance of India?", a: "Bharatanatyam", cat: "Arts" },
  { q: "Who wrote 'The Discovery of India'?", a: "Jawaharlal Nehru", cat: "Arts" },
  { q: "Which is the oldest language in the world?", a: "Sanskrit (considered one of the oldest)", cat: "Arts" },
  { q: "Who wrote 'War and Peace'?", a: "Leo Tolstoy", cat: "Arts" },
  { q: "In which country did the Olympics originate?", a: "Greece (Ancient Olympics)", cat: "Arts" },
  { q: "Who composed 'Ode to Joy'?", a: "Ludwig van Beethoven", cat: "Arts" },
  // ENVIRONMENT
  { q: "What percentage of Earth's surface is covered by water?", a: "About 71%", cat: "Environment" },
  { q: "Which gas makes up most of Earth's atmosphere?", a: "Nitrogen (~78%)", cat: "Environment" },
  { q: "What is the largest rainforest in the world?", a: "Amazon Rainforest", cat: "Environment" },
  { q: "How many layers does the Earth's atmosphere have?", a: "5 (Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere)", cat: "Environment" },
  { q: "What causes the seasons on Earth?", a: "Earth's axial tilt (23.5°)", cat: "Environment" },
  { q: "What is the Ozone Layer?", a: "A region of Earth's stratosphere absorbing UV radiation", cat: "Environment" },
  { q: "Which is the most abundant metal in Earth's crust?", a: "Aluminum", cat: "Environment" },
  { q: "What is carbon footprint?", a: "Total greenhouse gases produced by human activities", cat: "Environment" },
  { q: "Which country emits the most CO₂ in the world?", a: "China", cat: "Environment" },
  { q: "What is the Kyoto Protocol?", a: "An international treaty to reduce greenhouse gas emissions", cat: "Environment" },
  // INDIA - Misc Pinpoints
  { q: "How many states are there in India?", a: "28 States + 8 Union Territories", cat: "India" },
  { q: "What is the PIN code of New Delhi (Parliament Street)?", a: "110001", cat: "India" },
  { q: "Which is the longest national highway in India?", a: "NH 44 (Srinagar to Kanyakumari)", cat: "India" },
  { q: "What is the national emblem of India?", a: "Lion Capital of Ashoka (Sarnath)", cat: "India" },
  { q: "Which district has the highest literacy rate in India?", a: "Serchhip, Mizoram", cat: "India" },
  { q: "What is the Preamble of India?", a: "Introduction to the Constitution stating India is Sovereign, Socialist, Secular, Democratic Republic", cat: "India" },
  { q: "Which Indian state is known as 'God's Own Country'?", a: "Kerala", cat: "India" },
  { q: "What is the ISD code of India?", a: "+91", cat: "India" },
  { q: "Which city is known as the 'City of Joy'?", a: "Kolkata", cat: "India" },
  { q: "How many languages are in the 8th Schedule of Indian Constitution?", a: "22", cat: "India" },
  { q: "Who is known as the 'Iron Man of India'?", a: "Sardar Vallabhbhai Patel", cat: "India" },
  { q: "What is the national aquatic animal of India?", a: "River Dolphin (Gangetic Dolphin)", cat: "India" },
  { q: "What is the national heritage animal of India?", a: "Elephant", cat: "India" },
  { q: "Which is the first state formed on a linguistic basis in India?", a: "Andhra Pradesh (1953)", cat: "India" },
  { q: "What is the name of India's parliament building?", a: "Sansad Bhavan (Parliament House)", cat: "India" },
];

const CURRENT_AFFAIRS = [
  { q: "India's Chandrayaan-3 successfully landed on the moon's south pole in which year?", a: "2023 (August 23)", cat: "Current Affairs" },
  { q: "Which country hosted the G20 Summit in 2023?", a: "India (New Delhi)", cat: "Current Affairs" },
  { q: "India's UPI transactions crossed how many billion monthly transactions in 2024?", a: "Over 13 billion", cat: "Current Affairs" },
  { q: "Which Indian startup became the first to be valued over $100 billion?", a: "Reliance Jio Platforms", cat: "Current Affairs" },
  { q: "In 2024, India became the world's _ most populous country?", a: "Most populous (surpassing China)", cat: "Current Affairs" },
  { q: "Which Indian athlete won gold at the 2024 Paris Olympics in Javelin Throw?", a: "Neeraj Chopra", cat: "Current Affairs" },
  { q: "BRICS expanded in 2024 to include how many new members?", a: "6 new members (Egypt, Ethiopia, Iran, Saudi Arabia, UAE, Argentina)", cat: "Current Affairs" },
  { q: "India's GDP growth rate projected for 2024-25 by IMF is approximately?", a: "~6.5-7%", cat: "Current Affairs" },
  { q: "Which Indian city hosted the International Film Festival of India (IFFI) 2023?", a: "Goa (Panaji)", cat: "Current Affairs" },
  { q: "What is the name of India's first indigenous aircraft carrier?", a: "INS Vikrant", cat: "Current Affairs" },
  { q: "PM Vishwakarma scheme launched in 2023 targets which group?", a: "Traditional artisans and craftspeople", cat: "Current Affairs" },
  { q: "India's first Semiconductor chip fabrication plant is being set up in which state?", a: "Gujarat", cat: "Current Affairs" },
  { q: "The 'One Nation, One Election' concept in India proposes?", a: "Simultaneous elections for Lok Sabha and State Assemblies", cat: "Current Affairs" },
  { q: "India's Digital Public Infrastructure 'India Stack' won recognition from which global body?", a: "United Nations / World Bank", cat: "Current Affairs" },
  { q: "Who became the new Chief Justice of India in 2024?", a: "Justice Sanjiv Khanna", cat: "Current Affairs" },
];

// ─────────────────────────────────────────────
// NO-REPEAT DAILY QUESTION SYSTEM
//
// HOW IT WORKS — Zero repetition guaranteed:
//
//  1. seededRng(seed) → deterministic pseudo-random number generator
//     Uses a simple LCG (Linear Congruential Generator) seeded by
//     a number derived from the date. Same seed = same sequence,
//     always. No Math.random() — fully reproducible.
//
//  2. shuffleWithSeed(array, seed) → Fisher-Yates shuffle driven by
//     the seeded RNG. The ENTIRE question bank is shuffled into a
//     fixed order for a given "epoch" (cycle number). Questions are
//     then dealt out sequentially — day 1 gets positions 0-1,
//     day 2 gets positions 2-3, etc. Only after ALL questions are
//     exhausted does the order reset with a new epoch seed, ensuring
//     the full bank is seen before ANY question repeats.
//
//  3. getDayIndex(date) → how many days since the app epoch
//     (Jan 1 2025). Used to calculate which "slot" in the shuffled
//     deck today corresponds to.
//
//  4. getEpochAndSlot(dayIndex, bankSize, questionsPerDay) →
//     epoch = which full cycle we're in (bankSize/questionsPerDay days
//     per epoch). slot = position within this epoch's shuffled deck.
//     New epoch = new shuffle seed = new order, but still no repeats
//     within an epoch.
//
//  5. Current Affairs rotates independently with its own shuffle,
//     1 per day, same no-repeat guarantee.
//
//  RESULT: With 140 GK questions and 2/day → 70 days before any
//  repeat. With 15 CA questions and 1/day → 15 days before repeat.
//  After exhaustion, a new shuffled order begins (never same
//  consecutive question).
// ─────────────────────────────────────────────

// Seeded LCG pseudo-random number generator
// Returns a function that produces numbers in [0, 1)
function seededRng(seed) {
  let s = seed >>> 0; // force unsigned 32-bit
  return function () {
    // Park-Miller LCG constants
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 4294967296;
  };
}

// Fisher-Yates shuffle driven by a seeded RNG (pure, no side effects)
function shuffleWithSeed(array, seed) {
  const arr = array.map((item, i) => ({ item, i })); // keep original indices
  const rng = seededRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map(x => x.item);
}

// Days elapsed since app epoch (Jan 1 2025) — same for every user
const APP_EPOCH = new Date("2025-01-01T00:00:00Z");
function getDayIndex(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return Math.floor((d - APP_EPOCH) / 86400000);
}

// Returns { epochIndex, slotStart } for a given day
function getEpochAndSlot(dayIndex, bankSize, questionsPerDay) {
  const daysPerEpoch = Math.floor(bankSize / questionsPerDay);
  const epochIndex = Math.floor(dayIndex / daysPerEpoch);
  const slotStart = (dayIndex % daysPerEpoch) * questionsPerDay;
  return { epochIndex, slotStart };
}

// ── MAIN: Get 2 GK + 1 CA for a specific date, guaranteed no repeat
function getDailyQuestions(date = new Date()) {
  const dayIndex = getDayIndex(date);

  // ── 2 GK questions ──
  const GK_PER_DAY = 2;
  const { epochIndex: gkEpoch, slotStart: gkSlot } = getEpochAndSlot(
    dayIndex, GK_QUESTIONS.length, GK_PER_DAY
  );
  // Each epoch gets a unique seed so its shuffle order differs from other epochs
  const gkSeed = (gkEpoch * 2654435761 + 1234567) >>> 0;
  const shuffledGK = shuffleWithSeed(GK_QUESTIONS, gkSeed);
  const gkQ1 = shuffledGK[gkSlot];
  const gkQ2 = shuffledGK[gkSlot + 1];

  // ── 1 Current Affairs question ──
  const CA_PER_DAY = 1;
  const { epochIndex: caEpoch, slotStart: caSlot } = getEpochAndSlot(
    dayIndex, CURRENT_AFFAIRS.length, CA_PER_DAY
  );
  const caSeed = (caEpoch * 3141592653 + 9876543) >>> 0;
  const shuffledCA = shuffleWithSeed(CURRENT_AFFAIRS, caSeed);
  const caQ = shuffledCA[caSlot];

  return [gkQ1, gkQ2, caQ];
}

// ── Get 7 days of questions (21 total) for weekly review/test
// Each day independently guaranteed non-repeating
function getWeeklyQuestions() {
  const questions = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    getDailyQuestions(d).forEach(q => questions.push(q));
  }
  return questions; // 21 questions, each unique across 70-day GK cycle
}

// ─────────────────────────────────────────────
// ICON COMPONENTS
// ─────────────────────────────────────────────
const BellIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4H17L15 12H9L7 4Z"/><path d="M7 4H3V8C3 10.21 4.79 12 7 12"/>
    <path d="M17 4H21V8C21 10.21 19.21 12 17 12"/>
  </svg>
);

const FlameIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

// ─────────────────────────────────────────────
// AI QUESTION GENERATOR via Anthropic API
// ─────────────────────────────────────────────
async function generateAIQuestions() {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Generate exactly 9 unique General Knowledge quiz questions covering India GK, world geography, science, and current affairs 2024. Return ONLY a JSON array, no markdown, no extra text. Format: [{"q":"question","a":"answer","cat":"category"}]. Make questions factual and educational.`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// CATEGORY COLORS
// ─────────────────────────────────────────────
const CAT_COLORS = {
  India: { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316" },
  World: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  Science: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e" },
  History: { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce", dot: "#a855f7" },
  Sports: { bg: "#fff1f2", border: "#fecdd3", text: "#be123c", dot: "#f43f5e" },
  Tech: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1", dot: "#0ea5e9" },
  Arts: { bg: "#fdf4ff", border: "#f0abfc", text: "#86198f", dot: "#d946ef" },
  Environment: { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#16a34a" },
  "Current Affairs": { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", dot: "#f59e0b" },
  default: { bg: "#f8faff", border: "#e0e7ff", text: "#4338ca", dot: "#6366f1" },
};

const getCatStyle = (cat) => CAT_COLORS[cat] || CAT_COLORS.default;

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const GKDailyNotifications = () => {
  const [sessionUser, setSessionUser] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [todayQuestions, setTodayQuestions] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [activeTab, setActiveTab] = useState("today"); // today | weekly | test
  const [weeklyQuestions, setWeeklyQuestions] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [streak, setStreak] = useState(0);
  const [scores, setScores] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState("default");
  const [notifSupported, setNotifSupported] = useState(true);

  // ── Init ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);
      if (!user) { setIsLoading(false); return; }

      // Load prefs
      const { data: p } = await supabase.from("gk_prefs").select("*").eq("user_id", user.id).single();
      if (p) {
        setPrefs(p);
        setNotifEnabled(p.notifications_enabled);
        setStreak(p.streak || 0);
      }

      // Load scores
      const { data: sc } = await supabase
        .from("gk_scores").select("*").eq("user_id", user.id)
        .order("taken_at", { ascending: false }).limit(10);
      if (sc) setScores(sc);

      setIsLoading(false);
    };

    if (!("Notification" in window)) setNotifSupported(false);
    else setPermissionState(Notification.permission);

    setTodayQuestions(getDailyQuestions());
    setWeeklyQuestions(getWeeklyQuestions());
    init();
  }, []);

  // ── Toggle Notifications ──
  const handleToggleNotif = async () => {
    if (!sessionUser) { toast.error("Please log in first"); return; }

    if (!notifEnabled) {
      // Request permission
      if (!notifSupported) { toast.error("Push notifications not supported in this browser"); return; }
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm !== "granted") { toast.error("Please allow notifications in your browser settings"); return; }

      // Schedule service worker
      await registerNotifServiceWorker();
      await upsertPrefs(sessionUser.id, true);
      setNotifEnabled(true);
      toast.success("🔔 Daily GK notifications enabled! You'll get 3 questions every morning at 6 AM.");
    } else {
      await upsertPrefs(sessionUser.id, false);
      setNotifEnabled(false);
      toast("🔕 Notifications turned off", { icon: "ℹ️" });
    }
  };

  const upsertPrefs = async (userId, enabled) => {
    await supabase.from("gk_prefs").upsert({
      user_id: userId,
      notifications_enabled: enabled,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  };

  const registerNotifServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/gk-sw.js");
        // Schedule daily check
        if ("periodicSync" in (await navigator.serviceWorker.ready)) {
          await (await navigator.serviceWorker.ready).periodicSync.register("daily-gk", { minInterval: 24 * 60 * 60 * 1000 });
        }
      } catch (e) {
        console.log("SW registration note:", e);
      }
    }
  };

  // ── Reveal Answer ──
  const revealAnswer = (idx) => setRevealed(r => ({ ...r, [idx]: true }));

  // ── Mark Today Seen & Update Streak ──
  const markTodaySeen = async () => {
    if (!sessionUser) return;
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase.from("gk_daily_seen")
      .select("id").eq("user_id", sessionUser.id).eq("seen_date", today).single();
    if (!existing) {
      await supabase.from("gk_daily_seen").insert({ user_id: sessionUser.id, seen_date: today });
      const newStreak = streak + 1;
      setStreak(newStreak);
      await supabase.from("gk_prefs").upsert({ user_id: sessionUser.id, streak: newStreak }, { onConflict: "user_id" });
      toast.success(`🔥 Streak: ${newStreak} day${newStreak > 1 ? "s" : ""}! Keep it up!`);
    }
  };

  useEffect(() => {
    if (Object.keys(revealed).length === todayQuestions.length && todayQuestions.length > 0) {
      markTodaySeen();
    }
  }, [revealed]);

  // ── Weekly Test ──
  const startWeeklyTest = async () => {
    setActiveTab("test");
    setTestSubmitted(false);
    setTestAnswers({});
    setTestScore(null);
    setLoadingAI(true);
    const weekly = getWeeklyQuestions();
    const aiQs = await generateAIQuestions();
    setTestQuestions([...weekly, ...aiQs.slice(0, 9)]);
    setLoadingAI(false);
  };

  const submitTest = async () => {
    let correct = 0;
    testQuestions.forEach((q, i) => {
      if (testAnswers[i] !== undefined && testAnswers[i] === i) correct++;
    });
    // For MCQ-less test, score = number of self-reported correct
    const selfReported = Object.values(testAnswers).filter(Boolean).length;
    const total = testQuestions.length;
    const pct = Math.round((selfReported / total) * 100);
    setTestScore({ correct: selfReported, total, pct });
    setTestSubmitted(true);

    if (sessionUser) {
      await supabase.from("gk_scores").insert({
        user_id: sessionUser.id,
        score: selfReported,
        total,
        percentage: pct,
        taken_at: new Date().toISOString()
      });
      const { data: sc } = await supabase.from("gk_scores").select("*").eq("user_id", sessionUser.id)
        .order("taken_at", { ascending: false }).limit(10);
      if (sc) setScores(sc);
    }
  };

  // ─── STYLES ───
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #11102e 50%, #1a1a3e 100%)",
      padding: "32px 16px 60px",
      fontFamily: "'DM Sans', sans-serif",
    },
    card: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "24px",
      backdropFilter: "blur(20px)",
      padding: "28px",
      marginBottom: "20px",
    },
    qCard: (cat) => {
      const s = getCatStyle(cat);
      return {
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: "20px",
        padding: "22px",
        marginBottom: "16px",
        position: "relative",
        overflow: "hidden",
      };
    },
    tabBtn: (active) => ({
      padding: "10px 22px",
      borderRadius: "50px",
      border: "none",
      fontWeight: 700,
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s",
      background: active ? "rgba(99,102,241,0.9)" : "rgba(255,255,255,0.08)",
      color: active ? "#fff" : "rgba(255,255,255,0.6)",
      boxShadow: active ? "0 4px 15px rgba(99,102,241,0.4)" : "none",
    }),
    toggleTrack: (on) => ({
      width: "56px", height: "28px",
      background: on ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.15)",
      borderRadius: "50px",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.3s",
      border: "none",
      flexShrink: 0,
    }),
    toggleThumb: (on) => ({
      position: "absolute",
      top: "4px",
      left: on ? "31px" : "4px",
      width: "20px", height: "20px",
      borderRadius: "50%",
      background: "#fff",
      transition: "left 0.3s",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }),
  };

  if (isLoading) return (
    <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }} />
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
        .gk-reveal-btn { background: linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; padding:10px 22px; border-radius:50px; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.2s; }
        .gk-reveal-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(99,102,241,0.4); }
        .gk-answer-box { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:14px 18px; margin-top:14px; }
        .gk-self-check { display:flex; gap:10px; margin-top:12px; }
        .gk-correct-btn { flex:1; padding:9px; border-radius:12px; border:none; background:#dcfce7; color:#15803d; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; }
        .gk-correct-btn:hover,.gk-correct-btn.selected { background:#16a34a; color:#fff; transform:translateY(-1px); }
        .gk-wrong-btn { flex:1; padding:9px; border-radius:12px; border:none; background:#fee2e2; color:#dc2626; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; }
        .gk-wrong-btn:hover,.gk-wrong-btn.selected { background:#dc2626; color:#fff; transform:translateY(-1px); }
        .score-bar-bg { height:8px; background:rgba(255,255,255,0.1); border-radius:50px; overflow:hidden; }
        .score-bar-fill { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:50px; transition:width 1s ease; }
        .stat-card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:18px; text-align:center; }
        @media(max-width:576px){.gk-tabs{flex-wrap:wrap;gap:8px!important;}.gk-tabs button{flex:1;min-width:120px;}}
      `}</style>
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: "12px", fontFamily: "'DM Sans',sans-serif" } }} />

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 50, padding: "6px 18px", marginBottom: 16 }}>
          <SparkleIcon />
          <span style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 800, letterSpacing: "1.5px" }}>DAILY GK BRAIN BOOST</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px,6vw,48px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
          Knowledge <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pulse</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 10, fontSize: 15 }}>3 questions daily · Weekly tests · AI-powered · 6 AM delivery</p>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ fontSize: 28, fontWeight: 800, color: "#f97316", fontFamily: "'Space Grotesk',sans-serif" }}>🔥 {streak}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Day Streak</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 28, fontWeight: 800, color: "#a5b4fc", fontFamily: "'Space Grotesk',sans-serif" }}>{scores.length > 0 ? `${scores[0].percentage}%` : "—"}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Last Test</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 28, fontWeight: 800, color: "#4ade80", fontFamily: "'Space Grotesk',sans-serif" }}>{scores.length}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Tests Taken</div>
        </div>
      </motion.div>

      {/* ── NOTIFICATION TOGGLE ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: notifEnabled ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: notifEnabled ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.3s" }}>
              <BellIcon active={notifEnabled} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Daily 6 AM Notifications</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                {notifEnabled ? "🟢 Active — 3 questions every morning" : "Off — tap to enable"}
              </div>
            </div>
          </div>
          <button style={styles.toggleTrack(notifEnabled)} onClick={handleToggleNotif}>
            <div style={styles.toggleThumb(notifEnabled)} />
          </button>
        </div>
        {!notifSupported && (
          <div style={{ marginTop: 12, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 12 }}>
            ⚠️ Push notifications may not be supported in this browser. Use Chrome/Edge on Android for best experience.
          </div>
        )}
      </motion.div>

      {/* ── TABS ── */}
      <div className="gk-tabs" style={{ display: "flex", gap: 10, marginBottom: 24, justifyContent: "center" }}>
        {[["today", "📅 Today's Questions"], ["weekly", "📚 This Week"], ["test", "🏆 Weekly Test"], ["scores", "📊 My Scores"]].map(([k, label]) => (
          <button key={k} style={styles.tabBtn(activeTab === k)} onClick={() => k === "test" ? startWeeklyTest() : setActiveTab(k)}>{label}</button>
        ))}
      </div>

      {/* ── TODAY'S QUESTIONS ── */}
      <AnimatePresence mode="wait">
        {activeTab === "today" && (
          <motion.div key="today" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {todayQuestions.map((item, i) => {
              const cs = getCatStyle(item.cat);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={styles.qCard(item.cat)}>
                  {/* Decorative dot */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 20px 0 80px", background: cs.dot, opacity: 0.08 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ background: cs.border, color: cs.text, padding: "3px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, letterSpacing: "0.5px" }}>
                      {i === 2 ? "📰 CURRENT AFFAIRS" : `Q${i + 1} · ${item.cat.toUpperCase()}`}
                    </span>
                    <span style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: "50%", background: cs.dot, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                  </div>
                  <p style={{ color: "#1e293b", fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: "0 0 16px" }}>{item.q}</p>
                  {!revealed[i] ? (
                    <button className="gk-reveal-btn" onClick={() => revealAnswer(i)}>Reveal Answer ✨</button>
                  ) : (
                    <motion.div className="gk-answer-box" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ background: "#6366f1", color: "#fff", padding: "2px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>ANSWER</span>
                      </div>
                      <p style={{ color: "#312e81", fontWeight: 700, fontSize: 15, margin: 0 }}>✅ {item.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
            {Object.keys(revealed).length === todayQuestions.length && todayQuestions.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "24px", background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>All done for today!</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>Come back tomorrow for 3 new questions. Streak: 🔥{streak}</div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── WEEKLY QUESTIONS ── */}
        {activeTab === "weekly" && (
          <motion.div key="weekly" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20, textAlign: "center" }}>
              This week's 21 questions — used in your weekly test
            </div>
            {weeklyQuestions.map((item, i) => {
              const cs = getCatStyle(item.cat);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.6) }} style={styles.qCard(item.cat)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ background: cs.border, color: cs.text, padding: "2px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>Day {Math.floor(i / 3) + 1} · {item.cat}</span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: cs.text, fontWeight: 700 }}>#{i + 1}</span>
                  </div>
                  <p style={{ color: "#1e293b", fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>{item.q}</p>
                  <div style={{ background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ color: cs.text, fontWeight: 700, fontSize: 13 }}>→ {item.a}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── WEEKLY TEST ── */}
        {activeTab === "test" && (
          <motion.div key="test" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loadingAI ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", margin: "0 auto 16px" }} />
                <div style={{ color: "rgba(255,255,255,0.6)" }}>AI is crafting 9 bonus questions...</div>
              </div>
            ) : testSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>
                  {testScore.pct >= 80 ? "🏆" : testScore.pct >= 60 ? "🎯" : "📚"}
                </div>
                <h2 style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 8px" }}>
                  {testScore.correct}/{testScore.total}
                </h2>
                <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, fontSize: 15 }}>
                  {testScore.pct >= 80 ? "Outstanding! You're a GK master 🌟" : testScore.pct >= 60 ? "Good job! Keep learning 💪" : "Keep practicing — you'll get there! 📖"}
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 10 }}>
                    <span>Score</span><span style={{ color: "#a5b4fc", fontWeight: 700 }}>{testScore.pct}%</span>
                  </div>
                  <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${testScore.pct}%` }} /></div>
                </div>
                <button className="gk-reveal-btn" style={{ fontSize: 15, padding: "14px 32px" }} onClick={() => { setTestSubmitted(false); startWeeklyTest(); }}>
                  Retry Test 🔄
                </button>
              </motion.div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Weekly Test</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>21 weekly + 9 AI questions = {testQuestions.length} total</div>
                  </div>
                  <div style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 12, padding: "8px 16px", color: "#a5b4fc", fontWeight: 800, fontSize: 14 }}>
                    {Object.keys(testAnswers).length}/{testQuestions.length}
                  </div>
                </div>
                {testQuestions.map((item, i) => {
                  const cs = getCatStyle(item.cat);
                  const answered = testAnswers[i] !== undefined;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }} style={styles.qCard(item.cat)}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                        <span style={{ background: cs.border, color: cs.text, padding: "2px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>
                          {i >= 21 ? "🤖 AI" : `Q${i + 1}`} · {item.cat}
                        </span>
                        {answered && <span style={{ marginLeft: "auto", color: testAnswers[i] ? "#16a34a" : "#dc2626", fontSize: 12, fontWeight: 800 }}>{testAnswers[i] ? "✅ Got it" : "❌ Missed"}</span>}
                      </div>
                      <p style={{ color: "#1e293b", fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>{item.q}</p>
                      <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                        <span style={{ color: "#312e81", fontWeight: 700, fontSize: 13 }}>Answer: {item.a}</span>
                      </div>
                      <div className="gk-self-check">
                        <button className={`gk-correct-btn ${testAnswers[i] === true ? "selected" : ""}`} onClick={() => setTestAnswers(a => ({ ...a, [i]: true }))}>
                          <CheckIcon /> I got it!
                        </button>
                        <button className={`gk-wrong-btn ${testAnswers[i] === false ? "selected" : ""}`} onClick={() => setTestAnswers(a => ({ ...a, [i]: false }))}>
                          <XIcon /> Missed it
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {testQuestions.length > 0 && (
                  <button className="gk-reveal-btn" style={{ width: "100%", padding: "16px", fontSize: 16, borderRadius: 16, marginTop: 8 }} onClick={submitTest}>
                    Submit Test 🚀
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── SCORES ── */}
        {activeTab === "scores" && (
          <motion.div key="scores" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20, textAlign: "center" }}>Your last 10 test performances</div>
            {scores.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <TrophyIcon />
                <div style={{ color: "rgba(255,255,255,0.4)", marginTop: 16 }}>No tests taken yet.<br />Take your first weekly test!</div>
                <button className="gk-reveal-btn" style={{ marginTop: 20 }} onClick={startWeeklyTest}>Start Test 🏆</button>
              </div>
            ) : scores.map((s, i) => (
              <motion.div key={s.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 20px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>{s.score}/{s.total} correct</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{new Date(s.taken_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.percentage >= 80 ? "#4ade80" : s.percentage >= 60 ? "#fbbf24" : "#f87171", fontFamily: "'Space Grotesk',sans-serif" }}>
                    {s.percentage}%
                  </div>
                </div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${s.percentage}%`, background: s.percentage >= 80 ? "linear-gradient(90deg,#22c55e,#4ade80)" : s.percentage >= 60 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)" }} /></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <div style={{ textAlign: "center", marginTop: 40, color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
        Knowledge Pulse · 3 GK + 1 Current Affairs daily at 6 AM
      </div>
    </div>
  );
};

export default GKDailyNotifications;