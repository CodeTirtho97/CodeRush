export async function fetchCodeforcesContests() {
    try {
        console.log("Fetching CodeForces contests...");

        const response = await fetch("https://codeforces.com/api/contest.list?gym=false");
        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error("Failed to fetch CodeForces contests.");
        }

        const currentTime = Date.now();
        const threeDaysLater = currentTime + 3 * 24 * 60 * 60 * 1000;

        let contests = data.result
            .filter(contest => {
                const contestTime = contest.startTimeSeconds * 1000;
                return contestTime > currentTime && contestTime <= threeDaysLater;
            })
            .map(contest => ({
                name: contest.name,
                start: new Date(contest.startTimeSeconds * 1000).toLocaleString(),
                duration: formatDuration(contest.durationSeconds),
                url: `https://codeforces.com/contest/${contest.id}`,
                platform: "CodeForces"
            }));

        console.log("Fetched CodeForces contests:", contests);
        return contests;
    } catch (error) {
        console.error("Error fetching CodeForces contests:", error);
        return [];
    }
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
}
