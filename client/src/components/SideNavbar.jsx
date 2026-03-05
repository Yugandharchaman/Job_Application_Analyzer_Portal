import React, { useState, useRef, useEffect, useCallback } from "react"; 
import { Nav, Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { supabase } from '../supabaseClient'; 
import toast from "react-hot-toast"; 
import {
  Home, Clock, Calendar, Bell, XCircle, FileText,
  LogOut, Target, Book, User, MessageCircle,
  Edit3, Save, Camera, Upload, Download, File, Info, X, Rss, Search
} from "react-feather";

// ─────────────────────────────────────────────────────────────────
// LEETCODE-STYLE COIN BURST ANIMATION
// ─────────────────────────────────────────────────────────────────
const LeetcodeCoinBurst = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    const distance = 80 + Math.random() * 60;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    const delay = Math.random() * 0.3;
    const size = 14 + Math.floor(Math.random() * 12);
    return { angle, tx, ty, delay, size };
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,165,0,0.4) 50%, transparent 70%)',
        animation: 'lcRingExpand 0.6s ease-out forwards',
      }} />

      <div style={{
        position: 'absolute',
        animation: 'lcBonusLabel 1.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        textAlign: 'center', zIndex: 2,
      }}>
        <div style={{
          fontSize: '28px', fontWeight: 900,
          background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 8px rgba(255,165,0,0.8))',
          letterSpacing: '-1px',
        }}>+5</div>
        <div style={{ fontSize: '13px', color: '#FFD700', fontWeight: 700, marginTop: '-4px' }}>🪙 Coins</div>
      </div>

      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${p.size}px`,
          animation: `lcCoinParticle 1.4s ${p.delay}s ease-out forwards`,
          '--tx': `${p.tx}px`,
          '--ty': `${p.ty}px`,
          filter: 'drop-shadow(0 2px 4px rgba(255,165,0,0.6))',
        }}>🪙</div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// STREAK CALENDAR MODAL
// ─────────────────────────────────────────────────────────────────
const StreakCalendarModal = ({ show, onHide, streak, loginHistory }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const loginSet = new Set(
    (loginHistory || []).map(dateStr => {
      const d = new Date(dateStr);
      return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
    }).filter(Boolean)
  );

  return (
    <Modal show={show} onHide={onHide} centered size="sm" contentClassName="streak-modal-content">
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title style={{ fontSize: '16px', fontWeight: 800, color: '#06061a' }}>
          🔥 Streak Calendar — {streak} Days
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{monthName} {year}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#999', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const isToday = day === today.getDate();
            const hasLogin = loginSet.has(day);
            const isPast = day < today.getDate();
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '6px 2px', borderRadius: '8px',
                fontSize: '12px', fontWeight: isToday ? 900 : 600,
                background: isToday
                  ? 'linear-gradient(135deg,#6c5dff,#b49dff)'
                  : hasLogin ? 'linear-gradient(135deg,#ff6b00,#ffb347)'
                  : isPast ? '#f5f5f5' : 'transparent',
                color: isToday ? '#fff' : hasLogin ? '#fff' : isPast ? '#ccc' : '#333',
                border: isToday ? '2px solid #6c5dff' : 'none',
                position: 'relative',
              }}>
                {day}
                {hasLogin && !isToday && (
                  <div style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', fontSize: '7px' }}>🔥</div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '11px', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#ff6b00,#ffb347)' }} /> Logged in
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#6c5dff,#b49dff)' }} /> Today
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────────
const NotificationsPanel = ({ show, onHide, notifications, onMarkAllRead, onMarkOneRead }) => {
  if (!show) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <div onClick={onHide} style={{ position: 'fixed', inset: 0, zIndex: 2090, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '72px', right: '12px', width: '320px', maxHeight: '72vh',
        background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 2100, overflow: 'hidden',
        animation: 'notifSlideDown 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        border: '1px solid rgba(108,93,255,0.15)',
      }}>
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h6 style={{ margin: 0, fontWeight: 800, color: '#06061a', fontSize: '14px' }}>
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: '8px', background: '#6c5dff', color: '#fff', fontSize: '10px', fontWeight: 900, borderRadius: '10px', padding: '2px 6px' }}>
                {unreadCount} new
              </span>
            )}
          </h6>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c5dff', fontSize: '11px', fontWeight: 700, padding: '2px 6px' }}
              >
                Mark all read
              </button>
            )}
            <button onClick={onHide} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(72vh - 56px)' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
              <div style={{ fontSize: '13px' }}>No notifications yet</div>
            </div>
          ) : notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && onMarkOneRead(n.id)}
              style={{
                padding: '12px 18px', borderBottom: '1px solid #f8f8f8',
                display: 'flex', gap: '11px', alignItems: 'flex-start',
                background: !n.is_read ? 'rgba(108,93,255,0.05)' : '#fff',
                cursor: !n.is_read ? 'pointer' : 'default',
                animation: `notifItemIn 0.3s ${i * 0.04}s both`,
                transition: 'background 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: n.is_read ? 500 : 700, color: n.is_read ? '#555' : '#06061a', lineHeight: '1.4', marginBottom: '3px' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '10px', color: '#bbb' }}>{n.timeLabel}</div>
              </div>
              {!n.is_read && (
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6c5dff', flexShrink: 0, marginTop: '6px' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ═════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════
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

  // ── Gamification ──
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showCoinBurst, setShowCoinBurst] = useState(false);
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const currentUserId = useRef(null);

  // ── Notifications ──
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ── Touch refs ──
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", address: "", github: "", linkedin: "",
    leetcode: "", bio: "", passout_year: "", branch: "", college_name: "",
    degree: "", degree_cgpa: "", inter_cgpa: "", ssc_cgpa: "",
    profileImg: null, resumeName: "", resumeFile: null 
  });
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempResumeFile, setTempResumeFile] = useState(null);

  const isOnDashboard = location.pathname === '/';

  // ─────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

      const { data: updates, error } = await supabase
        .from("hiring_updates")
        .select("*")
        .gte("created_at", oneMonthAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: readRows } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", userId);

      const readSet = new Set((readRows || []).map(r => String(r.notification_id)));

      const formatted = (updates || []).map(u => {
        const createdAt = new Date(u.created_at);
        const now = new Date();
        const diffMs = now - createdAt;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        let timeLabel = '';
        if (diffMins < 1) timeLabel = 'Just now';
        else if (diffMins < 60) timeLabel = `${diffMins}m ago`;
        else if (diffHours < 24) timeLabel = `${diffHours}h ago`;
        else timeLabel = `${diffDays}d ago`;

        const content = u.content || '';
        const isDeadline = content.toLowerCase().includes('deadline') || content.toLowerCase().includes('expire') || content.toLowerCase().includes('last date');
        const isJob = content.toLowerCase().includes('job') || content.toLowerCase().includes('hiring') || content.toLowerCase().includes('walk') || content.toLowerCase().includes('drive');

        return {
          id: u.id,
          title: content,
          icon: isDeadline ? '⏰' : isJob ? '💼' : '📢',
          timeLabel,
          is_read: readSet.has(String(u.id)),
          created_at: u.created_at,
        };
      });

      setNotifications(formatted);
    } catch (err) {
      console.error('fetchNotifications error:', err);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = useCallback(async () => {
    if (!currentUserId.current) return;
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    const rows = unread.map(n => ({ user_id: currentUserId.current, notification_id: n.id }));
    await supabase.from("notification_reads").upsert(rows, { onConflict: 'user_id,notification_id' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [notifications]);

  const handleMarkOneRead = useCallback(async (notifId) => {
    if (!currentUserId.current) return;
    await supabase.from("notification_reads").upsert(
      [{ user_id: currentUserId.current, notification_id: notifId }],
      { onConflict: 'user_id,notification_id' }
    );
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }, []);

  // ─────────────────────────────────────────────────────────────
  // GAMIFICATION
  // ─────────────────────────────────────────────────────────────
  const initGamification = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const today = new Date().toDateString();
      const welcomeKey = `jv_welcomed_${userId}`;

      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      let currentCoins = data?.coins || 0;
      let currentStreak = data?.streak || 0;
      let history = data?.login_history || [];
      const lastLogin = data?.last_login || null;
      const isNewDay = lastLogin !== today;

      if (isNewDay) {
        currentCoins += 5;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLogin === yesterday.toDateString()) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }

        if (!history.includes(today)) {
          history = [...history.slice(-89), today];
        }

        await supabase.from("user_gamification").upsert({
          user_id: userId,
          coins: currentCoins,
          streak: currentStreak,
          last_login: today,
          login_history: history,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        setShowCoinBurst(true);

        setTimeout(() => {
          toast.success(`+5 🪙 Daily login bonus! 🔥 ${currentStreak} day streak!`, {
            duration: 4000,
            style: {
              borderRadius: '14px', background: 'linear-gradient(135deg,#1a0a00,#2d1500)',
              color: '#FFD700', fontWeight: 700, border: '1px solid rgba(255,165,0,0.3)',
            },
            icon: '🪙',
          });
        }, 900);
      }

      setCoins(currentCoins);
      setStreak(currentStreak);
      setLoginHistory(history);

      if (!localStorage.getItem(welcomeKey)) {
        setTimeout(() => {
          toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#06061a' }}>Welcome to Job Vault!</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Your career journey starts here 🚀</div>
              </div>
              <button onClick={() => toast.dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0 4px' }}>✕</button>
            </div>
          ), {
            duration: 6000,
            style: { borderRadius: '16px', background: '#fff', border: '2px solid rgba(108,93,255,0.4)', padding: '16px', boxShadow: '0 10px 40px rgba(108,93,255,0.2)', maxWidth: '340px' },
          });
          localStorage.setItem(welcomeKey, 'true');
        }, 1800);
      }
    } catch (err) {
      console.error('Gamification error:', err);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await fetchProfile();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserId.current = user.id;
        await initGamification(user.id);
        await fetchNotifications(user.id);
      }
    };
    init();
  }, []);

  // ── Real-time notifications ──
  useEffect(() => {
    const channel = supabase
      .channel("realtime-notif-new")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "hiring_updates"
      }, async (payload) => {
        if (!currentUserId.current) return;
        const u = payload.new;
        const content = u.content || '';
        const isDeadline = content.toLowerCase().includes('deadline') || content.toLowerCase().includes('expire');
        const isJob = content.toLowerCase().includes('job') || content.toLowerCase().includes('hiring');
        const newNotif = {
          id: u.id,
          title: content,
          icon: isDeadline ? '⏰' : isJob ? '💼' : '📢',
          timeLabel: 'Just now',
          is_read: false,
          created_at: u.created_at,
        };
        setNotifications(prev => [newNotif, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
    const onEnd = (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (Math.abs(dx) < 40 || dy > Math.abs(dx)) { touchStartX.current = null; return; }
      if (dx > 40 && touchStartX.current < 50 && !isMobileMenuOpen) setIsMobileMenuOpen(true);
      if (dx < -40 && isMobileMenuOpen) setIsMobileMenuOpen(false);
      touchStartX.current = null;
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => { document.removeEventListener('touchstart', onStart); document.removeEventListener('touchend', onEnd); };
  }, [isMobileMenuOpen]);

  // ─────────────────────────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;
        if (data) {
          setProfile({
            ...data, name: data.full_name || "", email: data.email || user.email,
            passout_year: data.passout_year || "", branch: data.branch || "",
            college_name: data.college_name || "", degree: data.degree || "",
            degree_cgpa: data.degree_cgpa || "", inter_cgpa: data.inter_cgpa || "",
            ssc_cgpa: data.ssc_cgpa || "", profileImg: data.profileImg || null,
            resumeFile: data.resumeFile || null, resumeName: data.resumeName || ""
          });
        } else {
          setProfile(prev => ({ ...prev, email: user.email }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      toast.error("Failed to load profile details");
    } finally { setLoadingProfile(false); }
  };

  const uploadFileToStorage = async (file, folderName) => {
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folderName}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('PROFILES').upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('PROFILES').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.degree_cgpa || !profile.inter_cgpa || !profile.ssc_cgpa) {
      toast.error("Please fill all mandatory fields including CGPA!"); return;
    }
    const savingToast = toast.loading("Saving changes to Cloud...");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session not found");
      let finalProfileData = { ...profile };
      if (tempImageFile) finalProfileData.profileImg = await uploadFileToStorage(tempImageFile, 'avatars');
      if (tempResumeFile) finalProfileData.resumeFile = await uploadFileToStorage(tempResumeFile, 'resumes');
      const upd = {
        id: user.id, full_name: finalProfileData.name, email: finalProfileData.email,
        phone: finalProfileData.phone || "", address: finalProfileData.address || "",
        github: finalProfileData.github || "", linkedin: finalProfileData.linkedin || "",
        leetcode: finalProfileData.leetcode || "", bio: finalProfileData.bio || "",
        passout_year: finalProfileData.passout_year || "", branch: finalProfileData.branch || "",
        college_name: finalProfileData.college_name || "", degree: finalProfileData.degree || "",
        degree_cgpa: parseFloat(finalProfileData.degree_cgpa),
        inter_cgpa: parseFloat(finalProfileData.inter_cgpa),
        ssc_cgpa: parseFloat(finalProfileData.ssc_cgpa),
        profileImg: finalProfileData.profileImg || null,
        resumeName: finalProfileData.resumeName || "",
        resumeFile: finalProfileData.resumeFile || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(upd, { onConflict: 'id' });
      if (error) throw error;
      setProfile(finalProfileData); setTempImageFile(null); setTempResumeFile(null); setSaveSuccess(true);
      toast.success("Profile Synchronized with Cloud", { id: savingToast });
      setTimeout(() => { setSaveSuccess(false); setIsEditing(false); }, 2500);
    } catch (error) {
      toast.error(error.message, { id: savingToast });
    } finally { setIsSaving(false); }
  };

  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/", hideOnMobile: true },
    { name: "ThinkDaily+", icon: null, isBrain: true, path: "/interview-Pro", hideOnMobile: true },
    { name: "Calendar", icon: <Calendar size={18} />, path: "/calendar" },
    { name: "Recent Jobs", icon: <Clock size={18} />, path: "/recent-jobs", hasNotification: true, hideOnMobile: true },
    { name: "Interview XP", icon: <MessageCircle size={18} />, path: "/interview-experience", hideOnMobile: true },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminders" },
    { name: "Notes", icon: <FileText size={18} />, path: "/notes" },
    { name: "Rejections", icon: <XCircle size={18} style={{color: "red"}} />, path: "/rejections" },
    { name: "Resources", icon: <Book size={18} />, path: "/resources" },
    { name: "AI Resume Analyzer", icon: <Search size={18} />, path: "/ai-resume-analyzer" },
    { name: "Daily News", icon: <Rss size={18} />, path: "/daily-news", hideOnMobile: true },
    { name: "Connect with Me", icon: <Target size={18} />, path: "/connect" }
  ];

  const bottomNavItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "ThinkDaily+", isBrain: true, path: "/interview-Pro" },
    { name: "Interview XP", icon: <MessageCircle size={20} />, path: "/interview-experience" },
    { name: "Daily News", icon: <Rss size={20} />, path: "/daily-news" },
    { name: "Recent Jobs", icon: <Clock size={20} />, path: "/recent-jobs", hasNotification: true },
  ];

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setTempImageFile(file);
      setProfile({ ...profile, profileImg: URL.createObjectURL(file) });
      toast.success("Image selected! Click save to upload.");
    }
  };
  const handleResumeChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setTempResumeFile(file);
      setProfile({ ...profile, resumeName: file.name });
      toast.success("Resume selected! Click save to upload.");
    }
  };
  const handleDownload = () => {
    if (profile.resumeFile) { toast.success("Opening resume..."); window.open(profile.resumeFile, "_blank"); }
    else toast.error("No resume file available to download");
  };
  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully", { id: loadingToast });
      navigate("/auth");
    } catch (error) { toast.error(error.message, { id: loadingToast }); }
  };
  const startEditing = () => {
    setIsEditing(true);
    toast("Editing Enabled", { icon: "✍️", style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  };

  const BrainIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="brain-icon-svg">
      <path d="M9.5 2a2.5 2.5 0 0 1 2.45 2H12a2.5 2.5 0 0 1 4.95.5A2.49 2.49 0 0 1 18 7v.5A2.5 2.5 0 0 1 20 10v4a2.5 2.5 0 0 1-2 2.45V17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-.55A2.5 2.5 0 0 1 4 14v-4a2.5 2.5 0 0 1 2-2.45V7a2.5 2.5 0 0 1 2.5-2.5"/>
      <path d="M12 4.5v15"/><path d="M8 8.5c1 0 2-.5 2-1.5"/><path d="M16 8.5c-1 0-2-.5-2-1.5"/>
      <path d="M8 12.5c1 0 2 .5 2 1.5"/><path d="M16 12.5c-1 0-2 .5-2 1.5"/>
    </svg>
  );

  return (
    <>
      <style>{`
        /* ── LeetCode-style coin burst ── */
        @keyframes lcRingExpand {
          0%   { transform: scale(0.2); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes lcBonusLabel {
          0%   { transform: translateY(20px) scale(0.6); opacity: 0; }
          20%  { transform: translateY(-5px) scale(1.1); opacity: 1; }
          70%  { transform: translateY(-5px) scale(1.05); opacity: 1; }
          100% { transform: translateY(-60px) scale(0.9); opacity: 0; }
        }
        @keyframes lcCoinParticle {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 0; }
        }

        /* ── Notification slide ── */
        @keyframes notifSlideDown {
          from { transform: translateY(-16px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes notifItemIn {
          from { transform: translateX(16px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        /* ── Common animations ── */
        @keyframes blink-glow {
          0%   { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255,0,0,0.7); }
          50%  { transform: scale(1.2); box-shadow: 0 0 12px 4px rgba(255,0,0,0.5); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255,0,0,0); }
        }
        @keyframes online-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(40,167,69,0.7); }
          70%  { box-shadow: 0 0 0 6px rgba(40,167,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(40,167,69,0); }
        }
        @keyframes success-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes topBarSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes brainPulse {
          0%   { filter: drop-shadow(0 0 0px rgba(180,140,255,0)); transform: scale(1); }
          40%  { filter: drop-shadow(0 0 6px rgba(180,140,255,0.9)); transform: scale(1.18); }
          100% { filter: drop-shadow(0 0 0px rgba(180,140,255,0)); transform: scale(1); }
        }
        @keyframes brainPulseMobile {
          0%   { filter: drop-shadow(0 0 0px rgba(180,140,255,0)); transform: scale(1); }
          40%  { filter: drop-shadow(0 0 8px rgba(180,140,255,1)); transform: scale(1.22); }
          100% { filter: drop-shadow(0 0 0px rgba(180,140,255,0)); transform: scale(1); }
        }
        @keyframes bottomNavIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes coinShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5) drop-shadow(0 0 6px rgba(255,210,0,1)); }
        }
        @keyframes bellRing {
          0%,55%,100% { transform: rotate(0deg); }
          10% { transform: rotate(18deg); }
          20% { transform: rotate(-16deg); }
          30% { transform: rotate(12deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes redDotPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,50,50,0.8); transform: scale(1); }
          70%  { box-shadow: 0 0 0 5px rgba(255,50,50,0); transform: scale(1.1); }
          100% { box-shadow: 0 0 0 0 rgba(255,50,50,0); transform: scale(1); }
        }

        /* ── Shared ── */
        .online-indicator {
          position: absolute; bottom: 2px; right: 2px; width: 13px; height: 13px;
          background-color: #28a745; border-radius: 50%; border: 2px solid rgba(6,6,26,1);
          animation: online-pulse 2s infinite; z-index: 5;
        }
        .blinking-dot {
          position: absolute; top: -3px; right: -3px; width: 9px; height: 9px;
          background-color: #ff0000; border-radius: 50%; border: 1px solid rgba(6,6,26,1);
          animation: blink-glow 1.2s infinite ease-in-out; z-index: 10;
        }
        .nav-notification-container { position: relative; display: flex; align-items: center; }
        .edit-input { border-radius: 8px; border: 1px solid #eee; padding: 8px 12px; font-size: 14px; transition: 0.3s; width: 100%; }
        .profile-modal-content { border-radius: 24px; border: none; overflow: hidden; background: #fff; max-height: 90vh; overflow-y: auto; }
        .streak-modal-content { border-radius: 20px; border: none; background: #fff; }
        .image-overlay { position: absolute; bottom: 0; right: 0; background: #6c5dff; color: white; padding: 6px; border-radius: 50%; cursor: pointer; border: 2px solid white; transition: 0.3s; }
        .resume-box { border: 2px dashed #e0e0e0; border-radius: 12px; padding: 15px; transition: 0.3s; }
        .success-animation { animation: success-pop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .notification-note { font-size: 11px; color: #6c757d; line-height: 1.3; margin-top: 15px; background: #f8f9fa; padding: 10px; border-radius: 10px; border-left: 3px solid #6c5dff; }
        .brain-icon-svg { animation: brainPulse 2.8s ease-in-out infinite; }
        .brain-icon-svg-mobile { animation: brainPulseMobile 2.2s ease-in-out infinite; }

        /* ════════════════════════════════════════════
           TOP BAR — WHITE THEME
           ════════════════════════════════════════════ */
        .jv-topbar {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; height: 68px;
          background: rgba(255,255,255,0.97);
          z-index: 1055;
          align-items: center;
          padding: 0 16px;
          animation: topBarSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
          border-bottom: 1px solid #e2e8f0;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 12px rgba(0,0,0,0.08);
        }

        /* LEFT: profile button */
        .jv-profile-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; padding: 0;
          cursor: pointer; -webkit-tap-highlight-color: transparent; flex-shrink: 0;
        }
        .jv-avatar-wrap { position: relative; width: 42px; height: 42px; flex-shrink: 0; }
        .jv-avatar-img {
          width: 42px; height: 42px; border-radius: 50%;
          border: 2px solid rgba(108,93,255,0.35);
          background: rgba(108,93,255,0.06);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .jv-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
        .jv-avatar-online {
          position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px;
          background: #28a745; border-radius: 50%; border: 2px solid #fff;
          animation: online-pulse 2s infinite;
        }
        .jv-profile-info { text-align: left; }
        .jv-profile-name {
          color: #0f172a;
          font-size: 13px; font-weight: 800; line-height: 1.2;
          max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .jv-profile-sub { color: #94a3b8; font-size: 9.5px; font-weight: 500; }

        /* Disable profile button when sidebar is open on non-dashboard */
        .jv-profile-btn.sidebar-disabled { pointer-events: none; opacity: 0.5; }

        /* CENTER logo */
        .jv-topbar-logo {
          position: absolute; left: 50%; transform: translateX(-50%);
          color: #0f172a; font-size: 15px; font-weight: 900;
          letter-spacing: -0.2px; white-space: nowrap; pointer-events: none;
        }

        /* RIGHT: no card backgrounds — plain icon+text style */
        .jv-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }

        /* Streak / Coins */
        .jv-stat {
          display: flex; align-items: center; gap: 3px;
          background: none; border: none; padding: 0;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
        }
        .jv-stat-emoji { font-size: 15px; line-height: 1; }
        .jv-stat-val { font-size: 13px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; }
        .jv-stat.streak .jv-stat-emoji { animation: flamePulse 1.5s ease-in-out infinite; display: inline-block; }
        .jv-stat.coins  .jv-stat-emoji { animation: coinShine 2s ease-in-out infinite; display: inline-block; }

        /* Bell */
        .jv-bell {
          position: relative; display: flex; align-items: center; justify-content: center;
          background: none; border: none; padding: 2px;
          cursor: pointer; color: #475569; -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .jv-bell.ringing { animation: bellRing 3.5s ease-in-out infinite; }
        .jv-bell-badge {
          position: absolute; top: -5px; right: -7px;
          background: #ff3232; color: #fff;
          font-size: 9px; font-weight: 900;
          border-radius: 10px; padding: 1px 4px; min-width: 16px; text-align: center;
          border: 1.5px solid #fff;
          animation: redDotPulse 1.5s infinite;
          line-height: 1.4;
        }
        .jv-bell-dot {
          position: absolute; top: -1px; right: -1px; width: 8px; height: 8px;
          background: #ff3232; border-radius: 50%; border: 1.5px solid #fff;
          animation: redDotPulse 1.5s infinite;
        }

        /* Sidebar gamification (desktop) */
        .sidebar-gami-row {
          display: flex; gap: 16px; justify-content: center;
          margin-bottom: 14px; flex-shrink: 0; align-items: center;
        }
        .sidebar-gami-item {
          display: flex; align-items: center; gap: 4px;
          background: none; border: none; padding: 0;
          cursor: pointer; color: #cfd3ff;
        }
        .sidebar-gami-item .ge { font-size: 14px; line-height: 1; }
        .sidebar-gami-item .gv { font-size: 12px; font-weight: 800; color: #fff; }

        /* ── Sidebar ── */
        .chatgpt-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          z-index: 1045; opacity: 0; transition: opacity 0.3s ease;
        }
        .chatgpt-overlay.active { display: block; opacity: 1; }
        .app-sidebar {
          position: fixed; top: 0; left: 0; height: 100vh; width: 240px;
          background-color: rgba(6,6,26,1); color: #cfd3ff; z-index: 1050;
          transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden; display: flex; flex-direction: column;
          padding: 20px 16px; padding-top: 28px; border-top-right-radius: 25px;
        }
        .sidebar-scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; }
        .sidebar-scroll-area::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .sidebar-logout { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; margin-top: 10px; }

        /* ── Bottom nav ── */
        .mobile-bottom-nav {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 64px;
          background: rgba(6,6,26,0.97);
          border-top-left-radius: 20px; border-top-right-radius: 20px;
          border-top: 1px solid rgba(108,93,255,0.28);
          border-left: 1px solid rgba(108,93,255,0.28);
          border-right: 1px solid rgba(108,93,255,0.28);
          border-bottom: none; z-index: 1040;
          align-items: center; justify-content: space-around; padding: 0 4px;
          animation: bottomNavIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
          backdrop-filter: blur(16px);
          box-shadow: 0 -4px 24px rgba(0,0,0,0.4), 0 -1px 12px rgba(108,93,255,0.12);
        }
        .bottom-nav-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex: 1; height: 100%; cursor: pointer; position: relative;
          text-decoration: none; -webkit-tap-highlight-color: transparent;
          transition: all 0.2s ease; gap: 3px; padding: 6px 0;
        }
        .bottom-nav-item .bnav-icon {
          position: relative; display: flex; align-items: center; justify-content: center;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bottom-nav-item.active .bnav-icon { color: #b49dff; transform: translateY(-2px) scale(1.15); filter: drop-shadow(0 0 6px rgba(180,160,255,0.7)); }
        .bottom-nav-item:not(.active) .bnav-icon { color: #6670bb; }
        .bottom-nav-item .bnav-label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.01em; transition: all 0.2s; white-space: nowrap; }
        .bottom-nav-item.active .bnav-label { color: #b49dff; }
        .bottom-nav-item:not(.active) .bnav-label { color: #4a5080; }
        .bottom-nav-active-pill {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 32px; height: 3px; background: linear-gradient(90deg,#6c5dff,#b49dff);
          border-radius: 0 0 4px 4px;
        }
        .bottom-nav-dot {
          position: absolute; top: -2px; right: -2px; width: 8px; height: 8px;
          background: #ff4444; border-radius: 50%; border: 1.5px solid rgba(6,6,26,1);
          animation: blink-glow 1.2s infinite ease-in-out;
        }

        /* ── Responsive ── */
        @media (min-width: 1025px) {
          .jv-topbar { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
          body { padding-top: 0 !important; padding-bottom: 0 !important; }
        }
        @media (max-width: 1024px) {
          .jv-topbar { display: flex !important; }
          .app-sidebar {
            transform: translateX(-100%); top: 0 !important; height: 100vh !important;
            width: 260px !important; border-radius: 0 22px 22px 0 !important;
            box-shadow: 10px 0 40px rgba(0,0,0,0.45);
          }
          .app-sidebar.mobile-open { transform: translateX(0); }
          .mobile-bottom-nav { display: flex !important; }
          .sidebar-gami-row { display: none !important; }
          body { padding-bottom: 64px; padding-top: 60px; }
        }
        @media (max-width: 768px) { .app-sidebar { width: 255px !important; } }
        @media (max-width: 480px) {
          .app-sidebar { width: 248px !important; border-radius: 0 20px 20px 0 !important; }
          .bottom-nav-item .bnav-label { font-size: 8.5px; }
        }
        @supports (padding: env(safe-area-inset-top)) {
          .jv-topbar { height: calc(68px + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top); }
          .app-sidebar { padding-top: calc(28px + env(safe-area-inset-top)) !important; padding-bottom: calc(14px + env(safe-area-inset-bottom)) !important; }
          .mobile-bottom-nav { height: calc(64px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); }
          body { padding-top: calc(60px + env(safe-area-inset-top)); }
        }
        @media (max-width: 768px) {
          .profile-modal-content .border-end { border-right: none !important; border-bottom: 1px solid #eee; padding-bottom: 30px; margin-bottom: 20px; }
        }
        @media (max-width: 576px) {
          .profile-modal-content { border-radius: 15px; margin: 10px; }
          .modal-dialog { margin: 0.5rem; }
          .edit-input { font-size: 13px; }
          .resume-box { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ── LeetCode Coin Burst ── */}
      {showCoinBurst && <LeetcodeCoinBurst onDone={() => setShowCoinBurst(false)} />}

      {/* ── Streak Calendar ── */}
      <StreakCalendarModal
        show={showStreakCalendar}
        onHide={() => setShowStreakCalendar(false)}
        streak={streak}
        loginHistory={loginHistory}
      />

      {/* ── Notifications Panel ── */}
      <NotificationsPanel
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onMarkOneRead={handleMarkOneRead}
      />

      {/* ════════════════════════════════════════════════════════
          TOP BAR (mobile ≤1024px only) — WHITE
          ════════════════════════════════════════════════════════ */}
      <div className="jv-topbar">
        {/* LEFT: Profile avatar */}
        <button
          className={`jv-profile-btn ${isMobileMenuOpen && !isOnDashboard ? 'sidebar-disabled' : ''}`}
          onClick={() => {
            if (isMobileMenuOpen) return;
            setIsMobileMenuOpen(true);
          }}
          aria-label="Open navigation"
        >
          <div className="jv-avatar-wrap">
            <div className="jv-avatar-img">
              {loadingProfile ? (
                <Spinner animation="border" size="sm" style={{ color: '#6c5dff', width: '18px', height: '18px' }} />
              ) : profile.profileImg ? (
                <img src={profile.profileImg} alt="Profile" />
              ) : (
                <User size={18} color="#6c5dff" />
              )}
            </div>
            <div className="jv-avatar-online" />
          </div>
          <div className="jv-profile-info">
            <div className="jv-profile-name">{profile.name || 'Job Vault'}</div>
            <div className="jv-profile-sub">Tap to explore ›</div>
          </div>
        </button>

        {/* RIGHT: Streak · Coins · Bell */}
        <div className="jv-topbar-right">
          <button className="jv-stat streak" onClick={() => setShowStreakCalendar(true)} title="Streak calendar">
            <span className="jv-stat-emoji">🔥</span>
            <span className="jv-stat-val">{streak}</span>
          </button>

          <button className="jv-stat coins" title="Daily coins">
            <span className="jv-stat-emoji">🪙</span>
            <span className="jv-stat-val">{coins}</span>
          </button>

          <button
            className={`jv-bell ${unreadCount > 0 ? 'ringing' : ''}`}
            onClick={() => setShowNotifications(p => !p)}
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 ? (
              <span className="jv-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            ) : null}
          </button>
        </div>
      </div>

      {/* ── Overlay backdrop ── */}
      <div
        className={`chatgpt-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── Main Sidebar (always dark) ── */}
      <div className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Close button (mobile) */}
        <div className="d-lg-none text-end mb-2" style={{ marginTop: '-8px', flexShrink: 0 }}>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#6c5dff', padding: '4px', cursor: 'pointer', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Profile avatar (desktop sidebar only) */}
        <div
          className="profile-trigger d-none d-lg-flex justify-content-center align-items-center"
          onClick={() => {
            setShowProfile(true);
            toast("Viewing Profile", { icon: "👤" });
            if (window.innerWidth <= 1024) setIsMobileMenuOpen(false);
          }}
          style={{ cursor: 'pointer', marginBottom: "16px", flexShrink: 0 }}
        >
          <div className="position-relative">
            <div className="bg-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
              {loadingProfile ? <Spinner animation="border" size="sm" variant="dark" />
                : profile.profileImg ? <img src={profile.profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={32} className="text-dark" />}
            </div>
            <div className="online-indicator" />
          </div>
        </div>

        {/* Desktop gamification */}
        <div className="sidebar-gami-row">
          <button className="sidebar-gami-item" onClick={() => setShowStreakCalendar(true)} title="Streak">
            <span className="ge" style={{ animation: 'flamePulse 1.5s infinite', display: 'inline-block' }}>🔥</span>
            <span className="gv">{streak}</span>
          </button>
          <button className="sidebar-gami-item" title="Coins">
            <span className="ge" style={{ animation: 'coinShine 2s infinite', display: 'inline-block' }}>🪙</span>
            <span className="gv">{coins}</span>
          </button>
          <button
            className="sidebar-gami-item"
            style={{ position: 'relative' }}
            onClick={() => setShowNotifications(p => !p)}
            title="Notifications"
          >
            <Bell size={15} color={unreadCount > 0 ? '#ff6b6b' : '#9aa2ff'} style={unreadCount > 0 ? { animation: 'bellRing 3.5s infinite' } : {}} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-6px',
                background: '#ff3232', color: '#fff', fontSize: '8px', fontWeight: 900,
                borderRadius: '10px', padding: '1px 3px', minWidth: '14px', textAlign: 'center',
                border: '1.5px solid rgba(6,6,26,1)',
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        </div>

        {/* Profile Modal */}
        <Modal show={showProfile} onHide={() => setShowProfile(false)} centered size="lg" contentClassName="profile-modal-content">
          <Modal.Header closeButton className="border-0 px-4 pt-4"></Modal.Header>
          <Modal.Body className="px-3 px-md-4 pb-5">
            <Row className="gy-4">
              <Col lg={4} className="text-center border-end">
                <div className="position-relative d-inline-block mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '130px', height: '130px', overflow: 'hidden', border: '3px solid #f0f0f0' }}>
                    {profile.profileImg
                      ? <img src={profile.profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User size={60} className="text-muted" />}
                  </div>
                  {isEditing && (
                    <div className="image-overlay" onClick={() => fileInputRef.current.click()}><Camera size={16} /></div>
                  )}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div
                    onClick={() => { setShowProfile(false); setTimeout(() => setShowStreakCalendar(true), 200); }}
                    style={{ background: 'linear-gradient(135deg,#ff6b00,#ffb347)', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '16px' }}>🔥</span>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '13px' }}>{streak} days</span>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,#FFD700,#FFA500)', borderRadius: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '16px' }}>🪙</span>
                    <span style={{ fontWeight: 800, color: '#1a0a00', fontSize: '13px' }}>{coins} pts</span>
                  </div>
                </div>

                <h5 className="fw-bold text-dark mb-3">{profile.name || "Your Name"}</h5>
                <div className="d-grid gap-2 px-3">
                  {!isEditing ? (
                    <Button variant="outline-primary" className="rounded-pill shadow-sm" onClick={startEditing}>
                      <Edit3 size={14} className="me-2" /> Edit Profile
                    </Button>
                  ) : (
                    <Button variant={saveSuccess ? "success" : "primary"} className="rounded-pill shadow-sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Spinner animation="border" size="sm" />
                        : saveSuccess ? <span className="success-animation">🎉 Saved Successfully!</span>
                        : <><Save size={14} className="me-2" /> Save Changes</>}
                    </Button>
                  )}
                </div>
                <div className="notification-note text-start mx-2">
                  <div className="d-flex align-items-start gap-2">
                    <span style={{ flexShrink: 0 }}><Info size={14} className="text-primary mt-1" /></span>
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
                      <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '8px 0 0 8px', fontSize: '14px' }}>+91</span>
                      <Form.Control className="edit-input border-start-0" style={{ borderRadius: '0 8px 8px 0' }} disabled={!isEditing} value={profile.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
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
                    <Form.Control type="number" step="0.01" className="edit-input" disabled={!isEditing} value={profile.degree_cgpa || ""} onChange={(e) => setProfile({...profile, degree_cgpa: e.target.value})} />
                  </Col>
                  <Col xs={4}>
                    <label className="text-muted small mb-1">Inter/diploma CGPA/Marks</label>
                    <Form.Control type="number" step="0.01" className="edit-input" disabled={!isEditing} value={profile.inter_cgpa || ""} onChange={(e) => setProfile({...profile, inter_cgpa: e.target.value})} />
                  </Col>
                  <Col xs={4}>
                    <label className="text-muted small mb-1">SSC CGPA/Marks</label>
                    <Form.Control type="number" step="0.01" className="edit-input" disabled={!isEditing} value={profile.ssc_cgpa || ""} onChange={(e) => setProfile({...profile, ssc_cgpa: e.target.value})} />
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
                        <div className="p-2 bg-primary bg-opacity-10 rounded text-primary"><File size={20} /></div>
                        <div style={{ maxWidth: '180px' }}>
                          <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>{profile.resumeName || "No Resume"}</p>
                          <small className="text-muted" style={{ fontSize: '11px' }}>Stored securely</small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {isEditing ? (
                          <Button variant="light" size="sm" style={{ fontSize: '12px' }} onClick={() => resumeInputRef.current.click()}><Upload size={12} className="me-1" /> Upload</Button>
                        ) : profile.resumeFile && (
                          <Button variant="primary" size="sm" style={{ fontSize: '12px' }} onClick={handleDownload}><Download size={12} className="me-1" /> Download</Button>
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

        {/* ── Scrollable Nav Menu ── */}
        <div className="sidebar-scroll-area">
          <Nav className="flex-column gap-1">
            {/* Profile — mobile only */}
            <div
              className="d-lg-none"
              onClick={() => {
                setShowProfile(true);
                setIsMobileMenuOpen(false);
                toast("Viewing Profile", { icon: "👤" });
              }}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "12px",
                color: "#b6bbff", background: "transparent",
                transition: "all 0.25s ease", cursor: "pointer", fontSize: "14.5px",
                marginBottom: "2px",
              }}
            >
              <span style={{ color: "#9aa2ff", display: "flex", alignItems: "center" }}>
                <User size={18} />
              </span>
              Profile
            </div>

            {menu.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Nav.Link
                  as={Link}
                  to={item.path}
                  key={index}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={item.hideOnMobile ? 'd-none d-lg-flex' : ''}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "12px",
                    color: isActive ? "#d6c7ff" : "#b6bbff",
                    background: isActive ? "linear-gradient(90deg,rgba(108,93,255,0.35),rgba(108,93,255,0.15))" : "transparent",
                    boxShadow: isActive ? "inset 0 0 12px rgba(120,100,255,0.25)" : "none",
                    transition: "all 0.25s ease", textDecoration: "none", fontSize: "14.5px",
                  }}
                >
                  <span className="nav-notification-container" style={{ color: isActive ? "#bfa8ff" : "#9aa2ff" }}>
                    {item.isBrain ? <BrainIcon size={18} /> : item.icon}
                    {item.hasNotification && <div className="blinking-dot" />}
                  </span>
                  {item.name}
                </Nav.Link>
              );
            })}
          </Nav>
        </div>

        {/* ── Logout pinned to bottom ── */}
        <div className="sidebar-logout">
          <button
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "12px", color: "#ff6b6b", background: "transparent", border: "none", width: "100%", textAlign: "left", fontSize: "14.5px", cursor: "pointer", transition: "all 0.25s" }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="mobile-bottom-nav">
        {bottomNavItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={index}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {isActive && <div className="bottom-nav-active-pill" />}
              <div className="bnav-icon">
                {item.isBrain ? (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="brain-icon-svg-mobile">
                    <path d="M9.5 2a2.5 2.5 0 0 1 2.45 2H12a2.5 2.5 0 0 1 4.95.5A2.49 2.49 0 0 1 18 7v.5A2.5 2.5 0 0 1 20 10v4a2.5 2.5 0 0 1-2 2.45V17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-.55A2.5 2.5 0 0 1 4 14v-4a2.5 2.5 0 0 1 2-2.45V7a2.5 2.5 0 0 1 2.5-2.5"/>
                    <path d="M12 4.5v15"/><path d="M8 8.5c1 0 2-.5 2-1.5"/><path d="M16 8.5c-1 0-2-.5-2-1.5"/>
                    <path d="M8 12.5c1 0 2 .5 2 1.5"/><path d="M16 12.5c-1 0-2 .5-2 1.5"/>
                  </svg>
                ) : item.icon}
                {item.hasNotification && <div className="bottom-nav-dot" />}
              </div>
              <span className="bnav-label">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default SideNavbar;