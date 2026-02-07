import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Tabs, Tab } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, Trash2, BookOpen, MessageCircle, Hash, Calendar, Edit3, Copy, Check } from "react-feather";
import toast, { Toaster } from "react-hot-toast";

// --- IMPORT YOUR CLIENT HERE ---
import { supabase } from "../supabaseClient"; 

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null); 
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "personal", 
    company: ""
  });

  // 1. Fetch Notes from Supabase on Load
  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error("Error loading notes");
        } else {
          setNotes(data || []);
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, []);

  const handleTabChange = (k) => {
    setIsLoading(true);
    setActiveTab(k);
    setEditingNoteId(null);
    setNewNote({ title: "", content: "", type: "personal", company: "" });
    setTimeout(() => setIsLoading(false), 600);
  };

  // 2. Handle Add OR Update Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      toast.error("Please fill in the title and content");
      return;
    }

    if (!sessionUser) {
        toast.error("Auth session expired. Please log in.");
        return;
    }

    if (editingNoteId) {
      // UPDATE MODE
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: newNote.title,
          content: newNote.content,
          company: activeTab === 'interview' ? newNote.company : "",
        })
        .eq('id', editingNoteId)
        .eq('user_id', sessionUser.id)
        .select();

      if (error) {
        toast.error("Update failed");
      } else {
        setNotes(notes.map(n => n.id === editingNoteId ? data[0] : n));
        setEditingNoteId(null);
        setNewNote({ title: "", content: "", type: "personal", company: "" });
        toast.success("Note updated!");
      }
    } else {
      // INSERT MODE
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.title,
          content: newNote.content,
          type: activeTab, 
          company: activeTab === 'interview' ? newNote.company : "",
          user_id: sessionUser.id 
        }])
        .select();

      if (error) {
          toast.error("Failed to save to cloud");
      } else {
          setNotes([data[0], ...notes]);
          setNewNote({ title: "", content: "", type: "personal", company: "" });
          toast.success("Note captured successfully!");
      }
    }
  };

  // 3. Handle Delete
  const deleteNote = async (id) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', sessionUser.id);

    if (error) {
        toast.error("Could not remove note");
    } else {
        setNotes(notes.filter(n => n.id !== id));
        if (editingNoteId === id) setEditingNoteId(null);
        toast.success("Note removed");
    }
  };

  // 4. Copy to Clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", { 
        icon: <Copy size={14} style={{color: '#6c5ddf'}}/>,
        style: { borderRadius: '10px', background: '#fff', color: '#333' }
    });
  };

  // 5. Trigger Edit Mode
  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setNewNote({
      title: note.title,
      content: note.content,
      type: note.type,
      company: note.company || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.type === activeTab && 
      (n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       n.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, activeTab, searchTerm]);

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
        <Col lg={4}>
          <Card className={`border-0 shadow-sm p-4 sticky-top ${editingNoteId ? 'border border-primary' : ''}`} style={{ borderRadius: "24px", top: "20px", transition: "all 0.3s" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">{editingNoteId ? 'Update Note' : 'Quick Capture'}</h5>
              {editingNoteId && <Badge bg="primary">Editing Mode</Badge>}
            </div>
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

              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  className="w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0 gradient-btn"
                  style={{ fontWeight: "600", transition: "all 0.3s ease" }}
                >
                  {editingNoteId ? <Check size={18}/> : <Plus size={18} />} 
                  {editingNoteId ? 'Update Note' : `Save to ${activeTab === 'personal' ? 'Personal' : 'Interview'}`}
                </Button>
                {editingNoteId && (
                  <Button variant="light" className="rounded-3 px-3" onClick={() => { setEditingNoteId(null); setNewNote({title:"", content:"", company:"", type: activeTab})}}>
                    Cancel
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </Col>

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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NoteSkeleton />
                <NoteSkeleton />
              </motion.div>
            ) : filteredNotes.length > 0 ? (
              <Row className="g-3">
                {filteredNotes.map((note) => (
                  <Col xs={12} key={note.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className={`border-0 shadow-sm p-4 note-card ${editingNoteId === note.id ? 'ring-active' : ''}`} style={{ borderRadius: "20px", position: "relative" }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            {note.company && (
                              <Badge bg="primary-subtle" className="text-primary mb-2 rounded-pill px-3 py-2 border border-primary-subtle">
                                <Hash size={12} className="me-1"/> {note.company}
                              </Badge>
                            )}
                            <h5 className="fw-bold mb-1">{note.title}</h5>
                            <div className="text-muted small d-flex align-items-center gap-2">
                              <Calendar size={14} /> {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="link" 
                              className="text-primary p-0 opacity-50 hover-opacity-100 action-icon"
                              onClick={() => startEdit(note)}
                              title="Edit Note"
                            >
                              <Edit3 size={18} />
                            </Button>
                            <Button 
                              variant="link" 
                              className="text-danger p-0 opacity-50 hover-opacity-100 action-icon"
                              onClick={() => deleteNote(note.id)}
                              title="Delete Note"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                        <hr className="opacity-5" />
                        
                        <div style={{ position: "relative" }}>
                          <p className="text-secondary mb-0 mt-3" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", paddingRight: "40px" }}>
                            {note.content}
                          </p>
                          
                          {/* Copy Symbol placed as shown in your images */}
                          <div 
                            className="action-icon position-absolute bottom-0 end-0 p-2 text-muted opacity-50"
                            onClick={() => copyToClipboard(note.content)}
                            title="Copy to Clipboard"
                            style={{ cursor: "pointer" }}
                          >
                            <Copy size={20} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            ) : (
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
          .gradient-btn { background: linear-gradient(135deg, #6c5ddf 0%, #a294ff 100%) !important; color: white !important; border: none !important; }
          .gradient-btn:hover { background: linear-gradient(135deg, #5b4ec9 0%, #8b79ff 100%) !important; transform: translateY(-1px); }
          .custom-tabs .nav-link { border: 1px solid transparent !important; margin-right: 8px; color: #0a131a; font-weight: 600; padding: 10px 20px; border-radius: 10px !important; transition: all 0.2s ease-in-out; background-color: transparent !important; }
          .custom-tabs .nav-link:hover { color: #11102e; border-color: #5f6871 !important; }
          .custom-tabs .nav-link.active { background-color: transparent !important; border-color: #6c5ddf !important; color: #6c5ddf !important; border-width: 2px !important; }
          .note-card { transition: transform 0.2s, box-shadow 0.2s; position: relative; }
          .note-card:hover { transform: scale(1.005); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
          .ring-active { border: 2px solid #6c5ddf !important; }
          .action-icon { transition: 0.2s; cursor: pointer; }
          .action-icon:hover { opacity: 1 !important; transform: scale(1.2); }
          .skeleton-line { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 8px; }
          @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}
      </style>
    </Container>
  );
};

export default Notes;