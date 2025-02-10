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
                
                // ✅ Remove unwanted symbols from contest name
                let name = $(columns[1]).text().trim().replace(/\s+/g, " ");
                name = name.replace(/[@📢◉ⒶⒽ]/g, "").trim(); // Remove @, 📢 symbols
                
                // ✅ Fix contest names based on special symbols
                // if (name.startsWith("Ⓐ")) {
                //     name = name.replace("Ⓐ", "").trim() + " (Algorithm)";
                // } else if (name.startsWith("Ⓗ")) {
                //     name = name.replace("Ⓗ", "").trim() + " (Heuristic)";
                // }

                const url = "https://atcoder.jp" + $(columns[1]).find("a").attr("href");
                const duration = $(columns[2]).text().trim();

                // ✅ Convert duration into clean hours & minutes format
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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
