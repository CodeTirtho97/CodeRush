export async function fetchCodechefContests() {
    try {
        const response = await fetch("https://www.codechef.com/api/list/contests/all");
        const data = await response.json();

        if (!data || !data.future_contests) {
            throw new Error("Invalid API response format");
        }

        const contests = data.future_contests.map(contest => {
            const startTime = new Date(contest.contest_start_date_iso);
            const endTime = new Date(contest.contest_end_date_iso);

            // Convert duration from minutes to HH:MM format
            const durationMinutes = parseInt(contest.contest_duration);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;

            return {
                name: contest.contest_name,
                start: startTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }), // Convert to readable format
                duration: `${hours} hours ${minutes} minutes`,
                url: `https://www.codechef.com/${contest.contest_code}`, // Construct contest URL
            };
        });

        return contests;
    } catch (error) {
        console.error("Error fetching CodeChef contests:", error);
        return [];
    }
}
