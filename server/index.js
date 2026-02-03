const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { scheduleReminder } = require("./reminderUtils");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let reminders = []; // simple in-memory storage

app.post("/reminders", (req, res) => {
  const { name, email, dateTime } = req.body; // dateTime = "2026-01-29T15:00"
  const id = reminders.length + 1;

  const reminder = { id, name, email, dateTime, sent: [] };
  reminders.push(reminder);

  scheduleReminder(reminder);
  res.json({ message: "Reminder scheduled", reminder });
});

app.get("/reminders", (req, res) => {
  res.json(reminders);
});

app.listen(5000, () => console.log("Server running on port 5000"));
