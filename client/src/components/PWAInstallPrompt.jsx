import React, { useState, useEffect, useRef } from "react";

/* =====================================================
   PWAInstallPrompt.jsx  — v3 (bulletproof)

   ROOT CAUSES FIXED:
   1. beforeinstallprompt captured in index.js (top-level)
      before React mounts — stored on window.__pwaInstallPromptEvent
   2. Component reads window global on mount, so it never misses it
   3. Listens to custom "pwaInstallReady" event for late fires
   4. iOS detection + manual instructions
   5. Respects 3-day dismiss cooldown via localStorage
   6. Auto-hides after 16 seconds
   7. Works on localhost AND production HTTPS
   ===================================================== */

const DISMISSED_KEY  = "pwa_dismissed_at";
const REMIND_DAYS    = 3;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const wasDismissedRecently = () => {
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  const daysSince = (Date.now() - parseInt(ts, 10)) / 86400000;
  return daysSince < REMIND_DAYS;
};

export default function PWAInstallPrompt() {
  const [visible,    setVisible]    = useState(false);
  const [isIOSDev,   setIsIOSDev]   = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed,  setInstalled]  = useState(false);
  const timerRef = useRef(null);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const startAutoHide = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, 16000);
  };

  const tryShow = () => {
    if (isInStandaloneMode()) return;   // already installed
    if (wasDismissedRecently())  return; // user said no recently

    const ios = isIOS();
    setIsIOSDev(ios);

    if (ios) {
      // iOS has no event — just show instructions
      setTimeout(() => { setVisible(true); startAutoHide(); }, 3500);
      return;
    }

    // Android/Desktop — only show if we have the deferred prompt
    if (window.__pwaInstallPromptEvent) {
      setTimeout(() => { setVisible(true); startAutoHide(); }, 3000);
    }
  };

  useEffect(() => {
    // Try immediately (event may have fired before component mounted)
    tryShow();

    // Also listen for it firing after mount
    const onReady = () => tryShow();
    const onInstalled = () => { setInstalled(true); setTimeout(() => setVisible(false), 2000); };

    window.addEventListener("pwaInstallReady", onReady);
    window.addEventListener("pwaInstalled",    onInstalled);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("pwaInstallReady", onReady);
      window.removeEventListener("pwaInstalled",    onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = window.__pwaInstallPromptEvent;
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        window.__pwaInstallPromptEvent = null;
        setTimeout(() => setVisible(false), 2000);
      } else {
        setInstalling(false);
        dismiss();
      }
    } catch (err) {
      console.error("[PWA] prompt() error:", err);
      setInstalling(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-up {
          from { transform: translateX(-50%) translateY(110px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }
        @keyframes pwa-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(108,93,223,.45); }
          50%      { box-shadow: 0 0 0 10px rgba(108,93,223,0); }
        }
        @keyframes pwa-spin { to { transform: rotate(360deg); } }
        @keyframes pwa-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .pwa-wrap {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999999;
          width: min(430px, calc(100vw - 20px));
          background: linear-gradient(145deg, #16103a 0%, #0d0826 100%);
          border: 1px solid rgba(108,93,223,.45);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04);
          animation: pwa-up .5s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        .pwa-bar {
          height: 3px;
          background: linear-gradient(90deg,#6c5ddf,#a78bfa,#6c5ddf);
          background-size: 200%;
          animation: pwa-shimmer 2s linear infinite;
        }
        .pwa-inner { padding: 18px 20px 20px; position: relative; }

        .pwa-close {
          position: absolute; top: 14px; right: 14px;
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(255,255,255,.07); border: none;
          color: #64748b; cursor: pointer; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s; line-height: 1;
        }
        .pwa-close:hover { background: rgba(255,255,255,.18); color: #fff; }

        .pwa-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(108,93,223,.2);
          border: 1.5px solid rgba(108,93,223,.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0;
          animation: pwa-glow 2.5s infinite;
        }
        .pwa-title  { font-size: 1rem; font-weight: 800; color: #fff; margin: 0 0 2px; }
        .pwa-sub    { font-size: .78rem; color: #94a3b8; margin: 0; }
        .pwa-badge  {
          background: linear-gradient(135deg,#6c5ddf,#a78bfa);
          color: #fff; font-size: .6rem; font-weight: 800;
          padding: 3px 9px; border-radius: 20px;
          letter-spacing: .5px; text-transform: uppercase; white-space: nowrap;
        }
        .pwa-chips { display: flex; gap: 7px; margin: 13px 0; flex-wrap: wrap; }
        .pwa-chip  {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px; padding: 5px 10px;
          font-size: .74rem; color: #cbd5e1; font-weight: 600;
        }

        .pwa-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg,#6c5ddf 0%,#8b5cf6 100%);
          color: #fff; border: none; border-radius: 12px;
          font-size: .92rem; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all .2s ease; letter-spacing: .3px;
        }
        .pwa-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#5a4dbf 0%,#7c3aed 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(108,93,223,.45);
        }
        .pwa-btn:disabled { opacity: .75; cursor: not-allowed; transform: none; }
        .pwa-btn.done { background: linear-gradient(135deg,#22c55e,#16a34a); }

        .pwa-later {
          background: none; border: none; color: #475569;
          font-size: .8rem; cursor: pointer; padding: 9px 0 0;
          width: 100%; text-align: center; transition: color .2s;
          display: block;
        }
        .pwa-later:hover { color: #94a3b8; }

        .pwa-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: pwa-spin .7s linear infinite;
        }

        /* iOS steps */
        .pwa-ios-box {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; padding: 13px 15px; margin: 13px 0;
        }
        .pwa-ios-row {
          display: flex; align-items: center; gap: 10px;
          font-size: .82rem; color: #cbd5e1; padding: 5px 0; font-weight: 500;
        }
        .pwa-ios-num {
          width: 22px; height: 22px; background: rgba(108,93,223,.35);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: .7rem; font-weight: 800; color: #a78bfa; flex-shrink: 0;
        }
      `}</style>

      <div className="pwa-wrap" role="dialog" aria-label="Install App">
        <div className="pwa-bar" />
        <div className="pwa-inner">
          <button className="pwa-close" onClick={dismiss} aria-label="Close">✕</button>

          {/* Header row */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:4 }}>
            <div className="pwa-icon">💼</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                <p className="pwa-title">Install Job Analyzer</p>
                <span className="pwa-badge">Free</span>
              </div>
              <p className="pwa-sub">Add to home screen for the best experience</p>
            </div>
          </div>

          {/* Feature chips */}
          <div className="pwa-chips">
            <div className="pwa-chip">⚡ Works Offline</div>
            <div className="pwa-chip">🔔 Notifications</div>
            <div className="pwa-chip">🚀 App Speed</div>
            <div className="pwa-chip">📱 Native Feel</div>
          </div>

          {isIOSDev ? (
            /* ── iOS manual steps ── */
            <>
              <div className="pwa-ios-box">
                <div className="pwa-ios-row">
                  <div className="pwa-ios-num">1</div>
                  Tap <strong style={{ color:"#fff", margin:"0 4px" }}>Share</strong>
                  <span style={{ fontSize:18 }}>⎙</span> at the bottom of Safari
                </div>
                <div className="pwa-ios-row">
                  <div className="pwa-ios-num">2</div>
                  Scroll and tap <strong style={{ color:"#fff", margin:"0 4px" }}>"Add to Home Screen"</strong>
                </div>
                <div className="pwa-ios-row">
                  <div className="pwa-ios-num">3</div>
                  Tap <strong style={{ color:"#fff", margin:"0 4px" }}>"Add"</strong> — done! 🎉
                </div>
              </div>
              <button className="pwa-later" onClick={dismiss}>Maybe later</button>
            </>
          ) : (
            /* ── Android / Desktop native prompt ── */
            <>
              <button
                className={`pwa-btn ${installed ? "done" : ""}`}
                onClick={handleInstall}
                disabled={installing || installed}
              >
                {installed  ? "✓ Installed Successfully!" :
                 installing ? <><div className="pwa-spinner" /> Installing…</> :
                              "⬇ Install App — It's Free"}
              </button>
              <button className="pwa-later" onClick={dismiss}>
                No thanks, continue in browser
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}