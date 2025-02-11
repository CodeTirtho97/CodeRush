const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

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
                name = name.replace(/[@📢◉ⒶⒽ]/g, "").trim(); // Remove unwanted symbols
                
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

// Scrape HackerRank contests using Puppeteer
app.get("/hackerrank-contests", async (req, res) => {
    try {
        console.log("Launching Puppeteer to scrape HackerRank...");
        const browser = await puppeteer.launch({
            headless: true, // Run in headless mode
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto("https://www.hackerrank.com/contests", {
            waitUntil: "networkidle2",
        });

        console.log("Page loaded, extracting contest details...");

        // Scrape contest data
        const contests = await page.evaluate(() => {
            let contestElements = document.querySelectorAll(".contest-card");
            let contestData = [];

            contestElements.forEach((contest) => {
                let nameElement = contest.querySelector("h3");
                let dateElement = contest.querySelector("span[aria-label]");
                let linkElement = contest.querySelector("a");

                if (nameElement && dateElement && linkElement) {
                    contestData.push({
                        name: nameElement.innerText.trim(),
                        start: dateElement.innerText.trim(),
                        url: linkElement.href,
                    });
                }
            });

            return contestData;
        });

        console.log("Closing Puppeteer...");
        await browser.close();

        if (contests.length === 0) {
            return res.json({ message: "No upcoming contests found." });
        }

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
