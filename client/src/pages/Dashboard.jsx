import { Card, Row, Col, Spinner, Badge } from "react-bootstrap"; 
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
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [greeting, setGreeting] = useState("");

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from(STORAGE_KEY)
          .select("*")
          .eq("user_id", user.id); 

        if (error) throw error;
        setJobs(data || []);
      }
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

  const counts = {
    total: jobs.length,
    screening: jobs.filter(j => j.status === "Selected Screening Round").length,
    tr: jobs.filter(j => j.status === "TR Round").length,
    hr: jobs.filter(j => j.status === "HR Round").length,
    offer: jobs.filter(j => j.status === "Offer").length,
    rejected: jobs.filter(j => j.status === "Rejected").length,
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
    <div className="dashboard-wrapper" style={{ padding: "30px", background: "#fdfdff", minHeight: "100vh" }}>
      
      <div className="d-md-flex justify-content-between align-items-center mb-4">
        <div className="animate-slide-in">
          <h2 className="fw-bold mb-1" style={{ color: COLORS.total }}>{greeting} 👋</h2>
          <p className="text-muted">Explore your real-time career analytics.</p>
        </div>
        
        <div className="inspiration-card p-3 shadow-sm d-none d-lg-block">
          <div className="d-flex align-items-center gap-2 mb-1">
              <span className="pulse-dot"></span>
              <small className="text-uppercase fw-bold" style={{ fontSize: "0.65rem", color: "#041020", letterSpacing: "1px" }}>Motivate Yourself</small>
          </div>
          <i className="fw-medium text-dark" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>"{quote}"</i>
        </div>
      </div>

      <div className="mb-4 p-3 d-flex align-items-center justify-content-between shadow-sm main-banner animate-fade-in">
        <div className="d-flex align-items-center gap-3">
          <div className="banner-icon">🔥</div>
          <div>
            <h6 className="mb-0 fw-bold">Interview Conversion Rate</h6>
            <small className="opacity-75">Your efficiency in reaching interview stages</small>
          </div>
        </div>
        <h3 className="fw-bold mb-0 me-md-4">{interviewRate}%</h3>
      </div>

      <Row className="g-3 mb-5">
        {summaryCards.map((item, index) => (
          <Col key={index} xs={6} sm={4} md={4} lg={2} className="animate-pop" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="dashboard-card h-100 p-3 shadow-sm d-flex flex-column align-items-center justify-content-center text-center" style={{ 
                borderRadius: "18px", background: "#fff", border: `1px solid ${item.color}22`
            }}>
              <div className="mb-2" style={{ fontSize: "1.8rem" }}>
                {item.icon}
              </div>
              <small className="text-uppercase fw-bold text-muted d-block mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                {item.title}
              </small>
              <h2 className="fw-black mb-0" style={{ color: item.color }}>{item.value}</h2>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="shadow-lg border-0 h-100 animate-fade-in" style={{ borderRadius: "25px", background: "#fff" }}>
            <Card.Body className="text-center p-4">
              <h6 className="mb-4 fw-bold text-dark">Job Application Status Distribution</h6>
              {pieData.length === 0 ? (
                <div className="text-center py-5">
                   <p className="text-muted mt-4">No specific interview rounds reached yet</p>
                </div>
              ) : (
                <>
                  <div style={{ width: "100%", height: 360, position: "relative" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
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
                        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "24px", fontWeight: "800" }}>
                          {counts.total}
                        </text>
                        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "7px", fill: "#6c757d", fontWeight: "700", letterSpacing: '1px' }}>
                          TOTAL APPLICATIONS
                        </text>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-flex justify-content-center flex-wrap gap-3 mt-3">
                    {pieData.map((item, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-light animate-pop" style={{ fontSize: "12px", fontWeight: 600, animationDelay: `${index * 0.05}s` }}>
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
            <Card className="border-0 shadow-lg h-100 animate-fade-in" style={{ borderRadius: "25px", background: "#fff" }}>
                <Card.Body className="p-4">
                    <div className="mb-4">
                        <h5 className="fw-bold mb-0">Journey Milestones</h5>
                    </div>
                    
                    <div className="milestone-container px-2">
                        {[
                          { label: "Active Hunter", reached: counts.total > 0, val: counts.total, desc: "Applications submitted", color: COLORS.total },
                          { label: "Interview", reached: (counts.screening + counts.tr) > 0, val: (counts.screening + counts.tr), desc: "Qualifying rounds", color: COLORS.tr },
                          { label: "Finalist", reached: counts.hr > 0, val: counts.hr, desc: "HR & Culture rounds", color: COLORS.hr },
                          { label: "Selected", reached: counts.offer > 0, val: counts.offer, desc: "Job offers secured", color: COLORS.offer },
                        ].map((m, i) => (
                          <div key={i} className={`milestone-item d-flex gap-3 mb-4 animate-slide-right ${m.reached ? 'active' : 'pending'}`} style={{ animationDelay: `${i * 0.15}s`, position: 'relative' }}>
                            <div className="milestone-line-box" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="milestone-circle">{m.reached ? "✓" : i + 1}</div>
                              {i < 3 && <div className="line-connector"></div>}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="mb-0 fw-bold">{m.label}</h6>
                                <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>{getProgression(m.val)}%</span>
                              </div>
                              <small className="text-muted d-block">{m.desc}</small>
                              <div className="progress mt-2" style={{ height: "4px", borderRadius: "10px", background: "#f0f0f0" }}>
                                <div className="progress-bar" style={{ width: `${getProgression(m.val)}%`, background: m.color, borderRadius: "10px", transition: 'width 1.5s ease-in-out' }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 rounded-4 animate-pop" style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)", border: "1px solid #e0e7ff", animationDelay: "0.6s" }}>
                        <div className="d-flex justify-content-between mb-2">
                           <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem" }}>Interview Readiness</h6>
                           <span className="text-primary fw-bold" style={{ fontSize: "0.85rem" }}>{interviewRate > 40 ? 'High' : 'Improving'}</span>
                        </div>
                        <p className="text-muted" style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
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
          .dashboard-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
          .fw-black { font-weight: 800; }
          
          /* ANIMATION DEFINITIONS */
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes dot-pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 29, 204, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(40, 29, 204, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 29, 204, 0); } }
          @keyframes pulseText { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

          /* UTILITY CLASSES */
          .animate-fade-in { animation: fadeIn 1s ease-out both; }
          .animate-slide-in { animation: slideInLeft 0.8s ease-out both; }
          .animate-slide-right { animation: slideInRight 0.6s ease-out both; }
          .animate-pop { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
          .animate-pulse { animation: pulseText 2s infinite ease-in-out; }

          .inspiration-card { 
            border-left: 6px solid navy; 
            border-radius: 20px; 
            background: rgba(255, 255, 255, 0.8); 
            transition: all 0.3s ease;
          }
          .inspiration-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          
          .pulse-dot { width: 8px; height: 8px; background: #281dcc; border-radius: 50%; display: inline-block; animation: dot-pulse 1.5s infinite; }
          
          .milestone-item.pending { opacity: 0.4; filter: grayscale(1); }
          .milestone-circle { 
             width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; 
             display: flex; align-items: center; justify-content: center; z-index: 2; 
             border: 2px solid #fff; transition: all 0.3s ease;
          }
          .active .milestone-circle { background: ${COLORS.offer}; color: white; box-shadow: 0 0 15px ${COLORS.offer}55; }
          
          .line-connector { 
            width: 2px; 
            height: 40px; 
            background: #e2e8f0; 
            position: absolute; 
            top: 32px; 
            left: 15px;
            z-index: 1; 
          }
          .active .line-connector { background: ${COLORS.offer}; }
          
          .main-banner { 
            background: linear-gradient(135deg, #14021c 0%, #3b075e 100%); 
            border-radius: 20px; color: white; 
            transition: transform 0.3s ease;
          }
          .main-banner:hover { transform: scale(1.01); }

          .dashboard-card { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .dashboard-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
        `}
      </style>
    </div>
  );
};

export default Dashboard;