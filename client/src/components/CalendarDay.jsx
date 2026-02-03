

const CalendarDay = ({ day, isToday }) => {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: isToday ? "#6c5cff" : "#0b0b2d",
        color: "#fff",
        minHeight: "110px",
        boxShadow: isToday
          ? "0 0 18px rgba(108,93,255,0.6)"
          : "none",
        position: "relative",
      }}
    >
      <strong>{day.label}</strong>

      {day.completed && (
        <div style={{ marginTop: "8px", color: "#00ff9d" }}>
          🔥 Streak
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
