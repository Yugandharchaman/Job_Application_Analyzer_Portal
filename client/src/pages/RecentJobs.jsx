import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Dropdown, Toast } from "react-bootstrap";
import {
  ExternalLink, Shield, Globe,
  ChevronLeft, ChevronRight, Layers,
  Cpu, Activity, Plus, ArrowRight, Check, Mail
} from "react-feather";
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
    min_cgpa: "", experience: "Fresher" // Added experience default
  });

  // NEW: States for "I Applied" functionality
  const [appliedJobs, setAppliedJobs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // --- NEW: Email Alerts toggle state ---
  const [emailAlerts, setEmailAlerts] = useState(false);
  // CHANGE 2: Separate modern toast for email alerts
  const [showEmailToast, setShowEmailToast] = useState(false);

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

  // MODIFIED: Handle "I Applied" checkbox toggle - ONE TIME ONLY
  const handleAppliedToggle = async (jobId) => {
    if (!currentUser) {
      showToastMessage("Please login to mark jobs as applied", "warning");
      return;
    }

    // MODIFICATION: Check if already applied - if yes, do nothing
    const isCurrentlyApplied = appliedJobs[jobId] || false;
    if (isCurrentlyApplied) {
      showToastMessage("Already marked as applied! You cannot undo this action.", "info");
      return;
    }

    const newStatus = true; // MODIFICATION: Always set to true (one-time only)

    // Optimistic UI update
    setAppliedJobs(prev => ({ ...prev, [jobId]: newStatus }));

    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('job_applications_status')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('job_id', jobId)
      .single();

    let error;

    if (existingRecord) {
      // Update existing record
      const result = await supabase
        .from('job_applications_status')
        .update({ is_applied: newStatus })
        .eq('id', existingRecord.id);
      error = result.error;
    } else {
      // Insert new record
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
      // Revert optimistic update
      setAppliedJobs(prev => ({ ...prev, [jobId]: isCurrentlyApplied }));
      showToastMessage("Failed to update status. Please try again.", "danger");
    } else {
      showToastMessage(" Marked as Applied! Good luck with your application!", "success");
    }
  };

  // NEW: Show toast message
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // CHANGE 2: Email Alerts toggle handler - shows modern separate toast
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

        const profileSubscription = supabase
          .channel('profile-changes')
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            (payload) => {
              setUserProfile(payload.new);
            })
          .subscribe();

        // NEW: Subscribe to job applications status changes
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
            })
          .subscribe();

        return () => {
          supabase.removeChannel(profileSubscription);
          supabase.removeChannel(applicationsSubscription);
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
  // MODIFICATION: Calculate today inside the component body so it's fresh on every render
  const today = new Date().toISOString().split('T')[0];
  const liveJobs = jobs.filter(j => j.expiry_date >= today);
  const expiredJobs = jobs.filter(j => j.expiry_date < today);
  const displayedJobs = activeTab === "live" ? liveJobs : expiredJobs;

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabLoading(true);
    setLoadStep(0);
    setActiveTab(tab);

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
      // CHANGE 1: expiry_date is now mandatory so it will always have a value
      expiry_date: newJob.expiry_date || null,
      apply_link: newJob.apply_link,
      experience: newJob.experience // Included experience in submission
    };

    const { error } = await supabase.from('admin_jobs').insert([submissionData]);

    if (error) {
      console.error("Submission error:", error);
      alert(`Failed to publish: ${error.message}. Check if 'experience' and 'passout_year' columns exist in Supabase.`);
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

          .job-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
          }

          .company-name {
            font-size: 1.1rem;
            font-weight: 800;
            color: #1e293b;
            margin: 0;
            line-height: 1.2;
          }

          .job-role {
            font-size: 0.95rem;
            color: #64748b;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .info-divider {
            height: 1px;
            background: #f1f5f9;
            margin: 12px 0;
          }

          .info-grid {
            display: grid;
            gap: 6px;
            margin-bottom: 16px;
          }

          .info-row {
            display: flex;
            align-items: center;
            font-size: 0.85rem;
            color: #475569;
          }

          .info-label {
            font-weight: 700;
            min-width: 80px;
            color: #1e293b;
          }

          .eligibility-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
          }
          .dot { width: 6px; height: 6px; border-radius: 50%; }
          
          .status-eligible { background: #dcfce7; color: #166534; }
          .status-eligible .dot { background: #22c55e; animation: blink-g 1s infinite; }
          
          .status-not-eligible { background: #fee2e2; color: #991b1b; }
          .status-not-eligible .dot { background: #ef4444; }

          @keyframes blink-g { 50% { opacity: 0.3; } }

          .apply-btn-primary {
            background: #6c5dff;
            color: white !important;
            border: none;
            border-radius: 8px;
            padding: 10px 0;
            font-weight: 700;
            font-size: 0.9rem;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s ease;
            text-decoration: none !important;
            margin-top: auto;
          }
          .apply-btn-primary:hover {
            background: #5a4ee0;
            transform: translateY(-2px);
          }

          /* ADDED: Disabled apply button style when job is already applied */
          .apply-btn-primary.btn-applied-disabled {
            background: #94a3b8 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            transform: none !important;
            opacity: 0.75;
          }

          /* MODIFIED: I Applied Checkbox Styles - ONE TIME ONLY */
          .applied-checkbox-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding: 10px;
            background: #f8f9fc;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
          }
          .applied-checkbox-container:hover {
            background: #eef2ff;
          }
          .applied-checkbox-container.checked {
            background: #dcfce7;
            border: 1px solid #22c55e;
            cursor: not-allowed;
          }
          .applied-checkbox-container.checked:hover {
            background: #dcfce7;
          }
          
          /* MODIFIED: Round checkbox with circular success tick */
          .applied-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid #cbd5e1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
          .applied-checkbox.checked {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-color: #22c55e;
            animation: checkmark-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          }
          .applied-checkbox-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #475569;
          }
          .applied-checkbox-container.checked .applied-checkbox-label {
            color: #166534;
            font-weight: 700;
          }
          @keyframes checkmark-pop {
            0% { transform: scale(0.5) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.15) rotate(0deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }

          /* MODIFIED: Enhanced Toast Styles with More Animations */
          .custom-toast {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 350px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.25);
            border-radius: 16px;
            animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 2px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
          }
          @keyframes toastSlideIn {
            0% {
              transform: translateX(500px) translateY(-20px) rotate(10deg);
              opacity: 0;
            }
            60% {
              transform: translateX(-20px) translateY(0) rotate(-2deg);
              opacity: 1;
            }
            80% {
              transform: translateX(10px) translateY(0) rotate(1deg);
            }
            100% {
              transform: translateX(0) translateY(0) rotate(0deg);
              opacity: 1;
            }
          }
          .toast-header {
            border-radius: 14px 14px 0 0 !important;
            font-weight: 700;
            padding: 12px 16px !important;
            background: rgba(255,255,255,0.95) !important;
            animation: headerGlow 2s ease-in-out infinite;
          }
          @keyframes headerGlow {
            0%, 100% { box-shadow: inset 0 0 0 rgba(108, 93, 255, 0); }
            50% { box-shadow: inset 0 2px 8px rgba(108, 93, 255, 0.15); }
          }
          .toast-body {
            border-radius: 0 0 14px 14px !important;
            padding: 16px !important;
            font-size: 0.95rem;
            font-weight: 500;
            animation: bodyFadeIn 0.5s ease 0.2s both;
          }
          @keyframes bodyFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Success toast specific animation */
          .custom-toast.bg-success {
            animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), successPulse 2s ease-in-out infinite;
          }
          @keyframes successPulse {
            0%, 100% { box-shadow: 0 12px 40px rgba(34, 197, 94, 0.25); }
            50% { box-shadow: 0 12px 40px rgba(34, 197, 94, 0.4); }
          }

          /* CHANGE 2: Modern Email Alert Toast */
          .email-toast-modern {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 99999;
            width: 380px;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 20px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(108, 93, 255, 0.35), 0 8px 24px rgba(0,0,0,0.4);
            animation: emailToastIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: 1px solid rgba(108, 93, 255, 0.3);
          }
          @keyframes emailToastIn {
            0% { transform: translateY(-120px) scale(0.8) rotate(-3deg); opacity: 0; }
            60% { transform: translateY(8px) scale(1.02) rotate(0deg); opacity: 1; }
            80% { transform: translateY(-4px) scale(0.99); }
            100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          }
          .email-toast-glow-bar {
            height: 3px;
            background: linear-gradient(90deg, #6c5dff, #a78bfa, #6c5dff);
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
          }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .email-toast-body-inner {
            padding: 20px 22px 22px;
            position: relative;
          }
          .email-toast-icon-wrap {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(108, 93, 255, 0.2);
            border: 1px solid rgba(108, 93, 255, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            animation: iconPulse 2s ease-in-out infinite;
          }
          @keyframes iconPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(108, 93, 255, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(108, 93, 255, 0); }
          }
          .email-toast-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.2px;
            margin-bottom: 3px;
          }
          .email-toast-subtitle {
            font-size: 0.78rem;
            color: #94a3b8;
            font-weight: 500;
          }
          .email-toast-badge {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            font-size: 0.65rem;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .email-toast-desc {
            font-size: 0.82rem;
            color: #94a3b8;
            line-height: 1.6;
            margin-top: 14px;
            padding: 12px 14px;
            background: rgba(255,255,255,0.04);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.06);
          }
          .email-toast-close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
            border: none;
            color: #64748b;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            line-height: 1;
          }
          .email-toast-close-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
          .email-toast-progress {
            height: 3px;
            background: rgba(255,255,255,0.06);
            margin: 16px 0 0;
            border-radius: 10px;
            overflow: hidden;
          }
          .email-toast-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #6c5dff, #a78bfa);
            border-radius: 10px;
            animation: progressDrain 4s linear forwards;
          }
          @keyframes progressDrain { from { width: 100%; } to { width: 0%; } }

          .form-control-prof {
            border: 1.5px solid #e2e8f0;
            padding: 10px 15px;
            font-size: 0.95rem;
            transition: all 0.2s;
            border-radius: 10px !important;
          }
          .form-control-prof:focus {
            border-color: #6c5dff;
            box-shadow: 0 0 0 4px rgba(108, 93, 255, 0.1);
          }
          .form-label-prof {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 6px;
          }

          .toggle-container {
            background: #e2e8f0;
            padding: 4px;
            border-radius: 12px;
            display: inline-flex;
            gap: 4px;
          }
          .toggle-btn {
            border: none;
            padding: 8px 20px;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 700;
            transition: all 0.2s ease;
            cursor: pointer;
            color: #64748b;
            background: transparent;
          }
          .toggle-btn.active {
            background: #ffffff;
            color: #6c5dff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }

          .degree-multi-select {
            background: #fff;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 15px;
            width: 100%;
            text-align: left;
            font-size: 0.9rem;
            color: #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .degree-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
          }
          .degree-item:hover { background: #f8f9fc; }

          /* NEW: Email Alerts toggle styles */
          .email-alerts-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          }
          .email-alerts-toggle:hover {
            border-color: #6c5dff;
            box-shadow: 0 4px 12px rgba(108, 93, 255, 0.1);
          }
          .email-alerts-label {
            font-size: 0.85rem;
            font-weight: 700;
            color: #475569;
          }
          .toggle-switch {
            position: relative;
            width: 40px;
            height: 22px;
            background: #e2e8f0;
            border-radius: 11px;
            transition: background 0.3s ease;
            flex-shrink: 0;
          }
          .toggle-switch.on {
            background: #6c5dff;
          }
          .toggle-knob {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.3s ease;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          }
          .toggle-switch.on .toggle-knob {
            transform: translateX(18px);
          }
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

      {/* CHANGE 2: Modern Email Alert Toast - fully custom, separate from existing Bootstrap toast */}
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
      <div className="d-flex justify-content-between align-items-start mb-0">
        <div>
          <h1 className="fw-bold" style={{ fontSize: '2.5rem', letterSpacing: '-1.5px', color: '#0f172a' }}>Recent Openings</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Direct access to career opportunities within premier corporate ecosystems.</p>
        </div>

        {userRole === 'admin' && (
          <Button
            onClick={() => setShowAdminForm(true)}
            style={{
              background: '#6c5dff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px'
            }}
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
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Direct Career Openings</h3>

          {/* Email Alerts Toggle - top right of this section */}
          <div
            className="email-alerts-toggle"
            onClick={handleEmailAlertsToggle}
            title="Toggle Email Alerts"
          >
            <Mail size={16} color={emailAlerts ? "#6c5dff" : "#94a3b8"} />
            <span className="email-alerts-label" style={{ color: emailAlerts ? "#6c5dff" : "#475569" }}>
              Email Alerts
            </span>
            <div className={`toggle-switch ${emailAlerts ? 'on' : ''}`}>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="d-flex justify-content-end mb-4">
            <div className="toggle-container">
              <button
                className={`toggle-btn ${activeTab === 'live' ? 'active' : ''}`}
                onClick={() => handleTabChange('live')}
              >
                Live Jobs ({liveJobs.length})
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

                      {/* MODIFIED: Apply Now button is disabled/unclickable when job is already applied */}
                      <a
                        href={isExpired || isApplied ? "#" : job.apply_link}
                        target={isExpired || isApplied ? "" : "_blank"}
                        rel="noreferrer"
                        className={`apply-btn-primary ${isExpired ? '' : isApplied ? 'btn-applied-disabled' : ''}`}
                        style={{
                          background: isExpired ? '#94a3b8' : isApplied ? '#94a3b8' : '#6c5dff'
                        }}
                        onClick={isApplied ? (e) => e.preventDefault() : undefined}
                      >
                        {isExpired ? "Position Closed" : isApplied ? "Already Applied" : "Apply Now"}
                        <ArrowRight size={16} />
                      </a>

                      {/* MODIFIED: I Applied Checkbox - ONE TIME ONLY with ROUND tick */}
                      {!isExpired && currentUser && (
                        <div 
                          className={`applied-checkbox-container ${isApplied ? 'checked' : ''}`}
                          onClick={() => handleAppliedToggle(job.id)}
                        >
                          <div className={`applied-checkbox ${isApplied ? 'checked' : ''}`}>
                            {isApplied && <Check size={16} color="white" strokeWidth={3} />}
                          </div>
                          <span className="applied-checkbox-label">
                            {isApplied ? " I Applied to this job" : "Mark as Applied"}
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
        </div>
      </div>

      {/* ADMIN MODAL */}
      <Modal show={showAdminForm} onHide={() => setShowAdminForm(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#0f172a' }}>Post New Career Opening</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAdminSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Company Name</Form.Label>
                <Form.Control required className="form-control-prof" placeholder="e.g. Microsoft" value={newJob.company_name} onChange={e => setNewJob({ ...newJob, company_name: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Job Role</Form.Label>
                <Form.Control required className="form-control-prof" placeholder="e.g. Backend Developer" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Experience Level</Form.Label>
                <Form.Select 
                  required 
                  className="form-control-prof" 
                  value={newJob.experience} 
                  onChange={e => setNewJob({ ...newJob, experience: e.target.value })}
                >
                  {experienceOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Annual Package (LPA)</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. 10-12 LPA" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Location</Form.Label>
                <Form.Control className="form-control-prof" placeholder="Remote / City" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
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
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Eligible Branches</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. CSE, IT, ECE" value={newJob.eligible_branches} onChange={e => setNewJob({ ...newJob, eligible_branches: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Minimum CGPA</Form.Label>
                <Form.Control className="form-control-prof" placeholder="e.g. 7.5 or N/A" value={newJob.min_cgpa} onChange={e => setNewJob({ ...newJob, min_cgpa: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">Target Batch</Form.Label>
                <Form.Control className="form-control-prof" placeholder="2024, 2025" value={newJob.passout_year} onChange={e => setNewJob({ ...newJob, passout_year: e.target.value })} />
              </Col>
              {/* CHANGE 1: Application Deadline is now mandatory - required attribute restored */}
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-prof">
                  Application Deadline <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  className="form-control-prof"
                  type="date"
                  value={newJob.expiry_date}
                  onChange={e => setNewJob({ ...newJob, expiry_date: e.target.value })}
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label className="form-label-prof">Direct Application URL</Form.Label>
                <Form.Control className="form-control-prof" type="url" required placeholder="https://company.com/careers/..." value={newJob.apply_link} onChange={e => setNewJob({ ...newJob, apply_link: e.target.value })} />
              </Col>
            </Row>
            <Button type="submit" disabled={isSubmitting} className="w-100 py-3 mt-3 shadow-sm border-0" style={{ background: '#6c5dff', borderRadius: '12px', fontWeight: 800 }}>
              {isSubmitting ? "SYNCING DATA..." : "PUBLISH CAREER LISTING"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RecentJobs;