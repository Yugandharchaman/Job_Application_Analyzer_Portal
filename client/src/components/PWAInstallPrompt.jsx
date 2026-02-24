import React, { useState, useEffect } from "react";

/* =====================================================
   PWAInstallPrompt.jsx
   - Android/Chrome: shows native install prompt via beforeinstallprompt
   - iOS Safari: shows manual "Share → Add to Home Screen" instructions
   - Remembers if user dismissed (doesn't spam)
   - Auto-hides after 15 seconds
   ===================================================== */

const DISMISSED_KEY = "pwa_install_dismissed_at";
const REMIND_AFTER_DAYS = 3; // re-show after 3 days

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const shouldShowAgain = () => {
  const dismissed = localStorage.getItem(DISMISSED_KEY);
  if (!dismissed) return true;
  const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
  return daysSince >= REMIND_AFTER_DAYS;
};

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA — don't show anything
    if (isInStandaloneMode()) return;
    // User dismissed recently — don't spam
    if (!shouldShowAgain()) return;

    const ios = isIOS();
    setIsIOSDevice(ios);

    if (ios) {
      // iOS: no event, just show manual instructions after a short delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome / Edge — wait for browser event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so user has time to interact with the page first
      setTimeout(() => setShowBanner(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also detect when app is installed by user via browser UI
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Auto-hide after 15 seconds
  useEffect(() => {
    if (!showBanner) return;
    const autoHide = setTimeout(() => handleDismiss(), 15000);
    return () => clearTimeout(autoHide);
  }, [showBanner]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setTimeout(() => setShowBanner(false), 2000);
    } else {
      setInstalling(false);
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-slide-up {
          from { transform: translateY(120px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes pwa-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(108,93,223,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(108,93,223,0); }
        }
        @keyframes pwa-spin {
          to { transform: rotate(360deg); }
        }
        .pwa-banner {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          width: min(420px, calc(100vw - 24px));
          background: linear-gradient(135deg, #1a1040 0%, #0f0a2e 100%);
          border: 1px solid rgba(108,93,223,0.4);
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05);
          animation: pwa-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .pwa-glow-bar {
          height: 3px;
          background: linear-gradient(90deg, #6c5ddf, #a78bfa, #6c5ddf);
          background-size: 200%;
          animation: pwa-pulse 2s infinite, shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .pwa-body {
          padding: 18px 20px 20px;
        }
        .pwa-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(108,93,223,0.2);
          border: 1.5px solid rgba(108,93,223,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
          animation: pwa-pulse 2.5s infinite;
        }
        .pwa-title {
          font-size: 1rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 2px;
        }
        .pwa-subtitle {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 0;
        }
        .pwa-badge {
          background: linear-gradient(135deg, #6c5ddf, #a78bfa);
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pwa-features {
          display: flex;
          gap: 8px;
          margin: 14px 0;
          flex-wrap: wrap;
        }
        .pwa-feature-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 0.75rem;
          color: #cbd5e1;
          font-weight: 600;
        }
        .pwa-btn-install {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6c5ddf 0%, #8b5cf6 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }
        .pwa-btn-install:hover {
          background: linear-gradient(135deg, #5a4dbf 0%, #7c3aed 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(108,93,223,0.4);
        }
        .pwa-btn-install:active { transform: translateY(0); }
        .pwa-btn-install.success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        .pwa-btn-dismiss {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 8px 0 0;
          width: 100%;
          text-align: center;
          transition: color 0.2s;
        }
        .pwa-btn-dismiss:hover { color: #94a3b8; }
        .pwa-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: all 0.2s;
          line-height: 1;
        }
        .pwa-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .pwa-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pwa-spin 0.7s linear infinite;
        }
        /* iOS instruction box */
        .pwa-ios-steps {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          margin: 14px 0;
        }
        .pwa-ios-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: #cbd5e1;
          padding: 5px 0;
          font-weight: 500;
        }
        .pwa-ios-num {
          width: 22px; height: 22px;
          background: rgba(108,93,223,0.35);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: #a78bfa;
          flex-shrink: 0;
        }
      `}</style>

      <div className="pwa-banner" role="dialog" aria-label="Install App">
        <div className="pwa-glow-bar" />

        <div className="pwa-body" style={{ position: "relative" }}>
          <button className="pwa-close" onClick={handleDismiss} aria-label="Close">✕</button>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "4px" }}>
            <div className="pwa-icon-wrap">💼</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                <p className="pwa-title">Install Job Analyzer</p>
                <span className="pwa-badge">Free</span>
              </div>
              <p className="pwa-subtitle">Add to home screen for the best experience</p>
            </div>
          </div>

          {/* Feature chips */}
          <div className="pwa-features">
            <div className="pwa-feature-chip">⚡ Works Offline</div>
            <div className="pwa-feature-chip">🔔 Notifications</div>
            <div className="pwa-feature-chip">🚀 App Speed</div>
            <div className="pwa-feature-chip">📱 Native Feel</div>
          </div>

          {/* iOS — manual instructions */}
          {isIOSDevice ? (
            <>
              <div className="pwa-ios-steps">
                <div className="pwa-ios-step">
                  <div className="pwa-ios-num">1</div>
                  Tap the <strong style={{ color: "#fff", margin: "0 4px" }}>Share</strong> button
                  <span style={{ fontSize: "18px", marginLeft: "2px" }}>⎙</span> at the bottom
                </div>
                <div className="pwa-ios-step">
                  <div className="pwa-ios-num">2</div>
                  Scroll down and tap <strong style={{ color: "#fff", margin: "0 4px" }}>"Add to Home Screen"</strong>
                </div>
                <div className="pwa-ios-step">
                  <div className="pwa-ios-num">3</div>
                  Tap <strong style={{ color: "#fff", margin: "0 4px" }}>"Add"</strong> in the top right — done! 🎉
                </div>
              </div>
              <button className="pwa-btn-dismiss" onClick={handleDismiss}>
                Maybe later
              </button>
            </>
          ) : (
            /* Android / Desktop — native prompt */
            <>
              <button
                className={`pwa-btn-install ${installed ? "success" : ""}`}
                onClick={handleInstall}
                disabled={installing || installed}
              >
                {installed ? (
                  <> ✓ Installed Successfully!</>
                ) : installing ? (
                  <><div className="pwa-spinner" /> Installing...</>
                ) : (
                  <> ⬇ Install App — It's Free</>
                )}
              </button>
              <button className="pwa-btn-dismiss" onClick={handleDismiss}>
                No thanks, I'll use the browser
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PWAInstallPrompt;