async function fetchAtcoderContests() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetchAtcoderContests" }, (response) => {
            if (response.success) {
                resolve(parseAtcoderHTML(response.html));
            } else {
                reject("Failed to fetch AtCoder contests: " + response.error);
            }
        });
    });
}

// Function to extract contest data from AtCoder HTML
function parseAtcoderHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const contests = [];
    const contestRows = doc.querySelectorAll(".contest-table tbody tr");

    contestRows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length < 4) return; // Skip invalid rows

        const contestName = cols[1].innerText.trim();
        const contestURL = "https://atcoder.jp" + cols[1].querySelector("a").getAttribute("href");
        const startTime = cols[0].innerText.trim();
        const duration = cols[2].innerText.trim();

        contests.push({
            name: contestName,
            url: contestURL,
            start: new Date(startTime).toISOString(),
            duration: duration
        });
    });

    return contests;
}
