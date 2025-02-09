document.addEventListener("DOMContentLoaded", async function () {
    const contestList = document.getElementById("contest-list");
    const refreshBtn = document.getElementById("refresh-btn");

    if (!contestList || !refreshBtn) {
        console.error("Error: Missing contest-list or refresh button in popup.html.");
        return;
    }

    console.log("Popup.js loaded successfully.");

    // Dynamically import CodeForces API module
    const { fetchCodeforcesContests } = await import("./api/codeforces.js");

    async function loadCodeforcesContests() {
        console.log("Fetching CodeForces contests...");
        contestList.innerHTML = `<p class="loading-text">Fetching contests...</p>`;

        try {
            const contests = await fetchCodeforcesContests();

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
                            <a href="${contest.url}" target="_blank" class="contest-link">
                                🔗 View Contest
                            </a>

                            <button class="reminder-btn" title="Set Reminder">
                                ⏰
                            </button>

                            <button class="calendar-btn" title="Add to Google Calendar">
                                📅
                            </button>
                        </div>
                    `;
                    contestList.appendChild(contestCard);
                });
            }
        } catch (error) {
            console.error("Error loading contests:", error);
            contestList.innerHTML = `<p class="error-text">⚠️ Failed to load contests. Please try again.</p>`;
        }
    }

    // Function to set a reminder using Chrome Alarms
    // Function to set a reminder using Chrome Alarms
    function setReminder(contestName, startTime) {
        const contestDate = new Date(startTime);
        const reminderTime = contestDate.getTime() - 5 * 60 * 1000; // 5 minutes before
    
        chrome.alarms.create(contestName, { when: reminderTime });
    
        chrome.storage.local.set({ [contestName]: startTime }, () => {
            // Update modal text and show it
            document.getElementById("reminder-text").innerText = `Reminder set for: ${contestName}`;
            document.getElementById("reminder-modal").style.display = "block";
        });
    }
    
    // Close the modal when "OK" is clicked
    document.getElementById("close-modal").addEventListener("click", function () {
        document.getElementById("reminder-modal").style.display = "none";
    });

    // Function to add contest to Google Calendar
    function addToGoogleCalendar(contestName, startTime, contestDuration) {
        console.log(`Attempting to add ${contestName} to Google Calendar...`);
    
        // Extract hours and minutes from the formatted duration
        const durationMatch = contestDuration.match(/(\d+)\s*hours?\s*(\d*)\s*minutes?/);
        if (!durationMatch) {
            console.error("❌ Invalid duration detected:", contestDuration);
            alert("Error: Invalid contest duration.");
            return;
        }
    
        const hours = parseInt(durationMatch[1] || "0", 10);
        const minutes = parseInt(durationMatch[2] || "0", 10);
        
        // Convert duration to milliseconds
        const durationMs = (hours * 60 + minutes) * 60 * 1000;
    
        // Ensure startTime is correctly formatted
        const startDate = new Date(startTime);
        if (isNaN(startDate.getTime())) {
            console.error("❌ Invalid start time:", startTime);
            alert("Error: Invalid contest start time.");
            return;
        }
    
        // Calculate end time
        const endDate = new Date(startDate.getTime() + durationMs);
    
        // Format dates to Google Calendar format (YYYYMMDDTHHmmSSZ)
        const formatGoogleCalendarDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
        };
    
        const startFormatted = formatGoogleCalendarDate(startDate);
        const endFormatted = formatGoogleCalendarDate(endDate);
    
        // Generate Google Calendar URL
        const googleCalendarURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            contestName
        )}&dates=${startFormatted}/${endFormatted}&details=Join this coding contest!`;
    
        // Open the Google Calendar link in a new tab
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
    loadCodeforcesContests();

    // Ensure Refresh button works properly
    refreshBtn.addEventListener("click", function () {
        console.log("Refresh button clicked, reloading CodeForces contests...");
        loadCodeforcesContests();
    });
});
