import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Container, Badge, ProgressBar, Row, Col, Form, Modal } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Zap, Activity,Cpu, Globe, Award, Star, TrendingUp, Shield } from "react-feather";
import { supabase } from "../supabaseClient"; 

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

const TROPHIES = [
  { days: 7, label: "Iron", color: "#88eef0c2" },
  { days: 15, label: "Bronze", color: "#cd7f32" },
  { days: 30, label: "Silver", color: "#94a3b8" },
  { days: 50, label: "Gold", color: "#fbbf24" },
  { days: 100, label: "Platinum", color: "#2dd4bf" },
  { days: 200, label: "Emerald", color: "#10b981" },
  { days: 365, label: "Diamond", color: "#7c3aed" },
];

const BADGE_SYSTEM = [
  { threshold: 365, label: "Diamond", icon: <Award size={14} />, color: "#b697ed", special: true },
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

  // MODIFIED: Wrapped in useCallback to fix dependency error
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const todayStr = today.toLocaleDateString('en-CA'); 

      const { data: userEntries, error } = await supabase
        .from(STORAGE_KEY)
        .select("applieddate") 
        .eq("user_id", user.id);
      
      if (error) throw error;

      const historyMap = {};
      if (userEntries) {
        userEntries.forEach(entry => {
          historyMap[entry.applieddate] = "streak";
        });
      }

      let currentStreak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const key = checkDate.toLocaleDateString('en-CA');
        if (historyMap[key] === "streak") {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreakCount(currentStreak);
      setActivity(historyMap);

      const appliedToday = !!historyMap[todayStr];
      const popupSeenToday = sessionStorage.getItem(`streak_popup_${todayStr}`);
      
      if (appliedToday && !popupSeenToday && currentStreak > 0) {
        setTimeout(() => {
          setShowStreakModal(true);
          sessionStorage.setItem(`streak_popup_${todayStr}`, 'true');
        }, 1200);
      }
    } catch (err) {
      console.error("Streak calculation error:", err);
    } finally {
      setLoading(false);
    }
  }, [today]); // today is a dependency here

  // MODIFIED: Added fetchData to dependencies
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthOptions = useMemo(() => {
    const options = [];
    const start = new Date(START_YEAR, 0, 1);
    const end = new Date(today.getFullYear(), 11, 1); 
    let current = new Date(start);
    while (current <= end) {
      options.push({ month: current.getMonth(), year: current.getFullYear(), label: current.toLocaleString('default', { month: 'long' }) });
      current.setMonth(current.getMonth() + 1);
    }
    return options; 
  }, [today]);

  const currentBadge = useMemo(() => {
    return BADGE_SYSTEM.find(b => streakCount >= b.threshold) || BADGE_SYSTEM[BADGE_SYSTEM.length - 1];
  }, [streakCount]);

  const nextMilestone = useMemo(() => {
    const goals = [7, 15, 30, 50, 100, 200, 365];
    return goals.find(g => g > streakCount) || streakCount + 10;
  }, [streakCount]);

  const stats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let applied = 0, missed = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date > today) continue;
      const key = date.toLocaleDateString('en-CA');
      if (activity[key] === "streak") applied++;
      else if (date < today) missed++;
    }
    
    const totalDaysCounted = (applied + missed) || 1; 
    const grade = Math.round((applied / totalDaysCounted) * 100);
    return { applied, missed, total: totalDaysCounted, grade };
  }, [currentMonth, activity, today]);

  if (loading) return (
    <div style={styles.uniqueLoaderWrapper}>
      <style>{`
        @keyframes pulseScale { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pulse-ring { position: absolute; width: 80px; height: 80px; border: 2px solid ${currentBadge.color}; border-radius: 50%; animation: pulseScale 1.5s ease-out infinite; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="pulse-ring" /><div className="pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div style={styles.loaderCore}><Cpu size={30} color={currentBadge.color} style={{ animation: 'rotate 3s linear infinite' }} /></div>
      </div>
      <h5 className="mt-4 fw-bold" style={{ color: currentBadge.color, letterSpacing: '2px' }}>SYNCING YOUR PROGRESS...</h5>
    </div>
  );

  return (
    <div style={styles.wrapper}>
       <style>{`
          .day-box-hover:hover { transform: translateY(-3px) scale(1.05) !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .today-pulse { animation: glow 2s infinite; }
          @keyframes glow { 0% { box-shadow: 0 0 5px ${currentBadge.color}; } 50% { box-shadow: 0 0 20px ${currentBadge.color}; } 100% { box-shadow: 0 0 5px ${currentBadge.color}; } }
          .special-badge-glow { box-shadow: 0 0 15px ${currentBadge.color}; border: 1px solid ${currentBadge.color} !important; }
          .missed-strike { position: absolute; inset: 0; border: 2px solid ${THEME.missed}; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .missed-strike::before { content: ''; position: absolute; width: 100%; height: 2px; background: ${THEME.missed}; transform: rotate(-45deg); }
          
          /* FIX: Ensure container is relative so children absolute positioning works */
          .trophy-container { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            position: relative; 
            padding: 30px 25px; 
            margin-bottom: 40px; 
            background: #ffffff; 
            border-radius: 35px; 
            border: 1px solid #e2e8f0; 
            overflow: visible;
            z-index: 1;
          }
          
          /* FIX: Higher z-index to stay above container background */
          .progression-line { 
            position: absolute; 
            top: 50%; 
            left: 60px; 
            right: 60px; 
            height: 12px; 
            background: #e2e8f0; 
            z-index: 1; 
            transform: translateY(-50%); 
            border-radius: 20px; 
            overflow: hidden; 
          }

          .progression-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%); 
            transition: width 2s cubic-bezier(0.34, 1.56, 0.64, 1); 
            border-radius: 20px; 
            position: relative;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
          }

          .progression-fill::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(
              90deg, 
              rgb(110, 230, 86) 0%, 
              rgba(73, 239, 8, 0.94) 50%, 
              rgba(77, 109, 7, 0.85) 100%
            );
            animation: shimmerEffect 2.5s  forwards;
          }

          @keyframes shimmerEffect {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          /* FIX: Trophies must be highest layer to stay on top of the bar */
          .trophy-card { z-index: 3; position: relative; min-width: 85px; padding: 12px 8px; border-radius: 20px !important; text-align: center; background: white; border: 2px solid #f1f5f9; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .trophy-unlocked { border: 2px solid; transform: translateY(-8px); box-shadow: 0 15px 25px -5px rgba(0,0,0,0.1); }
       `}</style>

      <Modal show={showStreakModal} onHide={() => setShowStreakModal(false)} centered>
        <div style={styles.streakModalBody}>
            <div style={{...styles.iconCircle, backgroundColor: currentBadge.color}}><Award size={48} color="#fff" /></div>
            <h2 className="fw-900 mt-4 mb-1">STREAK SECURED!</h2>
            <div style={{...styles.streakBadgeLarge, borderColor: currentBadge.color}}>
              <Zap size={24} fill="#facc15" color="#facc15" /><span style={{fontSize: '2rem', fontWeight: '900', color: currentBadge.color}}>{streakCount} DAY STREAK</span>
            </div>
            <button style={{...styles.modalBtn, backgroundColor: currentBadge.color}} onClick={() => setShowStreakModal(false)}>Keep it up!</button>
        </div>
      </Modal>

      <Container style={{ maxWidth: '1100px' }}>
        <div className="text-center mb-5">
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                <Badge bg="white" className={`shadow-sm px-4 py-2 border rounded-pill ${currentBadge.special ? 'special-badge-glow' : ''}`} style={{color: currentBadge.color, fontSize: '0.9rem'}}>
                    <span className="me-2">{currentBadge.icon}</span> {currentBadge.label}
                </Badge>
                <div style={{...styles.streakIndicator, borderRadius: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                    <Zap size={18} fill="#facc15" color="#facc15" />
                    <span className="fw-bold text-dark">{streakCount} Day Streak</span>
                </div>
            </div>
            <h1 style={{ fontWeight: '900', letterSpacing: '-2px', color: '#0f172a', fontSize: '3.5rem' }}>Personal Hub</h1>
            <p className="text-muted fw-medium">Tracking your journey to the {nextMilestone} day milestone</p>
        </div>

        <div className="trophy-container shadow-sm">
          <div className="progression-line">
            <div 
              className="progression-fill" 
              style={{ 
                width: (() => {
                  const nextTrophyIdx = TROPHIES.findIndex(t => t.days > streakCount);
                  if (nextTrophyIdx === -1) return "100%";
                  const totalSegments = TROPHIES.length - 1;
                  const segmentWeight = 100 / totalSegments;

                  if (nextTrophyIdx === 0) {
                    const ratio = streakCount / TROPHIES[0].days;
                    return `${ratio * segmentWeight}%`;
                  }

                  const prevMilestoneDays = TROPHIES[nextTrophyIdx - 1].days;
                  const nextMilestoneDays = TROPHIES[nextTrophyIdx].days;
                  const daysInCurrentGap = nextMilestoneDays - prevMilestoneDays;
                  const daysEarnedInGap = streakCount - prevMilestoneDays;
                  const gapProgressRatio = daysEarnedInGap / daysInCurrentGap;
                  const baseFill = (nextTrophyIdx - 1) * segmentWeight;
                  const dynamicFill = gapProgressRatio * segmentWeight;

                  return `${baseFill + dynamicFill}%`;
                })()
              }} 
            />
          </div>
          {TROPHIES.map((t, idx) => (
            <div key={idx} className={`trophy-card ${streakCount >= t.days ? 'trophy-unlocked' : ''}`} style={{borderColor: streakCount >= t.days ? t.color : '#f1f5f9'}}>
              <Award size={22} color={streakCount >= t.days ? t.color : '#cbd5e1'} fill={streakCount >= t.days ? t.color : 'transparent'} />
              <div className="fw-bold mt-2" style={{fontSize: '0.7rem', color: streakCount >= t.days ? '#1e293b' : '#94a3b8'}}>{t.label}</div>
              <div style={{fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700'}}>{t.days}D</div>
            </div>
          ))}
        </div>

        <Row className="g-4">
          <Col lg={6}>
            <Card style={{...styles.mainCard, height: '100%'}}>
              <div className="d-flex justify-content-between mb-4 align-items-center">
                <div>
                    <h6 className="fw-bold m-0 text-uppercase" style={{fontSize: '0.75rem', color: currentBadge.color, letterSpacing: '1.5px'}}>Activity Matrix</h6>
                    <small className="text-muted fw-bold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</small>
                </div>
                <div className="d-flex gap-2">
                    <button style={styles.miniBtn} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft size={16}/></button>
                    <button style={styles.miniBtn} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight size={16}/></button>
                </div>
              </div>
              <div style={styles.grid}>
                {["S", "M", "T", "W", "T", "F", "S"].map(d => <div key={d} style={styles.weekDay}>{d}</div>)}
                {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()}).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()}).map((_, i) => {
                  const day = i + 1; const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const key = date.toLocaleDateString('en-CA'); 
                  const status = activity[key];
                  const isFuture = date > today; 
                  const isToday = date.getTime() === today.getTime();
                  const isMissed = !isFuture && !status;

                  return (
                    <div key={day} className={`day-box-hover ${isToday ? 'today-pulse' : ''}`} style={{
                      ...styles.dayBox, background: status === 'streak' ? `linear-gradient(135deg, ${THEME.applied}, #059669)` : 'transparent',
                      color: (status) ? '#fff' : isMissed ? THEME.missed : '#64748b', border: isToday ? `2px solid ${currentBadge.color}` : '1px solid #f1f5f9', opacity: isFuture ? 0.3 : 1,
                    }}>{day}{isMissed && <div className="missed-strike" />}</div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-top d-flex justify-content-center">
                 <Form.Select className="text-center" value={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`} onChange={(e) => { const [m, y] = e.target.value.split('-'); setCurrentMonth(new Date(parseInt(y), parseInt(m), 1)); }} style={{...styles.dropdown, border: 'none', background: '#f8fafc'}}>
                    {monthOptions.map((opt, i) => <option key={i} value={`${opt.month}-${opt.year}`}>{opt.label} {opt.year}</option>)}
                 </Form.Select>
              </div>
            </Card>
          </Col>

          <Col lg={6}>
            <div className="d-flex flex-column gap-4 h-100">
              <Card style={{...styles.mainCard, background: '#1e293b', border: 'none'}}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="m-0 fw-bold text-white">Next Milestone Progress</h6>
                    <Badge bg="primary" pill>{streakCount} / {nextMilestone} Days</Badge>
                </div>
                <ProgressBar now={(streakCount / nextMilestone) * 100} style={{height: 14, borderRadius: 20, background: 'rgba(255,255,255,0.1)'}} />
                <p className="text-white-50 small mt-3 mb-0 text-center fw-medium">You are {nextMilestone - streakCount} days away from your next trophy!</p>
              </Card>

              <Row className="g-4 flex-grow-1">
                <Col md={6}>
                  <Card style={styles.mainCard} className="h-100 text-center d-flex flex-column justify-content-center">
                    <h6 className="fw-bold mb-4 text-muted small text-uppercase" style={{letterSpacing: '1px'}}>Monthly Insights</h6>
                    <div style={styles.donutContainer}>
                      <div style={styles.donutHole}>
                          <span style={{fontSize: '2rem', fontWeight: '900', color: '#0f172a'}}>{stats.applied}</span>
                          <span style={{fontSize: '0.6rem', color: '#94a3b8', fontWeight: '800'}}>TOTAL</span>
                      </div>
                      <div style={{ ...styles.donutBase, background: `conic-gradient(${THEME.applied} 0% ${(stats.applied / stats.total) * 100}%, ${THEME.missed} ${(stats.applied / stats.total) * 100}% 100%)` }} />
                    </div>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card style={styles.mainCard} className="h-100 text-center d-flex flex-column justify-content-center">
                    <h6 className="fw-bold mb-3 text-muted small text-uppercase" style={{letterSpacing: '1px'}}>Consistency</h6>
                    <div className="d-flex flex-column align-items-center">
                      <div style={styles.scoreCircle}>
                        <h1 className="m-0" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>{stats.grade}%</h1>
                      </div>
                      <p className="fw-bold mt-3 mb-1" style={{fontSize: '0.85rem', color: '#1e293b'}}>{stats.grade >= 80 ? "Elite Consistency" : "Building Momentum"}</p>
                      <small className="text-muted">Keep showing up!</small>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const styles = {
  wrapper: { background: THEME.bg, minHeight: "100vh", padding: "40px 0", fontFamily: "'Inter', sans-serif" },
  mainCard: { border: '1px solid #e2e8f0', padding: '30px', borderRadius: '35px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', background: THEME.card },
  dropdown: { width: '180px', fontSize: '0.8rem', fontWeight: '800', borderRadius: '15px' },
  streakIndicator: { background: '#fff', padding: '8px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' },
  weekDay: { textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#cbd5e1', paddingBottom: '10px' },
  dayBox: { aspectRatio: '1/1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', position: 'relative', transition: 'all 0.3s ease' },
  miniBtn: { border: '1px solid #f1f5f9', background: '#fff', borderRadius: '10px', padding: '5px 10px', color: '#64748b' },
  donutContainer: { position: 'relative', width: '140px', height: '140px', margin: '0 auto' },
  donutBase: { width: '100%', height: '100%', borderRadius: '50%' },
  donutHole: { position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', background: '#fff', borderRadius: '50%', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  scoreCircle: { background: '#f8fafc', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #f1f5f9' },
  uniqueLoaderWrapper: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' },
  loaderCore: { width: '60px', height: '60px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  streakModalBody: { padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '40px' },
  iconCircle: { width: '90px', height: '90px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' },
  streakBadgeLarge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '20px', background: '#f8fafc', borderRadius: '25px', border: '2px solid', margin: '25px 0' },
  modalBtn: { color: '#fff', border: 'none', padding: '14px 45px', borderRadius: '18px', fontWeight: '800' }
};

export default CalendarPage;