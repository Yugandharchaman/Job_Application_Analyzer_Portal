import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

// Components & Pages
import SideNavbar from "./components/SideNavbar";
import Dashboard from "./pages/Dashboard";
import JobForm from "./components/JobForm";      
import AddedJobs from "./pages/AddedJobs"; 
import CalendarPage from "./pages/CalendarPage"; 
import ReminderPage from "./pages/ReminderPage"; 
import Rejections from "./pages/Rejections";
import Notes from "./pages/Notes";
import Resources from "./pages/Resources";
import RecentJobs from "./pages/RecentJobs";    
import NetworkNode from "./pages/NetworkNode"; 
import AuthPage from "./pages/AuthPage";
import InterviewExperience from "./pages/InterviewExperience";
import ResetPassword from "./pages/ResetPassword";

// --- PROTECTED ROUTE COMPONENT ---
// Blocks access to Dashboard/Jobs if NOT logged in
const ProtectedRoute = ({ children, session }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// --- PUBLIC ROUTE COMPONENT ---
// Blocks access to Login/Register if ALREADY logged in
const PublicRoute = ({ children, session }) => {
  if (session) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for Auth Changes (Login, Logout, Session Expired)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing (or a spinner) while checking if user is logged in
  if (loading) {
    return (
      <div style={{ background: "#020204", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
         <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <Router>
      {/* Sidebar only appears when a valid session exists */}
      {session && <SideNavbar />}

      <div
        className="page-content"
        style={{
          // Margin adjusts automatically based on login status
          marginLeft: session ? "240px" : "0px", 
          padding: session ? "24px" : "0px",
          minHeight: "100vh",
          backgroundColor: session ? "#f6f7fb" : "#020204",
          transition: "margin-left 0.3s ease", // Smooth transition when logging in
        }}
      >
        <Routes>
          {/* Auth Route: If logged in, sends user to Dashboard */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute session={session}>
                <AuthPage />
              </PublicRoute>
            } 
          />

          {/* MODIFIED: Reset Password Route - PUBLIC (no auth required) */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes: If NOT logged in, sends user to /auth */}
          <Route path="/" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
          <Route path="/add-job" element={<ProtectedRoute session={session}><JobForm /></ProtectedRoute>} />
          <Route path="/added-jobs" element={<ProtectedRoute session={session}><AddedJobs /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute session={session}><CalendarPage /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute session={session}><ReminderPage /></ProtectedRoute>} />
          <Route path="/rejections" element={<ProtectedRoute session={session}><Rejections /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute session={session}><Notes /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute session={session}><Resources /></ProtectedRoute>} />
          <Route path="/recent-jobs" element={<ProtectedRoute session={session}><RecentJobs /></ProtectedRoute>} />
          <Route path="/interview-experience" element={<ProtectedRoute session={session}><InterviewExperience /></ProtectedRoute>} />
          <Route path="/connect" element={<ProtectedRoute session={session}><NetworkNode /></ProtectedRoute>} /> 

          {/* Catch-all: Redirects any typos or unknown URLs to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;