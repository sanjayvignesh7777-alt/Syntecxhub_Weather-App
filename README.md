# 🌤️ SkyPulse — Professional Weather Dashboard

> **Syntecxhub Internship &bull; Project 1: Weather App**  
> A high-performance, responsive weather dashboard built with Vanilla HTML5, modern CSS3 (Glassmorphism & CSS Variables), and JavaScript (ES6+ async/await). Powered by the OpenWeatherMap REST API.

---

## 📌 Project Overview

**SkyPulse** is a modern, portfolio-ready weather intelligence web application designed and built for the **Syntecxhub Internship Project 1**. It delivers accurate atmospheric conditions, temperature trends, wind dynamics, and solar schedules for any city globally, or detects your current GPS location with one click.

### Key Highlights
- ⚡ **Zero-Framework Architecture**: Built with 100% vanilla web technologies (HTML5, CSS3, ES6+ JavaScript) for blazing fast load times and clean code readability.
- 🎨 **Glassmorphic UI**: Refined frosted-glass cards (`backdrop-filter`), ambient background glows, and responsive typography using Google Fonts (*Inter* & *Outfit*).
- 🌓 **Dual-Theme Engine**: Seamless Dark and Light modes with automatic OS theme detection and persistent state stored in `localStorage`.
- 🔄 **Instant Unit Conversion**: Instant toggle between Celsius (°C) and Fahrenheit (°F) with client-side mathematical recalculation—no redundant API queries.
- 🕒 **True Local Time Calculation**: Automatically computes the target city's exact local time and sunrise/sunset schedules based on the API's UTC offset.
- 🛡️ **Fault-Tolerant Error Handling**: Friendly, clear banners for invalid cities (404), unactivated or missing API keys (401), rate limits (429), and offline network status.
- ⚙️ **In-App API Key Manager**: Allows users and reviewers to configure their OpenWeatherMap API key directly through an accessible modal dialog saved in `localStorage`, without needing to edit source code.

---

## ✨ Features & Metrics Breakdown

| Feature | Description |
| :--- | :--- |
| **Dynamic City Search** | Search any city worldwide with instant submit, Enter key listener, and auto-clear button. |
| **Geolocation ("My Location")** | One-tap detection of your local weather using the browser's `navigator.geolocation` API. |
| **Recent Searches History** | Keeps your last 5 searches as quick-access chips in `localStorage` with a 1-click clear option. |
| **Real-Time Weather Metrics** | Displays temperature, weather icon, description, daily high/low, and feels-like temperature. |
| **Atmospheric Indicators** | Humidity (with comfort rating), atmospheric pressure (hPa), visibility (km/mi), and wind speed/direction (16 compass points). |
| **Sun Schedule** | Sunrise and sunset times displayed in the local 12-hour time of the searched city. |
| **Unit Toggle (°C / °F)** | Smooth mathematical conversion of all temperatures, wind speed (km/h vs. mph), and visibility. |
| **Theme Switcher** | Sleek sun/moon toggle switching between dark obsidian glass and bright sky palettes. |

---

## 🛠️ Technology Stack

- **Markup**: HTML5 (Semantic elements, accessible ARIA roles, clean structure)
- **Styling**: Modern CSS3 (CSS Custom Properties, Flexbox, CSS Grid, Glassmorphism, animations)
- **Typography**: Google Fonts ([Inter](https://fonts.google.com/specimen/Inter) and [Outfit](https://fonts.google.com/specimen/Outfit))
- **Scripting**: Vanilla JavaScript (ES6+ `async`/`await`, `fetch()`, `localStorage`, Event Delegation)
- **Data Source**: [OpenWeatherMap Current Weather API](https://openweathermap.org/current)

---

## 📁 Project Structure

```text
Syntecxhub_Weather-App/
├── index.html        # Semantic HTML5 dashboard layout, modals, and templates
├── style.css         # Modern CSS3 styling, glassmorphism, themes, and responsiveness
├── script.js         # Modular JavaScript engine (API integration, state, UI logic)
└── README.md         # Comprehensive project documentation and guides
```

---

## 🚀 Quick Start & Setup Guide

### Method 1: Run with VS Code Live Server (Recommended)
Running through a local web server is the standard industry practice for testing web APIs:

1. **Open Project in VS Code**:
   - Open Visual Studio Code.
   - Click **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
   - Navigate to your Desktop and select `Syntecxhub_Weather-App`.
2. **Install Live Server Extension**:
   - Click the **Extensions** icon on the left sidebar (or press `Ctrl + Shift + X`).
   - Search for **Live Server** (by *Ritwick Dey*) and click **Install**.
3. **Launch the Application**:
   - Right-click `index.html` in the file explorer.
   - Click **"Open with Live Server"** (or click the **"Go Live"** button at the bottom status bar).
   - Chrome will automatically open `http://127.0.0.1:5500/index.html`.

### Method 2: Open Directly in Google Chrome
1. Navigate to your Desktop folder: `C:\Users\<YourUsername>\Desktop\Syntecxhub_Weather-App\`.
2. Double-click `index.html` (or right-click > **Open with** > **Google Chrome**).
3. The application will load immediately via the `file://` protocol.

---

## 🔑 OpenWeatherMap API Key Configuration

To retrieve real-time satellite weather data, an OpenWeatherMap API key is required.

### 1. How to get your free key:
1. Visit [openweathermap.org](https://home.openweathermap.org/users/sign_up) and sign up for a free account.
2. Verify your email address.
3. Navigate to your account profile and click the **API keys** tab.
4. Copy your default 32-character key (or generate a new named key).
> ⚠️ **Important Note on Key Activation**: Brand new OpenWeatherMap keys typically require **10 to 60 minutes** to activate on their global CDN. If your key returns a `401 Unauthorized` error immediately after creation, please allow a short wait for server propagation.

### 2. How to configure the key in SkyPulse:
SkyPulse supports two flexible configuration methods:

- **Option A: In-App Settings Modal (Zero Code Changes)**:
  1. Click the **⚙️ Settings icon** in the top navigation bar (or click **"Configure API Key"** on the banner).
  2. Paste your 32-character key into the input field.
  3. Click **Save & Apply**. The key is stored securely in your browser's `localStorage`.
- **Option B: Inside `script.js` (For Local Development)**:
  1. Open `script.js` in VS Code.
  2. Locate line 22:
     ```javascript
     STATIC_API_KEY: '', // Paste your 32-char key between the quotes
     ```
  3. Save the file.

---

## 🔒 Crucial Security Notice & Deployment Best Practices

### Why you should NEVER commit API keys to public repositories:
- Any secret key pushed to a public GitHub repository can be scraped by automated bots in seconds.
- GitHub Pages is a purely static file host. Any API key referenced in frontend JavaScript (`script.js`) is visible in the browser's Network tab or DevTools Source inspector.

### Recommended Production Architecture:
If you deploy this application publicly on GitHub Pages or custom domains, adopt one of the following architectures:
1. **In-App User Entry (Implemented here)**: Allow each user/evaluator to input their own personal free key through the in-app modal. No sensitive secrets are stored in git.
2. **Serverless Proxy / Backend (Best Practice)**:
   - Deploy a lightweight serverless function (e.g. [Cloudflare Workers](https://workers.cloudflare.com/), [Vercel Serverless Functions](https://vercel.com/docs/functions), or [Netlify Functions](https://docs.netlify.com/functions/overview/)).
   - Store your `OPENWEATHER_API_KEY` as an encrypted environment variable on the serverless platform.
   - The frontend calls `/api/weather?city=London`, and your proxy securely forwards the query to OpenWeatherMap with the hidden key.

---

## 🌐 Publishing to GitHub & GitHub Pages

Follow these step-by-step commands to upload your project to GitHub:

### 1. Initialize Git & Push to GitHub:
```bash
# 1. Open terminal inside the project directory
cd Desktop/Syntecxhub_Weather-App

# 2. Initialize git repository
git init

# 3. Add all project files
git add .

# 4. Create your initial commit
git commit -m "feat: complete Syntecxhub Project 1 Weather App dashboard"

# 5. Rename branch to main
git branch -M main

# 6. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Syntecxhub_Weather-App.git

# 7. Push the code
git push -u origin main
```

### 2. Enable GitHub Pages:
1. Go to your repository on [GitHub.com](https://github.com/).
2. Click **Settings** > **Pages** (on the left menu).
3. Under **Build and deployment** > **Branch**, select `main` and root `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, your live site URL will be displayed:
   `https://<YOUR_GITHUB_USERNAME>.github.io/Syntecxhub_Weather-App/`

---

## 📸 Adding Screenshots to Your Portfolio

To make your repository stand out to recruiters and Syntecxhub evaluators:
1. Capture screenshots of:
   - **Desktop Dark Theme** showing a live city search (e.g., Tokyo or London).
   - **Desktop Light Theme** with metric cards visible.
   - **Mobile View** (using Chrome DevTools Device Mode `Ctrl + Shift + M`).
2. Create an `assets/` folder inside the project and save the images.
3. Link them in this README under a **Preview** section.

---

## ✅ Syntecxhub Internship Submission Checklist

- [x] Correct folder path created: `Desktop/Syntecxhub_Weather-App/`
- [x] Pure HTML5, CSS3, and Vanilla JavaScript (No unnecessary dependencies)
- [x] Responsive layout tested on Desktop, Tablet, and Mobile viewport widths
- [x] Dynamic city search working with form submit and Enter key
- [x] OpenWeatherMap REST API integrated with `async`/`await` and `fetch()`
- [x] Displays City, Temperature, Humidity, Weather Description, and Weather Icons
- [x] Enhanced metrics added: Feels Like, Wind Speed/Direction, Pressure, Visibility, Sunrise & Sunset
- [x] Interactive features: Celsius/Fahrenheit toggle, Dark/Light theme, Recent searches history
- [x] Robust error handling: 404 Not Found, 401 Invalid Key, 429 Rate Limit, Offline state
- [x] Zero JavaScript console errors
- [x] Professional portfolio-grade README with complete instructions

---

## 💼 LinkedIn Project Showcase Post (Copy & Share)

You can copy and customize the template below to announce your project completion on LinkedIn:

```markdown
🚀 Excited to share my latest project as part of the Syntecxhub Web Development Internship: SkyPulse Weather Dashboard! 🌤️

For Project 1, I built a feature-rich, high-performance weather intelligence web application using vanilla HTML5, modern CSS3, and JavaScript (ES6+).

Key Features & Engineering Highlights:
🔹 Live REST API Integration: Connected to OpenWeatherMap API using async/await and fetch().
🔹 Modern Glassmorphic Design: Clean frosted-glass aesthetic with custom CSS variables, responsive typography, and ambient animations.
🔹 Dual-Theme Engine: Dark & Light mode toggle with localStorage persistence.
🔹 Dynamic Unit Conversions: Instant mathematical toggle between Celsius (°C) and Fahrenheit (°F) with zero re-fetching latency.
🔹 Granular Atmospheric Conditions: Real-time tracking of Feels-Like index, Wind Speed & Compass Direction, Barometric Pressure, Humidity comfort rating, Visibility, and Local Sunrise/Sunset times.
🔹 Recent Searches: Cached history of top 5 queried cities for fast access.
🔹 Resilient Error Handling: Graceful handling of invalid cities, network disconnects, and unactivated API keys.

Technologies Used: HTML5 | CSS3 | Vanilla JavaScript | REST API | LocalStorage | Git

🔗 GitHub Repository: [Link to your repo]
🌐 Live Demo: [Link to your GitHub Pages]

Thank you Syntecxhub for this rewarding opportunity! Looking forward to the next challenge.

#WebDevelopment #JavaScript #Frontend #OpenWeatherMap #Syntecxhub #CodingInternship #PortfolioProject #HTML5 #CSS3
```

---

## 📄 License & Attribution

This project was built for educational and portfolio demonstration purposes under the **Syntecxhub Internship Program**.  
Weather data is provided by [OpenWeatherMap](https://openweathermap.org/).
