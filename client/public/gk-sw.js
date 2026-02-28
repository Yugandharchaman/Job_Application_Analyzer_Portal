// gk-sw.js — Place this file in your /public folder
// Daily GK Notification Service Worker

const GK_QUESTIONS_SW = [
  { q: "What is the national animal of India?", a: "Bengal Tiger", cat: "India" },
  { q: "Which is the longest river in India?", a: "Ganga (Ganges)", cat: "India" },
  { q: "What planet is known as the Red Planet?", a: "Mars", cat: "Science" },
  { q: "Who developed the theory of relativity?", a: "Albert Einstein", cat: "Science" },
  { q: "Which country has won the most FIFA World Cups?", a: "Brazil (5 times)", cat: "Sports" },
  { q: "What is the largest continent?", a: "Asia", cat: "World" },
  { q: "India's Chandrayaan-3 landed on the moon in which year?", a: "2023", cat: "Current Affairs" },
  { q: "What is the hardest natural substance on Earth?", a: "Diamond", cat: "Science" },
  { q: "Who is known as the 'Missile Man of India'?", a: "Dr. A.P.J. Abdul Kalam", cat: "India" },
  { q: "What is the full form of DNA?", a: "Deoxyribonucleic Acid", cat: "Science" },
  { q: "Which city is called the Silicon Valley of India?", a: "Bengaluru", cat: "India" },
  { q: "How many rings are in the Olympic flag?", a: "5 rings", cat: "Sports" },
  { q: "Who wrote the Indian National Anthem Jana Gana Mana?", a: "Rabindranath Tagore", cat: "India" },
  { q: "What is the capital of Australia?", a: "Canberra", cat: "World" },
  { q: "In which year did India gain independence?", a: "1947", cat: "India" },
  { q: "What is the national flower of India?", a: "Lotus", cat: "India" },
  { q: "Who invented the World Wide Web?", a: "Tim Berners-Lee", cat: "Tech" },
  { q: "Which country hosted the G20 Summit in 2023?", a: "India (New Delhi)", cat: "Current Affairs" },
  { q: "How many bones are in the adult human body?", a: "206 bones", cat: "Science" },
  { q: "What is the powerhouse of the cell?", a: "Mitochondria", cat: "Science" },
  { q: "Which is the highest peak in India?", a: "Kangchenjunga", cat: "India" },
];

const CURRENT_AFFAIRS_SW = [
  "India's Chandrayaan-3 landed on the moon's south pole in August 2023.",
  "India hosted the G20 Summit in New Delhi in September 2023.",
  "India became the world's most populous country in 2023, surpassing China.",
  "Neeraj Chopra won gold in Javelin Throw at the 2024 Paris Olympics.",
  "India's first semiconductor chip plant is being set up in Gujarat.",
  "India's UPI crossed 13 billion monthly transactions in 2024.",
  "INS Vikrant is India's first indigenous aircraft carrier.",
];

// ── INSTALL ──
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  // Schedule daily alarm
  scheduleDailyAlarm();
});

// ── BACKGROUND SYNC / PERIODIC SYNC ──
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-gk") {
    event.waitUntil(checkAndNotify());
  }
});

// ── PUSH EVENT (from server-side push) ──
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : null;
  if (data) {
    showGKNotification(data.q, data.a, data.cat, data.num);
  } else {
    checkAndNotify();
  }
});

// ── NOTIFICATION CLICK ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

// ── MESSAGE from main thread ──
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TRIGGER_DAILY_NOTIF") {
    checkAndNotify();
  }
  if (event.data && event.data.type === "SCHEDULE_DAILY") {
    scheduleDailyAlarm();
  }
});

// ─────────────────────────────────────────────
// HELPER: Schedule 6 AM daily alarm
// ─────────────────────────────────────────────
function scheduleDailyAlarm() {
  const now = new Date();
  const next6AM = new Date(now);
  next6AM.setHours(6, 0, 0, 0);
  if (now >= next6AM) next6AM.setDate(next6AM.getDate() + 1);
  const msUntil6AM = next6AM - now;

  // Use setTimeout for first trigger, then setInterval for daily
  setTimeout(() => {
    checkAndNotify();
    setInterval(checkAndNotify, 24 * 60 * 60 * 1000); // every 24h
  }, msUntil6AM);
}

// ─────────────────────────────────────────────
// NO-REPEAT DAILY SELECTOR (mirrors main app logic)
// Seeded Fisher-Yates — same algorithm as GKDailyNotifications.jsx
// so SW notifications always match what the app shows
// ─────────────────────────────────────────────

function seededRngSW(seed) {
  let s = seed >>> 0;
  return function () {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 4294967296;
  };
}

function shuffleWithSeedSW(array, seed) {
  const arr = array.slice();
  const rng = seededRngSW(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const APP_EPOCH_SW = new Date("2025-01-01T00:00:00Z");

function getDayIndexSW(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return Math.floor((d - APP_EPOCH_SW) / 86400000);
}

function getDailyQsSW() {
  const now = new Date();
  const dayIndex = getDayIndexSW(now);

  // GK: 2 per day
  const gkPerDay = 2;
  const gkDaysPerEpoch = Math.floor(GK_QUESTIONS_SW.length / gkPerDay);
  const gkEpoch = Math.floor(dayIndex / gkDaysPerEpoch);
  const gkSlot = (dayIndex % gkDaysPerEpoch) * gkPerDay;
  const gkSeed = (gkEpoch * 2654435761 + 1234567) >>> 0;
  const shuffledGK = shuffleWithSeedSW(GK_QUESTIONS_SW, gkSeed);
  const gkQ1 = shuffledGK[gkSlot];
  const gkQ2 = shuffledGK[gkSlot + 1] || shuffledGK[0];

  // CA: 1 per day
  const caDaysPerEpoch = CURRENT_AFFAIRS_SW.length;
  const caEpoch = Math.floor(dayIndex / caDaysPerEpoch);
  const caSlot = dayIndex % caDaysPerEpoch;
  const caSeed = (caEpoch * 3141592653 + 9876543) >>> 0;
  const shuffledCA = shuffleWithSeedSW(CURRENT_AFFAIRS_SW, caSeed);
  const caText = shuffledCA[caSlot];

  return [
    gkQ1,
    gkQ2,
    { q: "Today's Current Affairs", a: caText, cat: "Current Affairs" }
  ];
}

// ─────────────────────────────────────────────
// HELPER: Check if already notified today
// ─────────────────────────────────────────────
async function checkAndNotify() {
  const today = new Date().toISOString().split("T")[0];
  const key = `gk_notified_${today}`;

  // Check cache
  const cache = await caches.open("gk-state");
  const existing = await cache.match(key);
  if (existing) return; // Already notified today

  // Mark as notified
  await cache.put(key, new Response("done"));

  // Send 3 notifications with a small delay
  const questions = getDailyQsSW();
  for (let i = 0; i < questions.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i * 3000)); // 3s apart
    showGKNotification(questions[i].q, questions[i].a, questions[i].cat, i + 1);
  }
}

// ─────────────────────────────────────────────
// HELPER: Show notification
// ─────────────────────────────────────────────
function showGKNotification(question, answer, category, num) {
  const catEmojis = {
    India: "🇮🇳", World: "🌍", Science: "🔬", History: "📜",
    Sports: "🏆", Tech: "💻", Arts: "🎨", Environment: "🌿",
    "Current Affairs": "📰", default: "🧠"
  };
  const emoji = catEmojis[category] || catEmojis.default;

  const options = {
    body: `Answer: ${answer}\n\n📱 Tap to see all today's questions`,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `gk-question-${num}-${new Date().toISOString().split("T")[0]}`,
    requireInteraction: false,
    silent: false,
    data: { category, question, answer },
    actions: [
      { action: "open", title: "Open App" },
    ],
    vibrate: [200, 100, 200],
  };

  const title = `${emoji} GK Q${num}: ${question.length > 60 ? question.slice(0, 57) + "..." : question}`;
  
  return self.registration.showNotification(title, options);
}