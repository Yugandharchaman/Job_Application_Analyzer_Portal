import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {ArrowRight, Loader} from 'react-feather';
import toast, { Toaster } from 'react-hot-toast';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const navigate = useNavigate();

  // NEW: Check if user came from password reset email link
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          toast.error('Invalid or expired reset link');
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }

        // Check if this is a password recovery session
        if (session && session.user) {
          setIsValidRecovery(true);
        } else {
          toast.error('Please use the reset link from your email');
          setTimeout(() => navigate('/auth'), 2000);
        }
      } catch (err) {
        console.error('Recovery check failed:', err);
        toast.error('Unable to verify reset link');
        setTimeout(() => navigate('/auth'), 2000);
      } finally {
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, [navigate]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating security credentials...");

    try {
      // Core Supabase logic to update password for the recovery session
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        toast.error(error.message, { id: loadingToast });
        setLoading(false);
      } else {
        toast.success("Identity Secured! Password updated successfully.", { id: loadingToast });
        // Redirect to auth page after 2 seconds
        setTimeout(() => navigate("/auth"), 2000);
      }
    } catch (err) {
      toast.error("Failed to update password. Please try again.", { id: loadingToast });
      setLoading(false);
    }
  };

  // Show loading while checking recovery session
  if (checkingSession) {
    return (
      <div className="auth-master-container" style={{ background: '#020204', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin" color="#6d28d9" size={40} />
      </div>
    );
  }

  // Only show reset form if valid recovery session
  if (!isValidRecovery) {
    return null; // Will redirect to auth
  }

  return (
    <div className="auth-master-container" style={{ background: '#020204', height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Toaster position="top-center" />
      
      <Container className="d-flex justify-content-center">
        <div className="glowing-wrapper animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="main-auth-card p-5" style={{ background: '#0a0a0c', borderRadius: '32px', border: '1px solid rgba(109, 40, 217, 0.3)' }}>
            <div className="text-center mb-4">
              <div className="pulse-dot m-auto mb-3" style={{ width: '12px', height: '12px', background: '#a78bfa', borderRadius: '50%', boxShadow: '0 0 10px #a78bfa' }}></div>
              <h2 className="fw-bold text-white">New Credentials</h2>
              <p className="text-secondary-muted small">Enter your updated encryption key below</p>
            </div>

            <Form onSubmit={handlePasswordUpdate}>
              <div className="input-group-modern mb-3">
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#71717a', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>NEW PASSWORD</label>
                <input 
                  type="password" 
                  ref={passwordRef} 
                  placeholder="••••••••" 
                  required 
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '14px', 
                    padding: '14px 16px', 
                    color: '#fff' 
                  }}
                />
              </div>

              <div className="input-group-modern mb-4">
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#71717a', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>CONFIRM NEW PASSWORD</label>
                <input 
                  type="password" 
                  ref={confirmPasswordRef} 
                  placeholder="••••••••" 
                  required 
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '14px', 
                    padding: '14px 16px', 
                    color: '#fff' 
                  }}
                />
              </div>

              <Button 
                type="submit" 
                className="premium-btn w-100 py-3 d-flex align-items-center justify-content-center" 
                disabled={loading}
                style={{ 
                  background: '#6d28d9', 
                  border: 'none', 
                  borderRadius: '14px', 
                  fontWeight: '700' 
                }}
              >
                {loading ? <Loader className="animate-spin" size={18} /> : "Update Identity"}
                {!loading && <ArrowRight size={18} className="ms-2" />}
              </Button>
            </Form>
          </div>
        </div>
      </Container>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .auth-master-container {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }

          .glowing-wrapper {
            position: relative;
            padding: 2px;
            border-radius: 34px;
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 280deg,
              #6d28d9 310deg,
              #a78bfa 340deg,
              #6d28d9 360deg
            );
            animation: rotate-border 4s linear infinite;
          }

          @keyframes rotate-border {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .main-auth-card {
            position: relative;
            z-index: 1;
          }

          .text-secondary-muted {
            color: #71717a;
          }

          .input-group-modern input:focus {
            border-color: #6d28d9 !important;
            outline: none;
            background: rgba(109, 40, 217, 0.05) !important;
            box-shadow: 0 0 20px rgba(109, 40, 217, 0.1);
          }

          .premium-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(109, 40, 217, 0.4);
            opacity: 0.9;
          }

          .animate-spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ResetPassword;