const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (HTML, CSS, JS, images) from project root
app.use(express.static(path.join(__dirname, "..")));

// Save message API
app.post("/contact", (req, res) => {
  const { name, email, msg } = req.body;

  const filePath = path.join(__dirname, "messages.json");
  let messages = [];

  if (fs.existsSync(filePath)) {
    try {
      messages = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      console.error("Error reading messages.json:", err);
    }
  }

  messages.push({ name, email, msg, time: new Date().toLocaleString() });

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

  res.json({ success: true, message: "Message saved in messages.json!" });
});

// ✅ Default route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Start server
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
