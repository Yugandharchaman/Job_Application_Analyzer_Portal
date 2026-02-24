import React, { useState, useRef, useEffect } from "react"; 
import { Nav, Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { supabase } from '../supabaseClient'; 
import toast from "react-hot-toast"; 
import {
  Home, PlusSquare, Briefcase, Clock, Calendar, Bell, XCircle, FileText,
  LogOut, Target, Book, User, MessageCircle,
  Edit3, Save, Camera, Upload, Download, File, Info, Menu, X
} from "react-feather";

const SideNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    github: "",
    linkedin: "",
    leetcode: "",
    bio: "",
    passout_year: "",
    branch: "",
    college_name: "",
    degree: "", 
    degree_cgpa: "", 
    inter_cgpa: "",   
    ssc_cgpa: "",     
    profileImg: null,
    resumeName: "",
    resumeFile: null 
  });

  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempResumeFile, setTempResumeFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(); 

        if (error) throw error;
        
        if (data) {
          setProfile({
            ...data,
            name: data.full_name || "", 
            email: data.email || user.email,
            passout_year: data.passout_year || "",
            branch: data.branch || "",
            college_name: data.college_name || "",
            degree: data.degree || "",
            degree_cgpa: data.degree_cgpa || "", 
            inter_cgpa: data.inter_cgpa || "",   
            ssc_cgpa: data.ssc_cgpa || "",       
            profileImg: data.profileImg || null,
            resumeFile: data.resumeFile || null,
            resumeName: data.resumeName || ""
          });
        } else {
          setProfile(prev => ({ ...prev, email: user.email }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      toast.error("Failed to load profile details");
    } finally {
      setLoadingProfile(false);
    }
  };

  const uploadFileToStorage = async (file, folderName) => {
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folderName}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('PROFILES')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('PROFILES').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.degree_cgpa || !profile.inter_cgpa || !profile.ssc_cgpa) {
      toast.error("Please fill all mandatory fields including CGPA!");
      return;
    }
    
    const savingToast = toast.loading("Saving changes to Cloud...");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session not found");

      let finalProfileData = { ...profile };

      if (tempImageFile) {
        const imageUrl = await uploadFileToStorage(tempImageFile, 'avatars');
        finalProfileData.profileImg = imageUrl;
      }

      if (tempResumeFile) {
        const resumeUrl = await uploadFileToStorage(tempResumeFile, 'resumes');
        finalProfileData.resumeFile = resumeUrl;
      }
      
      const updates = {
        id: user.id,
        full_name: finalProfileData.name, 
        email: finalProfileData.email,
        phone: finalProfileData.phone || "",
        address: finalProfileData.address || "",
        github: finalProfileData.github || "",
        linkedin: finalProfileData.linkedin || "",
        leetcode: finalProfileData.leetcode || "",
        bio: finalProfileData.bio || "",
        passout_year: finalProfileData.passout_year || "",
        branch: finalProfileData.branch || "",
        college_name: finalProfileData.college_name || "",
        degree: finalProfileData.degree || "",
        degree_cgpa: parseFloat(finalProfileData.degree_cgpa), 
        inter_cgpa: parseFloat(finalProfileData.inter_cgpa),   
        ssc_cgpa: parseFloat(finalProfileData.ssc_cgpa),       
        profileImg: finalProfileData.profileImg || null,
        resumeName: finalProfileData.resumeName || "",
        resumeFile: finalProfileData.resumeFile || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      setProfile(finalProfileData);
      setTempImageFile(null);
      setTempResumeFile(null);
      setSaveSuccess(true);
      
      toast.success("Profile Synchronized with Cloud", { id: savingToast });

      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 2500);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message, { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "InterviewPro", icon: <PlusSquare size={18} />, path: "/interview-Pro" },
    { name: "Applied Jobs", icon: <Briefcase size={18} />, path: "/added-jobs" },
    { name: "Calendar", icon: <Calendar size={18} />, path: "/calendar" },
    { name: "Recent Jobs", icon: <Clock size={18} />, path: "/recent-jobs", hasNotification: true },
    { name: "Interview XP", icon: <MessageCircle size={18} />, path: "/interview-experience" },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminders" },
    { name: "Notes", icon: <FileText size={18} />, path: "/notes" },
    { name: "Rejections", icon: <XCircle size={18} style={{color: "red"}} />, path: "/rejections" },
    { name: "Resources", icon: <Book size={18} />, path: "/resources" },
    { name: "Connect with Me", icon: <Target size={18} />, path: "/connect" }
  ];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempImageFile(file);
      setProfile({ ...profile, profileImg: URL.createObjectURL(file) });
      toast.success("Image selected! Click save to upload.");
    }
  };

  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempResumeFile(file);
      setProfile({ ...profile, resumeName: file.name });
      toast.success("Resume selected! Click save to upload.");
    }
  };

  const handleDownload = () => {
    if (profile.resumeFile) {
      toast.success("Opening resume...");
      window.open(profile.resumeFile, "_blank");
    } else {
      toast.error("No resume file available to download");
    }
  };

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully", { id: loadingToast });
      navigate("/auth"); 
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    toast("Editing Enabled", { icon: "✍️", style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  };

  return (
    <>
      <style>
        {`
          @keyframes blink-glow {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
            50% { transform: scale(1.2); box-shadow: 0 0 12px 4px rgba(255, 0, 0, 0.5); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
          }
          @keyframes online-pulse {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
          }
          @keyframes success-pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.2) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .online-indicator {
            position: absolute; bottom: 2px; right: 2px; width: 13px; height: 13px;
            background-color: #28a745; border-radius: 50%; border: 2px solid rgba(6, 6, 26, 1);
            animation: online-pulse 2s infinite; z-index: 5;
          }
          .blinking-dot {
            position: absolute; top: -3px; right: -3px; width: 9px; height: 9px;
            background-color: #ff0000; border-radius: 50%; border: 1px solid rgba(6, 6, 26, 1);
            animation: blink-glow 1.2s infinite ease-in-out; z-index: 10;
          }
          .nav-notification-container { position: relative; display: flex; align-items: center; }
          .edit-input { border-radius: 8px; border: 1px solid #eee; padding: 8px 12px; font-size: 14px; transition: 0.3s; width: 100%; }
          .profile-modal-content { border-radius: 24px; border: none; overflow: hidden; background: #fff; max-height: 90vh; overflow-y: auto; }
          .image-overlay { position: absolute; bottom: 0; right: 0; background: #6c5dff; color: white; padding: 6px; border-radius: 50%; cursor: pointer; border: 2px solid white; transition: 0.3s; }
          .resume-box { border: 2px dashed #e0e0e0; border-radius: 12px; padding: 15px; transition: 0.3s; }
          .success-animation { animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; position: relative; }
          .notification-note { font-size: 11px; color: #6c757d; line-height: 1.3; margin-top: 15px; background: #f8f9fa; padding: 10px; border-radius: 10px; border-left: 3px solid #6c5dff; }
          
          .mobile-trigger-container {
            display: none;
            padding: 15px;
          }

          .mobile-trigger-btn {
            background: rgba(6, 6, 26, 1);
            border: none;
            color: #cfd3ff;
            width: 45px;
            height: 45px;
            border-radius: 50%; 
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .mobile-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(3px);
            z-index: 1001;
          }

          @media (max-width: 1024px) {
            .mobile-trigger-container { display: flex; }
            .sidebar {
              transform: translateX(-100%);
              transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
              width: 280px !important;
              border-radius: 0 25px 25px 0 !important;
              box-shadow: 10px 0 30px rgba(0,0,0,0.3);
            }
            .sidebar.mobile-open {
              transform: translateX(0);
              z-index: 1050 !important;
            }
            .mobile-overlay.active {
              display: block;
            }
            .profile-modal-content .border-end {
              border-right: none !important;
              border-bottom: 1px solid #eee;
              padding-bottom: 30px;
              margin-bottom: 20px;
            }
          }

          @media (max-width: 576px) {
            .profile-modal-content { border-radius: 15px; margin: 10px; }
            .modal-dialog { margin: 0.5rem; }
            .edit-input { font-size: 13px; }
            .resume-box { flex-direction: column; text-align: center; }
            .resume-box .d-flex { justify-content: center; }
          }

          @supports (padding: env(safe-area-inset-top)) {
            .sidebar {
              padding-top: calc(20px + env(safe-area-inset-top)) !important;
            }
          }
        `}
      </style>

      {/* NON-FIXED ROUNDED MOBILE TRIGGER */}
      <div className="mobile-trigger-container d-lg-none">
        <button className="mobile-trigger-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* OVERLAY */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      <div
        className={`sidebar d-flex flex-column ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          minHeight: "100vh", width: "240px", position: "fixed", left: 0, top: 0,
          padding: "20px 16px", paddingTop: "28px", borderTopRightRadius: "25px",
          backgroundColor: "rgba(6, 6, 26, 1)", color: "#cfd3ff", zIndex: 1000,
          overflowY: 'auto'
        }}
      >
        <div className="d-lg-none text-end mb-3">
           <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#6c5dff' }}>
             <X size={26} />
           </button>
        </div>

        <div 
          className="profile-trigger d-flex justify-content-center align-items-center"
          onClick={() => {
            setShowProfile(true);
            toast("Viewing Profile", { icon: "👤" });
            if(window.innerWidth <= 1024) setIsMobileMenuOpen(false);
          }}
          style={{ cursor: 'pointer', marginBottom: "32px" }}
        >
          <div className="position-relative">
            <div className="bg-white d-flex align-items-center justify-content-center shadow-sm" 
                 style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
              {loadingProfile ? (
                <Spinner animation="border" size="sm" variant="dark" />
              ) : profile.profileImg ? (
                <img src={profile.profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={32} className="text-dark" />
              )}
            </div>
            <div className="online-indicator" />
          </div>
        </div>

        <Modal show={showProfile} onHide={() => setShowProfile(false)} centered size="lg" contentClassName="profile-modal-content">
          <Modal.Header closeButton className="border-0 px-4 pt-4"></Modal.Header>
          <Modal.Body className="px-3 px-md-4 pb-5">
            <Row className="gy-4">
              <Col lg={4} className="text-center border-end">
                <div className="position-relative d-inline-block mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                       style={{ width: '130px', height: '130px', overflow: 'hidden', border: '3px solid #f0f0f0' }}>
                    {profile.profileImg ? (
                      <img src={profile.profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={60} className="text-muted" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="image-overlay" onClick={() => fileInputRef.current.click()}>
                      <Camera size={16} />
                    </div>
                  )}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                </div>
                
                <h5 className="fw-bold text-dark mb-3">{profile.name || "Your Name"}</h5>
                
                <div className="d-grid gap-2 px-3">
                  {!isEditing ? (
                    <Button variant="outline-primary" className="rounded-pill shadow-sm" onClick={startEditing}>
                      <Edit3 size={14} className="me-2" /> Edit Profile
                    </Button>
                  ) : (
                    <Button variant={saveSuccess ? "success" : "primary"} className="rounded-pill shadow-sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Spinner animation="border" size="sm" /> : 
                        saveSuccess ? (
                         <span className="success-animation">🎉 Saved Successfully!</span>
                        ) : 
                        <><Save size={14} className="me-2" /> Save Changes</>}
                    </Button>
                  )}
                </div>

                <div className="notification-note text-start mx-2">
                  <div className="d-flex align-items-start gap-2">
                    <span style={{flexShrink: 0}}><Info size={14} className="text-primary mt-1" /></span>
                    <span>Please Carefully Add Your Profile details because You will get Notification Based on <b>Passout Year</b>, <b>Branch</b>,<b>Degree</b> and <b>CGPA</b>.</span>
                  </div>
                </div>
              </Col>

              <Col lg={8}>
                <h6 className="fw-bold text-uppercase text-muted small mb-3">Personal Details</h6>
                <Row className="g-3 mb-4">
                  <Col xs={12} sm={6}>
                    <label className="text-muted small mb-1">Full Name <span className="text-danger">*</span></label>
                    <Form.Control className="edit-input" placeholder="Enter full name" disabled={!isEditing} value={profile.name || ""} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <label className="text-muted small mb-1">Email Address<span className="text-danger">*</span></label>
                    <Form.Control className="edit-input" placeholder="example@mail.com" disabled={!isEditing} value={profile.email || ""} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <label className="text-muted small mb-1">Phone (India)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{borderRadius: '8px 0 0 8px', fontSize: '14px'}}>+91</span>
                      <Form.Control className="edit-input border-start-0" style={{borderRadius: '0 8px 8px 0'}} disabled={!isEditing} value={profile.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <label className="text-muted small mb-1">Location</label>
                    <Form.Control className="edit-input" placeholder="City, Country" disabled={!isEditing} value={profile.address || ""} onChange={(e) => setProfile({...profile, address: e.target.value})} />
                  </Col>
                </Row>

                <h6 className="fw-bold text-uppercase text-muted small mb-3">Academic Details</h6>
                <Row className="g-3 mb-4">
                  <Col xs={12}>
                    <label className="text-muted small mb-1">College Name</label>
                    <Form.Control className="edit-input" placeholder="Full College/University Name" disabled={!isEditing} value={profile.college_name || ""} onChange={(e) => setProfile({...profile, college_name: e.target.value})} />
                  </Col>
                  <Col xs={12} sm={4}>
                    <label className="text-muted small mb-1">Degree <span className="text-danger">*</span></label>
                    <Form.Control className="edit-input" placeholder="eg: B.Tech" disabled={!isEditing} value={profile.degree || ""} onChange={(e) => setProfile({...profile, degree: e.target.value})} />
                  </Col>
                  <Col xs={12} sm={4}>
                    <label className="text-muted small mb-1">Branch <span className="text-danger">*</span></label>
                    <Form.Control className="edit-input" placeholder="eg: CSE" disabled={!isEditing} value={profile.branch || ""} onChange={(e) => setProfile({...profile, branch: e.target.value})} />
                  </Col>
                  <Col xs={12} sm={4}>
                    <label className="text-muted small mb-1">Passout Year <span className="text-danger">*</span></label>
                    <Form.Control className="edit-input" placeholder="eg: 2026" disabled={!isEditing} value={profile.passout_year || ""} onChange={(e) => setProfile({...profile, passout_year: e.target.value})} />
                  </Col>
                  <Col xs={4}>
                    <label className="text-muted small mb-1">Degree CGPA</label>
                    <Form.Control type="number" step="0.01" className="edit-input"  disabled={!isEditing} value={profile.degree_cgpa || ""} onChange={(e) => setProfile({...profile, degree_cgpa: e.target.value})} />
                  </Col>
                  <Col xs={4}>
                    <label className="text-muted small mb-1">Inter/diploma CGPA/Marks</label>
                    <Form.Control type="number" step="0.01" className="edit-input" disabled={!isEditing} value={profile.inter_cgpa || ""} onChange={(e) => setProfile({...profile, inter_cgpa: e.target.value})} />
                  </Col>
                  <Col xs={4}>
                    <label className="text-muted small mb-1">SSC CGPA/Marks</label>
                    <Form.Control type="number" step="0.01" className="edit-input"  disabled={!isEditing} value={profile.ssc_cgpa || ""} onChange={(e) => setProfile({...profile, ssc_cgpa: e.target.value})} />
                  </Col>
                </Row>

                <h6 className="fw-bold text-uppercase text-muted small mb-3">Professional Links</h6>
                <Row className="g-3">
                  <Col xs={12}><Form.Control className="edit-input" placeholder="GitHub URL" disabled={!isEditing} value={profile.github || ""} onChange={(e) => setProfile({...profile, github: e.target.value})} /></Col>
                  <Col xs={12}><Form.Control className="edit-input" placeholder="LinkedIn URL" disabled={!isEditing} value={profile.linkedin || ""} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} /></Col>
                  <Col xs={12}><Form.Control className="edit-input" placeholder="LeetCode URL(optional)" disabled={!isEditing} value={profile.leetcode || ""} onChange={(e) => setProfile({...profile, leetcode: e.target.value})} /></Col>
          
                  <Col xs={12}>
                  <p className="fw-bold text-muted mb-2 small">UPLOAD RESUME</p>
                    <div className="resume-box d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-primary bg-opacity-10 rounded text-primary"><File size={20}/></div>
                        <div style={{maxWidth: '180px'}}>
                          <p className="mb-0 fw-bold text-dark text-truncate" style={{fontSize: '13px'}}>{profile.resumeName || "No Resume"}</p>
                          <small className="text-muted" style={{fontSize: '11px'}}>Stored securely</small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {isEditing ? (
                          <Button variant="light" size="sm" style={{fontSize: '12px'}} onClick={() => resumeInputRef.current.click()}><Upload size={12} className="me-1"/> Upload</Button>
                        ) : profile.resumeFile && (
                          <Button variant="primary" size="sm" style={{fontSize: '12px'}} onClick={handleDownload}><Download size={12} className="me-1"/> Download</Button>
                        )}
                        <input type="file" hidden ref={resumeInputRef} accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>

        <Nav className="flex-column gap-1 flex-grow-1">
          {menu.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Nav.Link as={Link} to={item.path} key={index}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "12px",
                  color: isActive ? "#d6c7ff" : "#b6bbff",
                  background: isActive ? "linear-gradient(90deg, rgba(108,93,255,0.35), rgba(108,93,255,0.15))" : "transparent",
                  boxShadow: isActive ? "inset 0 0 12px rgba(120,100,255,0.25)" : "none",
                  transition: "all 0.25s ease", textDecoration: "none", fontSize: "14.5px",
                }}
              >
                <span className="nav-notification-container" style={{ color: isActive ? "#bfa8ff" : "#9aa2ff" }}>
                  {item.icon}
                  {item.hasNotification && <div className="blinking-dot" />}
                </span>
                {item.name}
              </Nav.Link>
            );
          })}
        </Nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "14px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "12px", color: "#ff6b6b", background: "transparent", border: "none", width: "100%", textAlign: "left", fontSize: "14.5px", cursor: "pointer", transition: "all 0.25s" }}
            onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;