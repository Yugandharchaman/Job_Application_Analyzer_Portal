const nodemailer = require("nodemailer");

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "career.entry.hub@gmail.com", // Your actual Gmail
    pass: "ptad zsjn gygd etvl" // NOT your login password
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = { 
    from: `"Job Tracker Platform" <carrer.entry.hub@gmail.com>`, 
    to, 
    subject, 
    text 
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

const scheduleReminder = (reminder) => {
  // Intervals: 3 minutes before, 2 minutes before, 1 minute before
  const intervals = [3, 2, 1]; 

  intervals.forEach(min => {
    const eventTime = new Date(reminder.dateTime).getTime();
    const triggerTime = new Date(eventTime - min * 60 * 1000);
    const delay = triggerTime - new Date();

    if (delay > 0) {
      console.log(`⏰ Scheduled: ${min}min reminder for ${reminder.name} in ${delay}ms`);
      setTimeout(() => {
        sendEmail(
          reminder.email, 
          `Upcoming: ${reminder.name}`, 
          `Hi! This is a reminder that your event '${reminder.name}' starts in ${min} minutes.`
        );
      }, delay);
    }
  });

  // Final "Missed" check: 1 minute after the event starts
  const finalCheckDelay = (new Date(reminder.dateTime).getTime() + 60000) - new Date().getTime();
  if (finalCheckDelay > 0) {
    setTimeout(() => {
      sendEmail(
        reminder.email, 
        `Action Required: ${reminder.name}`, 
        `The event '${reminder.name}' has started. Did you attend? Log your notes in Job Tracker!`
      );
    }, finalCheckDelay);
  }
};

module.exports = { scheduleReminder };