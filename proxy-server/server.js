require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT || 3000;

// Proxy route to fetch AtCoder contests
app.get("/atcoder-contests", async (req, res) => {
    try {
        const response = await axios.get("https://atcoder.jp/contests/");
        res.send(response.data); // Send the raw HTML response
    } catch (error) {
        console.error("Error fetching AtCoder contests:", error.message);
        res.status(500).json({ error: "Failed to fetch AtCoder contests" });
    }
});

app.listen(PORT, () => console.log(`✅ Proxy server running on port ${PORT}`));
