import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";

// ── Animated Splash Screen ──
const SplashScreen = () => (
  <div id="splash-screen">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

      * { box-sizing: border-box; margin: 0; padding: 0; }

      #splash-screen {
        position: fixed;
        inset: 0;
        background: #0a0a0f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        overflow: hidden;
        animation: splashFadeOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) 3s forwards;
      }

      @keyframes splashFadeOut {
        0%   { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.08); pointer-events: none; }
      }

      /* ── Background Grid ── */
      .splash-bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(108,93,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,93,255,0.03) 1px, transparent 1px);
        background-size: 40px 40px;
        animation: gridFadeIn 1s ease 0.2s both;
      }

      @keyframes gridFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* ── Background Orbs ── */
      .splash-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        pointer-events: none;
      }

      .splash-orb-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(108,93,255,0.15) 0%, transparent 70%);
        top: -100px;
        right: -100px;
        animation: orbFloat1 6s ease-in-out infinite;
      }

      .splash-orb-2 {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
        bottom: -80px;
        left: -80px;
        animation: orbFloat2 8s ease-in-out infinite;
      }

      .splash-orb-3 {
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
        top: 50%;
        left: 10%;
        animation: orbFloat1 5s ease-in-out infinite reverse;
      }

      @keyframes orbFloat1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50%      { transform: translate(20px, -20px) scale(1.05); }
      }

      @keyframes orbFloat2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50%      { transform: translate(-15px, 15px) scale(1.08); }
      }

      /* ── Particles ── */
      .splash-particles {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }

      .particle {
        position: absolute;
        border-radius: 50%;
        animation: floatParticle linear infinite;
        opacity: 0;
      }

      @keyframes floatParticle {
        0%   { transform: translateY(110vh) scale(0) rotate(0deg);   opacity: 0; }
        10%  { opacity: 0.7; }
        90%  { opacity: 0.2; }
        100% { transform: translateY(-10vh) scale(1) rotate(360deg); opacity: 0; }
      }

      /* ── Logo Area ── */
      .splash-logo-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 36px;
        width: 220px;
        height: 220px;
      }

      /* Outer ring */
      .splash-ring {
        position: absolute;
        border-radius: 50%;
        border: 1.5px solid transparent;
      }

      .splash-ring-1 {
        width: 200px;
        height: 200px;
        border-top-color: #6c5dff;
        border-right-color: rgba(108,93,255,0.3);
        animation: ringSpinCW 2s linear infinite;
      }

      .splash-ring-2 {
        width: 220px;
        height: 220px;
        border-bottom-color: #a78bfa;
        border-left-color: rgba(167,139,250,0.2);
        animation: ringSpinCCW 3s linear infinite;
      }

      .splash-ring-3 {
        width: 175px;
        height: 175px;
        border-top-color: rgba(99,102,241,0.5);
        border-right-color: transparent;
        border-bottom-color: rgba(99,102,241,0.5);
        animation: ringSpinCW 4s linear infinite;
        animation-delay: -1s;
      }

      @keyframes ringSpinCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
      @keyframes ringSpinCCW { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }

      /* Glow behind logo */
      .splash-logo-glow {
        position: absolute;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(108,93,255,0.25) 0%, transparent 70%);
        animation: glowBreath 2s ease-in-out infinite;
      }

      @keyframes glowBreath {
        0%, 100% { transform: scale(1);   opacity: 0.6; }
        50%      { transform: scale(1.3); opacity: 1;   }
      }

      /* Logo image */
      .splash-logo {
        width: 120px;
        height: 120px;
        border-radius: 28px;
        object-fit: cover;
        position: relative;
        z-index: 2;
        animation: logoBounceIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s both;
        box-shadow:
          0 0 0 1px rgba(108,93,255,0.3),
          0 0 30px rgba(108,93,255,0.4),
          0 0 60px rgba(108,93,255,0.15);
      }

      @keyframes logoBounceIn {
        0%   { transform: scale(0.2) rotate(-20deg); opacity: 0; }
        50%  { transform: scale(1.12) rotate(4deg);  opacity: 1; }
        75%  { transform: scale(0.95) rotate(-1deg); }
        100% { transform: scale(1) rotate(0deg);     opacity: 1; }
      }

      /* Corner dots */
      .splash-corner-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6c5dff;
        box-shadow: 0 0 10px #6c5dff;
        animation: cornerPulse 1.5s ease-in-out infinite;
        z-index: 3;
      }

      .splash-corner-dot:nth-child(1) { top: 20px;    right: 20px;   animation-delay: 0s;    }
      .splash-corner-dot:nth-child(2) { bottom: 20px; right: 20px;   animation-delay: 0.4s;  background: #a78bfa; box-shadow: 0 0 10px #a78bfa; }
      .splash-corner-dot:nth-child(3) { bottom: 20px; left: 20px;    animation-delay: 0.8s;  background: #c4b5fd; box-shadow: 0 0 10px #c4b5fd; }
      .splash-corner-dot:nth-child(4) { top: 20px;    left: 20px;    animation-delay: 1.2s;  }

      @keyframes cornerPulse {
        0%, 100% { transform: scale(1);   opacity: 0.6; }
        50%      { transform: scale(1.5); opacity: 1;   }
      }

      /* ── App Name ── */
      .splash-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 2.2rem;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: -1.5px;
        line-height: 1;
        animation: nameReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1s both;
        margin-bottom: 10px;
        text-align: center;
      }

      .splash-name .highlight {
        background: linear-gradient(135deg, #a78bfa 0%, #6c5dff 50%, #818cf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 20px rgba(108,93,255,0.5));
      }

      @keyframes nameReveal {
        0%   { opacity: 0; transform: translateY(25px) scale(0.9); filter: blur(10px); }
        100% { opacity: 1; transform: translateY(0)    scale(1);   filter: blur(0);    }
      }

      /* ── Tagline ── */
      .splash-tagline {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.72rem;
        color: #475569;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        animation: nameReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.2s both;
        margin-bottom: 48px;
        text-align: center;
      }

      /* ── Loading Bar ── */
      .splash-progress-wrap {
        width: 160px;
        height: 3px;
        background: rgba(255,255,255,0.06);
        border-radius: 10px;
        overflow: hidden;
        animation: nameReveal 0.5s ease 1.4s both;
        margin-bottom: 20px;
      }

      .splash-progress-fill {
        height: 100%;
        border-radius: 10px;
        background: linear-gradient(90deg, #6c5dff, #a78bfa, #6c5dff);
        background-size: 200% 100%;
        animation:
          progressGrow 2.5s cubic-bezier(0.4, 0, 0.2, 1) 1.4s both,
          shimmerMove 1.5s linear 1.4s infinite;
      }

      @keyframes progressGrow {
        from { width: 0%; }
        to   { width: 100%; }
      }

      @keyframes shimmerMove {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }

      /* ── Loading Dots ── */
      .splash-dots {
        display: flex;
        gap: 6px;
        animation: nameReveal 0.5s ease 1.6s both;
      }

      .splash-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        animation: dotBounce 1.2s ease-in-out infinite;
      }

      .splash-dot:nth-child(1) { background: #6c5dff; animation-delay: 0s;   }
      .splash-dot:nth-child(2) { background: #a78bfa; animation-delay: 0.2s; }
      .splash-dot:nth-child(3) { background: #c4b5fd; animation-delay: 0.4s; }

      @keyframes dotBounce {
        0%, 100% { transform: translateY(0);     opacity: 0.4; }
        50%       { transform: translateY(-8px);  opacity: 1;   }
      }

      /* ── Version tag ── */
      .splash-version {
        position: absolute;
        bottom: 32px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.65rem;
        color: #1e293b;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        animation: nameReveal 0.5s ease 2s both;
      }
    `}</style>

    {/* Background elements */}
    <div className="splash-bg-grid" />
    <div className="splash-orb splash-orb-1" />
    <div className="splash-orb splash-orb-2" />
    <div className="splash-orb splash-orb-3" />

    {/* Floating particles */}
    <div className="splash-particles">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${5 + (i * 6.5)}%`,
            width:  `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: i % 3 === 0 ? '#6c5dff' : i % 3 === 1 ? '#a78bfa' : '#818cf8',
            animationDuration: `${3 + (i % 4)}s`,
            animationDelay:    `${(i * 0.3) % 2}s`,
          }}
        />
      ))}
    </div>

    {/* Logo with rings */}
    <div className="splash-logo-wrap">
      <div className="splash-corner-dot" />
      <div className="splash-corner-dot" />
      <div className="splash-corner-dot" />
      <div className="splash-corner-dot" />
      <div className="splash-logo-glow" />
      <div className="splash-ring splash-ring-1" />
      <div className="splash-ring splash-ring-2" />
      <div className="splash-ring splash-ring-3" />
      <img
        src="/android-chrome-512x512.png"
        alt="JobVault"
        className="splash-logo"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </div>

    {/* App Name */}
    <div className="splash-name">
      Job<span className="highlight">Vault</span>
    </div>

    {/* Tagline */}
    <div className="splash-tagline">Career Intelligence Platform</div>

    {/* Progress bar */}
    <div className="splash-progress-wrap">
      <div className="splash-progress-fill" />
    </div>

    {/* Dots */}
    <div className="splash-dots">
      <div className="splash-dot" />
      <div className="splash-dot" />
      <div className="splash-dot" />
    </div>

    {/* Version */}
    <div className="splash-version">v1.0 · JobVault</div>
  </div>
);

// ── Mount App ──
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
    <SplashScreen />
    <App />
  </>
);

// Remove splash from DOM after animation completes
setTimeout(() => {
  const splash = document.getElementById("splash-screen");
  if (splash) splash.remove();
}, 3600);

// ── Service Worker Registration ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("ServiceWorker registered:", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker failed:", error);
      });
  });
}