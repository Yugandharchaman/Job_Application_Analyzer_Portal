import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Badge, Form, InputGroup, Pagination, Placeholder, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Search, XCircle, Coffee, Zap, BarChart2, Save, Calendar, ArrowRight, AlertCircle, Target, User, Heart } from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient"; 

const STORAGE_KEY = "job_applications";

const Rejections = () => {
  const [allRejected, setAllRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userName, setUserName] = useState("Seeker");
  const itemsPerPage = 3;

  const quotes = [
    { text: "Failure is the opportunity to begin again more intelligently.", author: "Henry Ford" },
    { text: "A rejection is nothing more than a necessary step in the pursuit of success.", author: "Bo Bennett" },
    { text: "The master has failed more times than the beginner has tried.", author: "Stephen McCranie" },
    { text: "Success consists of going from failure to failure without loss of enthusiasm.", author: "Winston Churchill" },
    { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Rejection is merely a redirection; a course correction to your destiny.", author: "Bryant McGill" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
    { text: "Don't be embarrassed by your failures, learn from them and start again.", author: "Richard Branson" },
    { text: "Rejection is an opportunity for your selection to be better.", author: "Bernard Kelvin Clive" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin d. Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Persistence guarantees that results are inevitable.", author: "Paramahansa Yogananda" },
    { text: "Every 'No' brings me closer to a 'Yes'.", author: "Mark Victor Hansen" },
    { text: "Your dream doesn't have an expiration date. Take a deep breath and try again.", author: "Unknown" },
    { text: "The harder the conflict, the more glorious the triumph.", author: "Thomas Paine" },
    { text: "A river cuts through rock, not because of its power, but because of its persistence.", author: "James N. Watkins" },
    { text: "You are not your setbacks; you are the person who survives them.", author: "Unknown" }
  ];
  
  const activeQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email.split('@')[0]);
        const { data, error } = await supabase
          .from(STORAGE_KEY)
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "Rejected");

        if (error) throw error;

        const formatted = (data || [])
          .sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime())
          .map((job, index) => ({
            ...job,
            uniqueId: job.id,
            rejectRound: job.rejectRound || "Technical Round",
            mistakes: job.mistakes || ""
          }));
        setAllRejected(formatted);
      }
    } catch (error) {
      console.error("Error loading personal rejections:", error.message);
      toast.error("Failed to sync your personal data");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchPersonalData();
  }, []);

  const getAttemptCount = (company, date) => {
    const companyHistory = allRejected
      .filter(j => j.company === company)
      .sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    return companyHistory.findIndex(j => j.appliedDate === date) + 1;
  };

  const filteredJobs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allRejected;
    return allRejected.filter(job =>
      job.company.toLowerCase().includes(term)
    );
  }, [allRejected, searchTerm]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handleChange = (uniqueId, field, value) => {
    setAllRejected(prev => prev.map(job => 
      job.uniqueId === uniqueId ? { ...job, [field]: value } : job
    ));
  };

  const handleSave = async (uniqueId) => {
    const jobToSync = allRejected.find(j => j.uniqueId === uniqueId);
    
    try {
        const { error } = await supabase
            .from(STORAGE_KEY)
            .update({ 
                mistakes: jobToSync.mistakes, 
                rejectRound: jobToSync.rejectRound 
            })
            .eq('id', uniqueId);

        if (error) throw error;

        toast.success(`Analysis Saved!`, {
            style: { borderRadius: '12px', background: '#11102e', color: '#fff' }
        });
    } catch (error) {
        toast.error("Couldn't update analysis");
    }
  };

  return (
    <Container fluid className="py-4 px-lg-5" style={{ background: "#f8faff", minHeight: "100vh" }}>
      <Toaster position="top-center" />
      
      <Row className="mb-4 align-items-center">
        <Col lg={7}>
          <h2 className="fw-bold mb-0" style={{ color: "#11102ed9" }}>Analyze Your Rejections here</h2>
          <p className="text-muted">Tracking your progress from the beginning.</p>
        </Col>
        <Col lg={5}>
          <InputGroup className="shadow-sm rounded-4 overflow-hidden border-0">
            <InputGroup.Text className="bg-white border-0 ps-3">
              <Search size={18} className="text-primary" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search company..."
              className="border-0 py-3 shadow-none"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <InputGroup.Text className="bg-white border-0 pe-3" style={{cursor: 'pointer'}} onClick={() => setSearchTerm("")}>
                <XCircle size={16} className="text-muted" />
              </InputGroup.Text>
            )}
          </InputGroup>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-lg text-white p-4 mb-4" style={{ 
            background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
            borderRadius: "24px"
          }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Zap size={18} className="text-warning" fill="currentColor" />
              <span className="fw-bold small">Daily Motivation</span>
            </div>
            <h5 className="fw-light mb-2">"{activeQuote.text}"</h5>
            <small className="opacity-50">— {activeQuote.author}</small>
          </Card>

          <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "24px", borderLeft: "4px solid #4338ca" }}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <BarChart2 size={18} /> Performance Metrics
            </h6>
            <div className="d-grid">
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Total Rejections</span>
                <span className="fw-bold">{allRejected.length}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Notes Logged</span>
                <span className="fw-bold text-primary">{allRejected.filter(j => j.mistakes).length}</span>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "24px", borderLeft: "4px solid #ffc107" }}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Target size={18} className="text-warning" /> Improvement Guide
            </h6>
            <div className="small">
              <div className="mb-3">
                <p className="fw-bold mb-1 text-dark">Screening Round rejections?</p>
                <p className="text-muted mb-0">Prepare your resume according to the Job Description and ensure it's ATS-friendly.</p>
              </div>
              <div className="mb-3">
                <p className="fw-bold mb-1 text-dark">Technical Round failures?</p>
                <p className="text-muted mb-0">Focus thoroughly and revise technical questions and problem-solving skills.</p>
              </div>
              <div>
                <p className="fw-bold mb-1 text-dark">HR Round setbacks?</p>
                <p className="text-muted mb-0">Focus on HR-based and scenario-based behavioral questions.</p>
              </div>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          {loading ? (
              [1, 2, 3].map(i => <Placeholder key={i} as={Card} className="mb-4 p-5 rounded-4 border-0" animation="glow" />)
          ) : (
            <AnimatePresence mode="wait">
              {currentItems.length > 0 ? (
                <>
                  {currentItems.map((job) => (
                    <motion.div 
                      key={job.uniqueId} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="mb-4"
                    >
                      <Card className="border-0 shadow-sm p-4 rejection-card" style={{ borderRadius: "22px" }}>
                        <Row className="align-items-center">
                          <Col md={7}>
                            <div className="d-flex align-items-center gap-3">
                              <div className="p-3 bg-white shadow-sm rounded-4 border">
                                <Coffee size={24} style={{ color: "#4338ca" }} />
                              </div>
                              <div>
                                <h5 className="fw-bold mb-0">{job.company}</h5>
                                <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                                  <Badge bg="secondary" className="rounded-pill">Attempt #{getAttemptCount(job.company, job.appliedDate)}</Badge>
                                  <Calendar size={14} /> {job.appliedDate}
                                  <ArrowRight size={14} /> <span className="text-primary fw-bold">{job.role}</span>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col md={5}>
                            <Form.Select 
                              size="sm" 
                              className="rounded-pill border-0 bg-light px-3 fw-bold"
                              value={job.rejectRound}
                              onChange={(e) => handleChange(job.uniqueId, 'rejectRound', e.target.value)}
                            >
                              <option>Resume Screening</option>
                              <option>Online Assessment</option>
                              <option>Technical Round 1</option>
                              <option>Technical Round 2</option>
                              <option>HR Interview</option>
                            </Form.Select>
                          </Col>
                          <Col xs={12} className="mt-4">
                            <Form.Group className="position-relative">
                              <Form.Control
                                as="textarea" rows={3}
                                placeholder="Analyze your mistakes here..."
                                className="border-0 bg-light p-3 pb-5"
                                style={{ borderRadius: "18px", fontSize: "14px", resize: "none", border: "5px solid #0c0317" }}
                                value={job.mistakes}
                                onChange={(e) => handleChange(job.uniqueId, 'mistakes', e.target.value)}
                              />
                              <Button 
                                size="sm" className="position-absolute border-0"
                                style={{ bottom: "10px", right: "15px", borderRadius: "10px", backgroundColor: "#367d91" }}
                                onClick={() => handleSave(job.uniqueId)}
                              >
                                <Save size={14} className="me-2" /> Save
                              </Button>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  ))}

                  <div className="d-flex justify-content-center mt-5">
                    <Pagination className="custom-pagination">
                      <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                      
                      {[...Array(totalPages).keys()].map(n => (
                        <Pagination.Item 
                          key={n+1} 
                          active={n+1 === currentPage} 
                          onClick={() => setCurrentPage(n+1)}
                        >
                          {n+1}
                        </Pagination.Item>
                      ))}

                      <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
                  <AlertCircle size={60} className="text-danger mb-3 opacity-50" />
                  <h4 className="fw-bold">No Records Found</h4>
                  <p className="text-muted">No matches for "<strong>{searchTerm}</strong>".</p>
                  <Button variant="outline-primary" size="sm" onClick={() => setSearchTerm("")} className="rounded-pill px-4">Reset Search</Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </Col>
      </Row>

      <style>
        {`
          .rejection-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(67, 56, 202, 0.1) !important; border: 1px solid #4338ca; }
          .custom-pagination .page-link { color: #11102e; background-color: #fff; border: 1px solid #eee; margin: 0 3px; border-radius: 8px !important; font-weight: 600; }
          .custom-pagination .page-item.active .page-link { background-color: #11102e !important; border-color: #11102e !important; color: #fff !important; }
        `}
      </style>
    </Container>
  );
};

export default Rejections;