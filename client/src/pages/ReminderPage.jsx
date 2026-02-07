import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; 
import { Bell, Clock, Calendar, AlertCircle, Info, Loader } from "react-feather";
import toast, { Toaster } from "react-hot-toast";

const ReminderPage = () => {
  const today = new Date().toISOString().split("T")[0];
  
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    date: today, 
    time: "" 
  });
  
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState("Ongoing");
  const [sessionUser, setSessionUser] = useState(null); 

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);
      
      if (user) {
        await fetchReminders(user.id);
      }
      setTimeout(() => setInitialLoading(false), 1500);
    };
    init();
  }, []);

  const fetchReminders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId) 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Session expired. Please log in.");
      setLoading(false);
      return;
    }

    const dateTimeISO = new Date(`${formData.date}T${formData.time}`).toISOString();

    try {
      const { error } = await supabase
        .from("reminders")
        .insert([{
          name: formData.name,
          email: formData.email,
          dateTime: dateTimeISO,
          user_id: user.id 
        }]);

      if (error) throw error;
      
      toast.success("Reminder Scheduled Successfully!", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#6c5ddf', secondary: '#fff' },
      });

      setFormData({ name: "", email: "", date: today, time: "" });
      fetchReminders(user.id);
    } catch (err) {
      console.error("SUPABASE ERROR:", err.message || err);
      toast.error(`Error: ${err.message || "Connection failed"}`);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const getStatus = (dateTime) => {
    const now = new Date();
    const eventDate = new Date(dateTime);
    
    // Logic for expiry tab: 
    // If current time is past event time, it is 'Expired'
    // If current time is before event time, it is 'Ongoing'
    return eventDate > now ? "Ongoing" : "Expired";
  };

  const format12Hour = (dateTimeStr) => {
    const dateObj = new Date(dateTimeStr);
    return dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // NEW LOGIC: Filter out any reminder that is more than 1 month old
  const filteredReminders = reminders.filter(r => {
    const now = new Date();
    const eventDate = new Date(r.dateTime);
    const oneMonthAfterEvent = new Date(eventDate);
    oneMonthAfterEvent.setMonth(oneMonthAfterEvent.getMonth() + 1);

    // If the current date is past (Event Date + 1 Month), remove it completely from UI
    if (now > oneMonthAfterEvent) {
      return false;
    }

    // Otherwise, use your standard filter (Ongoing vs Expired)
    return getStatus(r.dateTime) === filter;
  });

  if (initialLoading) return (
    <div style={styles.uniqueLoaderWrapper}>
      <style>
        {`
          @keyframes pulseScale {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes rotateClock {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .pulse-ring {
            position: absolute; width: 100px; height: 100px;
            border: 2px solid #6c5ddf; border-radius: 50%;
            animation: pulseScale 2s ease-out infinite;
          }
        `}
      </style>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="pulse-ring" />
        <div className="pulse-ring" style={{ animationDelay: '0.6s' }} />
        <div style={styles.loaderCore}>
          <Clock size={32} color="#6c5ddf" style={{ animation: 'rotateClock 4s linear infinite' }} />
        </div>
      </div>
      <h5 className="mt-4 fw-bold" style={{ color: "#101341", letterSpacing: '3px', marginTop: '30px' }}>SYNCING TIMELINE...</h5>
      <p className="text-muted small">Accessing Global Notification Registry</p>
    </div>
  );

  return (
    <div style={{ padding: "40px", color: "white", maxWidth: "1200px", margin: "auto", position: "relative" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {loading && (
        <div style={loaderOverlayStyle}>
           <Loader size={40} color="#6c5ddf" style={{ animation: "rotateClock 1s linear infinite" }} />
        </div>
      )}
      
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "50px", opacity: loading ? 0.4 : 1, transition: "opacity 0.3s ease" }}>
        
        <section>
          <div style={cardStyle}>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#101341", fontSize: "1.2rem" }}>
              <Bell size={20} color="#0e0936" />Schedule Your Notification
            </h3>
            <hr style={hrStyle} />
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={labelStyle}>Event Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Interview with Amazon" 
                  style={inputStyle}
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label style={labelStyle}>Notification Email</label>
                <input 
                  type="email" 
                  placeholder="yourname@example.com" 
                  style={inputStyle}
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}><Calendar size={14} style={{marginRight: "5px"}}/> Date</label>
                  <input 
                    type="date" 
                    style={inputStyle}
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}><Clock size={14} style={{marginRight: "5px"}}/> Time</label>
                  <input 
                    type="time" 
                    style={inputStyle}
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ ...buttonStyle, backgroundColor: loading ? "#a29bfe" : "#6c5ddf", transform: loading ? "scale(0.98)" : "scale(1)" }}
              >
                {loading ? "Scheduling..." : "Set Reminder"}
              </button>
            </form>

            <div style={noteStyle}>
              <Info size={16} color="#6c5ddf" />
              <span><strong>Pro Tip:</strong> You can schedule your interview reminders a day before to ensure you have enough time for final prep.</span>
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#101341", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              Reminders <span style={{ fontSize: "14px", color: "#666" }}>({filteredReminders.length})</span>
            </h3>
            
            <div style={{ display: "flex", background: "#f0f0f0", padding: "4px", borderRadius: "12px", border: "1px solid #ddd" }}>
              <button 
                onClick={() => setFilter("Ongoing")}
                style={{ ...filterTabStyle, background: filter === "Ongoing" ? "#fff" : "transparent", color: filter === "Ongoing" ? "#6c5ddf" : "#666", boxShadow: filter === "Ongoing" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}
              >
                Scheduled
              </button>
              <button 
                onClick={() => setFilter("Expired")}
                style={{ ...filterTabStyle, background: filter === "Expired" ? "#fff" : "transparent", color: filter === "Expired" ? "#ff4d4d" : "#666", boxShadow: filter === "Expired" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}
              >
                Expired
              </button>
            </div>
          </div>
          <hr style={hrStyle} />

          <div style={{ height: "550px", overflowY: "auto", paddingRight: "10px" }}>
            {filteredReminders.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#888", textAlign: "center" }}>
                <AlertCircle size={48} color="#ddd" style={{ marginBottom: "15px" }} />
                <p style={{ fontSize: "16px", margin: 0 }}>No {filter.toLowerCase()} reminders found.</p>
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "5px" }}>Try adding a new schedule from the form.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {filteredReminders.map((r, index) => {
                  const status = getStatus(r.dateTime);
                  const isExpired = status === "Expired";
                  
                  return (
                    <div key={index} style={listEntryStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ ...iconBoxStyle, background: isExpired ? "#f8f8f8" : "rgba(108, 93, 255, 0.08)" }}>
                          <Clock size={18} color={isExpired ? "#999" : "#6c5ddf"} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: isExpired ? "#888" : "#1a1a1a" }}>{r.name}</div>
                          <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                            {new Date(r.dateTime).toDateString()} • <span style={{color: "#333", fontWeight: "600"}}>{format12Hour(r.dateTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: "11px", 
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: isExpired ? "#999" : "#6c5ddf", 
                        background: isExpired ? "#f0f0f0" : "rgba(108,93,255,0.1)", 
                        padding: "6px 14px", 
                        borderRadius: "30px"
                      }}>
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  uniqueLoaderWrapper: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' },
  loaderCore: { width: '70px', height: '70px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 30px rgba(108, 93, 223, 0.2)', zIndex: 5 }
};
const loaderOverlayStyle = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10, borderRadius: "28px" };
const cardStyle = { background: "#fff", padding: "35px", borderRadius: "28px", border: "1px solid #eef0f2", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" };
const labelStyle = { display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "13px", color: "#4a5568", fontWeight: "700" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #edf2f7", background: "#f7fafc", color: "#2d3748", outline: "none", fontSize: "14px", transition: "border-color 0.2s" };
const buttonStyle = { marginTop: "15px", padding: "16px", borderRadius: "14px", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", transition: "0.3s all ease", fontSize: "16px" };
const filterTabStyle = { border: "none", padding: "8px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "0.3s all" };
const noteStyle = { marginTop: "30px", padding: "18px", background: "#f8faff", borderRadius: "16px", borderLeft: "5px solid #6c5ddf", fontSize: "13px", color: "#4a5568", display: "flex", gap: "12px", lineHeight: "1.6" };
const listEntryStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" };
const iconBoxStyle = { padding: "12px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" };
const hrStyle = { border: "none", height: "1px", background: "linear-gradient(90deg, #e2e8f0 0%, rgba(226,232,240,0) 100%)", marginBottom: "25px" };

export default ReminderPage;