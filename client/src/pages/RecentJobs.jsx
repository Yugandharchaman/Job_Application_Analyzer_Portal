import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Dropdown, Toast, Card, Badge, Pagination, Spinner } from "react-bootstrap";
import {
  ExternalLink, Shield, Globe,
  ChevronLeft, ChevronRight, Layers,
  Cpu, Activity, Plus, ArrowRight, Check, Mail
} from "react-feather";
import { FaDownload } from "react-icons/fa";
import NoJobsImg from "../assets/No_Jobs.png";
import { supabase } from "../supabaseClient";

const RecentJobs = () => {
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const scrollRef = useRef(null);

  // --- NEW STATES FOR FEATURES ---
  const [jobs, setJobs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [userRole, setUserRole] = useState(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    company_name: "", salary: "", role: "", location: "",
    passout_year: "", eligible_branches: "All Branches",
    eligible_degree: "B.Tech", expiry_date: "", apply_link: "",
    min_cgpa: "", experience: "Fresher"
  });

  // NEW: States for "I Applied" functionality
  const [appliedJobs, setAppliedJobs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // --- NEW: Email Alerts toggle state ---
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [showEmailToast, setShowEmailToast] = useState(false);

  // ── ADDED JOBS (from AddedJobs page) ──
  const NAVBAR_COLOR = "#11102e";
  const jobsPerPage = 6;
  const maxPagesToShow = 4;
  const todayStr = new Date().toISOString().split("T")[0];
  const statusColors = {
    Applied: "secondary",
    "Selected Screening Round": "info",
    Test: "primary",
    "TR Round": "warning",
    "HR Round": "success",
    Offer: "success",
    Rejected: "danger",
  };

  const [manualJobs, setManualJobs] = useState([]);
  const [platformAppliedJobs, setPlatformAppliedJobs] = useState([]);
  const [addedJobsLoading, setAddedJobsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(""); // Empty = show ALL applied jobs by default
  const [currentPage, setCurrentPage] = useState(1);

  const degreeOptions = ["B.Tech", "BBA", "MBA", "MCA", "B.com", "M.Tech", "BE", "Any Degree"];
  const experienceOptions = ["Fresher", "0-1 Years", "1-2 Years", "2-5 Years", "5+ Years"];

  const platforms = [
    { name: "LinkedIn", color: "#0077B5", url: "https://www.linkedin.com/jobs/" },
    { name: "Internshala", color: "#00A5EC", url: "https://internshala.com/" },
    { name: "Wellfound", color: "#000000", url: "https://wellfound.com/jobs" },
    { name: "Unstop", color: "#1C4980", url: "https://unstop.com/" },
    { name: "Indeed", color: "#2164f3", url: "https://www.indeed.com/" },
    { name: "Naukri", color: "#2d2d2d", url: "https://www.naukri.com/" },
    { name: "Instahyre", color: "#303ab2", url: "https://www.instahyre.com/" },
    { name: "Glassdoor", color: "#0caa41", url: "https://www.glassdoor.com/" },
    { name: "Foundit", color: "#6e16f3", url: "https://www.foundit.in/" },
    { name: "SuperSet", color: "#f26522", url: "https://app.joinsuperset.com/students/login" },
  ];

  // --- FEATURE: FETCH DATA ---
  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('admin_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
    } else {
      setJobs(data || []);
    }
  };

  // NEW: Fetch user's applied jobs status
  const fetchAppliedJobs = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('job_applications_status')
      .select('job_id, is_applied')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching applied jobs:", error);
    } else {
      const appliedMap = {};
      data.forEach(item => {
        appliedMap[item.job_id] = item.is_applied;
      });
      setAppliedJobs(appliedMap);
    }
  };

  // ── ADDED JOBS: Load manual + platform applied jobs ──
  const loadAddedJobs = async (userId) => {
    if (!userId) return;
    try {
      setAddedJobsLoading(true);

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setManualJobs(data || []);

      const { data: appliedData, error: appliedError } = await supabase
        .from("job_applications_status")
        .select(`
          *,
          admin_jobs (
            id,
            company_name,
            role,
            location,
            salary,
            experience,
            apply_link,
            created_at
          )
        `)
        .eq("user_id", userId)
        .eq("is_applied", true)
        .order("created_at", { ascending: false });

      if (appliedError) throw appliedError;
      setPlatformAppliedJobs(appliedData || []);
    } catch (error) {
      console.error("Error loading added jobs:", error);
    } finally {
      setAddedJobsLoading(false);
    }
  };

  // MODIFIED: Handle "I Applied" checkbox toggle - ONE TIME ONLY
  const handleAppliedToggle = async (jobId) => {
    if (!currentUser) {
      showToastMessage("Please login to mark jobs as applied", "warning");
      return;
    }

    const isCurrentlyApplied = appliedJobs[jobId] || false;
    if (isCurrentlyApplied) {
      showToastMessage("Already marked as applied! You cannot undo this action.", "info");
      return;
    }

    const newStatus = true;
    setAppliedJobs(prev => ({ ...prev, [jobId]: newStatus }));

    const { data: existingRecord } = await supabase
      .from('job_applications_status')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('job_id', jobId)
      .single();

    let error;

    if (existingRecord) {
      const result = await supabase
        .from('job_applications_status')
        .update({ is_applied: newStatus })
        .eq('id', existingRecord.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('job_applications_status')
        .insert([{
          user_id: currentUser.id,
          job_id: jobId,
          is_applied: newStatus
        }]);
      error = result.error;
    }

    if (error) {
      console.error("Error updating application status:", error);
      setAppliedJobs(prev => ({ ...prev, [jobId]: isCurrentlyApplied }));
      showToastMessage("Failed to update status. Please try again.", "danger");
    } else {
      showToastMessage(" Marked as Applied! Good luck with your application!", "success");
      // Refresh platform applied jobs so Applied tab updates
      if (currentUser) loadAddedJobs(currentUser.id);
    }
  };

  // NEW: Show toast message
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // CHANGE 2: Email Alerts toggle handler
  const handleEmailAlertsToggle = () => {
    setEmailAlerts(prev => !prev);
    setShowEmailToast(true);
    setTimeout(() => setShowEmailToast(false), 4000);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);

        const fetchProfile = async () => {
          const { data } = await supabase
            .from('profiles')
            .select('role, degree, branch, passout_year, notifications_enabled')
            .eq('id', user.id)
            .single();

          if (data) {
            setUserRole(data.role);
            setUserProfile(data);
          }
        };

        fetchProfile();
        fetchAppliedJobs(user.id);
        loadAddedJobs(user.id);

        const profileSubscription = supabase
          .channel('profile-changes')
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            (payload) => {
              setUserProfile(payload.new);
            })
          .subscribe();

        const applicationsSubscription = supabase
          .channel('job-applications-status-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'job_applications_status', filter: `user_id=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                setAppliedJobs(prev => ({
                  ...prev,
                  [payload.new.job_id]: payload.new.is_applied
                }));
              } else if (payload.eventType === 'DELETE') {
                setAppliedJobs(prev => {
                  const updated = { ...prev };
                  delete updated[payload.old.job_id];
                  return updated;
                });
              }
              // Refresh applied jobs list for Applied tab
              loadAddedJobs(user.id);
            })
          .subscribe();

        // Real-time for manual job_applications
        const manualJobsSubscription = supabase
          .channel('applied-jobs-realtime')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'job_applications', filter: `user_id=eq.${user.id}` },
            () => { loadAddedJobs(user.id); })
          .subscribe();

        return () => {
          supabase.removeChannel(profileSubscription);
          supabase.removeChannel(applicationsSubscription);
          supabase.removeChannel(manualJobsSubscription);
        };
      }
    };

    checkUser();
    fetchJobs();

    const interval = setInterval(() => {
      setLoadStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 600);

    const timer = setTimeout(() => {
      setLoading(false);
      clearInterval(interval);
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // --- FEATURE: LOGIC ---
  const today = new Date().toISOString().split('T')[0];
  const liveJobs = jobs.filter(j => j.expiry_date >= today);
  const expiredJobs = jobs.filter(j => j.expiry_date < today);
  const displayedJobs = activeTab === "live" ? liveJobs : expiredJobs;

  // ── APPLIED TAB: combine manual + platform jobs ──
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const filteredManualJobs = manualJobs.filter((job) => {
    const matchSearch = job.company.toLowerCase().includes(search.toLowerCase());
    const jobEntryDate = job.applieddate || job.appliedDate || job.date;
    // MODIFIED: If searching, ignore the date filter. Otherwise, match the date.
    const matchDate = search.trim() !== "" ? true : filterDate === "" ? true : jobEntryDate === filterDate;
    return matchSearch && matchDate;
  });

  const filteredPlatformJobs = platformAppliedJobs.filter((item) => {
    const job = item.admin_jobs;
    if (!job) return false;
    const matchSearch = job.company_name.toLowerCase().includes(search.toLowerCase());
    const jobEntryDate = item.created_at.split('T')[0];
    // MODIFIED: If searching, ignore the date filter. Otherwise, match the date.
    const matchDate = search.trim() !== "" ? true : filterDate === "" ? true : jobEntryDate === filterDate;
    return matchSearch && matchDate;
  });

  const allFilteredAppliedJobs = [
    ...filteredPlatformJobs.map(item => ({ ...item, isFromPlatform: true, displayData: item.admin_jobs })),
    ...filteredManualJobs.map(job => ({ ...job, isFromPlatform: false, displayData: job }))
  ];

  let dateCardText = filterDate === "" ? "All Time" : filterDate;
  if (filterDate === todayStr) dateCardText = "Today";
  else if (filterDate === yesterdayStr) dateCardText = "Yesterday";

  const countForDate = allFilteredAppliedJobs.length;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentAppliedJobs = allFilteredAppliedJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(allFilteredAppliedJobs.length / jobsPerPage);
  const startPage = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabLoading(true);
    setLoadStep(0);
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");

    const interval = setInterval(() => {
      setLoadStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 200);

    setTimeout(() => {
      setTabLoading(false);
      clearInterval(interval);
    }, 800);
  };

  const checkEligibility = (job) => {
    if (!userProfile) return false;
    const degreeMatch = job.eligible_degree === "Any Degree" ||
      (userProfile.degree && job.eligible_degree.toLowerCase().includes(userProfile.degree.toLowerCase()));
    const branchMatch = job.eligible_branches === "All Branches" ||
      (userProfile.branch && job.eligible_branches.toLowerCase().includes(userProfile.branch.toLowerCase()));
    const yearMatch = !job.passout_year ||
      (userProfile.passout_year && job.passout_year.toString().includes(userProfile.passout_year.toString()));
    return degreeMatch && branchMatch && yearMatch;
  };

  const handleDegreeToggle = (degree) => {
    let currentDegrees = newJob.eligible_degree ? newJob.eligible_degree.split(", ") : [];
    if (degree === "Any Degree") {
      currentDegrees = ["Any Degree"];
    } else {
      currentDegrees = currentDegrees.filter(d => d !== "Any Degree");
      if (currentDegrees.includes(degree)) {
        currentDegrees = currentDegrees.filter(d => d !== degree);
      } else {
        currentDegrees.push(degree);
      }
    }
    setNewJob({ ...newJob, eligible_degree: currentDegrees.join(", ") });
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      company_name: newJob.company_name,
      role: newJob.role,
      salary: newJob.salary,
      location: newJob.location,
      eligible_degree: newJob.eligible_degree,
      eligible_branches: newJob.eligible_branches,
      min_cgpa: newJob.min_cgpa,
      passout_year: newJob.passout_year,
      expiry_date: newJob.expiry_date || null,
      apply_link: newJob.apply_link,
      experience: newJob.experience
    };

    const { error } = await supabase.from('admin_jobs').insert([submissionData]);

    if (error) {
      console.error("Submission error:", error);
      alert(`Failed to publish: ${error.message}`);
    } else {
      await fetchJobs();
      setShowAdminForm(false);
      setNewJob({
        company_name: "", salary: "", role: "", location: "",
        passout_year: "", eligible_branches: "All Branches",
        eligible_degree: "B.Tech", expiry_date: "", apply_link: "",
        min_cgpa: "", experience: "Fresher"
      });
    }
    setIsSubmitting(false);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // ── ADDED JOBS: Download Resume ──
  const downloadResume = (job) => {
    try {
      const base64 = job.resume_data || job.resumeData;
      const fileName = job.resume_name || job.resumeName || `${job.company}_Resume.pdf`;
      if (!base64) { showToastMessage("No resume file found for this application", "warning"); return; }
      const link = document.createElement("a");
      link.href = base64;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastMessage("Downloading Resume...", "success");
    } catch (error) {
      showToastMessage("Error downloading file", "danger");
    }
  };

  // ── ADDED JOBS: Platform status update ──
  const handlePlatformStatusUpdate = async (jobItem, newStatus) => {
    const { error } = await supabase
      .from("job_applications_status")
      .update({ status: newStatus })
      .eq("id", jobItem.id);

    if (error) { showToastMessage("Failed to update status", "danger"); return; }

    setPlatformAppliedJobs(prev =>
      prev.map(item => item.id === jobItem.id ? { ...item, status: newStatus } : item)
    );
    showToastMessage(`Status updated to ${newStatus}`, "success");
  };

  // ── ADDED JOBS: Manual status update ──
  const handleManualStatusUpdate = async (job, newStatus) => {
    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", job.id);

    if (error) { showToastMessage("Failed to update status", "danger"); return; }

    setManualJobs(prev =>
      prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j)
    );
    showToastMessage(`Status updated to ${newStatus}`, "success");
  };

  const ProfessionalLoader = () => (
    <div className="system-loader-container">
      <div className="orbit-container">
        <div className="orbit-ring"></div>
        <div className="orbit-ring-inner"></div>
        <Cpu size={32} className="processor-icon" />
      </div>
      <div className="terminal-text">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <Activity size={14} className="text-primary" />
          <span className="step-text">
            {loadStep === 0 && "ESTABLISHING SECURE HANDSHAKE..."}
            {loadStep === 1 && "QUERYING GLOBAL JOB REPOSITORIES..."}
            {loadStep === 2 && "VERIFYING CORPORATE SSL ENDPOINTS..."}
            {loadStep >= 3 && "SYNCING LIVE FEED..."}
          </span>
        </div>
        <div className="progress-mini">
          <div className="progress-mini-fill" style={{ width: `${(loadStep + 1) * 25}%` }}></div>
        </div>
      </div>
    </div>
  );

  // ── RENDER APPLIED JOB CARD ──
  const renderAppliedJobCard = (jobItem, index) => {
    const isFromPlatform = jobItem.isFromPlatform;

    if (isFromPlatform) {
      const job = jobItem.displayData;
      const displayDate = jobItem.created_at.split('T')[0];
      const currentStatus = jobItem.status || "Applied";

      return (
        <Col key={`platform-${jobItem.id}`} xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm applied-job-card platform-job-card p-3">
            <div className="platform-badge-container">
              <Badge style={{
                background: 'linear-gradient(135deg, #6c5dff 0%, #5a4ee0 100%)',
                fontSize: '0.7rem', padding: '4px 10px', fontWeight: '700', letterSpacing: '0.5px'
              }}>
                ✓ Applied from Platform
              </Badge>
            </div>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="fw-bold">{job.company_name}</h6>
                <Dropdown align="end">
                  <Dropdown.Toggle variant={statusColors[currentStatus]} size="sm" className="status-dropdown-toggle">
                    {currentStatus}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(statusColors).map((status) => (
                      <Dropdown.Item key={status} onClick={() => handlePlatformStatusUpdate(jobItem, status)}>
                        {status}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <p className="text-muted mb-1">{job.role}</p>
              <hr />
              <p className="mb-1 small"><strong>Experience:</strong> {job.experience || "Fresher"}</p>
              <p className="mb-1 small"><strong>Location:</strong> {job.location || "Not specified"}</p>
              <p className="mb-1 small"><strong>Salary:</strong> {job.salary || "As per norms"}</p>
              <p className="mb-1 small"><strong>Applied Date:</strong> {displayDate}</p>
              <div className="mt-3">
                <a href={job.apply_link} target="_blank" rel="noreferrer"
                  className="btn btn-sm w-100"
                  style={{ background: '#6c5dff', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: '600', fontSize: '0.85rem' }}>
                  View Job Details →
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      );
    } else {
      const job = jobItem.displayData;
      const resumeName = job.resume_name || job.resumeName || "Not Uploaded";
      const hasResume = job.resume_data || job.resumeData;
      const displayDate = job.applieddate || job.appliedDate || job.date;

      return (
        <Col key={job.id || index} xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm applied-job-card p-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="fw-bold">{job.company}</h6>
                <Dropdown align="end">
                  <Dropdown.Toggle variant={statusColors[job.status]} size="sm" className="status-dropdown-toggle">
                    {job.status}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(statusColors).map((status) => (
                      <Dropdown.Item key={status} onClick={() => handleManualStatusUpdate(job, status)}>
                        {status}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <p className="text-muted mb-1">{job.role}</p>
              <hr />
              <p className="mb-1 small"><strong>Platform:</strong> {job.platform}</p>
              <p className="mb-1 small"><strong>Location:</strong> {job.location}</p>
              <p className="mb-1 small"><strong>Salary:</strong> {job.salary} LPA</p>
              <p className="mb-1 small"><strong>Bond:</strong> {job.bond}</p>
              <p className="mb-1 small"><strong>Applied Date:</strong> {displayDate}</p>
              <div className="mt-2 d-flex align-items-center justify-content-between">
                <span className="text-truncate text-muted small" style={{ maxWidth: 160, fontSize: "13px" }}>
                  <strong>Resume:</strong> {resumeName}
                </span>
                {hasResume && (
                  <div title="Download Resume"
                    style={{ cursor: "pointer", backgroundColor: "#f4f4f4", padding: "8px", borderRadius: "50%", display: "flex", transition: "0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f4")}
                    onClick={() => downloadResume(job)}>
                    <FaDownload size={14} style={{ color: NAVBAR_COLOR }} />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      );
    }
  };

  return (
    <div style={{
      marginLeft: "50px",
      padding: "40px 20px",
      background: "#f8f9fc",
      minHeight: "100vh",
      width: "calc(100% - 80px)",
    }}>
      <style>
        {`
          .system-loader-container { padding: 40px 0; display: flex; flex-direction: column; align-items: center; }
          .orbit-container { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; }
          .orbit-ring { position: absolute; width: 100%; height: 100%; border: 2px solid rgba(108, 93, 255, 0.1); border-top: 2px solid #6c5dff; border-radius: 50%; animation: spin 1s linear infinite; }
          .orbit-ring-inner { position: absolute; width: 70%; height: 70%; border: 1px dashed rgba(108, 93, 255, 0.3); border-radius: 50%; animation: spin-reverse 2s linear infinite; }
          .processor-icon { color: #6c5dff; animation: pulse-glow 1.5s infinite ease-in-out; }
          .terminal-text { font-family: 'Monaco', 'Consolas', monospace; text-align: center; }
          .step-text { font-size: 11px; letter-spacing: 1px; color: #475569; font-weight: 600; }
          .progress-mini { width: 200px; height: 2px; background: #e2e8f0; margin: 10px auto; border-radius: 10px; overflow: hidden; }
          .progress-mini-fill { height: 100%; background: #6c5dff; transition: width 0.4s ease; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
          @keyframes pulse-glow { 0%, 100% { filter: drop-shadow(0 0 2px rgba(108, 93, 255, 0)); } 50% { filter: drop-shadow(0 0 8px rgba(108, 93, 255, 0.5)); } }
          
          .platform-scroller { display: flex; align-items: center; gap: 10px; margin: 30px 0; width: 100%; }
          .scroll-area { display: flex; gap: 15px; overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none; padding: 10px 5px; }
          .scroll-area::-webkit-scrollbar { display: none; }
          .nav-btn { width: 35px; height: 35px; border-radius: 50%; background: #fff; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); flex-shrink: 0; transition: all 0.3s ease; }
          .nav-btn:hover { background: linear-gradient(135deg, #6c5dff 0%, #3f3697 100%); color: #fff; transform: scale(1.1); }
          .platform-item { min-width: 160px; background: #fff; border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; gap: 10px; text-decoration: none !important; color: #333; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #f0f0f0; transition: all 0.2s ease; }
          .platform-item:hover { border-color: #6c5dff; transform: translateY(-2px); }

          .disclaimer-card {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #310d0d 100%);
            border-radius: 20px; padding: 30px; color: white; display: flex; align-items: flex-start; gap: 20px; margin-bottom: 40px; border-left: 6px solid #ef4444; position: relative; overflow: hidden;
          }
          .disclaimer-card::after { content: ''; position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%); pointer-events: none; }

          .job-card-clean {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          }
          .job-card-clean:hover {
            box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
            border-color: #6c5dff;
          }
          .card-disabled {
            opacity: 0.6;
            filter: grayscale(0.4);
            pointer-events: none;
            background: #fcfcfc;
          }

          .job-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
          .company-name { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2; }
          .job-role { font-size: 0.95rem; color: #64748b; margin-bottom: 12px; font-weight: 500; }
          .info-divider { height: 1px; background: #f1f5f9; margin: 12px 0; }
          .info-grid { display: grid; gap: 6px; margin-bottom: 16px; }
          .info-row { display: flex; align-items: center; font-size: 0.85rem; color: #475569; }
          .info-label { font-weight: 700; min-width: 80px; color: #1e293b; }
          .eligibility-status { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
          .dot { width: 6px; height: 6px; border-radius: 50%; }
          .status-eligible { background: #dcfce7; color: #166534; }
          .status-eligible .dot { background: #22c55e; animation: blink-g 1s infinite; }
          .status-not-eligible { background: #fee2e2; color: #991b1b; }
          .status-not-eligible .dot { background: #ef4444; }
          @keyframes blink-g { 50% { opacity: 0.3; } }

          .apply-btn-primary {
            background: #6c5dff; color: white !important; border: none; border-radius: 8px; padding: 10px 0;
            font-weight: 700; font-size: 0.9rem; width: 100%; display: flex; align-items: center;
            justify-content: center; gap: 8px; transition: all 0.2s ease; text-decoration: none !important; margin-top: auto;
          }
          .apply-btn-primary:hover { background: #5a4ee0; transform: translateY(-2px); }
          .apply-btn-primary.btn-applied-disabled { background: #94a3b8 !important; cursor: not-allowed !important; pointer-events: none !important; transform: none !important; opacity: 0.75; }

          .applied-checkbox-container { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px; background: #f8f9fc; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; user-select: none; }
          .applied-checkbox-container:hover { background: #eef2ff; }
          .applied-checkbox-container.checked { background: #dcfce7; border: 1px solid #22c55e; cursor: not-allowed; }
          .applied-checkbox-container.checked:hover { background: #dcfce7; }
          .applied-checkbox { width: 24px; height: 24px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; flex-shrink: 0; }
          .applied-checkbox.checked { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-color: #22c55e; animation: checkmark-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4); }
          .applied-checkbox-label { font-size: 0.85rem; font-weight: 600; color: #475569; }
          .applied-checkbox-container.checked .applied-checkbox-label { color: #166534; font-weight: 700; }
          .applied-checkbox-container.disabled-checkbox { background: #f1f5f9; cursor: not-allowed; opacity: 0.55; }
          .applied-checkbox-container.disabled-checkbox:hover { background: #f1f5f9; }
          .applied-checkbox-container.disabled-checkbox .applied-checkbox-label { color: #94a3b8; }
          @keyframes checkmark-pop { 0% { transform: scale(0.5) rotate(-180deg); opacity: 0; } 50% { transform: scale(1.15) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

          .custom-toast { position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 280px; max-width: calc(100vw - 40px); box-shadow: 0 12px 40px rgba(0,0,0,0.25); border-radius: 16px; animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); border: 2px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); }
          @media (max-width: 480px) { .custom-toast { top: auto; bottom: 20px; right: 12px; left: 12px; min-width: unset; max-width: unset; width: auto; border-radius: 14px; } }
          @keyframes toastSlideIn { 0% { transform: translateX(500px) translateY(-20px) rotate(10deg); opacity: 0; } 60% { transform: translateX(-20px) translateY(0) rotate(-2deg); opacity: 1; } 80% { transform: translateX(10px) translateY(0) rotate(1deg); } 100% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; } }
          .toast-header { border-radius: 14px 14px 0 0 !important; font-weight: 700; padding: 12px 16px !important; background: rgba(255,255,255,0.95) !important; }
          .toast-body { border-radius: 0 0 14px 14px !important; padding: 16px !important; font-size: 0.95rem; font-weight: 500; }
          .custom-toast.bg-success { animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), successPulse 2s ease-in-out infinite; }
          @keyframes successPulse { 0%, 100% { box-shadow: 0 12px 40px rgba(34, 197, 94, 0.25); } 50% { box-shadow: 0 12px 40px rgba(34, 197, 94, 0.4); } }

          .email-toast-modern { position: fixed; top: 24px; right: 24px; z-index: 99999; width: min(380px, calc(100vw - 24px)); background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 20px; padding: 0; overflow: hidden; box-shadow: 0 24px 60px rgba(108, 93, 255, 0.35), 0 8px 24px rgba(0,0,0,0.4); animation: emailToastIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid rgba(108, 93, 255, 0.3); }
          @media (max-width: 480px) { .email-toast-modern { top: auto; bottom: 16px; right: 12px; left: 12px; width: auto; border-radius: 16px; } }
          @keyframes emailToastIn { 0% { transform: translateY(-120px) scale(0.8) rotate(-3deg); opacity: 0; } 60% { transform: translateY(8px) scale(1.02) rotate(0deg); opacity: 1; } 80% { transform: translateY(-4px) scale(0.99); } 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; } }
          .email-toast-glow-bar { height: 3px; background: linear-gradient(90deg, #6c5dff, #a78bfa, #6c5dff); background-size: 200% 100%; animation: shimmer 2s linear infinite; }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .email-toast-body-inner { padding: 20px 22px 22px; position: relative; }
          .email-toast-icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: rgba(108, 93, 255, 0.2); border: 1px solid rgba(108, 93, 255, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; animation: iconPulse 2s ease-in-out infinite; }
          @keyframes iconPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(108, 93, 255, 0.3); } 50% { box-shadow: 0 0 0 8px rgba(108, 93, 255, 0); } }
          .email-toast-title { font-size: 0.95rem; font-weight: 800; color: #fff; letter-spacing: 0.2px; margin-bottom: 3px; }
          .email-toast-subtitle { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }
          .email-toast-badge { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; }
          .email-toast-desc { font-size: 0.82rem; color: #94a3b8; line-height: 1.6; margin-top: 14px; padding: 12px 14px; background: rgba(255,255,255,0.04); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); }
          .email-toast-close-btn { position: absolute; top: 14px; right: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.08); border: none; color: #64748b; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; line-height: 1; }
          .email-toast-close-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
          .email-toast-progress { height: 3px; background: rgba(255,255,255,0.06); margin: 16px 0 0; border-radius: 10px; overflow: hidden; }
          .email-toast-progress-fill { height: 100%; background: linear-gradient(90deg, #6c5dff, #a78bfa); border-radius: 10px; animation: progressDrain 4s linear forwards; }
          @keyframes progressDrain { from { width: 100%; } to { width: 0%; } }

          .form-control-prof { border: 1.5px solid #e2e8f0; padding: 10px 15px; font-size: 0.95rem; transition: all 0.2s; border-radius: 10px !important; }
          .form-control-prof:focus { border-color: #6c5dff; box-shadow: 0 0 0 4px rgba(108, 93, 255, 0.1); }
          .form-label-prof { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: #64748b; margin-bottom: 6px; }

          .toggle-container { background: #e2e8f0; padding: 4px; border-radius: 12px; display: inline-flex; gap: 4px; }
          .toggle-btn { border: none; padding: 8px 20px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; transition: all 0.2s ease; cursor: pointer; color: #64748b; background: transparent; }
          .toggle-btn.active { background: #ffffff; color: #6c5dff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

          .degree-multi-select { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 15px; width: 100%; text-align: left; font-size: 0.9rem; color: #475569; display: flex; justify-content: space-between; align-items: center; }
          .degree-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
          .degree-item:hover { background: #f8f9fc; }

          .email-alerts-toggle { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 16px; cursor: pointer; transition: all 0.2s ease; user-select: none; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
          .email-alerts-toggle:hover { border-color: #6c5dff; box-shadow: 0 4px 12px rgba(108, 93, 255, 0.1); }
          .email-alerts-label { font-size: 0.85rem; font-weight: 700; color: #475569; }
          .toggle-switch { position: relative; width: 40px; height: 22px; background: #e2e8f0; border-radius: 11px; transition: background 0.3s ease; flex-shrink: 0; }
          .toggle-switch.on { background: #6c5dff; }
          .toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.3s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
          .toggle-switch.on .toggle-knob { transform: translateX(18px); }

          @media (max-width: 767.98px) {
            .admin-modal-dialog { margin: 0 !important; max-width: 100% !important; width: 100% !important; display: flex !important; align-items: flex-end !important; }
            .admin-modal-dialog .modal-content { border-radius: 24px 24px 0 0 !important; max-height: 92vh !important; display: flex !important; flex-direction: column !important; }
            .admin-modal-dialog .modal-header { flex-shrink: 0; padding: 16px 20px 8px !important; position: sticky; top: 0; background: #fff; z-index: 10; border-bottom: 1px solid #f1f5f9 !important; }
            .admin-modal-body { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; flex: 1 1 auto !important; padding: 16px !important; }
            .admin-modal-body .form-control-prof { font-size: 0.88rem; padding: 9px 12px; }
            .admin-modal-body .form-label-prof { font-size: 0.75rem; }
            .admin-modal-body .mb-3 { margin-bottom: 0.6rem !important; }
            .admin-modal-title { font-size: 1.1rem !important; }
            .admin-submit-btn-wrap { position: sticky; bottom: 0; background: #fff; padding: 12px 0 4px; margin-top: 8px; z-index: 5; }
          }
          @media (min-width: 768px) {
            .admin-modal-dialog .modal-content { max-height: 90vh; display: flex; flex-direction: column; }
            .admin-modal-body { overflow-y: auto !important; flex: 1 1 auto; padding: 24px !important; }
          }

          .recent-jobs-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0; flex-wrap: wrap; gap: 12px; }
          @media (max-width: 576px) {
            .recent-jobs-header { flex-direction: column; }
            .recent-jobs-header h1 { font-size: 1.8rem !important; letter-spacing: -1px !important; }
            .recent-jobs-header p { font-size: 0.95rem !important; }
          }

          .jobs-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px; }
          .tab-email-row { display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 1rem; }

          @media (max-width: 576px) {
            .disclaimer-card { flex-direction: column; gap: 14px; padding: 20px; }
            .disclaimer-card h5 { font-size: 0.85rem !important; }
            .disclaimer-card p { font-size: 0.8rem !important; }
          }

          /* ── APPLIED JOBS TAB STYLES ── */
          .applied-job-card { border-radius: 12px; transition: all 0.2s ease-in-out; border: 1px solid #e0e0e0; background: white; }
          .applied-job-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(17,16,46,0.1) !important; border: 1px solid #11102e; }
          .platform-job-card { position: relative; border: 2px solid #6c5dff !important; background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%) !important; }
          .platform-job-card:hover { border: 2px solid #5a4ee0 !important; box-shadow: 0 12px 30px rgba(108, 93, 255, 0.2) !important; }
          .platform-badge-container { position: absolute; top: -12px; right: 16px; z-index: 10; }
          .status-dropdown-toggle { border: 2px solid rgba(255,255,255,0.4) !important; border-radius: 8px !important; font-weight: 600 !important; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .status-dropdown-toggle:hover { border: 2px solid rgba(255,255,255,0.8) !important; transform: scale(1.02); }
          .btn-secondary.status-dropdown-toggle { border-color: #6c757d !important; background: transparent; color: #6c757d; }
          .btn-info.status-dropdown-toggle { border-color: #0dcaf0 !important; background: transparent; color: #0dcaf0; }
          .btn-primary.status-dropdown-toggle { border-color: #0d6efd !important; background: transparent; color: #0d6efd; }
          .btn-warning.status-dropdown-toggle { border-color: #ffc107 !important; background: transparent; color: #856404; }
          .btn-success.status-dropdown-toggle { border-color: #198754 !important; background: transparent; color: #198754; }
          .btn-danger.status-dropdown-toggle { border-color: #dc3545 !important; background: transparent; color: #dc3545; }

          .today-badge-card { background: linear-gradient(135deg, #11102e 0%, #2a285c 100%); color: #fff; border: none; border-radius: 15px; min-width: 140px; box-shadow: 0 4px 15px rgba(17, 16, 46, 0.2); }

          .page-item.active .page-link { background-color: #11102e !important; border-color: #11102e !important; color: white !important; }
          .page-link { color: #11102e; padding: 8px 16px; border-radius: 6px; margin: 0 2px; border: 1px solid #dee2e6; }

          /* Applied tab search/filter bar */
          .applied-filter-bar { background: #fff; border-radius: 14px; padding: 16px 20px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          .applied-count-badge { background: linear-gradient(135deg, #11102e 0%, #2a285c 100%); color: #fff; border: none; border-radius: 12px; padding: 10px 20px; display: flex; flex-direction: column; align-items: center; min-width: 120px; }
        `}
      </style>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        className="custom-toast"
        bg={toastVariant}
      >
        <Toast.Header>
          <strong className="me-auto">
            {toastVariant === "success" && "✓ Success"}
            {toastVariant === "warning" && "⚠ Warning"}
            {toastVariant === "danger" && "✕ Error"}
            {toastVariant === "info" && "ℹ Info"}
          </strong>
        </Toast.Header>
        <Toast.Body className={toastVariant === "success" || toastVariant === "danger" ? "text-white" : ""}>
          {toastMessage}
        </Toast.Body>
      </Toast>

      {/* Modern Email Alert Toast */}
      {showEmailToast && (
        <div className="email-toast-modern">
          <div className="email-toast-glow-bar"></div>
          <div className="email-toast-body-inner">
            <button className="email-toast-close-btn" onClick={() => setShowEmailToast(false)}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="email-toast-icon-wrap">
                <Mail size={20} color="#a78bfa" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="email-toast-title">Email Job Alerts</div>
                  <span className="email-toast-badge">🚧 Coming Soon</span>
                </div>
                <div className="email-toast-subtitle">Notification preferences</div>
              </div>
            </div>
            <div className="email-toast-desc">
              We're building this feature! Soon you'll receive real-time job alerts directly in your inbox whenever new opportunities matching your profile are posted.
            </div>
            <div className="email-toast-progress">
              <div className="email-toast-progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="recent-jobs-header">
        <div>
          <h1 className="fw-bold" style={{ fontSize: '2.5rem', letterSpacing: '-1.5px', color: '#0f172a' }}>Recent Openings</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Direct access to career opportunities within premier corporate ecosystems.</p>
        </div>

        {userRole === 'admin' && (
          <Button
            onClick={() => setShowAdminForm(true)}
            style={{ background: '#6c5dff', border: 'none', borderRadius: '12px', padding: '12px 24px' }}
            className="d-flex align-items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> <strong>Post Job</strong>
          </Button>
        )}
      </div>

      {/* Platforms */}
      <div className="platform-scroller">
        <div className="nav-btn" onClick={() => scroll("left")}><ChevronLeft size={18} /></div>
        <div className="scroll-area" ref={scrollRef}>
          {platforms.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" className="platform-item">
              <div style={{ background: `${p.color}15`, padding: '6px', borderRadius: '50%' }}>
                <Globe size={16} style={{ color: p.color }} />
              </div>
              <span style={{ fontSize: '14px' }}>{p.name}</span>
              <ExternalLink size={12} className="ms-auto opacity-25" />
            </a>
          ))}
        </div>
        <div className="nav-btn" onClick={() => scroll("right")}><ChevronRight size={18} /></div>
      </div>

      <div className="disclaimer-card shadow-lg">
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.3)', flexShrink: 0 }}>
          <Shield size={32} color="#70d1da" />
        </div>
        <div style={{ zIndex: 1 }}>
          <h5 className="fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1.5px', color: '#70d1da' }}>SECURE NAVIGATION & ANTI-FRAUD DIRECTIVE</h5>
          <p className="mb-0 text-white-50 small font-italic" style={{ lineHeight: '1.6' }}>
            <strong>Disclaimer:</strong> This platform serves as a navigational bridge to official career portals.
            We do not facilitate, authorize, or accept responsibility for any financial transactions.
            Engagement in such requests is at the user's own risk.</p>
        </div>
      </div>

      {/* Main Jobs Area */}
      <div>
        <div className="jobs-section-header">
          <h3 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Direct Career Openings</h3>

          {/* Email Alerts Toggle */}
          <div className="email-alerts-toggle" onClick={handleEmailAlertsToggle} title="Toggle Email Alerts">
            <Mail size={16} color={emailAlerts ? "#6c5dff" : "#94a3b8"} />
            <span className="email-alerts-label" style={{ color: emailAlerts ? "#6c5dff" : "#475569" }}>
              Email Alerts
            </span>
            <div className={`toggle-switch ${emailAlerts ? 'on' : ''}`}>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

        {/* ── TABS: Live / Applied / Expired ── */}
        {!loading && (
          <div className="tab-email-row">
            <div className="toggle-container">
              <button
                className={`toggle-btn ${activeTab === 'live' ? 'active' : ''}`}
                onClick={() => handleTabChange('live')}
              >
                Live Jobs ({liveJobs.length})
              </button>
              <button
                className={`toggle-btn ${activeTab === 'applied' ? 'active' : ''}`}
                onClick={() => handleTabChange('applied')}
              >
                Applied Jobs ({manualJobs.length + platformAppliedJobs.length})
              </button>
              <button
                className={`toggle-btn ${activeTab === 'expired' ? 'active' : ''}`}
                onClick={() => handleTabChange('expired')}
              >
                Expired ({expiredJobs.length})
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: '0' }}>

          {/* ── LIVE / EXPIRED TAB CONTENT ── */}
          {(activeTab === 'live' || activeTab === 'expired') && (
            <>
              {(loading || tabLoading) ? (
                <div className="bg-white p-5 rounded-4 shadow-sm"><ProfessionalLoader /></div>
              ) : displayedJobs.length > 0 ? (
                <Row>
                  {displayedJobs.map((job, idx) => {
                    const eligible = checkEligibility(job);
                    const isExpired = job.expiry_date < today;
                    const isApplied = appliedJobs[job.id] || false;

                    return (
                      <Col md={6} lg={4} key={idx} className="mb-4">
                        <div className={`job-card-clean ${isExpired ? 'card-disabled' : ''}`}>
                          <div className="job-card-header">
                            <h2 className="company-name">{job.company_name}</h2>
                            {userProfile && !isExpired && (
                              <div className={`eligibility-status ${eligible ? 'status-eligible' : 'status-not-eligible'}`}>
                                <div className="dot"></div>
                                {eligible ? "Eligible" : "Not Eligible"}
                              </div>
                            )}
                          </div>

                          <div className="job-role">{job.role}</div>
                          <div className="info-divider"></div>

                          <div className="info-grid">
                            <div className="info-row"><span className="info-label">Exp:</span> {job.experience || "Fresher"}</div>
                            <div className="info-row"><span className="info-label">Salary:</span> {job.salary || "As per norms"}</div>
                            <div className="info-row"><span className="info-label">Location:</span> {job.location || "Multiple"}</div>
                            <div className="info-row"><span className="info-label">Degree:</span> {job.eligible_degree}</div>
                            <div className="info-row"><span className="info-label">Min CGPA:</span> {job.min_cgpa || "No criteria"}</div>
                            <div className="info-row"><span className="info-label">Batch:</span> {job.passout_year}</div>
                            <div className="info-row"><span className="info-label">Deadline:</span> {job.expiry_date || "Open"}</div>
                            {job.eligible_branches && (
                              <div className="info-row"><span className="info-label">Branches:</span> {job.eligible_branches}</div>
                            )}
                          </div>

                          <a
                            href={isExpired || isApplied ? "#" : job.apply_link}
                            target={isExpired || isApplied ? "" : "_blank"}
                            rel="noreferrer"
                            className={`apply-btn-primary ${isExpired ? '' : isApplied ? 'btn-applied-disabled' : ''}`}
                            style={{ background: isExpired ? '#94a3b8' : isApplied ? '#94a3b8' : '#6c5dff' }}
                            onClick={isApplied ? (e) => e.preventDefault() : undefined}
                          >
                            {isExpired ? "Position Closed" : isApplied ? "Already Applied" : "Apply Now"}
                            <ArrowRight size={16} />
                          </a>

                          {!isExpired && currentUser && (
                            <div
                              className={`applied-checkbox-container ${isApplied ? 'checked' : ''} ${!eligible && !isApplied ? 'disabled-checkbox' : ''}`}
                              onClick={() => (!eligible && !isApplied) ? undefined : handleAppliedToggle(job.id)}
                              title={!eligible && !isApplied ? "You are not eligible for this job" : ""}
                            >
                              <div className={`applied-checkbox ${isApplied ? 'checked' : ''}`}>
                                {isApplied && <Check size={16} color="white" strokeWidth={3} />}
                              </div>
                              <span className="applied-checkbox-label">
                                {isApplied ? " I Applied to this job" : !eligible ? "Not Eligible to Apply" : "Mark as Applied"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className="py-5 text-center bg-white rounded-4 shadow-sm">
                  <Layers size={48} className="text-muted mb-3 opacity-25" />
                  <h5 className="fw-bold text-dark">No Listings Found</h5>
                  <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                    Please check daily for more updates
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── APPLIED JOBS TAB CONTENT ── */}
          {activeTab === 'applied' && (
            <div>
              {/* Filter Bar */}
              <div className="applied-filter-bar">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                  <Form.Control
                    placeholder="Search by company Name"
                    style={{ borderRadius: "8px", maxWidth: '300px' }}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                  <Form.Control
                    type="date"
                    style={{ borderRadius: "8px", maxWidth: '180px' }}
                    value={filterDate}
                    max={todayStr}
                    onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                    disabled={search.trim() !== ""}
                  />
                  {filterDate !== "" && (
                    <button
                      onClick={() => { setFilterDate(""); setCurrentPage(1); }}
                      style={{ border: '1px solid #e2e8f0', background: '#f8f9fc', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                    >
                      Clear Date ✕
                    </button>
                  )}
                </div>
                <div className="applied-count-badge">
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75 }}>
                    {search.trim() !== "" ? "Found" : dateCardText}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{countForDate}</span>
                    <Badge bg="light" text="dark" pill style={{ fontSize: '0.7rem' }}>Applications</Badge>
                  </div>
                </div>
              </div>

              {/* Applied Jobs Grid */}
              {(tabLoading || addedJobsLoading) ? (
                <div className="bg-white p-5 rounded-4 shadow-sm"><ProfessionalLoader /></div>
              ) : allFilteredAppliedJobs.length === 0 ? (
                <div className="text-center py-5 d-flex flex-column align-items-center bg-white rounded-4 shadow-sm">
                  <img src={NoJobsImg} alt="No jobs" style={{ maxWidth: "100%", width: "400px", opacity: 0.8 }} />
                  <h5 className="mt-3 text-muted">
                    {search.trim() !== "" ? `No applications found for "${search}"` : filterDate !== "" ? `No Jobs Applied On "${filterDate}"` : `No Applications Yet`}
                  </h5>
                  {(search.trim() === "" && filterDate === "") && (
                    <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mt-2"
                      style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                      Go to Live Jobs tab and mark jobs as Applied ✓
                    </div>
                  )}
                </div>
              ) : (
                <div className="pb-4">
                  <Row className="g-4 mb-4">
                    {currentAppliedJobs.map((job, idx) => renderAppliedJobCard(job, idx))}
                  </Row>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4 mb-4 overflow-auto">
                      <Pagination>
                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                        {startPage > 1 && (<><Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item><Pagination.Ellipsis disabled /></>)}
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                          <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>{page}</Pagination.Item>
                        ))}
                        {endPage < totalPages && (<><Pagination.Ellipsis disabled /><Pagination.Item onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item></>)}
                        <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ADMIN MODAL */}
      <Modal show={showAdminForm} onHide={() => setShowAdminForm(false)} size="lg" centered dialogClassName="admin-modal-dialog">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold admin-modal-title" style={{ color: '#0f172a' }}>Post New Career Opening</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 admin-modal-body">
          <Form onSubmit={handleAdminSubmit}>
            <Row>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Company Name</Form.Label>
                <Form.Control required className="form-control-prof" placeholder="e.g. Microsoft" value={newJob.company_name} onChange={e => setNewJob({ ...newJob, company_name: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Job Role</Form.Label>
                <Form.Control required className="form-control-prof" placeholder="e.g. Backend Developer" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Experience Level</Form.Label>
                <Form.Select required className="form-control-prof" value={newJob.experience} onChange={e => setNewJob({ ...newJob, experience: e.target.value })}>
                  {experienceOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Annual Package (LPA)</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. 10-12 LPA" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Location</Form.Label>
                <Form.Control className="form-control-prof" placeholder="Remote / City" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Required Degrees (Multiple)</Form.Label>
                <Dropdown autoClose="outside">
                  <Dropdown.Toggle className="degree-multi-select shadow-none">
                    {newJob.eligible_degree || "Select Degrees"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100 shadow-lg border-0 py-2" style={{ borderRadius: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                    {degreeOptions.map((degree) => (
                      <div key={degree} className="degree-item" onClick={() => handleDegreeToggle(degree)}>
                        <span className={newJob.eligible_degree.includes(degree) ? "fw-bold text-primary" : ""}>{degree}</span>
                        {newJob.eligible_degree.includes(degree) && <Check size={14} className="text-primary" />}
                      </div>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Eligible Branches</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. CSE, IT, ECE" value={newJob.eligible_branches} onChange={e => setNewJob({ ...newJob, eligible_branches: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Minimum CGPA</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. 7.5 or N/A" value={newJob.min_cgpa} onChange={e => setNewJob({ ...newJob, min_cgpa: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">Target Batch</Form.Label>
                <Form.Control className="form-control-prof" placeholder="2024, 2025" value={newJob.passout_year} onChange={e => setNewJob({ ...newJob, passout_year: e.target.value })} />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Label className="form-label-prof">
                  Application Deadline <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Control required className="form-control-prof" type="date" value={newJob.expiry_date} onChange={e => setNewJob({ ...newJob, expiry_date: e.target.value })} />
              </Col>
              <Col xs={12} className="mb-3">
                <Form.Label className="form-label-prof">Direct Application URL</Form.Label>
                <Form.Control className="form-control-prof" type="url" required placeholder="https://company.com/careers/..." value={newJob.apply_link} onChange={e => setNewJob({ ...newJob, apply_link: e.target.value })} />
              </Col>
            </Row>

            <div className="admin-submit-btn-wrap">
              <Button type="submit" disabled={isSubmitting} className="w-100 py-3 shadow-sm border-0" style={{ background: '#6c5dff', borderRadius: '12px', fontWeight: 800 }}>
                {isSubmitting ? "SYNCING DATA..." : "PUBLISH CAREER LISTING"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RecentJobs;