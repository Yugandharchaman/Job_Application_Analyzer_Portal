import { supabase } from '../supabaseClient';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Award, Eye, EyeOff, Layout, List, Calendar, Bell, FileText, XCircle, BookOpen, Share2, Activity, Zap, ArrowRight, Loader, Briefcase, CheckCircle } from 'react-feather';
import toast, { Toaster } from 'react-hot-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard"); 
      } else {
        setLoadingSession(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Real-time Forgot Password Logic
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const loadingToast = toast.loading("Verifying identity...");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message, { id: loadingToast });
    } else {
      toast.success("Recovery link dispatched to your inbox!", { id: loadingToast, duration: 5000 });
      setIsForgotMode(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isForgotMode) return handleForgotPassword(e);

    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const loadingToast = toast.loading(isLogin ? "Securing Session..." : "Initializing Profile...");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message, { id: loadingToast });
      } else {
        toast.success("Access Granted. Welcome back.", { id: loadingToast });
        navigate("/dashboard"); 
      }
    } else {
      const fullName = nameRef.current?.value;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (error) {
        toast.error(error.message, { id: loadingToast });
      } else if (data?.user?.identities?.length === 0) {
        toast.error("Account already exists. Switching to Login.", { id: loadingToast });
        setIsLogin(true);
      } else {
        // High-end Verification Logic
        toast.success("Account Created! Check email for verification link.", { 
          id: loadingToast,
          duration: 6000 
        });
        setIsLogin(true);
      }
    }
  };

  if (loadingSession) {
    return (
      <div style={{ background: '#020204', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', zIndex: 10000 }}>
        <Loader className="animate-spin" color="#6d28d9" size={40} />
      </div>
    );
  }

  return (
    <div className="auth-master-container">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Platform Mock Underlay for Aesthetic */}
      <div className="platform-underlay">
        <div className="mock-sidebar">
            <div className="mock-profile-circle"></div>
            <div className="mock-nav-item active"><Layout size={20}/></div>
            <div className="mock-nav-item"><List size={20}/></div>
            <div className="mock-nav-item"><Calendar size={20}/></div>
            <div className="mock-nav-item"><Bell size={20}/></div>
        </div>
        <div className="mock-content">
            <div className="mock-header"></div>
            <div className="mock-grid">
                <div className="mock-card"></div>
                <div className="mock-card"></div>
            </div>
            <div className="mock-big-chart"></div>
        </div>
        <div className="blur-overlay-layer"></div>
      </div>

      <Container className="d-flex align-items-center justify-content-center min-vh-100 auth-card-container">
        <div className="main-auth-card animate-fade-in">
          <Row className="g-0 h-100">
            {/* Left Branding Panel */}
            <Col lg={6} className="d-none d-lg-flex flex-column justify-content-center p-5 branding-inner">
              <div className="bento-icon"><Shield size={28} /></div>
              <h1 className="display-5 fw-800 text-white mb-3">Hire <span className="text-primary-glow">Faster.</span></h1>
              <p className="text-light-muted mb-4">The intelligent hub for high-growth career management.</p>
              
              {/* Feature: Verified Direct Carrier Access UI */}
              <div className="carrier-access-box mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div className="pulse-dot me-2"></div>
                    <span className="small fw-800 text-white uppercase-tracking">Direct Source Protocol</span>
                  </div>
                  <div className="verified-tag">
                    <CheckCircle size={10} className="me-1" /> Verified Source
                  </div>
                </div>
                
                <h5 className="text-white fw-bold mb-2" style={{ letterSpacing: '-0.5px' }}>
                  Authentic <span className="text-primary-glow">Carrier-Only</span> Intelligence
                </h5>
                
                <p className="extra-small text-light-muted mb-3" style={{ lineHeight: '1.6', opacity: '0.8' }}>
                  We bypass third-party boards. 100% of our roles are pulled in real-time 
                  directly from <strong>internal company career portals</strong>. Genuine jobs, direct from the source.
                </p>

                <div className="carrier-sync-indicator">
                  <div className="sync-line"></div>
                  <span className="text-secondary-muted" style={{ fontSize: '9px', fontWeight: '700' }}>
                    SYNCED WITH 500+ ENTERPRISE REPOSITORIES
                  </span>
                </div>
              </div>

              <div className="pulse-stats-card">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="mini-stat-box">
                      <Zap size={14} className="text-primary-glow mb-1"/>
                      <div className="stat-val">99.9%</div>
                      <div className="stat-label">Uptime</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mini-stat-box">
                      <Activity size={14} className="text-success mb-1"/>
                      <div className="stat-val">Secure</div>
                      <div className="stat-label">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Form Panel */}
            <Col lg={6} xs={12} className="p-4 p-md-5 d-flex flex-column justify-content-center form-inner">
              <div className="header-stack mb-4">
                <h2 className="fw-bold text-white mb-1">
                  {isForgotMode ? "Recover Account" : (isLogin ? "Welcome back" : "Get started")}
                </h2>
                <p className="text-secondary-muted small">
                  {isForgotMode ? "Request a secure password reset link" : (isLogin ? "Sign in to your private dashboard" : "Join the enterprise-grade hub today")}
                </p>
              </div>

              <Form onSubmit={handleAuthSubmit}>
                {!isLogin && !isForgotMode && (
                  <div className="input-group-modern mb-3">
                    <label>FULL NAME</label>
                    <input type="text" ref={nameRef} placeholder="Alex Rivera" required />
                  </div>
                )}
                
                <div className="input-group-modern mb-3">
                  <label>WORK EMAIL ADDRESS</label>
                  <input type="email" ref={emailRef} placeholder="alex@company.com" required />
                </div>

                {!isForgotMode && (
                  <div className="input-group-modern mb-4">
                    <div className="d-flex justify-content-between">
                      <label>SECURE PASSWORD</label>
                    </div>
                    <div className="password-wrapper" style={{ position: 'relative' }}>
                      <input type={showPassword ? "text" : "password"} ref={passwordRef} placeholder="••••••••" required style={{ width: '100%' }} />
                      <span className="eye-icon-toggle" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="premium-btn w-100 py-3 mb-3">
                  {isForgotMode ? "Send Recovery Link" : (isLogin ? "Authorize Access" : "Register Account")}
                  <ArrowRight size={18} className="ms-2" />
                </Button>

                {isForgotMode && (
                  <div className="text-center">
                    <span className="toggle-btn-text" onClick={() => setIsForgotMode(false)}>Return to Security Login</span>
                  </div>
                )}
              </Form>

              {!isForgotMode && (
                <div className="text-center mt-4">
                  <p className="text-secondary-muted small">
                    {isLogin ? "New to the platform?" : "Already verified?"}
                    <span className="ms-2 toggle-btn-text" onClick={() => setIsLogin(!isLogin)}>
                      {isLogin ? "Create credentials" : "Log in"}
                    </span>
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </Container>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .auth-master-container {
            font-family: 'Plus Jakarta Sans', sans-serif;
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: #020204;
            color: #fff;
            z-index: 9999;
            overflow: hidden;
          }

          /* High-End Carrier Box Styles */
          .carrier-access-box {
            background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 24px;
            position: relative;
          }

          .verified-tag {
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
            padding: 2px 10px;
            border-radius: 100px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid rgba(34, 197, 94, 0.2);
            display: flex;
            align-items: center;
          }

          .pulse-dot {
            width: 8px;
            height: 8px;
            background: #a78bfa;
            border-radius: 50%;
            box-shadow: 0 0 10px #a78bfa;
            animation: pulse-ring 2s infinite;
          }

          @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(167, 139, 250, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
          }

          .carrier-sync-indicator {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.05);
          }

          .sync-line {
            height: 2px;
            width: 40px;
            background: #6d28d9;
            border-radius: 2px;
            position: relative;
            overflow: hidden;
          }

          .sync-line::after {
            content: '';
            position: absolute;
            left: 0; top: 0; height: 100%; width: 15px;
            background: #fff;
            filter: blur(3px);
            animation: move-glow 2.5s infinite linear;
          }

          @keyframes move-glow {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          /* Aesthetic Mock Background */
          .platform-underlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; z-index: 1; opacity: 0.15; pointer-events: none; }
          .mock-sidebar { width: 80px; background: #08080a; border-right: 1px solid #1a1a1c; display: flex; flex-direction: column; align-items: center; padding-top: 30px; gap: 25px; }
          .mock-profile-circle { width: 42px; height: 42px; border-radius: 50%; background: #1a1a1c; }
          .mock-content { flex: 1; padding: 60px; background: #0c0c0e; }
          .mock-header { height: 40px; width: 300px; background: #1a1a1c; border-radius: 10px; margin-bottom: 60px; }
          .mock-grid { display: flex; gap: 24px; margin-bottom: 40px; }
          .mock-card { flex: 1; height: 160px; background: #141416; border-radius: 16px; }
          .mock-big-chart { width: 100%; height: 300px; background: #141416; border-radius: 20px; }
          .blur-overlay-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(15px); background: rgba(0,0,0,0.6); z-index: 2; }

          /* Layout & Components */
          .auth-card-container { position: relative; z-index: 10; }
          .main-auth-card { width: 95%; max-width: 1000px; background: rgba(10, 10, 12, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,0.7); }
          .branding-inner { background: rgba(255,255,255,0.01); border-right: 1px solid rgba(255,255,255,0.05); }
          .text-primary-glow { color: #a78bfa; text-shadow: 0 0 20px rgba(167, 139, 250, 0.4); }
          .pulse-stats-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 15px; }
          .mini-stat-box { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 10px; }
          .stat-val { font-size: 16px; font-weight: 800; }
          .stat-label { font-size: 9px; color: #71717a; text-transform: uppercase; }

          .input-group-modern label { font-size: 10px; font-weight: 800; color: #71717a; margin-bottom: 8px; display: block; letter-spacing: 0.5px; }
          .input-group-modern input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px 16px; color: #fff; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .input-group-modern input:focus { border-color: #6d28d9; outline: none; background: rgba(109, 40, 217, 0.05); box-shadow: 0 0 20px rgba(109, 40, 217, 0.1); }
          
          .premium-btn { background: #6d28d9 !important; border: none; border-radius: 14px; font-weight: 700; transition: all 0.3s; }
          .premium-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(109, 40, 217, 0.4); opacity: 0.9; }
          .toggle-btn-text { color: #fff; font-weight: 700; cursor: pointer; border-bottom: 1px solid #6d28d9; font-size: 13px; }
          .x-small { font-size: 11px; }
          
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          
          .uppercase-tracking { text-transform: uppercase; letter-spacing: 1.2px; font-size: 10px; }
          .extra-small { font-size: 11px; }
        `}
      </style>
    </div>
  );
};

export default AuthPage;