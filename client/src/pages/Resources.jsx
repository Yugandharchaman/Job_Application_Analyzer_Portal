import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner } from "react-bootstrap";
import {
  Book, Bookmark, Plus, Trash2, Search, Youtube, Info,
  Share2, MoreVertical, CheckCircle, Circle, ChevronDown,
  ChevronUp, Lock, Eye, EyeOff, X, Users, Edit2, Copy
} from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";

// ── SKILL DEFINITIONS (static metadata) ──
const SKILLS = [
  { key: "HTML",       icon: "🌐", color: "#e34c26", bg: "#fff3f0", border: "#f9a98d" },
  { key: "CSS",        icon: "🎨", color: "#264de4", bg: "#f0f3ff", border: "#a3b4f9" },
  { key: "JavaScript", icon: "⚡", color: "#c9a800", bg: "#fffef0", border: "#f0d84a" },
  { key: "Python",     icon: "🐍", color: "#3776ab", bg: "#f0f7ff", border: "#90c2e7" },
  { key: "Java",       icon: "☕", color: "#f89820", bg: "#fff8f0", border: "#fcd3a1" },
  { key: "SQL",        icon: "🗄️", color: "#00758f", bg: "#f0fbff", border: "#7ecde0" },
  { key: "Node.js",    icon: "🟢", color: "#3c873a", bg: "#f0fff4", border: "#86efac" },
  { key: "React.js",   icon: "⚛️", color: "#0ea5e9", bg: "#f0f9ff", border: "#7dd3fc" },
  { key: "Bootstrap",  icon: "🅱️", color: "#7952b3", bg: "#f5f0ff", border: "#c4a9f7" },
];

const Resources = () => {
  // ── MY LIBRARY STATE ──
  const [myLinks, setMyLinks]       = useState([]);
  const [newLink, setNewLink]       = useState({ title: "", url: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading]   = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef                     = useRef(null);

  // ── USER & ROLE ──
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);

  // ── ACTIVE TAB ──
  const [activeTab, setActiveTab] = useState("tech"); // "tech" | "hr"

  // ── TECH QUESTIONS STATE ──
  const [questions, setQuestions]       = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [activeSkill, setActiveSkill]   = useState(null);
  const [expandedId, setExpandedId]     = useState(null);

  // ── HR QUESTIONS STATE (flat list) ──
  const [hrQuestions, setHrQuestions]   = useState([]);
  const [expandedHrId, setExpandedHrId] = useState(null);

  // ── ADMIN: Add Question Modal ──
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addingSkill, setAddingSkill]     = useState("");
  const [addingType, setAddingType]       = useState("tech"); // "tech" | "hr"
  const [newQ, setNewQ]                   = useState({ question: "", answer: "" });
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);

  // ── ADMIN: Edit Question Modal ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQ, setEditingQ]           = useState(null);
  const [editQData, setEditQData]         = useState({ question: "", answer: "" });
  const [isUpdatingQ, setIsUpdatingQ]     = useState(false);

  // ── CLOSE DROPDOWN ON OUTSIDE CLICK ──
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── INITIAL LOAD ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // 1. Check admin role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        const admin = profile?.role === "admin";
        setIsAdmin(admin);

        // 2. Fetch personal bookmarks
        const { data: links } = await supabase
          .from("resources")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setMyLinks(links || []);

        // 3. Fetch tech interview questions — all users get full row
        const { data: qs } = await supabase
          .from("interview_questions")
          .select("*")
          .eq("type", "tech")
          .order("created_at", { ascending: true });
        setQuestions(qs || []);

        // 4. Fetch HR questions — flat list, all users get full row
        const { data: hrQs } = await supabase
          .from("interview_questions")
          .select("*")
          .eq("type", "hr")
          .order("created_at", { ascending: true });
        setHrQuestions(hrQs || []);

        // 5. Fetch this user's completed question ids
        const { data: comp } = await supabase
          .from("question_completions")
          .select("question_id")
          .eq("user_id", user.id);
        setCompletedIds((comp || []).map(c => c.question_id));
      }

      setIsLoading(false);
    };
    init();
  }, []);

  // ─────────────────────────────────────────────
  //  MY LIBRARY HANDLERS
  // ─────────────────────────────────────────────
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return toast.error("Please fill all fields");
    if (!currentUser) return toast.error("Please login to save resources");

    const { data, error } = await supabase
      .from("resources")
      .insert([{ title: newLink.title, url: newLink.url, user_id: currentUser.id }])
      .select();

    if (error) {
      toast.error("Failed to save");
    } else {
      setMyLinks([data[0], ...myLinks]);
      setNewLink({ title: "", url: "" });
      toast.success("Bookmark saved!");
    }
  };

  const deleteLink = async (id) => {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
    } else {
      setMyLinks(myLinks.filter(l => l.id !== id));
      setOpenMenuId(null);
      toast.success("Removed");
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link.url)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => {
        const el = document.createElement("textarea");
        el.value = link.url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success("Link copied!");
      });
    setOpenMenuId(null);
  };

  const shareLink = (link) => {
    const text = `${link.title}\n${link.url}`;
    if (navigator.share) {
      navigator.share({ title: link.title, url: link.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => {
          const el = document.createElement("textarea");
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
          toast.success("Link copied!");
        });
    }
    setOpenMenuId(null);
  };

  // ─────────────────────────────────────────────
  //  INTERVIEW QUESTION HANDLERS
  // ─────────────────────────────────────────────
  const openAddModal = (skillKey, type = "tech") => {
    setAddingSkill(skillKey);
    setAddingType(type);
    setNewQ({ question: "", answer: "" });
    setShowAddModal(true);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.question.trim() || !newQ.answer.trim())
      return toast.error("Both question and answer are required");
    setIsSubmittingQ(true);

    const { data, error } = await supabase
      .from("interview_questions")
      .insert([{
        skill: addingSkill,
        question: newQ.question.trim(),
        answer: newQ.answer.trim(),
        created_by: currentUser.id,
        type: addingType,
      }])
      .select("*");

    if (error) {
      toast.error("Failed to add question");
    } else {
      if (addingType === "hr") {
        setHrQuestions(prev => [...prev, data[0]]);
      } else {
        setQuestions(prev => [...prev, data[0]]);
      }
      setShowAddModal(false);
      toast.success("Question added successfully!");
    }
    setIsSubmittingQ(false);
  };

  const openEditModal = (q) => {
    setEditingQ(q);
    setEditQData({ question: q.question, answer: q.answer || "" });
    setShowEditModal(true);
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (!editQData.question.trim() || !editQData.answer.trim())
      return toast.error("Both question and answer are required");
    setIsUpdatingQ(true);

    const { data, error } = await supabase
      .from("interview_questions")
      .update({ question: editQData.question.trim(), answer: editQData.answer.trim() })
      .eq("id", editingQ.id)
      .select("*");

    if (error) {
      toast.error("Failed to update question");
    } else {
      const updated = data[0];
      if (editingQ.type === "hr") {
        setHrQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
      } else {
        setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
      }
      setShowEditModal(false);
      setEditingQ(null);
      toast.success("Question updated!");
    }
    setIsUpdatingQ(false);
  };

  const handleDeleteQuestion = async (qid, type = "tech") => {
    if (!window.confirm("Delete this question?")) return;
    const { error } = await supabase.from("interview_questions").delete().eq("id", qid);
    if (error) { toast.error("Failed to delete"); return; }
    if (type === "hr") {
      setHrQuestions(prev => prev.filter(q => q.id !== qid));
    } else {
      setQuestions(prev => prev.filter(q => q.id !== qid));
    }
    toast.success("Question deleted");
  };

  const toggleComplete = async (qid) => {
    if (!currentUser) return;
    const already = completedIds.includes(qid);

    if (already) {
      await supabase
        .from("question_completions")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("question_id", qid);
      setCompletedIds(prev => prev.filter(id => id !== qid));
    } else {
      const { error } = await supabase
        .from("question_completions")
        .insert([{ user_id: currentUser.id, question_id: qid }]);
      if (!error) setCompletedIds(prev => [...prev, qid]);
    }
  };

  // ─────────────────────────────────────────────
  //  DERIVED DATA
  // ─────────────────────────────────────────────
  const filteredLinks = myLinks.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSkillQuestions = (skillKey) =>
    questions.filter(q => q.skill === skillKey);

  const getSkillProgress = (skillKey) => {
    const qs = getSkillQuestions(skillKey);
    if (!qs.length) return { done: 0, total: 0, pct: 0 };
    const done = qs.filter(q => completedIds.includes(q.id)).length;
    return { done, total: qs.length, pct: Math.round((done / qs.length) * 100) };
  };

  const totalDone = completedIds.length;
  const totalQs   = questions.length + hrQuestions.length;
  const totalPct  = totalQs > 0 ? Math.round((totalDone / totalQs) * 100) : 0;

  const hrDone = hrQuestions.filter(q => completedIds.includes(q.id)).length;

  // ─────────────────────────────────────────────
  //  LOADING SCREEN
  // ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh", background: "#f8faff" }}>
        <div className="loader-pulse mb-3">
          <Book size={40} className="text-primary" />
        </div>
        <h5 className="fw-bold text-dark" style={{ letterSpacing: "1px" }}>PREPARING HUB...</h5>
        <Spinner animation="border" variant="primary" size="sm" className="mt-2 opacity-50" />
        <style>{`
          .loader-pulse { animation: pulse-animation 1.5s infinite ease-in-out; }
          @keyframes pulse-animation {
            0%   { transform: scale(0.95); opacity: 0.5; }
            50%  { transform: scale(1.1);  opacity: 1;   }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <Container fluid className="py-4 px-lg-5 animate-in"
      style={{ background: "#f8faff", minHeight: "100vh", position: "relative" }}>
      <Toaster position="bottom-right" />

      {/* ══════════════════════════════════════════
          ADD QUESTION MODAL — Admin only
      ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="res-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="res-modal-box" onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <div>
                <div className="res-modal-title">➕ Add Question</div>
                <div className="res-modal-sub">
                  {addingType === "hr"
                    ? <span style={{ color: "#f59e0b", fontWeight: 700 }}>👔 HR Question</span>
                    : <><span style={{ color: "#6c5dff", fontWeight: 700 }}>💻 {addingSkill}</span></>
                  }
                </div>
              </div>
              <button className="res-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={15} />
              </button>
            </div>

            <Form onSubmit={handleAddQuestion}>
              <Form.Group className="mb-3">
                <div className="res-modal-label">
                  Question <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <Form.Control
                  as="textarea" rows={3}
                  className="res-modal-input"
                  placeholder="Type your question here..."
                  value={newQ.question}
                  onChange={e => setNewQ({ ...newQ, question: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="res-modal-label">
                  Answer <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <Form.Control
                  as="textarea" rows={5}
                  className="res-modal-input"
                  placeholder="Write a detailed answer here..."
                  value={newQ.answer}
                  onChange={e => setNewQ({ ...newQ, answer: e.target.value })}
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="res-cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="res-submit-btn" disabled={isSubmittingQ}>
                  {isSubmittingQ ? "Saving..." : "Add Question"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT QUESTION MODAL — Admin only
      ══════════════════════════════════════════ */}
      {showEditModal && editingQ && (
        <div className="res-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="res-modal-box" onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <div>
                <div className="res-modal-title">✏️ Edit Question</div>
                <div className="res-modal-sub">
                  {editingQ.type === "hr"
                    ? <span style={{ color: "#f59e0b", fontWeight: 700 }}>👔 HR Question</span>
                    : <span style={{ color: "#6c5dff", fontWeight: 700 }}>💻 {editingQ.skill}</span>
                  }
                </div>
              </div>
              <button className="res-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={15} />
              </button>
            </div>

            <Form onSubmit={handleEditQuestion}>
              <Form.Group className="mb-3">
                <div className="res-modal-label">
                  Question <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <Form.Control
                  as="textarea" rows={3}
                  className="res-modal-input"
                  value={editQData.question}
                  onChange={e => setEditQData({ ...editQData, question: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="res-modal-label">
                  Answer <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <Form.Control
                  as="textarea" rows={5}
                  className="res-modal-input"
                  value={editQData.answer}
                  onChange={e => setEditQData({ ...editQData, answer: e.target.value })}
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="res-cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="res-submit-btn" disabled={isUpdatingQ}>
                  {isUpdatingQ ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      <Row className="g-4">

        {/* ══════════════════════════════════════
            COL 1 — MY LIBRARY
        ══════════════════════════════════════ */}
        <Col lg={4} className="order-1">
          <Card className="border-0 shadow-sm p-4 sticky-top"
            style={{ borderRadius: "24px", top: "20px" }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
              <Bookmark className="text-primary" size={20} /> My Library
            </h5>

            <div className="p-3 rounded-4 mb-3"
              style={{ backgroundColor: "#fcfcff", border: "1px solid #edf0ff" }}>
              <Form onSubmit={handleAddLink}>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text" placeholder="Resource Name"
                    className="custom-input shadow-none"
                    value={newLink.title}
                    onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                  />
                </Form.Group>
                <InputGroup>
                  <Form.Control
                    type="text" placeholder="Paste Link..."
                    className="custom-input shadow-none border-end-0"
                    value={newLink.url}
                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                  />
                  <Button variant="primary" type="submit"
                    className="px-3 border-0 d-flex align-items-center"
                    style={{ backgroundColor: "#11102e", borderRadius: "0 10px 10px 0" }}>
                    <Plus size={18} />
                  </Button>
                </InputGroup>
              </Form>
            </div>

            <div className="mb-4 p-2 px-3 rounded-3 d-flex align-items-center gap-2"
              style={{ background: "#fff5f5" }}>
              <Youtube size={14} color="#ff0000" />
              <span className="text-muted" style={{ fontSize: "11px", lineHeight: "1.2" }}>
                Found a great <b>YouTube tutorial</b> or <b>Doc</b>? Paste it above to save it!
              </span>
            </div>

            <div className="mb-3">
              <InputGroup size="sm" className="bg-light rounded-pill px-2 border align-items-center">
                <Search size={14} className="text-muted ms-2" />
                <Form.Control
                  placeholder="Search your links..."
                  className="bg-transparent border-0 shadow-none py-2"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </InputGroup>
            </div>

            {/* ── Link list with three-dot menu ── */}
            <div className="link-scroll" ref={menuRef}>
              {filteredLinks.map(link => (
                <div key={link.id}
                  className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 bg-white border border-light link-item shadow-xs"
                  style={{ position: "relative" }}>

                  <div className="text-truncate" style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-bold small">{link.title}</div>
                    <a href={link.url} target="_blank" rel="noreferrer"
                      className="text-muted text-decoration-none text-truncate d-block"
                      style={{ fontSize: "11px" }}>
                      {link.url}
                    </a>
                  </div>

                  {/* Three-dot button */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      className="three-dot-btn"
                      onClick={() => setOpenMenuId(openMenuId === link.id ? null : link.id)}
                      title="Options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === link.id && (
                      <div className="link-dropdown">
                        <button className="link-dropdown-item" onClick={() => copyLink(link)}>
                          <Copy size={13} /> Copy Link
                        </button>
                        <div className="link-dropdown-divider" />
                        <button className="link-dropdown-item" onClick={() => shareLink(link)}>
                          <Share2 size={13} /> Share
                        </button>
                        <div className="link-dropdown-divider" />
                        <button className="link-dropdown-item danger" onClick={() => deleteLink(link.id)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredLinks.length === 0 && (
                <div className="text-center py-4">
                  <Info size={24} className="text-muted opacity-25 mb-2" />
                  <p className="text-muted small">No links found</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* ══════════════════════════════════════
            COL 2 — INTERVIEW PREP HUB
        ══════════════════════════════════════ */}
        <Col lg={8} className="order-2">

          {/* Overall progress banner */}
          <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "24px" }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div style={{ flex: 1 }}>
                <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2 flex-wrap">
                  🎯 Interview Prep Hub
                  {isAdmin && (
                    <span className="res-admin-pill">
                      <Lock size={10} /> Admin Mode
                    </span>
                  )}
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  {isAdmin
                    ? "You can add, edit & delete questions. Answers are visible to all users."
                    : "Click 'Answer' on any question to see the answer. Mark questions as done to track progress."}
                </p>
              </div>

              {/* Circular progress ring */}
              <div className="d-flex flex-column align-items-center gap-1">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="36" cy="36" r="28" fill="none"
                    stroke="#6c5dff" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - totalPct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                  <text x="36" y="40" textAnchor="middle" fontSize="12"
                    fontWeight="800" fill="#0f172a">{totalPct}%</text>
                </svg>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                  {totalDone}/{totalQs} Done
                </span>
              </div>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="hub-tab-bar mt-4">
              <button
                className={`hub-tab-btn ${activeTab === "tech" ? "hub-tab-active-tech" : ""}`}
                onClick={() => setActiveTab("tech")}
              >
                💻 Technical Questions
                <span className="hub-tab-count">{questions.length}</span>
              </button>
              <button
                className={`hub-tab-btn ${activeTab === "hr" ? "hub-tab-active-hr" : ""}`}
                onClick={() => setActiveTab("hr")}
              >
                <Users size={14} /> HR Questions
                <span className="hub-tab-count">{hrQuestions.length}</span>
              </button>
            </div>
          </Card>

          {/* ══════════════════════════════════════
              TECHNICAL QUESTIONS TAB
          ══════════════════════════════════════ */}
          {activeTab === "tech" && (
            <Row className="g-3">
              {SKILLS.map(skill => {
                const { done, total, pct } = getSkillProgress(skill.key);
                const isOpen   = activeSkill === skill.key;
                const skillQs  = getSkillQuestions(skill.key);

                return (
                  <Col xs={12} key={skill.key}>
                    <div className="skill-card" style={{ borderLeft: `4px solid ${skill.color}` }}>

                      {/* ── Skill header (click to expand) ── */}
                      <div className="skill-card-header"
                        onClick={() => setActiveSkill(isOpen ? null : skill.key)}>
                        <div className="d-flex align-items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                          <div className="skill-icon-box"
                            style={{ background: skill.bg, border: `1px solid ${skill.border}` }}>
                            <span style={{ fontSize: "20px" }}>{skill.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="skill-title">{skill.key}</div>
                            <div className="skill-meta">
                              {total === 0
                                ? (isAdmin ? "No questions yet — click + to add" : "No questions yet")
                                : `${done}/${total} completed`}
                            </div>
                            {total > 0 && (
                              <div className="skill-bar-wrap">
                                <div className="skill-bar-fill"
                                  style={{ width: `${pct}%`, background: skill.color }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
                          {total > 0 && (
                            <span className="skill-pct-badge"
                              style={{ background: skill.bg, color: skill.color, border: `1px solid ${skill.border}` }}>
                              {pct}%
                            </span>
                          )}
                          {isAdmin && (
                            <button className="add-q-btn" title={`Add question to ${skill.key}`}
                              onClick={e => { e.stopPropagation(); openAddModal(skill.key, "tech"); }}>
                              <Plus size={14} />
                            </button>
                          )}
                          <div className="chevron-box">
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* ── Question list (expanded) ── */}
                      {isOpen && (
                        <div className="skill-q-body">
                          {skillQs.length === 0 ? (
                            <div className="skill-empty">
                              <Info size={20} style={{ color: "#cbd5e1" }} />
                              <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                                {isAdmin ? "Click + to add the first question." : "No questions added yet."}
                              </span>
                            </div>
                          ) : (
                            skillQs.map((q, idx) => {
                              const isDone     = completedIds.includes(q.id);
                              const isExpanded = expandedId === q.id;
                              return (
                                <div key={q.id} className={`q-row ${isDone ? "q-row-done" : ""}`}>
                                  <div className="q-row-top">
                                    <button className="complete-toggle" onClick={() => toggleComplete(q.id)}
                                      title={isDone ? "Mark as pending" : "Mark as done"}>
                                      {isDone ? <CheckCircle size={18} color="#22c55e" /> : <Circle size={18} color="#cbd5e1" />}
                                    </button>
                                    <div className="q-text-wrap" style={{ flex: 1 }}>
                                      <span className="q-num" style={{ color: skill.color }}>Q{idx + 1}.</span>
                                      <span className={`q-text ${isDone ? "q-text-done" : ""}`}>{q.question}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                                      {q.answer && (
                                        <button className="ans-btn"
                                          onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                                          {isExpanded ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Answer</>}
                                        </button>
                                      )}
                                      {isAdmin && (
                                        <button className="q-edit-btn" onClick={() => openEditModal(q)} title="Edit">
                                          <Edit2 size={13} />
                                        </button>
                                      )}
                                      {isAdmin && (
                                        <button className="q-del-btn" onClick={() => handleDeleteQuestion(q.id, "tech")} title="Delete">
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isExpanded && q.answer && (
                                    <div className="ans-panel">
                                      <div className="ans-panel-text">{q.answer}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* ══════════════════════════════════════
              HR QUESTIONS TAB — Flat todo list
          ══════════════════════════════════════ */}
          {activeTab === "hr" && (
            <div>
              {/* HR header card with single Add button */}
              <Card className="border-0 shadow-sm p-4 mb-3" style={{ borderRadius: "20px" }}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                      👔 HR Interview Questions
                    </div>
                    <div className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                      {hrQuestions.length === 0
                        ? (isAdmin ? "No questions yet. Click + Add to get started." : "No questions added yet.")
                        : `${hrDone} of ${hrQuestions.length} completed`}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {hrQuestions.length > 0 && (
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 800,
                        background: "#fffbeb", color: "#f59e0b",
                        border: "1px solid #fcd34d",
                        padding: "3px 10px", borderRadius: "20px"
                      }}>
                        {Math.round((hrDone / hrQuestions.length) * 100)}%
                      </span>
                    )}
                    {/* Admin only: single Add button */}
                    {isAdmin && (
                      <button className="hr-add-btn"
                        onClick={() => openAddModal("HR", "hr")}
                        title="Add HR Question">
                        <Plus size={14} /> Add Question
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {hrQuestions.length > 0 && (
                  <div className="skill-bar-wrap mt-3" style={{ maxWidth: "100%" }}>
                    <div className="skill-bar-fill"
                      style={{ width: `${Math.round((hrDone / hrQuestions.length) * 100)}%`, background: "#f59e0b" }} />
                  </div>
                )}
              </Card>

              {/* Flat question list */}
              {hrQuestions.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👔</div>
                  <p className="text-muted" style={{ fontSize: "13px" }}>
                    {isAdmin ? "Click '+ Add Question' above to add your first HR question." : "No HR questions added yet."}
                  </p>
                </div>
              ) : (
                <div className="hr-list">
                  {hrQuestions.map((q, idx) => {
                    const isDone     = completedIds.includes(q.id);
                    const isExpanded = expandedHrId === q.id;
                    return (
                      <div key={q.id} className={`hr-q-card ${isDone ? "hr-q-card-done" : ""}`}>

                        {/* Top row */}
                        <div className="q-row-top">
                          <button className="complete-toggle" onClick={() => toggleComplete(q.id)}
                            title={isDone ? "Mark as pending" : "Mark as done"}>
                            {isDone
                              ? <CheckCircle size={18} color="#22c55e" />
                              : <Circle size={18} color="#94a3b8" />}
                          </button>

                          <div className="q-text-wrap" style={{ flex: 1 }}>
                            <span className="q-num" style={{ color: "#f59e0b" }}>Q{idx + 1}.</span>
                            <span className={`q-text ${isDone ? "q-text-done" : ""}`}>{q.question}</span>
                          </div>

                          <div className="d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                            {q.answer && (
                              <button className="ans-btn"
                                onClick={() => setExpandedHrId(isExpanded ? null : q.id)}>
                                {isExpanded ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Answer</>}
                              </button>
                            )}
                            {isAdmin && (
                              <button className="q-edit-btn" onClick={() => openEditModal(q)} title="Edit">
                                <Edit2 size={13} />
                              </button>
                            )}
                            {isAdmin && (
                              <button className="q-del-btn" onClick={() => handleDeleteQuestion(q.id, "hr")} title="Delete">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Answer panel */}
                        {isExpanded && q.answer && (
                          <div className="ans-panel">
                            <div className="ans-panel-text">{q.answer}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </Col>
      </Row>

      {/* ══════════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════════ */}
      <style>{`
        /* Base */
        .animate-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        /* Library */
        .custom-input { border-radius:10px !important; border:1px solid #e2e8f0; padding:10px 14px; font-size:14px; background:#fff; }
        .custom-input:focus { border-color:#11102e; background:#fff; }
        .link-item { transition:background 0.2s; }
        .link-item:hover { background-color:#f8f9ff !important; }
        .link-scroll { max-height:420px; overflow-y:auto; padding-right:5px; }
        .link-scroll::-webkit-scrollbar { width:4px; }
        .link-scroll::-webkit-scrollbar-thumb { background:#e0e0e0; border-radius:10px; }

        /* Three-dot */
        .three-dot-btn {
          width:30px; height:30px; border:none; background:transparent;
          border-radius:8px; display:flex; align-items:center; justify-content:center;
          color:#94a3b8; cursor:pointer; transition:all 0.2s;
        }
        .three-dot-btn:hover { background:#f1f5f9; color:#475569; }

        /* Link dropdown */
        .link-dropdown {
          position:absolute; right:0; top:34px; z-index:9999;
          background:#fff; border:1px solid #e2e8f0; border-radius:12px;
          box-shadow:0 8px 24px rgba(0,0,0,0.12); min-width:140px;
          padding:4px; animation:dropIn 0.15s ease;
        }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .link-dropdown-item {
          display:flex; align-items:center; gap:8px;
          width:100%; padding:8px 12px; border:none; background:transparent;
          font-size:13px; font-weight:600; color:#475569; cursor:pointer;
          border-radius:8px; transition:background 0.15s;
        }
        .link-dropdown-item:hover { background:#f8f9fc; }
        .link-dropdown-item.danger { color:#dc2626; }
        .link-dropdown-item.danger:hover { background:#fff1f1; }
        .link-dropdown-divider { height:1px; background:#f1f5f9; margin:3px 8px; }

        /* Admin pills */
        .res-admin-pill {
          display:inline-flex; align-items:center; gap:4px;
          background:linear-gradient(135deg,#11102e,#2a285c);
          color:#fff; font-size:0.62rem; font-weight:700;
          padding:3px 9px; border-radius:20px; letter-spacing:0.3px;
        }

        /* ── Tab Switcher ── */
        .hub-tab-bar {
          display:flex; gap:8px;
          background:#f1f4ff; border-radius:14px; padding:5px;
        }
        .hub-tab-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
          padding:9px 16px; border-radius:10px; border:none;
          background:transparent; font-size:0.83rem; font-weight:700;
          color:#64748b; cursor:pointer; transition:all 0.22s;
        }
        .hub-tab-btn:hover { background:#fff; color:#334155; }
        .hub-tab-active-tech {
          background:#fff; color:#6c5dff;
          box-shadow:0 2px 10px rgba(108,93,255,0.15);
          border:1px solid #ddd6ff;
        }
        .hub-tab-active-hr {
          background:#fff; color:#f59e0b;
          box-shadow:0 2px 10px rgba(245,158,11,0.15);
          border:1px solid #fde68a;
        }
        .hub-tab-count {
          background:#f1f5f9; color:#64748b;
          font-size:0.65rem; font-weight:800;
          padding:2px 7px; border-radius:20px; min-width:22px; text-align:center;
        }
        .hub-tab-active-tech .hub-tab-count { background:#ede9ff; color:#6c5dff; }
        .hub-tab-active-hr  .hub-tab-count  { background:#fef3c7; color:#b45309; }

        /* Skill card */
        .skill-card {
          background:#fff; border-radius:16px;
          border:1px solid #e8ecf4; border-left-width:4px;
          box-shadow:0 2px 8px rgba(0,0,0,0.04); overflow:hidden;
          transition:box-shadow 0.2s;
        }
        .skill-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.08); }
        .skill-card-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 20px; cursor:pointer; gap:12px; user-select:none;
          transition:background 0.15s;
        }
        .skill-card-header:hover { background:#fafbff; }
        .skill-icon-box {
          width:46px; height:46px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .skill-title { font-size:0.95rem; font-weight:800; color:#0f172a; margin-bottom:2px; }
        .skill-meta  { font-size:0.72rem; color:#94a3b8; font-weight:600; margin-bottom:4px; }
        .skill-bar-wrap { height:4px; background:#f1f5f9; border-radius:10px; max-width:200px; overflow:hidden; }
        .skill-bar-fill  { height:100%; border-radius:10px; transition:width 0.5s ease; }
        .skill-pct-badge {
          font-size:0.68rem; font-weight:800; padding:3px 9px;
          border-radius:20px; white-space:nowrap;
        }
        .add-q-btn {
          width:30px; height:30px; border-radius:8px;
          background:#f0fdf4; border:1px solid #86efac; color:#16a34a;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s; flex-shrink:0;
        }
        .add-q-btn:hover { background:#dcfce7; transform:scale(1.08); }
        .chevron-box {
          width:30px; height:30px; border-radius:8px; background:#f8f9fc;
          display:flex; align-items:center; justify-content:center; color:#94a3b8;
        }

        /* Questions body */
        .skill-q-body {
          border-top:1px solid #f1f5f9; padding:8px 16px 14px;
          max-height:540px; overflow-y:auto;
        }
        .skill-q-body::-webkit-scrollbar { width:3px; }
        .skill-q-body::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:10px; }
        .skill-empty {
          display:flex; align-items:center; justify-content:center; gap:10px;
          padding:28px 0; color:#94a3b8;
        }

        /* Question row (tech) */
        .q-row {
          border-radius:10px; padding:10px 10px 6px; margin-bottom:6px;
          transition:background 0.15s; border:1px solid transparent;
        }
        .q-row:hover { background:#fafbff; border-color:#eef0f6; }
        .q-row-done  { background:#f0fdf4 !important; border-color:#bbf7d0 !important; }
        .q-row-top   { display:flex; align-items:flex-start; gap:10px; }

        /* HR flat list */
        .hr-list { display:flex; flex-direction:column; gap:10px; }
        .hr-q-card {
          background:#fff; border-radius:14px;
          border:1.5px solid #e8ecf4;
          padding:14px 16px 10px;
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          transition:all 0.2s;
        }
        .hr-q-card:hover { border-color:#fde68a; box-shadow:0 4px 16px rgba(245,158,11,0.1); }
        .hr-q-card-done {
          background:#fffbeb !important;
          border-color:#fcd34d !important;
        }

        /* HR Add button */
        .hr-add-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; border-radius:10px;
          background:#f0fdf4; border:1.5px solid #86efac; color:#16a34a;
          font-size:0.8rem; font-weight:700; cursor:pointer;
          transition:all 0.2s; white-space:nowrap;
        }
        .hr-add-btn:hover { background:#dcfce7; transform:translateY(-1px); }

        .complete-toggle {
          border:none; background:transparent; padding:2px; cursor:pointer;
          flex-shrink:0; margin-top:1px; transition:transform 0.2s;
        }
        .complete-toggle:hover { transform:scale(1.15); }

        .q-text-wrap { display:flex; gap:5px; align-items:baseline; flex-wrap:wrap; }
        .q-num  { font-size:0.7rem; font-weight:800; flex-shrink:0; }
        .q-text { font-size:0.85rem; color:#334155; font-weight:500; line-height:1.5; }
        .q-text-done { text-decoration:line-through; color:#94a3b8 !important; }

        /* Answer toggle button */
        .ans-btn {
          display:inline-flex; align-items:center; gap:4px;
          font-size:0.68rem; font-weight:700; padding:3px 8px;
          border-radius:6px; border:1px solid #c4bbff;
          background:#ede9ff; color:#6c5dff; cursor:pointer;
          white-space:nowrap; transition:all 0.2s;
        }
        .ans-btn:hover { background:#ddd6fe; }

        /* Edit button */
        .q-edit-btn {
          width:26px; height:26px; border-radius:6px;
          border:1px solid #bfdbfe; background:#eff6ff; color:#2563eb;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s;
        }
        .q-edit-btn:hover { background:#dbeafe; }

        /* Delete button */
        .q-del-btn {
          width:26px; height:26px; border-radius:6px;
          border:1px solid #fecaca; background:#fff1f1; color:#dc2626;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s;
        }
        .q-del-btn:hover { background:#fee2e2; }

        /* Answer panel */
        .ans-panel {
          margin:8px 0 4px 28px;
          background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);
          border-radius:10px; padding:12px 14px;
          animation:slideDown 0.2s ease;
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .ans-panel-text {
          font-size:0.83rem; color:#e2e8f0; line-height:1.7; white-space:pre-wrap;
        }

        /* Modal */
        .res-modal-overlay {
          position:fixed; inset:0; z-index:99999;
          background:rgba(15,23,42,0.6); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          padding:20px; animation:overlayIn 0.2s ease;
        }
        @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
        .res-modal-box {
          background:#fff; border-radius:20px; width:100%; max-width:540px;
          padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.22);
          animation:modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .res-modal-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          margin-bottom:20px; gap:12px;
        }
        .res-modal-title { font-size:1.05rem; font-weight:800; color:#0f172a; margin-bottom:5px; }
        .res-modal-sub   { font-size:0.78rem; color:#64748b; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .res-modal-close {
          width:30px; height:30px; border-radius:50%;
          border:1px solid #e2e8f0; background:#f8f9fc; color:#64748b;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s; flex-shrink:0;
        }
        .res-modal-close:hover { background:#fee2e2; border-color:#fca5a5; color:#dc2626; }
        .res-modal-label {
          font-size:0.75rem; font-weight:700; text-transform:uppercase;
          letter-spacing:0.5px; color:#64748b; margin-bottom:6px;
        }
        .res-modal-input {
          border:1.5px solid #e2e8f0 !important; border-radius:10px !important;
          padding:10px 14px; font-size:0.88rem; resize:vertical;
          transition:border-color 0.2s;
        }
        .res-modal-input:focus {
          border-color:#6c5dff !important;
          box-shadow:0 0 0 3px rgba(108,93,255,0.1) !important;
        }
        .res-cancel-btn {
          padding:9px 20px; border-radius:10px; border:1.5px solid #e2e8f0;
          background:#f8f9fc; color:#475569; font-weight:700; font-size:0.85rem;
          cursor:pointer; transition:all 0.2s;
        }
        .res-cancel-btn:hover { background:#f1f5f9; }
        .res-submit-btn {
          padding:9px 24px; border-radius:10px; border:none;
          background:linear-gradient(135deg,#11102e 0%,#2a285c 100%);
          color:#fff; font-weight:700; font-size:0.85rem; cursor:pointer;
          transition:all 0.2s; box-shadow:0 4px 12px rgba(17,16,46,0.25);
        }
        .res-submit-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .res-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

        /* Responsive */
        @media (max-width:575px) {
          .skill-card-header { padding:12px 14px; }
          .skill-q-body      { padding:6px 10px 10px; }
          .q-text            { font-size:0.8rem; }
          .res-modal-box     { padding:20px; }
          .skill-bar-wrap    { max-width:120px; }
          .hub-tab-btn       { font-size:0.75rem; padding:7px 8px; }
          .hr-add-btn        { font-size:0.72rem; padding:6px 12px; }
        }
      `}</style>
    </Container>
  );
};

export default Resources;