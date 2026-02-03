import { useEffect, useMemo, useState } from "react";
import { Card, Container, Badge, ProgressBar, Row, Col, Form, Modal } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Zap, Target, Activity, PieChart, BarChart, Cpu, Globe, Award, Star, TrendingUp, Shield } from "react-feather";

const ACTIVITY_KEY = "calendar_activity";
const STORAGE_KEY = "job_applications"; 
const START_YEAR = 2026; 

const THEME = {
  applied: "#10b981",
  activeOnly: "#3b82f6",
  missed: "#ff4d4d",
  bg: "#f8fafc",
  card: "#ffffff",
  accent: "#6366f1",
  glass: "rgba(255, 255, 255, 0.8)"
};

// BADGE DEFINITIONS - Icons corrected for react-feather compatibility
const BADGE_SYSTEM = [
  { threshold: 365, label: "Immortal", icon: <Award size={14} />, color: "#7c3aed", special: true },
  { threshold: 200, label: "Centurion Elite", icon: <Shield size={14} />, color: "#1e293b", special: true },
  { threshold: 100, label: "Century Club", icon: <Globe size={14} />, color: "#059669", special: false },
  { threshold: 30,  label: "Monthly Master", icon: <Star size={14} />, color: "#2563eb", special: false },
  { threshold: 15,  label: "Persistence", icon: <Zap size={14} />, color: "#ea580c", special: false },
  { threshold: 7,   label: "Weekly Warrior", icon: <Activity size={14} />, color: "#6366f1", special: false },
  { threshold: 0,   label: "Rising Star", icon: <TrendingUp size={14} />, color: "#94a3b8", special: false },
];

const CalendarPage = () => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activity, setActivity] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  const monthOptions = useMemo(() => {
    const options = [];
    const start = new Date(START_YEAR, 0, 1);
    const end = new Date(today.getFullYear(), 11, 1); 

    let current = new Date(start);
    while (current <= end) {
      options.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        label: current.toLocaleString('default', { month: 'long' }) 
      });
      current.setMonth(current.getMonth() + 1);
    }
    return options; 
  }, [today]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const storedActivity = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || {};
      const storedJobs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const updatedActivity = { ...storedActivity };

      let currentStreak = 0;
      
      storedJobs.forEach(job => {
        const jobDateKey = job.appliedDate || job.date;
        if (jobDateKey) {
          updatedActivity[jobDateKey] = "streak";
        }
      });

      const todayStr = today.toISOString().split("T")[0];
      let checkDate = new Date(today);
      
      while (true) {
        const key = checkDate.toISOString().split("T")[0];
        if (updatedActivity[key] === "streak") {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreakCount(currentStreak);
      
      if (updatedActivity[todayStr] === "streak") {
        const sessionShown = sessionStorage.getItem('streak_popup_shown');
        if (!sessionShown) {
          setTimeout(() => {
            setShowStreakModal(true);
            sessionStorage.setItem('streak_popup_shown', 'true');
          }, 2500);
        }
      }

      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updatedActivity));
      setActivity(updatedActivity);
      setTimeout(() => setLoading(false), 1800);
    };
    fetchData();
  }, [today]);

  const currentBadge = useMemo(() => {
    return BADGE_SYSTEM.find(b => streakCount >= b.threshold) || BADGE_SYSTEM[BADGE_SYSTEM.length - 1];
  }, [streakCount]);

  const nextMilestone = useMemo(() => {
    const goals = [7, 15, 30, 100, 200, 365];
    return goals.find(g => g > streakCount) || streakCount + 10;
  }, [streakCount]);

  const milestoneProgress = (streakCount / nextMilestone) * 100;

  const stats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let applied = 0, portal = 0, missed = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date > today) continue;

      const key = date.toISOString().split("T")[0];
      const status = activity[key];
      
      if (status === "streak") applied++;
      else if (status === "opened") portal++;
      else missed++;
    }

    const totalDaysCounted = (applied + portal + missed) || 1; 
    const grade = Math.round(((applied + portal) / totalDaysCounted) * 100);

    return { applied, portal, missed, total: totalDaysCounted, grade };
  }, [currentMonth, activity, today]);

  if (loading) return (
    <div style={styles.uniqueLoaderWrapper}>
      <style>
        {`
          @keyframes pulseScale {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .pulse-ring {
            position: absolute; width: 80px; height: 80px;
            border: 2px solid ${currentBadge.color}; border-radius: 50%;
            animation: pulseScale 1.5s ease-out infinite;
          }
        `}
      </style>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="pulse-ring" />
        <div className="pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div style={styles.loaderCore}>
          <Cpu size={30} color={currentBadge.color} style={{ animation: 'rotate 3s linear infinite' }} />
        </div>
      </div>
      <h5 className="mt-4 fw-bold" style={{ color: currentBadge.color, letterSpacing: '2px' }}>CALIBRATING {currentBadge.label.toUpperCase()}...</h5>
      <p className="text-muted small">Validating Daily Job Submissions</p>
    </div>
  );

  return (
    <div style={styles.wrapper}>
       <style>{`
          .day-box-hover:hover {
            transform: translateY(-3px) scale(1.05) !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .today-pulse { animation: glow 2s infinite; }
          @keyframes glow {
            0% { box-shadow: 0 0 5px ${currentBadge.color}; }
            50% { box-shadow: 0 0 20px ${currentBadge.color}; }
            100% { box-shadow: 0 0 5px ${currentBadge.color}; }
          }
          .special-badge-glow {
            box-shadow: 0 0 15px ${currentBadge.color};
            border: 1px solid ${currentBadge.color} !important;
          }
          /* This creates the second line of the X */
          .strike-x::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            background: ${THEME.missed};
            transform: rotate(90deg);
          }
       `}</style>

      <Modal show={showStreakModal} onHide={() => setShowStreakModal(false)} centered>
        <div style={styles.streakModalBody}>
           <div style={{...styles.iconCircle, backgroundColor: currentBadge.color}}><Award size={48} color="#fff" /></div>
           <h2 className="fw-900 mt-4 mb-1">STREAK SECURED!</h2>
           <p className="text-muted mb-4">You've unlocked the <strong>{currentBadge.label}</strong> status. Keep the momentum!</p>
           <div style={{...styles.streakBadgeLarge, borderColor: currentBadge.color}}>
              <Zap size={24} fill="#facc15" color="#facc15" />
              <span style={{fontSize: '2rem', fontWeight: '900', color: currentBadge.color}}>{streakCount} DAY STREAK</span>
           </div>
           <button style={{...styles.modalBtn, backgroundColor: currentBadge.color}} onClick={() => setShowStreakModal(false)}>Back to Dashboard</button>
        </div>
      </Modal>

      <Container fluid style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
                <Badge bg="white" className={`shadow-sm px-3 py-2 border ${currentBadge.special ? 'special-badge-glow' : ''}`} style={{color: currentBadge.color}}>
                    <span className="me-1">{currentBadge.icon}</span> {currentBadge.label}
                </Badge>
                <Badge bg="primary" className="shadow-sm px-3 py-2">
                    <TrendingUp size={12} className="me-1"/> Milestone: {nextMilestone} Days
                </Badge>
            </div>
            <h1 style={{ fontWeight: '900', letterSpacing: '-1.5px', color: '#1e293b' }}>Application Analytics</h1>
            <p className="text-muted m-0 fw-500">Real-time validation of your daily hustle.</p>
          </div>
          
          <div className="d-flex gap-3 align-items-center">
            <Form.Select 
              value={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`} 
              onChange={(e) => {
                const [m, y] = e.target.value.split('-');
                setCurrentMonth(new Date(parseInt(y), parseInt(m), 1));
              }}
              style={styles.dropdown}
            >
              {monthOptions.map((opt, i) => (
                <option key={i} value={`${opt.month}-${opt.year}`}>{opt.label}</option>
              ))}
            </Form.Select>
            <div style={styles.streakIndicator}>
                <Zap size={16} fill="#facc15" color="#facc15" />
                <span className="fw-bold text-dark">{streakCount}d Streak</span>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={5}>
            <Card style={styles.mainCard}>
              <div className="d-flex justify-content-between mb-4 align-items-center">
                <h6 className="fw-bold m-0 text-uppercase" style={{fontSize: '0.75rem', color: currentBadge.color, letterSpacing: '2px'}}>Activity Matrix</h6>
                <div className="d-flex gap-2">
                    <button style={styles.miniBtn} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft size={16}/></button>
                    <button style={styles.miniBtn} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight size={16}/></button>
                </div>
              </div>
              
              <div style={styles.grid}>
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => <div key={d} style={styles.weekDay}>{d}</div>)}
                {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()}).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()}).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const key = date.toISOString().split("T")[0];
                  const status = activity[key];
                  const isFuture = date > today;
                  const isMissed = !isFuture && !status && date < today;
                  const isToday = date.getTime() === today.getTime();
                  
                  return (
                    <div key={day} className={`day-box-hover ${isToday ? 'today-pulse' : ''}`} style={{
                      ...styles.dayBox,
                      background: status === 'streak' ? `linear-gradient(135deg, ${THEME.applied}, #059669)` : status === 'opened' ? THEME.activeOnly : isMissed ? '#fff1f1' : 'transparent',
                      color: (status) ? '#fff' : isMissed ? THEME.missed : '#64748b',
                      border: isToday ? `2px solid ${currentBadge.color}` : isMissed ? `1px solid ${THEME.missed}` : '1px solid #f1f5f9',
                      opacity: isFuture ? 0.3 : 1,
                    }}>
                      {day}
                      {isMissed && <div className="strike-x" style={styles.strike} />}
                      {isToday && <div style={{...styles.todayDot, backgroundColor: currentBadge.color}} />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>

          <Col lg={7}>
            <Row className="g-4">
              <Col md={12}>
                <Card style={{...styles.mainCard, background: '#f8fafc', color: '#03031d', border: '1px solid #061325'}}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="m-0 fw-bold">Next Milestone Journey</h6>
                    <span className="small fw-bold">{streakCount}/{nextMilestone} Days</span>
                  </div>
                  <ProgressBar now={milestoneProgress} variant="primary" style={{height: 12, borderRadius: 10, background: 'rgba(130, 141, 130, 0.1)'}} />
                  <p className="mt-3 mb-0 small opacity-75">You are {nextMilestone - streakCount} days away from the <b>{nextMilestone} Day Streak</b> badge!</p>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card style={styles.mainCard} className="h-100 text-center">
                  <h6 className="fw-bold mb-4 text-start"><PieChart size={20} className="me-2 text-success"/>Monthwise Data Insights</h6>
                  <div style={styles.donutContainer}>
                    <div style={styles.donutHole}>
                       <span style={{fontSize: '1.8rem', fontWeight: '900', color: '#0f172a'}}>{stats.applied + stats.portal}</span>
                       <span style={{fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800'}}>TOTAL ACTIVE</span>
                    </div>
                    <div style={{
                      ...styles.donutBase,
                      background: `conic-gradient(${THEME.applied} 0% ${(stats.applied / stats.total) * 100}%, ${THEME.activeOnly} ${(stats.applied / stats.total) * 100}% ${((stats.applied + stats.portal) / stats.total) * 100}%, ${THEME.missed} ${((stats.applied + stats.portal) / stats.total) * 100}% 100%)`
                    }} />
                  </div>
                  <div className="mt-4 text-start">
                    <LegendItem color={THEME.applied} label="Job Applied" val={stats.applied} />
                    <LegendItem color={THEME.activeOnly} label="Portal Visit" val={stats.portal} />
                    <LegendItem color={THEME.missed} label="Gap Days" val={stats.missed} />
                  </div>
                </Card>
              </Col>

              <Col md={6}>
                <Card style={styles.mainCard} className="h-100">
                  <h6 className="fw-bold mb-3"><BarChart size={16} className="me-2 text-primary"/>Performance Output</h6>
                  <div className="d-flex flex-column gap-3">
                    <div style={styles.scoreCircle}>
                       <span className="text-muted small fw-bold">Current Efficiency</span>
                       <h1 className="m-0" style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a' }}>{stats.grade}%</h1>
                    </div>
                    <div style={styles.infoBox}>
                      <Target size={18} className="text-primary me-3" />
                      <div>
                        <p className="m-0 fw-bold" style={{fontSize: '0.75rem'}}>Goal Tracker</p>
                        <span style={{fontSize: '0.65rem'}}>Streak maintenance requires 1 daily application.</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const LegendItem = ({ color, label, val }) => (
  <div className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-3" style={{background: '#f8fafc'}}>
    <div className="d-flex align-items-center gap-2">
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>{label}</span>
    </div>
    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e293b' }}>{val}d</span>
  </div>
);

const styles = {
  wrapper: { background: THEME.bg, minHeight: "100vh", padding: "60px 0", fontFamily: "'Inter', sans-serif" },
  mainCard: { border: '1px solid #0b1a29', borderRadius: '32px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', background: THEME.card },
  dropdown: { width: '220px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid #e2e8f0', padding: '12px' },
  streakIndicator: { background: '#fff', padding: '10px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' },
  weekDay: { textAlign: 'center', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', paddingBottom: '15px' },
  // Changed borderRadius to 50% for rounded boxes
  dayBox: { aspectRatio: '1/1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '800', position: 'relative', transition: 'all 0.4s' },
  // Modified to serve as one half of the X
  strike: { position: 'absolute', width: '50%', height: '2px', background: THEME.missed, transform: 'rotate(45deg)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  todayDot: { position: 'absolute', bottom: '8px', width: '5px', height: '5px', borderRadius: '50%' },
  miniBtn: { border: '1px solid #e2e8f0', background: '#fff', borderRadius: '12px', padding: '6px 12px', color: '#1e293b' },
  donutContainer: { position: 'relative', width: '180px', height: '180px', margin: '0 auto' },
  donutBase: { width: '100%', height: '100%', borderRadius: '50%' },
  donutHole: { position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', background: '#fff', borderRadius: '50%', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  scoreCircle: { background: '#f8fafc', padding: '20px', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0' },
  infoBox: { background: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0', marginTop: '15px', display: 'flex', alignItems: 'center' },
  uniqueLoaderWrapper: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' },
  loaderCore: { width: '60px', height: '60px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  streakModalBody: { padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '32px' },
  iconCircle: { width: '100px', height: '100px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' },
  streakBadgeLarge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '2px solid', margin: '20px 0' },
  modalBtn: { color: '#fff', border: 'none', padding: '12px 40px', borderRadius: '14px', fontWeight: '800' }
};

export default CalendarPage;