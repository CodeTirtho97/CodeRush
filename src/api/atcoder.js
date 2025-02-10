export async function fetchAtcoderContests() {
    try {
        const response = await fetch("https://coderush-d1a0.onrender.com/atcoder-contests");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contests = await response.json();

        // ✅ Convert date format for proper display
        return contests.map(contest => ({
            name: contest.name,
            start: new Date(contest.start).toLocaleString(),  // Format the date
            duration: contest.duration,
            url: contest.url
        }));

    } catch (error) {
        console.error("❌ Error fetching AtCoder contests:", error);
        return [];
    }
}
