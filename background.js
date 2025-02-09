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
