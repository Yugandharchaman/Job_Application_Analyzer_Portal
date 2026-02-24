import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";

// ─── CRITICAL FIX ────────────────────────────────────────────────────────────
// The beforeinstallprompt event fires VERY early — often before React even
// mounts. We MUST register the listener here, at the top of the file,
// BEFORE ReactDOM.createRoot(), so we never miss it.
// ─────────────────────────────────────────────────────────────────────────────
window.__pwaInstallPromptEvent = null;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent browser from showing its own mini-infobar automatically
  e.preventDefault();
  // Save the event globally so PWAInstallPrompt.jsx can access it any time
  window.__pwaInstallPromptEvent = e;
  // Dispatch a custom event so any mounted React component can react to it
  window.dispatchEvent(new Event("pwaInstallReady"));
  console.log("[PWA] beforeinstallprompt captured ✅");
});

window.addEventListener("appinstalled", () => {
  window.__pwaInstallPromptEvent = null;
  window.dispatchEvent(new Event("pwaInstalled"));
  console.log("[PWA] App installed successfully ✅");
});

// ─── React App ───────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// ─── Service Worker Registration ─────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("[SW] Registered ✅ scope:", registration.scope);

        // Check for updates on every page load
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[SW] New version available — will update on next visit.");
            }
          };
        };
      })
      .catch((error) => {
        console.error("[SW] Registration failed ❌:", error);
      });
  });
}