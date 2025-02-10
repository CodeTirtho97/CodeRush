const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Root route for testing
app.get("/", (req, res) => {
    res.send("✅ Proxy Server is Running!");
});

// AtCoder Contests Proxy Route
app.get("/atcoder-contests", async (req, res) => {
    try {
        const response = await fetch("https://atcoder.jp/contests/");
        const html = await response.text();
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch AtCoder contests" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
