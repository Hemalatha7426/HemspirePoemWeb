// server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint to handle contact form
app.post("/api/contact", (req, res) => {
  const newMessage = req.body;

  // Read existing messages
  fs.readFile("messages.json", "utf8", (err, data) => {
    let messages = [];
    if (!err && data) {
      try {
        messages = JSON.parse(data);
      } catch (e) {
        messages = [];
      }
    }

    // Add new message
    messages.push(newMessage);

    // Save back to file
    fs.writeFile("messages.json", JSON.stringify(messages, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save message" });
      }
      res.json({ success: true, message: "Message saved successfully" });
    });
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("Contact API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
