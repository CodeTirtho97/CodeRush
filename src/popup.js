document.addEventListener("DOMContentLoaded", async function () {
    const contestList = document.getElementById("contest-list");
    const refreshBtn = document.getElementById("refresh-btn");

    if (!contestList || !refreshBtn) {
        console.error("Error: Missing contest-list or refresh button in popup.html.");
        return;
    }

    console.log("Popup.js loaded successfully.");

    // Dynamically import Platform API modules
    const { fetchCodeforcesContests } = await import("./api/codeforces.js");
    const { fetchCodechefContests } = await import("./api/codechef.js");
    const { fetchAtcoderContests } = await import("./api/atcoder.js");

    async function loadContests(platform) {
        console.log(`Fetching ${platform} contests...`);
        contestList.innerHTML = `<p class="loading-text">Fetching contests...</p>`;
    
        let contests = [];
        try {
            if (platform === "CodeForces") {
                contests = await fetchCodeforcesContests();
            } else if (platform === "CodeChef") {
                contests = await fetchCodechefContests();
            } else if (platform === "AtCoder") {
                contests = await fetchAtcoderContests();
            }
    
            console.log(`Raw ${platform} contests:`, contests); // ✅ Log raw API response
    
            // ✅ Set filtering limit to **14 days** (TEMPORARY)
            const now = new Date();
            const fourteenDaysLater = new Date();
            fourteenDaysLater.setDate(now.getDate() + 14); // Increased to 14 days
    
            // ✅ Filter contests happening within the next **14** days
            contests = contests.filter(contest => {
                const contestDate = new Date(contest.start);
                return contestDate >= now && contestDate <= fourteenDaysLater;
            });
    
            console.log(`Filtered ${platform} contests:`, contests); // ✅ Log filtered contests
    
            contestList.innerHTML = "";
    
            if (contests.length === 0) {
                contestList.innerHTML = "<p>No upcoming contests in the next 14 days.</p>";
            } else {
                contests.forEach(contest => {
                    const contestCard = document.createElement("div");
                    contestCard.classList.add("contest-card");
    
                    contestCard.setAttribute("data-start-time", contest.start);
                    contestCard.setAttribute("data-duration", contest.duration);
    
                    contestCard.innerHTML = `
                        <h3>${contest.name}</h3>
                        <p>📅 Starts: ${new Date(contest.start).toLocaleString()}</p>
                        <p>⏳ Duration: ${contest.duration}</p>
    
                        <div class="contest-actions">
                            <a href="${contest.url}" target="_blank" class="contest-link">🔗 View Contest</a>
                            <button class="reminder-btn" title="Set Reminder" data-name="${contest.name}" data-start-time="${contest.start}">⏰</button>
                            <button class="calendar-btn" title="Add to Google Calendar" data-name="${contest.name}" data-start-time="${contest.start}" data-duration="${contest.duration}">📅</button>
                        </div>
                    `;
    
                    contestList.appendChild(contestCard);
                });
            }
        } catch (error) {
            console.error(`Error loading ${platform} contests:`, error);
            contestList.innerHTML = `<p class="error-text">⚠️ Failed to load ${platform} contests. Please try again.</p>`;
        }
    }

    // Load CodeForces contests on startup
    loadContests("CodeForces");

    const tabs = document.querySelectorAll(".platform-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelector(".active-tab").classList.remove("active-tab");
            this.classList.add("active-tab");
            loadContests(this.dataset.platform);
        });
    });

    refreshBtn.addEventListener("click", function () {
        const activePlatform = document.querySelector(".active-tab").dataset.platform;
        console.log(`Refresh button clicked, reloading ${activePlatform} contests...`);
        loadContests(activePlatform);
    });
});
