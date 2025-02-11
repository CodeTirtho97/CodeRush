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

// ✅ Scrape AtCoder Contests (Existing)
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
                
                // ✅ Remove unwanted symbols from contest name
                let name = $(columns[1]).text().trim().replace(/\s+/g, " ");
                name = name.replace(/[@📢◉ⒶⒽ]/g, "").trim(); 

                // ✅ Modify contest name based on type
                if (name.includes("Ⓗ")) {
                    name = name.replace("Ⓗ", "").trim() + " (Heuristic)";
                }
                if (name.includes("Ⓐ")) {
                    name = name.replace("Ⓐ", "").trim() + " (Algorithm)";
                }

                const url = "https://atcoder.jp" + $(columns[1]).find("a").attr("href");
                const duration = $(columns[2]).text().trim();

                // ✅ Convert duration into clean format
                const durationParts = duration.split(":");
                let formattedDuration = `${parseInt(durationParts[0], 10)} hours`;
                if (parseInt(durationParts[1], 10) > 0) {
                    formattedDuration += ` ${parseInt(durationParts[1], 10)} minutes`;
                }

                // ✅ Fix Large Hour Cases (e.g., 240 hours → 10 days)
                if (parseInt(durationParts[0], 10) >= 24) {
                    const days = Math.floor(parseInt(durationParts[0], 10) / 24);
                    const remainingHours = parseInt(durationParts[0], 10) % 24;
                    
                    formattedDuration = `${days} days`;
                    if (remainingHours > 0) {
                        formattedDuration += ` ${remainingHours} hours`;
                    }
                    if (parseInt(durationParts[1], 10) > 0) {
                        formattedDuration += ` ${parseInt(durationParts[1], 10)} minutes`;
                    }
                }

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

// ✅ Scrape HackerRank Contests (New)
app.get("/hackerrank-contests", async (req, res) => {
    try {
        const response = await axios.get("https://www.hackerrank.com/contests");
        const html = response.data;
        const $ = cheerio.load(html);

        let contests = [];

        $(".contests-active .contest-card").each((index, element) => {
            const name = $(element).find(".contest-name").text().trim();
            const url = "https://www.hackerrank.com" + $(element).find("a").attr("href");

            const startTimeAttr = $(element).find(".contest-duration").attr("data-starttime");
            const durationAttr = $(element).find(".contest-duration").attr("data-duration");

            if (!startTimeAttr || !durationAttr) return;

            const start = new Date(parseInt(startTimeAttr) * 1000).toISOString();
            const durationMinutes = parseInt(durationAttr) / 60;

            let formattedDuration = `${Math.floor(durationMinutes / 60)} hours`;
            if (durationMinutes % 60 > 0) {
                formattedDuration += ` ${durationMinutes % 60} minutes`;
            }

            contests.push({
                name,
                start,
                duration: formattedDuration,
                url,
            });
        });

        res.json(contests);
    } catch (error) {
        console.error("Error fetching HackerRank contests:", error);
        res.status(500).json({ error: "Failed to fetch HackerRank contests" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
