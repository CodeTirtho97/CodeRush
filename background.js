chrome.runtime.onInstalled.addListener(() => {
    console.log("CodeRush Extension Installed!");
});

// Listener for triggered alarms (reminders)
chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.notifications.create(alarm.name, {
        type: "basic",
        iconUrl: "assets/icon128.png",
        title: "CodeRush Reminder",
        message: `Your contest "${alarm.name}" is starting soon!`,
        priority: 2,
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchAtcoderContests") {
        console.log("Fetching AtCoder contests...");

        fetch("https://atcoder.jp/contests/")
            .then(response => response.text())
            .then(html => {
                sendResponse({ success: true, html });
            })
            .catch(error => {
                console.error("Error fetching AtCoder contests:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep the message channel open for async response
    }
});