document.addEventListener("DOMContentLoaded", async function () {
    const contestList = document.getElementById("contest-list");
    const refreshBtn = document.getElementById("refresh-btn");

    if (!contestList || !refreshBtn) {
        console.error("Error: Missing contest-list or refresh button in popup.html.");
        return;
    }

    console.log("Popup.js loaded successfully.");

    // Dynamically import Plateform API module
    const { fetchCodeforcesContests } = await import("./api/codeforces.js");
    const { fetchCodechefContests } = await import("./api/codechef.js");

    async function loadContests(platform) {
        console.log(`Fetching ${platform} contests...`);
        contestList.innerHTML = `<p class="loading-text">Fetching contests...</p>`;
    
        let contests = [];
        try {
            if (platform === "CodeForces") {
                contests = await fetchCodeforcesContests();
            } else if (platform === "CodeChef") {
                contests = await fetchCodechefContests();
            }
    
            // ✅ Sort contests by start time (earliest first)
            contests.sort((a, b) => new Date(a.start) - new Date(b.start));
    
            contestList.innerHTML = "";
    
            if (contests.length === 0) {
                contestList.innerHTML = "<p>No upcoming contests in the next 3 days.</p>";
            } else {
                contests.forEach(contest => {
                    const contestCard = document.createElement("div");
                    contestCard.classList.add("contest-card");
    
                    contestCard.setAttribute("data-start-time", contest.start);
                    contestCard.setAttribute("data-duration", contest.duration);
    
                    contestCard.innerHTML = `
                        <h3>${contest.name}</h3>
                        <p>📅 Starts: ${contest.start}</p>
                        <p>⏳ Duration: ${contest.duration}</p>

                        <div class="contest-actions">
                            <a href="${contest.url}" target="_blank" class="contest-link">🔗 View Contest</a>
                            <button class="reminder-btn" title="Set Reminder" data-name="${contest.name}" data-start-time="${contest.start}">⏰</button>
                            <button class="calendar-btn" title="Add to Google Calendar" data-name="${contest.name}" data-start-time="${contest.start}" data-duration="${contest.duration}">📅</button>
                        </div>
                    `;

                    contestCard.dataset.startTime = contest.start;
                    contestCard.dataset.duration = contest.duration;

                    contestList.appendChild(contestCard);
                });
            }
        } catch (error) {
            console.error(`Error loading ${platform} contests:`, error);
            contestList.innerHTML = `<p class="error-text">⚠️ Failed to load ${platform} contests. Please try again.</p>`;
        }
    }

    // Function to set a reminder using Chrome Alarms
    // Function to set a reminder using Chrome Alarms
    function setReminder(contestName, startTime) {
        const contestDate = new Date(startTime);
        
        if (isNaN(contestDate.getTime())) {
            console.error("❌ Invalid contest start time:", startTime);
            alert("Error: Invalid contest start time.");
            return;
        }
    
        const reminderTime = contestDate.getTime() - 5 * 60 * 1000; // 5 minutes before
        
        chrome.alarms.create(contestName, { when: reminderTime });
    
        chrome.storage.local.set({ [contestName]: startTime }, () => {
            document.getElementById("reminder-text").innerText = `Reminder set for: ${contestName}`;
            document.getElementById("reminder-modal").style.display = "block";
        });
    
        console.log(`✅ Reminder set for ${contestName} at ${contestDate}`);
    }
    
    // Close the modal when "OK" is clicked
    document.getElementById("close-modal").addEventListener("click", function () {
        document.getElementById("reminder-modal").style.display = "none";
    });

    // Function to add contest to Google Calendar
    function addToGoogleCalendar(contestName, startTime, contestDuration) {
        console.log(`Attempting to add ${contestName} to Google Calendar...`);

        // ✅ Extract hours & minutes properly
        const durationMatch = contestDuration.match(/(\d+)\s*hours?\s*(\d*)\s*minutes?/);
        if (!durationMatch) {
            console.error("❌ Invalid duration detected:", contestDuration);
            alert("Error: Invalid contest duration.");
            return;
        }

        const hours = parseInt(durationMatch[1] || "0", 10);
        const minutes = durationMatch[2] ? parseInt(durationMatch[2], 10) : 0; // Handle missing minutes case
        
        // ✅ Convert duration to milliseconds
        const durationMs = (hours * 60 + minutes) * 60 * 1000;

        // ✅ Ensure startTime is a proper Date object
        const startDate = new Date(startTime);
        if (isNaN(startDate.getTime())) {
            console.error("❌ Invalid start time:", startTime);
            alert("Error: Invalid contest start time.");
            return;
        }

        // ✅ Calculate end time correctly
        const endDate = new Date(startDate.getTime() + durationMs);

        // ✅ Format dates for Google Calendar (YYYYMMDDTHHmmSSZ)
        const formatGoogleCalendarDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

        const startFormatted = formatGoogleCalendarDate(startDate);
        const endFormatted = formatGoogleCalendarDate(endDate);

        // ✅ Generate Google Calendar URL
        const googleCalendarURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            contestName
        )}&dates=${startFormatted}/${endFormatted}&details=Join this coding contest!`;

        // ✅ Open Google Calendar in a new tab
        window.open(googleCalendarURL, "_blank");

        console.log(`✅ Added ${contestName} to Google Calendar successfully.`);
    }

    // Event listener for contest actions (Reminder & Calendar)
    document.addEventListener("click", function (event) {
        const contestCard = event.target.closest(".contest-card");
        if (!contestCard) return;
    
        const contestName = contestCard.querySelector("h3").innerText;
        const contestStartTime = contestCard.dataset.startTime;
        const contestDuration = contestCard.dataset.duration;
    
        if (event.target.classList.contains("reminder-btn")) {
            setReminder(contestName, contestStartTime);
        } else if (event.target.classList.contains("calendar-btn")) {
            console.log(`Adding ${contestName} to Google Calendar...`);
            addToGoogleCalendar(contestName, contestStartTime, contestDuration);
        }
    });

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

    // Ensure Refresh button works properly
    refreshBtn.addEventListener("click", function () {
        const activePlatform = document.querySelector(".active-tab").dataset.platform;
        console.log(`Refresh button clicked, reloading ${activePlatform} contests...`);
        loadContests(activePlatform);
    });
});
