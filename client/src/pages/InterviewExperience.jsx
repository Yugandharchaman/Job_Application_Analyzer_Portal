import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Pagination } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Shield, Briefcase, Send, 
  Clock, Award, Monitor, Trash2, Edit3, AlertCircle, Calendar,
  Globe, ThumbsUp, Check, X
} from "react-feather";
import toast, { Toaster } from "react-hot-toast";

// --- IMPORT YOUR CLIENT HERE ---
import { supabase } from "../supabaseClient"; 

const SkeletonCard = () => (
  <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex gap-2">
          <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '6px' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: '6px' }}></div>
        </div>
      </div>
      <div className="skeleton mb-2" style={{ width: '60%', height: '28px' }}></div>
      <div className="d-flex gap-4 mb-3">
        <div className="skeleton" style={{ width: '100px', height: '14px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '14px' }}></div>
      </div>
      <div className="skeleton mb-3" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
      <div className="skeleton" style={{ width: '120px', height: '32px', borderRadius: '20px' }}></div>
    </Card.Body>
  </Card>
);

const InterviewExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null); 
  const [editFormData, setEditFormData] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionUser, setSessionUser] = useState(null); 
  const [votedPosts, setVotedPosts] = useState(new Set()); 
  const recordsPerPage = 3;

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({ 
    company: "", role: "", questions: "", 
    difficulty: "Medium", interview_date: today, time_slot: "" 
  });

  // 1. Fetch Data from Supabase & Get Session
  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);

      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) toast.error("Error loading data");
      else setExperiences(data || []);
      setIsLoading(false);
    };
    initialize();
  }, []);

  // 2. Handle Post to Supabase
  const handlePost = async (e) => {
    e.preventDefault();
    
    if (!sessionUser) {
        toast.error("Authentication required. Please log in.");
        return;
    }

    const now = new Date();
    const systemPostTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fullName = sessionUser.user_metadata?.full_name || 
                     sessionUser.user_metadata?.display_name || 
                     sessionUser.email.split('@')[0];

    const { data, error } = await supabase
      .from('experiences')
      .insert([{
        company: formData.company,
        role: formData.role,
        questions: formData.questions,
        interview_date: formData.interview_date,
        time_slot: formData.time_slot,
        post_time: systemPostTime,
        user_name: fullName, 
        user_id: sessionUser.id,
        upvotes: 0
      }])
      .select();

    if (error) {
        console.error("Supabase Error:", error);
        toast.error(`Failed to publish: ${error.message}`);
    } else {
        setExperiences([data[0], ...experiences]);
        toast.success("Published to Community.");
        setFormData({ company: "", role: "", questions: "", difficulty: "Medium", interview_date: today, time_slot: "" });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  // 3. Save Edit to Supabase
  const saveEdit = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .update({ 
        role: editFormData.role, 
        questions: editFormData.questions 
      })
      .eq('id', editingId)
      .select(); 

    if (error) {
        toast.error("Unauthorized or update failed.");
    } else {
        setExperiences(experiences.map(ex => ex.id === editingId ? data[0] : ex));
        setEditingId(null);
        toast.success("Post Updated Successfully.");
    }
  };

  // 4. Delete from Supabase
  const deleteEntry = async (id, ownerId) => {
    if(ownerId !== sessionUser?.id) {
        toast.error("Unauthorized action.");
        return;
    }

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) {
        toast.error("Could not delete.");
    } else {
        setExperiences(experiences.filter(ex => ex.id !== id));
        toast.error("Deleted Successfully.");
    }
  };

  // 5. Upvote Logic (Restricted to one upvote, silent if already voted)
  const handleUpvote = async (id, currentVotes) => {
    if (votedPosts.has(id)) {
        return; // Exit silently
    }

    const { error } = await supabase
      .from('experiences')
      .update({ upvotes: (currentVotes || 0) + 1 })
      .eq('id', id);

    if (!error) {
        setExperiences(experiences.map(ex => ex.id === id ? { ...ex, upvotes: (ex.upvotes || 0) + 1 } : ex));
        setVotedPosts(prev => new Set(prev).add(id)); 
        toast.success("Thank you for the feedback!");
    }
  };

  const filteredData = useMemo(() => {
    return experiences.filter(xp => 
      (xp.company?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (xp.role?.toLowerCase().includes(roleSearch.toLowerCase()))
    );
  }, [experiences, searchTerm, roleSearch]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div style={{ backgroundColor: "#F8F9FA", minHeight: "100vh", paddingBottom: "50px" }}>
      <Toaster position="bottom-center" />
      
      <style>{`
        .skeleton {
          background: #eee;
          background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
          border-radius: 4px;
          background-size: 200% 100%;
          animation: 1.5s shine linear infinite;
        }
        @keyframes shine {
          to { background-position-x: -200%; }
        }
      `}</style>
      
      <div className="bg-white border-bottom py-4 mb-5 shadow-sm">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Shield size={16} className="text-primary" />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#6c757d' }}>COMMUNITY VAULT</span>
              </div>
              <h2 className="fw-bold m-0">Interview Knowledge Base</h2>
            </div>
            
            <div className="d-flex gap-2">
               <InputGroup className="bg-light rounded-pill px-3 border-0">
                  <InputGroup.Text className="bg-transparent border-0"><Globe size={16}/></InputGroup.Text>
                  <Form.Control 
                    className="bg-transparent border-0 shadow-none" 
                    placeholder="Search Company..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </InputGroup>
               <InputGroup className="bg-light rounded-pill px-3 border-0">
                  <InputGroup.Text className="bg-transparent border-0"><Briefcase size={16}/></InputGroup.Text>
                  <Form.Control 
                    className="bg-transparent border-0 shadow-none" 
                    placeholder="Search Role..." 
                    onChange={(e) => setRoleSearch(e.target.value)}
                  />
               </InputGroup>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Plus size={20} className="text-primary"/> Share Experience
                </h5>

                <div className="p-3 mb-4 rounded-3 border-start border-4 border-primary" style={{ backgroundColor: '#EEF2FF' }}>
                    <div className="d-flex gap-2 align-items-center text-primary mb-1">
                        <AlertCircle size={14} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>COMMUNITY GUIDELINE</span>
                    </div>
                    <p className="m-0 text-muted" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        Maintain a professional tone. Your post helps fellow candidates prepare effectively.
                    </p>
                </div>

                <Form onSubmit={handlePost}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">COMPANY NAME <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      style={{ borderRadius: '10px', padding: '12px' }}
                      required placeholder="e.g. Microsoft"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">APPLIED ROLE <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      style={{ borderRadius: '10px', padding: '12px' }}
                      required placeholder="e.g. Frontend Engineer"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    />
                  </Form.Group>

                  <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">DATE</Form.Label>
                            <Form.Control 
                                type="date"
                                max={today}
                                style={{ borderRadius: '10px', padding: '12px' }}
                                value={formData.interview_date}
                                onChange={e => setFormData({...formData, interview_date: e.target.value})}
                            />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">TIME SLOT</Form.Label>
                            <Form.Control 
                                type="time"
                                style={{ borderRadius: '10px', padding: '12px' }}
                                value={formData.time_slot}
                                onChange={e => setFormData({...formData, time_slot: e.target.value})}
                            />
                        </Form.Group>
                      </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">DETAILED EXPERIENCE</Form.Label>
                    <Form.Control 
                      as="textarea" rows={5}
                      style={{ borderRadius: '10px', padding: '12px' }}
                      required placeholder="Share the questions and rounds..."
                      value={formData.questions}
                      onChange={e => setFormData({...formData, questions: e.target.value})}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 py-3 border-0 fw-bold d-flex align-items-center justify-content-center gap-2" 
                          style={{ backgroundColor: '#6366F1', borderRadius: '12px' }}>
                    POST EXPERIENCE <Send size={16}/>
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <AnimatePresence mode='wait'>
              {isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </motion.div>
              ) : currentRecords.length > 0 ? (
                <>
                {currentRecords.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                      <Card.Body className="p-4">
                        {editingId === item.id ? (
                          <div className="p-2">
                             <h6 className="fw-bold text-primary mb-3">Editing Experience</h6>
                             <Form.Group className="mb-2">
                               <Form.Label className="small fw-bold">Role Title</Form.Label>
                               <Form.Control value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} />
                             </Form.Group>
                             <Form.Group className="mb-3">
                               <Form.Label className="small fw-bold">Content</Form.Label>
                               <Form.Control as="textarea" rows={5} value={editFormData.questions} onChange={e => setEditFormData({...editFormData, questions: e.target.value})} />
                             </Form.Group>
                             <div className="d-flex gap-2">
                                <Button variant="success" size="sm" className="px-4" onClick={saveEdit}><Check size={16}/> Save</Button>
                                <Button variant="light" size="sm" onClick={() => setEditingId(null)}><X size={16}/> Cancel</Button>
                             </div>
                          </div>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg="white" className="px-3 py-2 border border-primary text-primary" style={{ borderRadius: '6px' }}>{item.company?.toUpperCase()}</Badge>
                                
                                {item.updated_at && item.updated_at !== item.created_at && (
                                   <Badge bg="primary" className="bg-opacity-10 text-primary border-0 px-2 py-1" style={{ fontSize: '10px', fontWeight: '600' }}>Edited</Badge>
                                )}

                                <Badge bg="light" text="dark" className="border d-flex align-items-center gap-1">
                                    <Clock size={12}/> 
                                    {item.time_slot ? item.time_slot.slice(0, 5) : "No Time Set"}
                                </Badge>
                              </div>
                              
                              {item.user_id === sessionUser?.id && (
                                  <div className="d-flex gap-2">
                                    <Button variant="link" className="text-primary p-0" onClick={() => startEdit(item)}><Edit3 size={18}/></Button>
                                    <Button variant="link" className="text-danger p-0" onClick={() => deleteEntry(item.id, item.user_id)}><Trash2 size={18}/></Button>
                                  </div>
                              )}
                            </div>

                            <h4 className="fw-bold mb-2">{item.role}</h4>
                            
                            <div className="d-flex flex-wrap gap-4 mb-3 text-muted small">
                               <span className="d-flex align-items-center gap-1"><Calendar size={14}/> {item.interview_date}</span>
                               <span className="d-flex align-items-center gap-1"><Award size={14}/> {item.user_name}</span>
                            </div>

                            <div className="p-3 bg-light rounded-3 text-secondary mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
                              {item.questions}
                            </div>

                            <div className="d-flex justify-content-between align-items-end">
                                <Button 
                                    variant={votedPosts.has(item.id) ? "primary" : "outline-primary"} 
                                    size="sm" 
                                    className="rounded-pill px-3 d-flex align-items-center gap-2"
                                    onClick={() => handleUpvote(item.id, item.upvotes)}
                                >
                                    <ThumbsUp size={14}/> Helpful ({item.upvotes || 0})
                                </Button>
                                
                                <Badge bg="info" className="bg-opacity-10 text-info border-0 px-2 py-2" style={{ fontSize: '12px' }}>
                                    Posted at: {item.post_time}
                                </Badge>
                            </div>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <Pagination>
                            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>
                                    {i+1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                )}
                </>
              ) : (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                  <Monitor size={48} className="text-muted opacity-25 mb-3" />
                  <p className="text-muted fw-bold">No records found matching your search.</p>
                </div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InterviewExperience;