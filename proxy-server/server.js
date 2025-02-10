const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Root route for testing
app.get("/", (req, res) => {
    res.send("✅ Proxy Server is Running!");
});

// Scrape AtCoder contests
app.get("/atcoder-contests", async (req, res) => {
    try {
        const response = await axios.get("https://atcoder.jp/contests/");
        const html = response.data;
        const $ = cheerio.load(html);

        let contests = [];

        $(".table-responsive tbody tr").each((index, element) => {
            const columns = $(element).find("td");
            if (columns.length >= 3) {
                const startTime = $(columns[0]).text().trim();
                let name = $(columns[1]).text().trim().replace(/\s+/g, " "); // ✅ Remove excessive spaces/tabs/newlines
                const url = "https://atcoder.jp" + $(columns[1]).find("a").attr("href");
                const duration = $(columns[2]).text().trim();

                // Convert duration into hours and minutes
                const durationParts = duration.split(":");
                const formattedDuration = `${durationParts[0]} hours ${durationParts[1]} minutes`;

                contests.push({
                    name,
                    start: startTime,
                    duration: formattedDuration,
                    url,
                });
            }
        });

        res.json(contests);
    } catch (error) {
        console.error("Error fetching AtCoder contests:", error);
        res.status(500).json({ error: "Failed to fetch AtCoder contests" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
