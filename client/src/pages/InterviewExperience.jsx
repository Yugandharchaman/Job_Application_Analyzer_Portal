import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Pagination } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Shield, Briefcase, Send, 
  Clock, Award, Monitor, Trash2, Edit3, AlertCircle, Calendar,
  Globe, ThumbsUp, Check, X
} from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient"; 

// ── Gender detection from Indian names ──────────────────────────────────────
const FEMALE_NAME_HINTS = [
  "priya","sneha","pooja","kavya","lakshmi","divya","ananya","swathi","deepa",
  "nithya","sravani","mounika","haritha","lavanya","sirisha","supriya","ramya",
  "madhuri","padma","gayathri","gayatri","anusha","bhavana","chandana","deepthi",
  "geeta","geetha","hema","indira","jyothi","kalyani","keerthi","komali","latha",
  "meena","mythili","nalini","nandini","nithyasri","parvathi","pavithra","pushpa",
  "radha","rajeshwari","ratna","rekha","rohini","rupa","sadhana","sarada","saritha",
  "savitha","shanthi","shobha","shobhana","sita","sridevi","srilakshmi","sriya",
  "subhadra","sudha","sukanya","suma","sumathi","sunitha","suparna","sushma",
  "swapna","tulasi","usha","vani","vanitha","vasantha","vasudha","vidya","vijaya",
  "vimala","yamini","yashodha","yasmin","zeenath","amrutha","aparna","aruna",
  "archana","aswini","bhargavi","chaithanya","chaitra","chetana","deeksha",
  "dharani","durgha","durga","esther","fathima","fatima","ganga","girija",
  "hemavathi","jahnavi","jayalakshmi","jyothsna","kamala","kamalini","kamini",
  "kanchana","karuna","kasthuri","kavitha","kiran","komal","krishna","kumari",
  "lipika","madhavi","malathi","malini","mamatha","manasa","mangala","manjula",
  "meghana","menaka","mridula","nagalakshmi","nagamani","namitha","neeraja",
  "neha","niharika","nikitha","nimisha","nirupama","padmaja","padmavathi",
  "pallavi","parameshwari","parimala","poonam","prasanna","prathibha","preeti",
  "premalatha","purnima","pushpalatha","ragini","rajeswari","rajini","rajitha",
  "rani","ranjitha","rashmitha","rathna","raveena","revathi","rohitha","roopa",
  "sabitha","sahithi","sahithya","sandhya","sangeetha","sanjana","saraswathi",
  "sarojini","sasikala","sathyabhama","savitri","shailaja","shakuntala",
  "shantha","shanthi","sharmila","shilpa","shireesha","shobhitha","shreelekha",
  "shreya","shridevi","shruti","sindhu","sireesha","smitha","sowmya","spandana",
  "sravanthi","sreeja","sreelatha","sreelekha","sreemathi","sridevi","srilatha",
  "srinivasulamma","srivani","subbalakshmi","subhashini","suhasini","sulochana",
  "sumalatha","suseela","suvarna","swarnalatha","tara","tejaswini","thulasi",
  "trilokasundari","triveni","umadevi","umamaheswari","umamaheshwari","vasavi",
  "veda","vedavathi","venkatalakshmi","vennela","vibha","vijayalakshmi",
  "vijayashree","vijetha","vimala","vishalakshi","yadagiri"
];

const FEMALE_SUFFIXES = ["bai","vathi","mathi","latha","priya","devi","sri","shree","lakshmi","kumari","rani","mala","vani","thi","thi"];

function detectGender(name) {
  if (!name) return "male";
  const lower = name.toLowerCase().replace(/[^a-z\s]/g, "");
  const parts = lower.split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts[parts.length - 1] || "";
  if (FEMALE_NAME_HINTS.some(fn => firstName === fn || firstName.startsWith(fn))) return "female";
  if (FEMALE_NAME_HINTS.some(fn => lastName === fn)) return "female";
  if (FEMALE_SUFFIXES.some(suf => firstName.endsWith(suf) || lastName.endsWith(suf))) return "female";
  return "male";
}

// ── Avatar SVG components ────────────────────────────────────────────────────
const MaleAvatar = ({ size = 38, initials = "" }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="maleBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#1d4ed8"/>
      </linearGradient>
      <linearGradient id="maleBody" x1="0" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563eb"/>
        <stop offset="1" stopColor="#1e40af"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="40" fill="url(#maleBg)"/>
    <circle cx="40" cy="28" r="13" fill="#fde68a"/>
    <ellipse cx="40" cy="28" rx="13" ry="13" fill="#fcd34d"/>
    <ellipse cx="40" cy="18" rx="12" ry="7" fill="#92400e"/>
    <ellipse cx="29" cy="22" rx="4" ry="6" fill="#92400e"/>
    <ellipse cx="51" cy="22" rx="4" ry="6" fill="#92400e"/>
    <circle cx="35" cy="28" r="1.5" fill="#78350f"/>
    <circle cx="45" cy="28" r="1.5" fill="#78350f"/>
    <path d="M36 33 Q40 36 44 33" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 80 Q20 56 40 56 Q60 56 60 80Z" fill="url(#maleBody)"/>
    <path d="M34 56 L40 64 L46 56" fill="white" opacity="0.9"/>
    <rect x="38" y="64" width="4" height="16" fill="white" opacity="0.3"/>
    <title>{initials}</title>
  </svg>
);

const FemaleAvatar = ({ size = 38, initials = "" }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="femaleBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ec4899"/>
        <stop offset="1" stopColor="#be185d"/>
      </linearGradient>
      <linearGradient id="femaleBody" x1="0" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#db2777"/>
        <stop offset="1" stopColor="#9d174d"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="40" fill="url(#femaleBg)"/>
    <ellipse cx="40" cy="42" rx="17" ry="22" fill="#7c2d12"/>
    <circle cx="40" cy="28" r="13" fill="#fde68a"/>
    <ellipse cx="40" cy="28" rx="13" ry="13" fill="#fcd34d"/>
    <ellipse cx="40" cy="17" rx="13" ry="8" fill="#7c2d12"/>
    <ellipse cx="28" cy="24" rx="4" ry="8" fill="#7c2d12"/>
    <ellipse cx="52" cy="24" rx="4" ry="8" fill="#7c2d12"/>
    <ellipse cx="36" cy="16" rx="5" ry="3" fill="#92400e" opacity="0.5"/>
    <circle cx="35" cy="28" r="1.5" fill="#78350f"/>
    <circle cx="45" cy="28" r="1.5" fill="#78350f"/>
    <path d="M33 26 L35 24" stroke="#78350f" strokeWidth="1" strokeLinecap="round"/>
    <path d="M35 25.5 L35 23.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round"/>
    <path d="M43 25.5 L43 23.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round"/>
    <path d="M45 26 L47 24" stroke="#78350f" strokeWidth="1" strokeLinecap="round"/>
    <path d="M36 33 Q40 37 44 33" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="32" cy="31" r="3" fill="#f87171" opacity="0.35"/>
    <circle cx="48" cy="31" r="3" fill="#f87171" opacity="0.35"/>
    <path d="M18 80 Q18 54 40 54 Q62 54 62 80Z" fill="url(#femaleBody)"/>
    <path d="M30 54 Q40 62 50 54" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <circle cx="40" cy="62" r="2" fill="white" opacity="0.8"/>
    <title>{initials}</title>
  </svg>
);

// ── Persistent upvote storage key ─────────────────────────────────────────────
const UPVOTE_STORAGE_KEY = "interview_xp_upvotes";

const getStoredUpvotes = () => {
  try {
    const stored = localStorage.getItem(UPVOTE_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
};

const saveUpvotesToStorage = (set) => {
  try {
    localStorage.setItem(UPVOTE_STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
    <Card.Body className="p-4">
      <div className="d-flex gap-3 mb-3 align-items-center">
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }}></div>
        <div>
          <div className="skeleton mb-1" style={{ width: 120, height: 14, borderRadius: 6 }}></div>
          <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6 }}></div>
        </div>
      </div>
      <div className="skeleton mb-2" style={{ width: '60%', height: 26, borderRadius: 6 }}></div>
      <div className="skeleton mb-3" style={{ width: '100%', height: 80, borderRadius: 10 }}></div>
      <div className="skeleton" style={{ width: 120, height: 32, borderRadius: 20 }}></div>
    </Card.Body>
  </Card>
);

// ── Difficulty badge colors ───────────────────────────────────────────────────
const DIFF_COLORS = {
  Easy:   { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  Medium: { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
  Hard:   { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

// ── Main Component ─────────────────────────────────────────────────────────────
const InterviewExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionUser, setSessionUser] = useState(null); 
  const [votedPosts, setVotedPosts] = useState(() => getStoredUpvotes());
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
    if (!sessionUser) { toast.error("Authentication required. Please log in."); return; }

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
        time_slot: formData.time_slot || null, 
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

  const startEdit = (item) => { setEditingId(item.id); setEditFormData({ ...item }); };

  // 3. Save Edit to Supabase
  const saveEdit = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .update({ role: editFormData.role, questions: editFormData.questions })
      .eq('id', editingId)
      .select(); 

    if (error) { toast.error("Unauthorized or update failed."); }
    else {
      setExperiences(experiences.map(ex => ex.id === editingId ? data[0] : ex));
      setEditingId(null);
      toast.success("Post Updated Successfully.");
    }
  };

  // 4. Delete from Supabase
  const deleteEntry = async (id, ownerId) => {
    if (ownerId !== sessionUser?.id) { toast.error("Unauthorized action."); return; }
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) { toast.error("Could not delete."); }
    else {
      setExperiences(experiences.filter(ex => ex.id !== id));
      toast.error("Deleted Successfully.");
    }
  };

  // 5. Upvote with localStorage persistence
  const handleUpvote = async (id, currentVotes) => {
    if (votedPosts.has(id)) return;

    const { error } = await supabase
      .from('experiences')
      .update({ upvotes: (currentVotes || 0) + 1 })
      .eq('id', id);

    if (!error) {
      setExperiences(experiences.map(ex => 
        ex.id === id ? { ...ex, upvotes: (ex.upvotes || 0) + 1 } : ex
      ));
      const newVoted = new Set(votedPosts).add(id);
      setVotedPosts(newVoted);
      saveUpvotesToStorage(newVoted);
      toast.success("Thanks for the feedback! 👍");
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
    <div style={{ backgroundColor: "#F0F4FF", minHeight: "100vh", paddingBottom: "60px" }}>
      <Toaster position="bottom-center" />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        .ixp-wrapper { font-family: 'DM Sans', sans-serif; }

        .skeleton {
          background: linear-gradient(110deg, #e8edf5 8%, #f4f7fc 18%, #e8edf5 33%);
          border-radius: 4px;
          background-size: 200% 100%;
          animation: 1.5s shine linear infinite;
        }
        @keyframes shine { to { background-position-x: -200%; } }

        .xp-card {
          border-radius: 20px !important;
          border: 1.5px solid #e8edf5 !important;
          background: #fff !important;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          box-shadow: 0 2px 12px rgba(99,102,241,0.06) !important;
        }
        .xp-card:hover {
          box-shadow: 0 8px 32px rgba(99,102,241,0.13) !important;
          transform: translateY(-2px);
        }

        .company-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          background: #EEF2FF;
          color: #4338ca;
          border: 1.5px solid #c7d2fe;
        }

        .upvote-btn {
          border: 1.5px solid #e0e7ff !important;
          background: #f5f3ff !important;
          color: #6366f1 !important;
          border-radius: 30px !important;
          padding: 6px 18px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          transition: all 0.18s ease !important;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .upvote-btn:hover:not(.voted) {
          background: #6366f1 !important;
          color: #fff !important;
          border-color: #6366f1 !important;
          transform: scale(1.04);
        }
        .upvote-btn.voted {
          background: #6366f1 !important;
          color: #fff !important;
          border-color: #6366f1 !important;
        }

        .posted-at-badge {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .questions-box {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 1px solid #e0e7ff;
          border-radius: 14px;
          padding: 16px 18px;
          font-size: 14px;
          line-height: 1.7;
          color: #374151;
          white-space: pre-wrap;
        }

        .avatar-ring {
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
          flex-shrink: 0;
        }

        .form-card {
          border-radius: 24px !important;
          border: 1.5px solid #e0e7ff !important;
          box-shadow: 0 4px 24px rgba(99,102,241,0.08) !important;
          background: #fff !important;
        }

        .post-btn {
          background: linear-gradient(135deg, #6366f1, #4338ca) !important;
          border: none !important;
          border-radius: 14px !important;
          padding: 14px !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px !important;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35) !important;
          transition: all 0.2s ease !important;
        }
        .post-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(99,102,241,0.45) !important;
        }

        .edited-chip {
          font-size: 10px;
          padding: 2px 8px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 6px;
          font-weight: 700;
          border: 1px solid #bfdbfe;
        }

        .user-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .user-name-text {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }
        .user-meta-text {
          font-size: 11.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        .card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          margin-top: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .meta-pills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .pagination .page-item .page-link {
          border-radius: 10px !important;
          border: 1.5px solid #e0e7ff !important;
          color: #6366f1 !important;
          font-weight: 600 !important;
          margin: 0 2px !important;
        }
        .pagination .page-item.active .page-link {
          background: #6366f1 !important;
          border-color: #6366f1 !important;
          color: #fff !important;
        }

        .form-control, .form-select {
          border-radius: 12px !important;
          border: 1.5px solid #e0e7ff !important;
          padding: 12px 14px !important;
          font-size: 14px !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .form-control:focus, .form-select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
      `}</style>

      {/* ── HEADER: White (as per user requirement) ── */}
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
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </InputGroup>
              <InputGroup className="bg-light rounded-pill px-3 border-0">
                <InputGroup.Text className="bg-transparent border-0"><Briefcase size={16}/></InputGroup.Text>
                <Form.Control 
                  className="bg-transparent border-0 shadow-none" 
                  placeholder="Search Role..." 
                  onChange={(e) => { setRoleSearch(e.target.value); setCurrentPage(1); }}
                />
              </InputGroup>
            </div>
          </div>
        </Container>
      </div>

      <Container className="ixp-wrapper">
        <Row className="g-4">
          {/* ── Left: Post Form ── */}
          <Col lg={4}>
            <Card className="form-card sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={18} color="#fff" />
                  </div>
                  Share Experience
                </h5>

                <div className="p-3 mb-4 rounded-3" style={{ background: 'linear-gradient(135deg,#eff6ff,#eef2ff)', border: '1.5px solid #c7d2fe' }}>
                  <div className="d-flex gap-2 align-items-center mb-1">
                    <AlertCircle size={13} color="#6366f1" />
                    <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: '#6366f1' }}>COMMUNITY GUIDELINE</span>
                  </div>
                  <p className="m-0" style={{ fontSize: '11.5px', lineHeight: '1.5', color: '#475569' }}>
                    Maintain a professional tone. Your post helps fellow candidates prepare effectively.
                  </p>
                </div>

                <Form onSubmit={handlePost}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>COMPANY NAME <span className="text-danger">*</span></Form.Label>
                    <Form.Control required placeholder="e.g. Microsoft" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>APPLIED ROLE <span className="text-danger">*</span></Form.Label>
                    <Form.Control required placeholder="e.g. Frontend Engineer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>DATE</Form.Label>
                        <Form.Control type="date" max={today} value={formData.interview_date} onChange={e => setFormData({...formData, interview_date: e.target.value})} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>TIME SLOT</Form.Label>
                        <Form.Control type="time" value={formData.time_slot} onChange={e => setFormData({...formData, time_slot: e.target.value})} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>DETAILED EXPERIENCE <span className="text-danger">*</span></Form.Label>
                    <Form.Control as="textarea" rows={5} required placeholder="Share the questions asked, rounds, tips..." value={formData.questions} onChange={e => setFormData({...formData, questions: e.target.value})} />
                  </Form.Group>

                  <Button type="submit" className="w-100 post-btn d-flex align-items-center justify-content-center gap-2">
                    POST TO COMMUNITY <Send size={15}/>
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* ── Right: Experience Cards ── */}
          <Col lg={8}>
            <AnimatePresence mode='wait'>
              {isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[1,2,3].map(i => <SkeletonCard key={i} />)}
                </motion.div>
              ) : currentRecords.length > 0 ? (
                <>
                  {currentRecords.map((item) => {
                    const gender = detectGender(item.user_name || "");
                    const initials = (item.user_name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                    const diffStyle = DIFF_COLORS[item.difficulty] || DIFF_COLORS["Medium"];

                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-4">
                        <Card className="xp-card">
                          <Card.Body className="p-4">
                            {editingId === item.id ? (
                              <div>
                                <h6 className="fw-bold mb-3" style={{ color: '#6366f1' }}>✏️ Editing Experience</h6>
                                <Form.Group className="mb-2">
                                  <Form.Label className="small fw-bold text-muted">Role Title</Form.Label>
                                  <Form.Control value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold text-muted">Content</Form.Label>
                                  <Form.Control as="textarea" rows={5} value={editFormData.questions} onChange={e => setEditFormData({...editFormData, questions: e.target.value})} />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                  <Button variant="success" size="sm" className="px-4 rounded-pill fw-bold" onClick={saveEdit}><Check size={14}/> Save</Button>
                                  <Button variant="light" size="sm" className="rounded-pill fw-bold" onClick={() => setEditingId(null)}><X size={14}/> Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* ── User info row with avatar ── */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div className="user-info-row mb-0">
                                    <div className="avatar-ring">
                                      {gender === "female"
                                        ? <FemaleAvatar size={44} initials={initials} />
                                        : <MaleAvatar size={44} initials={initials} />
                                      }
                                    </div>
                                    <div>
                                      <div className="user-name-text">{item.user_name || "Anonymous"}</div>
                                      <div className="user-meta-text d-flex align-items-center gap-2">
                                        <Calendar size={11} />
                                        {item.interview_date}
                                        {item.time_slot && (
                                          <span className="d-flex align-items-center gap-1">
                                            <Clock size={11} /> {item.time_slot.slice(0,5)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {item.user_id === sessionUser?.id && (
                                    <div className="d-flex gap-1">
                                      <button className="btn btn-sm" style={{ border: '1.5px solid #e0e7ff', borderRadius: 10, color: '#6366f1', padding: '5px 10px' }} onClick={() => startEdit(item)}><Edit3 size={15}/></button>
                                      <button className="btn btn-sm" style={{ border: '1.5px solid #fee2e2', borderRadius: 10, color: '#ef4444', padding: '5px 10px' }} onClick={() => deleteEntry(item.id, item.user_id)}><Trash2 size={15}/></button>
                                    </div>
                                  )}
                                </div>

                                <div className="meta-pills">
                                  <span className="company-chip">🏢 {item.company?.toUpperCase()}</span>
                                  {item.updated_at && item.updated_at !== item.created_at && (
                                    <span className="edited-chip">Edited</span>
                                  )}
                                </div>

                                <h5 className="fw-bold mb-3" style={{ color: '#0f172a', fontSize: '1.1rem', lineHeight: 1.3 }}>{item.role}</h5>

                                <div className="questions-box mb-0">{item.questions}</div>

                                <div className="card-footer-row">
                                  <button
                                    className={`upvote-btn ${votedPosts.has(item.id) ? 'voted' : ''}`}
                                    onClick={() => handleUpvote(item.id, item.upvotes)}
                                    style={{ border: 'none', cursor: votedPosts.has(item.id) ? 'default' : 'pointer' }}
                                  >
                                    <ThumbsUp size={13} fill={votedPosts.has(item.id) ? '#fff' : 'none'} />
                                    Helpful &nbsp;
                                    <span style={{ background: votedPosts.has(item.id) ? 'rgba(255,255,255,0.25)' : '#e0e7ff', borderRadius: 20, padding: '1px 9px', fontSize: 12, fontWeight: 800, color: votedPosts.has(item.id) ? '#fff' : '#6366f1' }}>
                                      {item.upvotes || 0}
                                    </span>
                                  </button>

                                  <span className="posted-at-badge">
                                    <Clock size={11}/> Posted {item.post_time}
                                  </span>
                                </div>
                              </>
                            )}
                          </Card.Body>
                        </Card>
                      </motion.div>
                    );
                  })}

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>{i+1}</Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5 rounded-4" style={{ background: '#fff', border: '1.5px solid #e0e7ff' }}>
                  <Monitor size={48} className="mb-3" style={{ color: '#c7d2fe' }} />
                  <p className="fw-bold mb-0" style={{ color: '#64748b' }}>No records found matching your search.</p>
                  <small style={{ color: '#94a3b8' }}>Try a different company or role name</small>
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