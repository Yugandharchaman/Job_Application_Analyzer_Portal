const calendarData = [
  {
    date: new Date().toDateString(),
    label: "Today",
    completed: true,
    reminder: "Apply to 2 jobs",
  },
  {
    date: new Date(Date.now() - 86400000).toDateString(),
    label: "Yesterday",
    completed: true,
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toDateString(),
    label: "2 days ago",
    completed: false,
    reminder: "Prepare interview",
  },
];

export default calendarData;
