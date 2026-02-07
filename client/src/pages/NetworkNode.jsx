import React, { useState, useEffect } from "react";
import { Row, Col, Container, Toast, ToastContainer, Form, Button } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import { 
  GitHub, Linkedin, Mail, ArrowRight, 
  Globe, Shield,
  Clock, Zap, Code, Briefcase, Check, Smartphone as MobileIcon,
  MessageSquare, Send
} from "react-feather";

const NetworkNode = () => {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Normal Loading Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleEmailAction = () => {
    const email = "career.entry.hub@gmail.com";
    
    // Strictly copy to clipboard only
    navigator.clipboard.writeText(email).then(() => {
      // Trigger Toaster Popup
      setShowToast(true);
    });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSending(true);

    // --- EmailJS Logic ---
    // Replace these with your actual IDs from the EmailJS Dashboard
    const SERVICE_ID = "service_exmomhv"; 
    const TEMPLATE_ID = "template_zzx8rx5";
    const PUBLIC_KEY = "MxBE0u0w7vfq2tYrf";

    const templateParams = {
      from_name: "Portfolio Visitor",
      message: feedback,
      reply_to: "career.entry.hub@gmail.com",
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        setIsSending(false);
        setFeedback("");
        alert("Feedback sent! Thank you for your suggestion.");
      })
      .catch((error) => {
        setIsSending(false);
        console.error("EmailJS Error:", error);
        alert("Failed to send feedback. Please try again later.");
      });
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh", background: "#fff" }}>
        <style>{`
          .spinner {
            width: 40px; height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6c5dff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "40px 0", 
      background: "#ffffff", 
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <style>{`
        html, body { overflow-x: hidden; width: 100%; position: relative; }

        .glass-card {
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 32px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
        }

        .hover-card:hover {
          transform: translateY(-8px);
          border-color: #6c5dff;
          box-shadow: 0 15px 30px rgba(108, 93, 255, 0.1);
          background: #fff;
        }

        .hero-title {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1;
          color: #000;
        }

        .social-btn {
          width: 100%;
          padding: 25px;
          border-radius: 24px;
          background: #f5f5f7;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: 0.3s;
          text-decoration: none !important;
          margin-bottom: 15px;
          color: #000;
        }

        .social-btn:hover {
          background: #000;
          color: #fff !important;
        }

        .circle-blur {
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(108, 93, 255, 0.05);
          filter: blur(80px);
          border-radius: 50%;
          z-index: -1;
          top: -100px;
          right: -100px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          background: #f0fdf4;
          color: #16a34a;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .custom-toast {
          background: #000 !important;
          color: #fff !important;
          border-radius: 16px !important;
          border: 1px solid #333 !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25) !important;
        }

        .feedback-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 15px;
          resize: none;
          transition: 0.3s;
        }

        .feedback-input:focus {
          background: #fff;
          border-color: #6c5dff;
          box-shadow: 0 0 0 4px rgba(108, 93, 255, 0.1);
          outline: none;
        }
      `}</style>

      {/* --- Fixed Top Toaster --- */}
      <ToastContainer 
        position="top-center" 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 9999,
          width: 'auto'
        }}
      >
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={2500} 
          autohide 
          className="custom-toast mt-3"
        >
          <Toast.Body className="d-flex align-items-center justify-content-center gap-3 py-3 px-4">
            <Check size={20} color="#6c5dff" />
            <span className="fw-bold" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Email Copied!</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Container>
        <div className="position-relative">
          <div className="circle-blur"></div>
          
          <Row className="mb-5 gx-0">
            <Col lg={12}>
              <div className="status-badge">
                <span className="me-2">●</span> AVAILABLE FOR NEW PROJECTS
              </div>
              <h1 className="hero-title mb-4">
                Let’s build the <br /> 
                <span style={{ color: '#6c5dff' }}>future</span> together.
              </h1>
              <p className="text-muted lead" style={{ maxWidth: '600px' }}>
                I’m Yugandhar Chamana. I specialize in bridging the gap between complex code and intuitive user experiences.
              </p>
            </Col>
          </Row>

          <Row className="g-4 mt-5">
            <Col lg={7}>
              <div className="glass-card p-5 h-100 shadow-sm">
                <h3 className="fw-bold mb-5">Connect With Me</h3>
                
                <a href="https://www.linkedin.com/in/yugandhar-chamana-719373252/" target="_blank" rel="noreferrer" className="social-btn">
                  <div className="d-flex align-items-center gap-3">
                    <Linkedin size={22} />
                    <span className="fw-bold">LinkedIn</span>
                  </div>
                  <ArrowRight size={18} />
                </a>

                <a href="https://github.com/Yugandharchaman" target="_blank" rel="noreferrer" className="social-btn">
                  <div className="d-flex align-items-center gap-3">
                    <GitHub size={22} />
                    <span className="fw-bold">GitHub</span>
                  </div>
                  <ArrowRight size={18} />
                </a>

                <button onClick={handleEmailAction} className="social-btn">
                  <div className="d-flex align-items-center gap-3">
                    <Mail size={22} />
                    <span className="fw-bold">Copy Email Address</span>
                  </div>
                  <ArrowRight size={18} />
                </button>

                {/* Feedback Form Integration */}
                <div className="mt-5 p-4 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <MessageSquare size={18} color="#6c5dff" />
                    <h6 className="fw-bold mb-0">Feedback Form</h6>
                  </div>
                  <p className="small text-muted mb-3">You can Suggest New Features</p>
                  <Form onSubmit={handleFeedbackSubmit}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="feedback-input mb-3"
                      placeholder="What should I build next?"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSending || !feedback.trim()}
                      style={{ 
                        background: '#3140c9', 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '10px 24px',
                        fontSize: '14px' 
                      }}
                      className="fw-bold d-flex align-items-center gap-2"
                    >
                      {isSending ? "Sending..." : "Submit Suggestion"}
                      <Send size={14} />
                    </Button>
                  </Form>
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <Row className="g-4">
                <Col xs={12}>
                  <div className="glass-card p-4 shadow-sm border-0 d-flex align-items-center" style={{ background: '#7f60be', color: '#fff' }}>
                    <div className="me-3">
                       <Clock size={32} color="#cdecef" />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0">Ultra-Responsive</h6>
                        <p className="small opacity-75 mb-0">Guaranteed reply within 12 hours.</p>
                    </div>
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="glass-card hover-card p-4 shadow-sm border-0 d-flex align-items-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="me-3 p-3 bg-white rounded-circle shadow-sm">
                       <MobileIcon size={24} color="#6c5dff" />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0 text-dark">Mobile-First Approach</h6>
                        <p className="small text-muted mb-0">Interfaces optimized for every screen size.</p>
                    </div>
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="glass-card hover-card p-4 shadow-sm d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <Briefcase className="me-3 text-muted" size={20} />
                        <div>
                            <div className="fw-bold small text-dark">Work Strategy</div>
                            <div className="small text-muted" style={{fontSize: '10px'}}>Remote & In-Office ready</div>
                        </div>
                    </div>
                    <Globe size={16} className="text-muted" />
                  </div>
                </Col>

                <Col xs={6}>
                  <div className="glass-card hover-card p-4 shadow-sm h-100 text-center text-md-start">
                    <Zap className="mb-2 text-warning" size={20}/>
                    <div className="fw-bold small text-dark">Performance</div>
                    <div className="small text-muted" style={{fontSize: '10px'}}>Optimized Delivery</div>
                  </div>
                </Col>

                <Col xs={6}>
                  <div className="glass-card hover-card p-4 shadow-sm h-100 text-center text-md-start">
                    <Code className="mb-2 text-primary" size={20}/>
                    <div className="fw-bold small text-dark">Clean Code</div>
                    <div className="small text-muted" style={{fontSize: '10px'}}>Scalable Architecture</div>
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="glass-card p-4 shadow-sm border-0" style={{ background: '#6c5dff', color: '#fff' }}>
                    <h5 className="fw-bold"> <Shield size={23} className="m-2"/>Secure Collaboration</h5>
                    <p className="small opacity-75 mb-0 m-2">Professional standards for NDAs and project confidentiality.</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <div className="mt-5 pt-5 text-center border-top">
            <p className="small text-muted">© 2026 Yugandhar Chamana • Always Building</p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NetworkNode;