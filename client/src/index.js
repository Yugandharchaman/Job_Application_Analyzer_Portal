import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/dashboard.css";
import "./styles/responsive.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// PWA Service Worker registration has been removed from here.