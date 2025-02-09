export async function fetchCodechefContests() {
    try {
        const response = await fetch("https://kontests.net/api/v1/code_chef");
        const data = await response.json();

        const currentTime = Date.now();
        const threeDaysLater = currentTime + 3 * 24 * 60 * 60 * 1000;

        return data
            .filter(contest => new Date(contest.start_time).getTime() <= threeDaysLater)
            .map(contest => ({
                name: contest.name,
                start: new Date(contest.start_time).toLocaleString(),
                duration: formatDuration(contest.duration),
                url: contest.url,
                platform: "CodeChef"
            }));
    } catch (error) {
        console.error("Error fetching CodeChef contests:", error);
        return [];
    }
}
