import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/dashboard.css";
import "./styles/responsive.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// --- STEP-B: SERVICE WORKER REGISTRATION ---
// This enables the "Install" prompt for Mobile, Laptop, and Desktop.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed: ", error);
      });
  });
}