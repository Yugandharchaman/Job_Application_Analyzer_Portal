import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Tabs, Tab } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, Trash2, BookOpen, MessageCircle, Hash, Calendar } from "react-feather";
import toast, { Toaster } from "react-hot-toast";

const NOTES_STORAGE_KEY = "job_tracker_notes";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true); // Loading State
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "personal", 
    company: ""
  });

  useEffect(() => {
    // Simulate initial fetch loading
    const timer = setTimeout(() => {
      const savedNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)) || [];
      setNotes(savedNotes);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab switching loading effect
  const handleTabChange = (k) => {
    setIsLoading(true);
    setActiveTab(k);
    setTimeout(() => setIsLoading(false), 600);
  };

  const saveToStorage = (updatedNotes) => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      toast.error("Please fill in the title and content");
      return;
    }
    const noteToAdd = {
      ...newNote,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: activeTab 
    };
    const updatedNotes = [noteToAdd, ...notes];
    saveToStorage(updatedNotes);
    setNewNote({ title: "", content: "", type: "personal", company: "" });
    toast.success("Note captured successfully!");
  };

  const deleteNote = (id) => {
    const filtered = notes.filter(n => n.id !== id);
    saveToStorage(filtered);
    toast.success("Note removed");
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.type === activeTab && 
      (n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       n.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, activeTab, searchTerm]);

  // Skeleton Loader Component
  const NoteSkeleton = () => (
    <Card className="border-0 shadow-sm p-4 mb-3" style={{ borderRadius: "20px" }}>
      <div className="skeleton-line w-25 mb-3" style={{ height: '20px' }}></div>
      <div className="skeleton-line w-75 mb-2" style={{ height: '25px' }}></div>
      <div className="skeleton-line w-50" style={{ height: '15px' }}></div>
      <hr className="opacity-5" />
      <div className="skeleton-line w-100 mt-3" style={{ height: '60px' }}></div>
    </Card>
  );

  return (
    <Container fluid className="py-4 px-lg-5" style={{ background: "#f8faff", minHeight: "100vh" }}>
      <Toaster position="bottom-right" />

      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="fw-bold d-flex align-items-center gap-2" style={{ color: "#11102e" }}>
            <FileText className="text-primary" /> Knowledge Base
          </h2>
          <p className="text-muted">Personal reflections and company-specific interview insights.</p>
        </Col>
        <Col md={6}>
          <InputGroup className="shadow-sm rounded-4 overflow-hidden border-0">
            <InputGroup.Text className="bg-white border-0 ps-3">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by title or company..."
              className="border-0 py-3 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left Side: Create Note Form */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4 sticky-top" style={{ borderRadius: "24px", top: "20px" }}>
            <h5 className="fw-bold mb-4">Quick Capture</h5>
            <Form onSubmit={handleAddNote}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Title</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. System Design Prep" 
                  className="bg-light border-0 p-3 rounded-3"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                />
              </Form.Group>

              {activeTab === "interview" && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase text-primary">Company Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. Google, Amazon..." 
                    className="bg-light border-primary-subtle border-1 p-3 rounded-3"
                    value={newNote.company}
                    onChange={(e) => setNewNote({...newNote, company: e.target.value})}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted text-uppercase">Note Details</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={8} 
                  placeholder={activeTab === 'personal' ? "What's on your mind?" : "What questions were asked?"}
                  className="bg-light border-1 p-3 rounded-3"
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                />
              </Form.Group>

              <Button 
                type="submit" 
                className="w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0 gradient-btn"
                style={{ 
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                <Plus size={18} /> Save to {activeTab === 'personal' ? 'Personal' : 'Interview'}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Side: Notes Display */}
        <Col lg={8}>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-4 border-0 custom-tabs"
          >
            <Tab eventKey="personal" title={<span><BookOpen size={16} className="me-2"/>Personal Notes</span>} />
            <Tab eventKey="interview" title={<span><MessageCircle size={16} className="me-2"/>Interview Notes</span>} />
          </Tabs>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              /* LOADING STATE */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NoteSkeleton />
                <NoteSkeleton />
              </motion.div>
            ) : filteredNotes.length > 0 ? (
              /* CONTENT STATE */
              <Row className="g-3">
                {filteredNotes.map((note) => (
                  <Col xs={12} key={note.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-0 shadow-sm p-4 note-card" style={{ borderRadius: "20px" }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            {note.company && (
                              <Badge bg="primary-subtle" className="text-primary mb-2 rounded-pill px-3 py-2 border border-primary-subtle">
                                <Hash size={12} className="me-1"/> {note.company}
                              </Badge>
                            )}
                            <h5 className="fw-bold mb-1">{note.title}</h5>
                            <div className="text-muted small d-flex align-items-center gap-2">
                              <Calendar size={14} /> {note.date}
                            </div>
                          </div>
                          <Button 
                            variant="link" 
                            className="text-danger p-0 opacity-50 hover-opacity-100"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                        <hr className="opacity-5" />
                        <p className="text-secondary mb-0 mt-3" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                          {note.content}
                        </p>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            ) : (
              /* EMPTY STATE */
              <div className="text-center py-5 opacity-50">
                <FileText size={48} className="mb-3" />
                <p>No notes found in this category.</p>
              </div>
            )}
          </AnimatePresence>
        </Col>
      </Row>

      <style>
        {`
          /* Custom Gradient Button */
          .gradient-btn {
            background: linear-gradient(135deg, #6c5ddf 0%, #a294ff 100%) !important;
            color: white !important;
            border: none !important;
          }
          
          .gradient-btn:hover {
            background: linear-gradient(135deg, #5b4ec9 0%, #8b79ff 100%) !important;
            transform: translateY(-1px);
          }

          .custom-tabs .nav-link {
            border: 1px solid transparent !important;
            margin-right: 8px;
            color: #0a131a;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 10px !important;
            transition: all 0.2s ease-in-out;
             background-color: transparent !important;
          }
          
          .custom-tabs .nav-link:hover {
            color: #11102e;
            border-color: #5f6871 !important;
          }

          .custom-tabs .nav-link.active {
            background-color: transparent !important;
            border-color: #6c5ddf !important; /* Proper #6c5ddf border */
            color: #6c5ddf !important;
            border-width: 2px !important;
          }

          .note-card { transition: transform 0.2s; }
          .note-card:hover { transform: scale(1.005); }

          /* Skeleton Animation */
          .skeleton-line {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: 8px;
          }

          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </Container>
  );
};

export default Notes;