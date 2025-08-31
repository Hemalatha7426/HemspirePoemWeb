const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve all static files (HTML, CSS, JS, images) from project root
app.use(express.static(path.join(__dirname, "..")));

// Endpoint to handle contact form submissions
app.post("/api/contact", (req, res) => {
  const newMessage = req.body;

  // Read existing messages
  fs.readFile(path.join(__dirname, "messages.json"), "utf8", (err, data) => {
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
    fs.writeFile(path.join(__dirname, "messages.json"), JSON.stringify(messages, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save message" });
      }
      res.json({ success: true, message: "Message saved successfully" });
    });
  });
});

// ✅ Fallback: serve index.html if no API route matches
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
