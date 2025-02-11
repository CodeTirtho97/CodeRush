document.addEventListener("DOMContentLoaded", async function () {
    const contestList = document.getElementById("contest-list");
    const refreshBtn = document.getElementById("refresh-btn");

    if (!contestList || !refreshBtn) {
        console.error("Error: Missing contest-list or refresh button in popup.html.");
        return;
    }

    console.log("Popup.js loaded successfully.");

    // ✅ Dynamically import API modules
    const { fetchCodeforcesContests } = await import("./api/codeforces.js");
    const { fetchCodechefContests } = await import("./api/codechef.js");
    const { fetchAtcoderContests } = await import("./api/atcoder.js");

    let activePlatform = "CodeForces"; // ✅ Store the selected platform

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

            console.log(`Raw ${platform} contests:`, contests);

            // ✅ Set filtering limit to **7 days**
            const now = new Date();
            const sevenDaysLater = new Date();
            sevenDaysLater.setDate(now.getDate() + 7);

            // ✅ Filter contests happening within the next **7** days
            contests = contests.filter(contest => {
                const contestDate = new Date(contest.start);
                return contestDate >= now && contestDate <= sevenDaysLater;
            });

            console.log(`Filtered ${platform} contests:`, contests);

            contestList.innerHTML = "";

            if (contests.length === 0) {
                contestList.innerHTML = `<p>No upcoming ${platform} contests in the next 7 days.</p>`;
            } else {
                contests.forEach(contest => {
                    const contestCard = document.createElement("div");
                    contestCard.classList.add("contest-card");

                    // ✅ Ensure attributes are set properly
                    contestCard.setAttribute("data-name", contest.name);
                    contestCard.setAttribute("data-start-time", contest.start);
                    contestCard.setAttribute("data-duration", contest.duration);
                    contestCard.setAttribute("data-url", contest.url);

                    contestCard.innerHTML = `
                        <h3>${contest.name}</h3>
                        <p>📅 Starts: ${new Date(contest.start).toLocaleString()}</p>
                        <p>⏳ Duration: ${contest.duration}</p>

                        <div class="contest-actions">
                            <a href="${contest.url}" target="_blank" class="contest-link">🔗 View Contest</a>
                            <button class="reminder-btn" title="Set Reminder">⏰</button>
                            <button class="calendar-btn" title="Add to Google Calendar">📅</button>
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

    // ✅ Function to set a reminder using Chrome Alarms
    function setReminder(contestCard) {
        const contestName = contestCard.getAttribute("data-name");
        const contestStartTime = contestCard.getAttribute("data-start-time");

        const contestDate = new Date(contestStartTime);

        if (isNaN(contestDate.getTime())) {
            console.error("❌ Invalid contest start time:", contestStartTime);
            alert("Error: Invalid contest start time.");
            return;
        }

        const reminderTime = contestDate.getTime() - 5 * 60 * 1000; // 5 minutes before

        chrome.alarms.create(contestName, { when: reminderTime });

        chrome.storage.local.set({ [contestName]: contestStartTime }, () => {
            document.getElementById("reminder-text").innerText = `Reminder set for: ${contestName}`;
            document.getElementById("reminder-modal").style.display = "block";
        });

        console.log(`✅ Reminder set for ${contestName} at ${contestDate}`);
    }

    // ✅ Close the modal when "OK" is clicked
    document.getElementById("close-modal").addEventListener("click", function () {
        document.getElementById("reminder-modal").style.display = "none";
    });

    // ✅ Function to add contest to Google Calendar
    function addToGoogleCalendar(contestCard) {
        const contestName = contestCard.getAttribute("data-name");
        const contestStartTime = contestCard.getAttribute("data-start-time");
        const contestDuration = contestCard.getAttribute("data-duration");

        console.log(`Attempting to add ${contestName} to Google Calendar...`);

        // ✅ Handle large durations properly
        const durationMatch = contestDuration.match(/(\d+)\s*hours?/);
        let hours = durationMatch ? parseInt(durationMatch[1], 10) : 0;

        const minutesMatch = contestDuration.match(/(\d+)\s*minutes?/);
        let minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        if (contestDuration.includes("days")) {
            const daysMatch = contestDuration.match(/(\d+)\s*days?/);
            if (daysMatch) {
                hours += parseInt(daysMatch[1], 10) * 24;
            }
        }

        // ✅ Convert duration to milliseconds
        const durationMs = (hours * 60 + minutes) * 60 * 1000;

        // ✅ Ensure startTime is a valid Date object
        const startDate = new Date(contestStartTime);
        if (isNaN(startDate.getTime())) {
            console.error("❌ Invalid start time:", contestStartTime);
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

    // ✅ Event delegation for dynamically created contest buttons
    document.addEventListener("click", function (event) {
        const contestCard = event.target.closest(".contest-card");
        if (!contestCard) return;

        if (event.target.classList.contains("reminder-btn")) {
            setReminder(contestCard);
        } else if (event.target.classList.contains("calendar-btn")) {
            addToGoogleCalendar(contestCard);
        }
    });

    // ✅ Prevent Auto-Switching to CodeForces After Selecting Another Platform
    loadContests(activePlatform);

    const tabs = document.querySelectorAll(".platform-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelector(".active-tab").classList.remove("active-tab");
            this.classList.add("active-tab");

            activePlatform = this.dataset.platform; // ✅ Store the selected platform
            loadContests(activePlatform);
        });
    });

    refreshBtn.addEventListener("click", function () {
        console.log(`Refresh button clicked, reloading ${activePlatform} contests...`);
        loadContests(activePlatform);
    });
});