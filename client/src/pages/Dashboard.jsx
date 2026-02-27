import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../supabaseClient";

const STORAGE_KEY = "job_applications";
const UPDATES_TABLE = "hiring_updates";

const COLORS = {
  total: "#14021c",
  screening: "#1d14d1",
  tr: "#ff7f50",
  hr: "#27b7b4",
  offer: "#05c024",
  rejected: "#e12713",
};

const MOTIVATIONAL_QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts. – Winston Churchill",
  "Opportunities don't happen, you create them. – Chris Grosser",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
  "The future depends on what you do today. – Mahatma Gandhi",
  "Hard work beats talent when talent doesn't work hard. – Tim Notke",
  "I am not a product of my circumstances. I am a product of my decisions. – Stephen Covey",
  "Your talent determines what you can do. Your motivation determines how much you are willing to do.",
  "Precision is the soul of professional excellence.",
  "Consistency is what transforms average into excellence.",
  "Standardize your excellence until it becomes your habit.",
  "Your professional reputation is the shadow cast by your work ethic.",
  "Every expert was once a beginner. Keep applying, keep growing.",
  "Focus on being productive instead of busy. – Tim Ferriss",
  "Efficiency is doing things right; effectiveness is doing the right things. – Peter Drucker",
  "The secret of getting ahead is getting started. – Mark Twain",
  "The only limit to our realization of tomorrow will be our doubts of today. – Franklin D. Roosevelt",
  "Don't be afraid to give up the good to go for the great. – John D. Rockefeller",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "Quality is not an act, it is a habit. – Aristotle",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "Success usually comes to those who are too busy to be looking for it. – Henry David Thoreau",
  "The way to get started is to quit talking and begin doing. – Walt Disney",
  "Dream big and dare to fail. – Norman Vaughan",
  "Action is the foundational key to all success. – Pablo Picasso",
  "The difference between a successful person and others is not a lack of strength, but a lack of will.",
  "The goal is not to be better than the other man, but your previous self. – Dalai Lama",
  "Small daily improvements over time lead to stunning results. – Robin Sharma",
  "Your career is a marathon, not a sprint. Pace your progress.",
  "Professionalism is knowing how to do it, when to do it, and doing it. – Frank Tyger",
  "Excellence is the gradual result of always striving to do better. – Pat Riley"
];

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [appliedJobsWithStatus, setAppliedJobsWithStatus] = useState([]); // NEW: Track applied jobs with status

  // Fetch initial updates
  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from(UPDATES_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setUpdates(data);
  };

  // NEW: Fetch applied jobs with status from job_applications_status
  const fetchAppliedJobsWithStatus = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('job_applications_status')
      .select('id, status')
      .eq('user_id', userId)
      .eq('is_applied', true);

    if (!error) {
      setAppliedJobsWithStatus(data || []);
      setAppliedJobsCount(data?.length || 0);
    }
  };

  // REAL-TIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase
      .channel("realtime-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: UPDATES_TABLE },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setUpdates((prev) => [payload.new, ...prev]);
          } 
          else if (payload.eventType === "UPDATE") {
            setUpdates((prev) =>
              prev.map((u) => (u.id === payload.new.id ? payload.new : u))
            );
          } 
          else if (payload.eventType === "DELETE") {
            setUpdates((prev) => prev.filter((u) => u.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // NEW: Real-time subscription for job_applications_status changes
  useEffect(() => {
    if (!sessionUser) return;

    const applicationsChannel = supabase
      .channel('job-applications-status-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications_status',
          filter: `user_id=eq.${sessionUser.id}`
        },
        (payload) => {
          // Refetch applied jobs with status whenever there's a change
          fetchAppliedJobsWithStatus(sessionUser.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
    };
  }, [sessionUser]);

  // NEW: Real-time subscription for job_applications changes
  useEffect(() => {
    if (!sessionUser) return;

    const jobApplicationsChannel = supabase
      .channel('job-applications-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications',
          filter: `user_id=eq.${sessionUser.id}`
        },
        async (payload) => {
          // Refetch manual job applications whenever there's a change
          const { data } = await supabase
            .from(STORAGE_KEY)
            .select("*")
            .eq("user_id", sessionUser.id);
          
          setJobs(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobApplicationsChannel);
    };
  }, [sessionUser]);

  // Post a real-time update (Admin Only)
  const handlePostUpdate = async () => {
    const text = prompt("Enter real-time hiring update (Speaker Marquee):");
    if (!text || !sessionUser) return;

    const { error } = await supabase
      .from(UPDATES_TABLE)
      .insert([{ content: text, is_new: true }]);

    if (error) {
      alert("Error posting update: " + error.message);
    }
    setShowAdminMenu(false);
  };

  // Edit an update (Admin Only)
  const handleEditUpdate = async () => {
    if (updates.length === 0) {
      alert("No updates to edit.");
      return;
    }
    
    const updateList = updates.map((u, i) => `${i + 1}. ${u.content}`).join("\n");
    const choice = prompt(`Select update number to edit:\n\n${updateList}`);
    if (choice === null) return; 
    
    const index = parseInt(choice) - 1;
    if (isNaN(index) || index < 0 || index >= updates.length) {
      alert("Invalid selection.");
      return;
    }

    const selectedUpdate = updates[index];
    const newText = prompt("Edit hiring update:", selectedUpdate.content);
    
    if (newText === null || newText.trim() === "" || newText === selectedUpdate.content) {
      setShowAdminMenu(false);
      return;
    }

    const { error } = await supabase
      .from(UPDATES_TABLE)
      .update({ content: newText.trim() })
      .eq("id", selectedUpdate.id);

    if (error) {
      alert("Edit failed: " + error.message);
    } else {
      setShowAdminMenu(false);
    }
  };

  // Delete an update (Admin Only)
  const handleDeleteUpdate = async (id, content) => {
    if (!window.confirm(`Are you sure you want to delete this update?\n\n"${content}"`)) return;

    const { error } = await supabase
      .from(UPDATES_TABLE)
      .delete()
      .eq("id", id);
    
    if (error) {
      alert("Delete failed: " + error.message);
    }
  };

  // Delete via Menu Selection (Admin Only)
  const handleDeleteFromMenu = async () => {
    if (updates.length === 0) return;
    
    const updateList = updates.map((u, i) => `${i + 1}. ${u.content}`).join("\n");
    const choice = prompt(`Select update number to DELETE:\n\n${updateList}`);
    if (choice === null) return; 
    
    const index = parseInt(choice) - 1;
    if (isNaN(index) || index < 0 || index >= updates.length) return;

    const selectedUpdate = updates[index];
    await handleDeleteUpdate(selectedUpdate.id, selectedUpdate.content);
    setShowAdminMenu(false);
  };

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role") 
          .eq("id", user.id)
          .single();

        if (!profileError && profileData) {
          setIsAdmin(profileData.role === 'admin');
        }

        const { data, error } = await supabase
          .from(STORAGE_KEY)
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setJobs(data || []);

        // NEW: Fetch applied jobs with status
        await fetchAppliedJobsWithStatus(user.id);
      }
      fetchUpdates();
    } catch (error) {
      console.error("Error loading dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);

    fetchPersonalData();
  }, []);

  // NEW: Calculate counts including platform jobs with status
  const platformScreening = appliedJobsWithStatus.filter(j => j.status === "Selected Screening Round").length;
  const platformTR = appliedJobsWithStatus.filter(j => j.status === "TR Round").length;
  const platformHR = appliedJobsWithStatus.filter(j => j.status === "HR Round").length;
  const platformOffer = appliedJobsWithStatus.filter(j => j.status === "Offer").length;
  const platformRejected = appliedJobsWithStatus.filter(j => j.status === "Rejected").length;

  const counts = {
    total: jobs.length + appliedJobsCount,
    screening: jobs.filter(j => j.status === "Selected Screening Round").length + platformScreening,
    tr: jobs.filter(j => j.status === "TR Round").length + platformTR,
    hr: jobs.filter(j => j.status === "HR Round").length + platformHR,
    offer: jobs.filter(j => j.status === "Offer").length + platformOffer,
    rejected: jobs.filter(j => j.status === "Rejected").length + platformRejected,
  };

  const pieData = [
    { name: "Screening", value: counts.screening, color: COLORS.screening },
    { name: "TR Round", value: counts.tr, color: COLORS.tr },
    { name: "HR Round", value: counts.hr, color: COLORS.hr },
    { name: "Offers", value: counts.offer, color: COLORS.offer },
    { name: "Rejected", value: counts.rejected, color: COLORS.rejected },
  ].filter(item => item.value > 0);

  const interviewRate = counts.total > 0
    ? (((counts.screening + counts.tr + counts.hr) / counts.total) * 100).toFixed(1)
    : 0;

  const getProgression = (val) => (counts.total > 0 ? ((val / counts.total) * 100).toFixed(0) : 0);

  const summaryCards = [
    { title: "Applications", value: counts.total, color: COLORS.total, icon: "📋" },
    { title: "Screening", value: counts.screening, color: COLORS.screening, icon: "🎯" },
    { title: "Technical", value: counts.tr, color: COLORS.tr, icon: "💻" },
    { title: "HR Round", value: counts.hr, color: COLORS.hr, icon: "🤝" },
    { title: "Offers", value: counts.offer, color: COLORS.offer, icon: "🚀" },
    { title: "Rejections", value: counts.rejected, color: COLORS.rejected, icon: "📉" },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "85vh", background: "#f8f9fa" }}>
        <Spinner animation="grow" style={{ color: COLORS.total, width: '4rem', height: '4rem' }} />
        <h5 className="mt-4 fw-bold animate-pulse" style={{ color: COLORS.total }}>Analyzing Your Career Path...</h5>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      
      {isAdmin && (
        <div className="admin-fab-container">
          {showAdminMenu && (
            <div className="admin-menu animate-pop">
              <button onClick={handlePostUpdate} className="admin-menu-item">
                <span className="menu-icon">✉️</span> Post Update
              </button>
              <button onClick={handleEditUpdate} className="admin-menu-item">
                <span className="menu-icon">✏️</span> Edit Updates
              </button>
              <button onClick={handleDeleteFromMenu} className="admin-menu-item text-danger">
                <span className="menu-icon">🗑️</span> Delete Update
              </button>
            </div>
          )}
          <button 
            className={`admin-fab-btn ${showAdminMenu ? 'active' : ''}`} 
            onClick={() => setShowAdminMenu(!showAdminMenu)} 
            title="Admin Actions"
          >
            <span className="fab-icon">{showAdminMenu ? '×' : '+'}</span>
          </button>
        </div>
      )}

      <div className="marquee-nav-container full-width-marquee mb-4 shadow-sm animate-slide-up">
        <div className="speaker-icon">📢</div>
        <marquee 
          behavior="scroll" 
          direction="left" 
          scrollamount="7" 
          onMouseOver={(e) => e.currentTarget.stop()} 
          onMouseOut={(e) => e.currentTarget.start()}
        >
          {updates.length > 0 ? (
            updates.map((item) => (
              <span 
                key={item.id} 
                className={`marquee-news-text ${isAdmin ? 'admin-item' : ''}`}
              >
                <span className="new-tag-burst">NEW</span> 
                {item.content}
              </span>
            ))
          ) : (
            <span className="marquee-news-text">No real-time updates yet. Stay tuned for new hiring posts!</span>
          )}
        </marquee>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="animate-slide-in">
          <h2 className="fw-bold mb-1 greeting-text" style={{ color: COLORS.total }}>{greeting} 👋</h2>
          <p className="text-muted mb-0">Explore your real-time career analytics.</p>
        </div>

        <div className="inspiration-card p-3 shadow-sm d-lg-block">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pulse-dot"></span>
            <small className="text-uppercase fw-bold" style={{ fontSize: "0.65rem", color: "#041020", letterSpacing: "1px" }}>Motivate Yourself</small>
          </div>
          <i className="fw-medium text-dark quote-text">"{quote}"</i>
        </div>
      </div>

      <div className="mb-4 p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between shadow-sm main-banner animate-fade-in gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="banner-icon">🔥</div>
          <div>
            <h6 className="mb-0 fw-bold">Interview Conversion Rate</h6>
            <small className="opacity-75">Your efficiency in reaching interview stages</small>
          </div>
        </div>
        <h3 className="fw-bold mb-0 me-md-4 conversion-rate-text">{interviewRate}%</h3>
      </div>

      <Row className="g-2 g-md-3 mb-4 mb-md-5">
        {summaryCards.map((item, index) => (
          <Col key={index} xs={6} sm={4} md={4} lg={2} className="animate-pop" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="dashboard-card h-100 p-2 p-md-3 shadow-sm d-flex flex-column align-items-center justify-content-center text-center">
              <div className="mb-1 mb-md-2 card-icon">
                {item.icon}
              </div>
              <small className="text-uppercase fw-bold text-muted d-block mb-1 card-title-text">
                {item.title}
              </small>
              <h2 className="fw-black mb-0 card-value-text" style={{ color: item.color }}>{item.value}</h2>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-lg border-0 h-100 animate-fade-in chart-card">
            <Card.Body className="text-center p-3 p-md-4">
              <h6 className="mb-4 fw-bold text-dark">Job Application Status Distribution</h6>
              {pieData.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mt-4">No specific interview rounds reached yet</p>
                </div>
              ) : (
                <>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="90%"
                          animationDuration={1500}
                          animationEasing="ease-out"
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(null)}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                              stroke="#fff"
                              strokeWidth={2}
                              style={{
                                filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}88)` : "none",
                                outline: 'none'
                              }}
                            />
                          ))}
                        </Pie>
                        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="pie-center-total">
                          {counts.total}
                        </text>
                        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="pie-center-label">
                          TOTAL APPLICATIONS
                        </text>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                    {pieData.map((item, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-light animate-pop legend-item" style={{ animationDelay: `${index * 0.05}s` }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color }} />
                        {item.name}: {item.value}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-lg h-100 animate-fade-in milestone-card">
            <Card.Body className="p-3 p-md-4">
              <div className="mb-4">
                <h5 className="fw-bold mb-0">Journey Milestones</h5>
              </div>

              <div className="milestone-container px-1">
                {[
                  { label: "Active Hunter", reached: counts.total > 0, val: counts.total, desc: "Applications submitted", color: COLORS.total },
                  { label: "Interview", reached: (counts.screening + counts.tr) > 0, val: (counts.screening + counts.tr), desc: "Qualifying rounds", color: COLORS.tr },
                  { label: "Finalist", reached: counts.hr > 0, val: counts.hr, desc: "HR & Culture rounds", color: COLORS.hr },
                  { label: "Selected", reached: counts.offer > 0, val: counts.offer, desc: "Job offers secured", color: COLORS.offer },
                ].map((m, i) => (
                  <div key={i} className={`milestone-item d-flex gap-3 mb-4 animate-slide-right ${m.reached ? 'active' : 'pending'}`} style={{ animationDelay: `${i * 0.15}s`, position: 'relative' }}>
                    <div className="milestone-line-box">
                      <div className="milestone-circle">{m.reached ? "✓" : i + 1}</div>
                      {i < 3 && <div className="line-connector"></div>}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-0 fw-bold milestone-label">{m.label}</h6>
                        <span className="fw-bold text-dark milestone-percent">{getProgression(m.val)}%</span>
                      </div>
                      <small className="text-muted d-block milestone-desc">{m.desc}</small>
                      <div className="progress mt-2" style={{ height: "4px", borderRadius: "10px", background: "#f0f0f0" }}>
                        <div className="progress-bar" style={{ width: `${getProgression(m.val)}%`, background: m.color, borderRadius: "10px", transition: 'width 1.5s ease-in-out' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-4 animate-pop readiness-box">
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem" }}>Interview Readiness</h6>
                  <span className="text-primary fw-bold" style={{ fontSize: "0.85rem" }}>{interviewRate > 40 ? 'High' : 'Improving'}</span>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                  {counts.tr > 0
                    ? "You have technical rounds scheduled. Focus on Leetcode Mediums."
                    : "Focus on networking to unlock the 'Interviewee' milestone."}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .dashboard-wrapper { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            padding: 15px;
            background: #fdfdff; 
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }

          .marquee-nav-container.full-width-marquee {
            background: #fff;
            border-radius: 22px;
            padding: 8px 20px;
            display: flex;
            align-items: center;
            border-bottom: 3px solid #eee;
            border-left: 6px solid ${COLORS.screening};
            overflow: hidden;
            width: 100%;
          }
          .speaker-icon { font-size: 1.5rem; margin-right: 15px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.1)); }
          
          .marquee-news-text { 
            margin-right: 80px; 
            font-weight: 700; 
            color: #14021c; 
            font-size: 0.95rem; 
            display: inline-flex; 
            align-items: center; 
            gap: 10px;
          }

          .new-tag-burst {
            background: ${COLORS.rejected};
            color: white;
            padding: 4px 10px;
            font-size: 0.6rem;
            font-weight: 800;
            clip-path: polygon(100% 50%, 90% 80%, 60% 90%, 50% 100%, 40% 90%, 10% 80%, 0% 50%, 10% 20%, 40% 10%, 50% 0%, 60% 10%, 90% 20%);
            animation: tag-glow 1.5s infinite alternate;
          }

          /* ── Admin FAB: desktop default position ── */
          .admin-fab-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 15px;
          }

          @media (max-width: 1024px) {
            .admin-fab-container {
              bottom: 82px;
            }
          }

          /* ── On mobile (≤1024px), raise FAB above the bottom nav bar (64px) + extra gap ── */
          @media (max-width: 1024px) {
            .admin-fab-container {
              bottom: 82px;
            }
          }

          .admin-menu {
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: white;
            padding: 10px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            border: 1px solid #eee;
          }

          .admin-menu-item {
            border: none;
            background: transparent;
            padding: 10px 20px;
            font-weight: 700;
            font-size: 0.85rem;
            color: ${COLORS.total};
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 10px;
            transition: all 0.2s;
            text-align: left;
            white-space: nowrap;
          }

          .admin-menu-item:hover {
            background: #f1f5f9;
            color: ${COLORS.screening};
          }

          .admin-fab-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${COLORS.screening} 0%, #4f46e5 100%);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(29, 20, 209, 0.4);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .admin-fab-btn.active {
            background: ${COLORS.total};
            transform: rotate(0deg);
          }

          .admin-fab-btn:hover {
            transform: scale(1.1) rotate(45deg);
            box-shadow: 0 15px 35px rgba(29, 20, 209, 0.6);
          }
          .fab-icon { font-size: 32px; font-weight: 300; line-height: 1; }

          @media (min-width: 768px) {
            .dashboard-wrapper { padding: 30px; }
          }

          .fw-black { font-weight: 800; }
          .greeting-text { font-size: 1.5rem; }
          .quote-text { font-size: 0.8rem; line-height: 1.4; }
          .card-title-text { font-size: 0.6rem; letter-spacing: 0.5px; }
          .card-value-text { font-size: 1.5rem; }
          .card-icon { font-size: 1.4rem; }

          @media (min-width: 768px) {
            .greeting-text { font-size: 2rem; }
            .quote-text { font-size: 0.85rem; }
            .card-title-text { font-size: 0.7rem; }
            .card-value-text { font-size: 2rem; }
            .card-icon { font-size: 1.8rem; }
          }

          .chart-container { width: 100%; height: 280px; position: relative; }
          .pie-center-total { font-size: 20px; font-weight: 800; }
          .pie-center-label { font-size: 6px; fill: #6c757d; font-weight: 700; letter-spacing: 1px; }

          @media (min-width: 768px) {
            .chart-container { height: 360px; }
            .pie-center-total { font-size: 24px; }
            .pie-center-label { font-size: 7px; }
          }

          .chart-card, .milestone-card { border-radius: 20px; background: #fff; }

          @keyframes tag-glow { 0% { box-shadow: 0 0 0px ${COLORS.rejected}; transform: scale(1); } 50% { box-shadow: 0 0 8px ${COLORS.rejected}; transform: scale(1.05); } 100% { box-shadow: 0 0 0px ${COLORS.rejected}; transform: scale(1); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes dot-pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 29, 204, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(40, 29, 204, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 29, 204, 0); } }
          @keyframes pulseText { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

          .animate-fade-in { animation: fadeIn 1s ease-out both; }
          .animate-slide-in { animation: slideInLeft 0.8s ease-out both; }
          .animate-slide-up { animation: slideInUp 0.8s ease-out both; }
          .animate-slide-right { animation: slideInRight 0.6s ease-out both; }
          .animate-pop { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
          .animate-pulse { animation: pulseText 2s infinite ease-in-out; }

          .inspiration-card { 
            border-left: 6px solid navy; 
            border-radius: 15px; 
            background: rgba(255, 255, 255, 0.8); 
            transition: all 0.3s ease;
            width: 100%;
          }
          @media (min-width: 992px) {
            .inspiration-card { border-radius: 20px; width: auto; max-width: 400px; }
          }
          .inspiration-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          
          .pulse-dot { width: 8px; height: 8px; background: #281dcc; border-radius: 50%; display: inline-block; animation: dot-pulse 1.5s infinite; }
          
          .milestone-item.pending { opacity: 0.4; filter: grayscale(1); }
          .milestone-circle { 
             width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; 
             display: flex; align-items: center; justify-content: center; z-index: 2; 
             border: 2px solid #fff; transition: all 0.3s ease; font-size: 0.8rem;
          }
          @media (min-width: 768px) {
            .milestone-circle { width: 32px; height: 32px; font-size: 1rem; }
          }
          .active .milestone-circle { background: ${COLORS.offer}; color: white; box-shadow: 0 0 15px ${COLORS.offer}55; }
          
          .milestone-line-box { position: relative; display: flex; flex-direction: column; align-items: center; }
          .line-connector { 
            width: 2px; 
            height: 100%; 
            background: #e2e8f0; 
            position: absolute; 
            top: 28px; 
            left: 50%;
            transform: translateX(-50%);
            z-index: 1; 
          }
          @media (min-width: 768px) { .line-connector { top: 32px; } }
          .active .line-connector { background: ${COLORS.offer}; }
          
          .main-banner { 
            background: linear-gradient(135deg, #14021c 0%, #3b075e 100%); 
            border-radius: 20px; color: white; 
            transition: transform 0.3s ease;
          }
          .main-banner:hover { transform: scale(1.01); }

          .dashboard-card { 
             transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
             border-radius: 14px; background: #fff; border: 1px solid #00000011;
          }
          @media (min-width: 768px) {
            .dashboard-card { border-radius: 18px; }
          }
          .dashboard-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }

          .readiness-box { background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%); border: 1px solid #e0e7ff; }
          .legend-item { font-size: 10px; font-weight: 600; }
          @media (min-width: 768px) { .legend-item { font-size: 12px; } }
        `}
      </style>
    </div>
  );
};

export default Dashboard;