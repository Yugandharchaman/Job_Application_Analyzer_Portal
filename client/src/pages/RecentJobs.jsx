import React, { useState, useEffect, useRef } from "react";
import { Card, Badge } from "react-bootstrap";
import { 
  ExternalLink, Shield, Globe, 
  ChevronLeft, ChevronRight, Layers,
  Cpu, Activity
} from "react-feather";

const RecentJobs = () => {
  const [loading, setLoading] = useState(true);
  const [loadStep, setLoadStep] = useState(0);
  const scrollRef = useRef(null);

  const platforms = [
    { name: "LinkedIn", color: "#0077B5", url: "https://www.linkedin.com/jobs/" },
    { name: "Internshala", color: "#00A5EC", url: "https://internshala.com/" },
    { name: "Wellfound", color: "#000000", url: "https://wellfound.com/jobs" },
    { name: "Unstop", color: "#1C4980", url: "https://unstop.com/" },
    { name: "Indeed", color: "#2164f3", url: "https://www.indeed.com/" },
    { name: "Naukri", color: "#2d2d2d", url: "https://www.naukri.com/" },
    { name: "Instahyre", color: "#303ab2", url: "https://www.instahyre.com/" },
    { name: "Glassdoor", color: "#0caa41", url: "https://www.glassdoor.com/" },
    { name: "Foundit", color: "#6e16f3", url: "https://www.foundit.in/" },
    { name: "SuperSet", color: "#f26522", url: "https://app.joinsuperset.com/students/login" },
  ];

  useEffect(() => {
    // Simulating technical steps for professionalism
    const interval = setInterval(() => {
      setLoadStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 600);

    const timer = setTimeout(() => {
      setLoading(false);
      clearInterval(interval);
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // NEW PROFESSIONAL LOADER COMPONENT
  const ProfessionalLoader = () => (
    <div className="system-loader-container">
      <div className="orbit-container">
        <div className="orbit-ring"></div>
        <div className="orbit-ring-inner"></div>
        <Cpu size={32} className="processor-icon" />
      </div>
      <div className="terminal-text">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <Activity size={14} className="text-primary" />
          <span className="step-text">
            {loadStep === 0 && "ESTABLISHING SECURE HANDSHAKE..."}
            {loadStep === 1 && "QUERYING GLOBAL JOB REPOSITORIES..."}
            {loadStep === 2 && "VERIFYING CORPORATE SSL ENDPOINTS..."}
            {loadStep >= 3 && "SYNCING LIVE FEED..."}
          </span>
        </div>
        <div className="progress-mini">
          <div className="progress-mini-fill" style={{ width: `${(loadStep + 1) * 25}%` }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      marginLeft: "50px", 
      padding: "40px 20px", 
      background: "#f8f9fc", 
      minHeight: "100vh",
      width: "calc(100% - 80px)", 
    }}>
      <style>
        {`
          /* NEW PROFESSIONAL LOADING STYLES */
          .system-loader-container {
            padding: 40px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .orbit-container {
            position: relative;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 25px;
          }
          .orbit-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(108, 93, 255, 0.1);
            border-top: 2px solid #6c5dff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .orbit-ring-inner {
            position: absolute;
            width: 70%;
            height: 70%;
            border: 1px dashed rgba(108, 93, 255, 0.3);
            border-radius: 50%;
            animation: spin-reverse 2s linear infinite;
          }
          .processor-icon {
            color: #6c5dff;
            animation: pulse-glow 1.5s infinite ease-in-out;
          }
          .terminal-text {
            font-family: 'Monaco', 'Consolas', monospace;
            text-align: center;
          }
          .step-text {
            font-size: 11px;
            letter-spacing: 1px;
            color: #475569;
            font-weight: 600;
          }
          .progress-mini {
            width: 200px;
            height: 2px;
            background: #e2e8f0;
            margin: 10px auto;
            border-radius: 10px;
            overflow: hidden;
          }
          .progress-mini-fill {
            height: 100%;
            background: #6c5dff;
            transition: width 0.4s ease;
          }

          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
          @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 2px rgba(108, 93, 255, 0)); }
            50% { filter: drop-shadow(0 0 8px rgba(108, 93, 255, 0.5)); }
          }

          /* PRE-EXISTING STYLES WITH GRADIENTS */
          .platform-scroller {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 30px 0;
            width: 100%;
          }
          .scroll-area {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            scroll-behavior: smooth;
            scrollbar-width: none;
            padding: 10px 5px;
          }
          .scroll-area::-webkit-scrollbar { display: none; }
          
          .nav-btn {
            width: 35px; height: 35px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid #eee;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            flex-shrink: 0;
            transition: all 0.3s ease;
          }
          .nav-btn:hover { 
            background: linear-gradient(135deg, #6c5dff 0%, #3f3697 100%); 
            color: #fff; 
            transform: scale(1.1);
          }

          .platform-item {
            min-width: 160px;
            background: #fff;
            border-radius: 12px;
            padding: 12px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none !important;
            color: #333;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            border: 1px solid #f0f0f0;
            transition: all 0.2s ease;
          }
          .platform-item:hover {
            border-color: #6c5dff;
            transform: translateY(-2px);
          }

          /* ENHANCED SECURITY CARD GRADIENT */
          .disclaimer-card {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #310d0d 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 40px;
            border-left: 6px solid #ef4444; 
            position: relative;
            overflow: hidden;
          }
          .disclaimer-card::after {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 150px; height: 150px;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
            pointer-events: none;
          }
        `}
      </style>

      {/* Header */}
      <div className="mb-0">
        <h1 className="fw-bold" style={{ fontSize: '2.5rem', letterSpacing: '-1.5px', color: '#0f172a' }}>Recent Openings</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Direct access to career opportunities within premier corporate ecosystems.</p>
      </div>

      {/* Platforms */}
      <div className="platform-scroller">
        <div className="nav-btn" onClick={() => scroll("left")}><ChevronLeft size={18} /></div>
        <div className="scroll-area" ref={scrollRef}>
          {platforms.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" className="platform-item">
              <div style={{ background: `${p.color}15`, padding: '6px', borderRadius: '50%' }}>
                <Globe size={16} style={{ color: p.color }} />
              </div>
              <span style={{ fontSize: '14px' }}>{p.name}</span>
              <ExternalLink size={12} className="ms-auto opacity-25" />
            </a>
          ))}
        </div>
        <div className="nav-btn" onClick={() => scroll("right")}><ChevronRight size={18} /></div>
      </div>

      {/* Professional Payment Disclaimer Box */}
      <div className="disclaimer-card shadow-lg">
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <Shield size={32} color="#70d1da" />
        </div>
        <div style={{ zIndex: 1 }}>
          <h5 className="fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1.5px', color: '#70d1da' }}>SECURE NAVIGATION & ANTI-FRAUD DIRECTIVE</h5>
          <p className="mb-0 text-white-50 small font-italic" style={{ lineHeight: '1.6' }}>
            <strong>Disclaimer:</strong>This platform serves as a navigational bridge to official career portals. 
            We do not facilitate, authorize, or accept responsibility for any financial transactions. 
            Engagement in such requests is at the user's own risk.</p>
        </div>
      </div>

      {/* Main Jobs Area */}
      <div>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h3 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Direct Career Openings</h3>
          <Badge className="px-3 py-2 border" style={{ background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#64748b' }}>
            {loading ? "SYSTEM ENGINE BOOTING..." : "UNDER DEVELOPMENT"}
          </Badge>
        </div>

        <Card className="border-0 shadow-sm p-5 text-center" style={{ borderRadius: '24px', background: '#ffffff' }}>
          {loading ? (
            <ProfessionalLoader />
          ) : (
            <div className="py-4 animate__animated animate__fadeIn">
              <Layers size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Proprietary Job Feed Initializing</h5>
              <p className="text-muted mx-auto" style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                We are currently indexing verified corporate assets to provide a real-time stream of 
                unfiltered career opportunities directly from the source.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RecentJobs;