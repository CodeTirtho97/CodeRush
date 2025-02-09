# CodeRush – Competitive Coding Tracker & Reminder

![image](https://github.com/user-attachments/assets/446681b2-dbc7-407b-89e7-89343e8d4ba9)

**Track upcoming coding contests across multiple platforms and set reminders with ease!** 🎯  
Stay updated with contests from **CodeForces, CodeChef, LeetCode, HackerRank, and AtCoder**.  
Set **reminders** and add contests directly to **Google Calendar** in one click!  

---

## 🎯 Features  

✅ **Fetches upcoming contests** from multiple platforms  
✅ **Filters contests** within the next **3 days** and sorts by the earliest date  
✅ **Interactive tab-based UI** for selecting platforms  
✅ **Modern, engaging UI with animations**  
✅ **Reminder functionality** to set contest alerts  
✅ **Google Calendar integration** to schedule contests  
✅ **Refresh button** to fetch latest contests  
✅ **Robust error handling and graceful fallbacks**  

---

## 🖥️ Screenshots  

| Home UI | Contests List | Reminder & Calendar |
|---------|-------------|-------------------|
| ![Home UI](assets/home.png) | ![Contests List](assets/contests.png) | ![Reminder & Calendar](assets/reminder.png) |

---

## 🔧 Installation  

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/YourUsername/CodeRush.git
   cd CodeRush
   ```
2. **Open Chrome and go to**:
    ```bash
    chrome://extensions/
    ```
3. **Enable Developer Mode (toggle in the top right corner).**
4. **Click "Load unpacked" and select the CodeRush folder.**
5. **🎉 Done! CodeRush is now installed and ready to use!**

---

## ⚡ Usage Guide  

### 🏆 Fetch Contests  
- Click on a **platform tab** (e.g., CodeForces, CodeChef).  
- Press **"Refresh"** to get the latest contests.  

### ⏰ Set a Reminder  
- Click the **Reminder Button** (⏰) on any contest.  
- A confirmation popup will show that the reminder is set.  

### 📅 Add to Google Calendar  
- Click the **Calendar Button** (📅) to schedule the contest.  
- A new **Google Calendar event** will be created for the contest.  

---

## 🚀 Tech Stack  

- **HTML, CSS, JavaScript** – Frontend  
- **Chrome Extension APIs** – Background scripts, notifications  
- **Google Calendar API** – Calendar integration  
- **Fetch API** – Fetching contest data

---

📂 Project Structure

    ```bash
    /CodeRush
    │── /assets          # Icons, logos, images
    │── /src
    │   ├── popup.html   # Main UI
    │   ├── popup.js     # Handles contest fetching & reminders
    │   ├── styles.css   # UI Styling
    │   ├── manifest.json # Chrome extension config
    │   ├── /api
    │   │   ├── codeforces.js  # Fetch contests from CodeForces
    │   │   ├── codechef.js    # Fetch contests from CodeChef (TBD)
    │   │   ├── leetcode.js    # Fetch contests from LeetCode (TBD)
    │   │   ├── hackerrank.js  # Fetch contests from HackerRank (TBD)
    │   │   ├── atcoder.js     # Fetch contests from AtCoder (TBD)
    │── README.md
    ```

---

## 🚧 Roadmap  

### 🔹 Next Steps:  
- ✅ **Fix UI responsiveness** *(DONE 🎉)*  
- ✅ **Improve scrollbar & background styles** *(DONE 🎉)*  
- ✅ **Add Reminder & Google Calendar functionality** *(DONE 🎉)*  
- 🚀 **Integrate CodeChef, LeetCode, HackerRank, AtCoder APIs**  
- 🚀 **Allow users to customize reminder timings**  
- 🚀 **Dark Mode toggle**  

---

## 🛠️ Contributing  

Want to improve **CodeRush**? Feel free to **fork** the repo and **submit a pull request**! 🤝  

---

## ⚖️ License  

This project is **open-source** and licensed under the **MIT License**.
