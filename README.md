# ⚙️ OS Resource Manager & CPU Scheduler Simulator

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frautvedant81-dev%2FResource-Alocation-game)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Modern-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Cyberpunk%20Glassmorphism-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Optimized-000000?logo=vercel&logoColor=white)](https://vercel.com)

> **An interactive, gamified Operating System simulator and educational laboratory.** Master **Banker's Algorithm**, **Deadlock Avoidance**, **Resource Allocation Graphs (RAG)**, and **CPU Scheduling Algorithms** with real-time visualizations, interactive Gantt charts, and a cyber-themed UI.

---

## 🚀 Live Demo & Deployment

- **Live URL:** Deploy instantly to Vercel with one click:
  [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frautvedant81-dev%2FResource-Alocation-game)
- **GitHub Repository:** [https://github.com/rautvedant81-dev/Resource-Alocation-game](https://github.com/rautvedant81-dev/Resource-Alocation-game)

---

## 🎮 Core Features & Game Modes

### 1. 🛡️ Banker's Algorithm & Resource Allocation Game
- **Interactive Process Matrix:** Live tables tracking `Allocation`, `Max Demand`, `Need Matrix` ($Need = Max - Allocation$), and `Available Resources`.
- **Level Progression:** From beginner single-resource challenges to multi-instance scenarios (CPU, RAM, Disk, Printer, GPU).
- **Safety Algorithm Engine:** Real-time safety validation calculating valid **Safe Sequences** ($\langle P_1, P_3, P_0, \dots \rangle$).
- **Deadlock Detection & Recovery:** Circular wait alarms, deadlock modal diagnosis, and emergency resource preemption / process termination tools.
- **Custom Sandbox Mode:** Create custom process counts, resource types, and capacity matrices to test complex academic exam problems.

### 2. ⏱️ CPU Scheduling Laboratory & Gantt Chart
- **Supported Algorithms:**
  - **FCFS** (First-Come, First-Served)
  - **SJF** (Shortest Job First - Non-Preemptive)
  - **SRTF** (Shortest Remaining Time First - Preemptive SJF)
  - **Round Robin (RR)** with configurable Time Quantum ($q$)
  - **Priority Scheduling** (Preemptive and Non-Preemptive)
- **Interactive Visual Timeline:** Dynamic, color-coded Gantt chart displaying execution bursts, context switches, and CPU idle time.
- **Performance Metrics Matrix:** Calculates exact **Turnaround Time (TAT)**, **Waiting Time (WT)**, and **Response Time (RT)** per process.
- **Side-by-Side Algorithm Comparison:** Run all algorithms simultaneously across the same workload to identify the optimal scheduling policy.

### 3. 🕸️ Resource Allocation Graph (RAG) & Cycle Detection
- **Interactive Canvas Visualization:** Dynamic force-directed graph rendering Process nodes ($\bigcirc$) and Resource nodes ($\square$).
- **Cycle Finder:** Visualizes request edges ($P_i \rightarrow R_j$) and assignment edges ($R_j \rightarrow P_i$) with instant cycle detection alerting to potential deadlocks.

### 4. 📖 Interactive OS Theory & Knowledge Hub
- **Interactive Flashcards & Cheat Sheets:** Clear explanations of Coffman conditions, Banker's safety criteria, starvation vs. deadlock, and scheduling criteria.
- **Visual Math Breakdowns:** Step-by-step vector arithmetic and safety checks explained simply for computer science students and engineers.

### 5. 🎨 Aesthetic Cyberpunk Glassmorphism & Audio FX
- **Synthesized Web Audio Engine:** Procedural UI sound effects (beeps, success chimes, alert sirens) powered entirely by the browser's `AudioContext` without external MP3 dependencies.
- **Particle Rewards FX:** High-performance HTML5 canvas particle celebration engine upon solving levels.
- **Dark / Light Theme Engine:** Smooth transitions with persistent user preferences in `localStorage`.

---

## 📂 Project Architecture

```
Resource-Alocation-game/
├── index.html                   # Core single-page application & UI markup
├── vercel.json                  # Vercel deployment headers & caching config
├── package.json                 # Project metadata & npm dev scripts
├── .gitignore                   # Clean git repository rules
├── README.md                    # Comprehensive documentation & guide
│
├── css/                         # Curated styling stylesheets
│   ├── main.css                 # Base theme, typography, & layout rules
│   ├── cyber-ui.css             # Glassmorphism cards, buttons, & badges
│   ├── banker-game.css          # Banker's algorithm matrix & process styling
│   ├── cpu-scheduler.css        # CPU scheduling forms & Gantt chart styling
│   └── rag-canvas.css           # Resource Allocation Graph viewport styles
│
└── js/                          # Modular ES6 JavaScript architecture
    ├── app.js                   # Application coordinator & tab navigation
    ├── audio.js                 # Web Audio API procedural sound synthesizer
    ├── banker/
    │   ├── banker-engine.js     # Banker's safety & allocation algorithms
    │   ├── banker-game.js       # Game loop, UI handlers, & state controller
    │   ├── banker-levels.js     # Level presets & tutorial scenarios
    │   └── rag-visualizer.js    # Canvas RAG graph renderer & cycle detector
    ├── scheduler/
    │   ├── scheduler-engine.js  # FCFS, SJF, SRTF, RR, Priority algorithms
    │   ├── gantt-chart.js       # Dynamic Gantt chart timeline rendering
    │   └── scheduler-game.js    # Process table management & comparison engine
    ├── guide/
    │   └── os-theory.js         # Operating system concepts & interactive lessons
    └── utils/
        ├── particle-fx.js       # Canvas particle reward explosion effects
        └── storage.js           # LocalStorage persistence wrapper
```

---

## 🛠️ Local Development Setup

No complex build steps or external bundlers required! The project runs as a lightweight static web app:

### Option 1: Using Node & npx
```bash
# Clone the repository
git clone https://github.com/rautvedant81-dev/Resource-Alocation-game.git

# Navigate into project directory
cd Resource-Alocation-game

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click [`index.html`](file:///c:/Users/vedant/Desktop/Project/Game%20Development/Resource%20Alocation%20game/index.html) and select **"Open with Live Server"**.

### Option 3: Python Built-in Server
```bash
python -m http.server 8000
```
Visit [http://localhost:8000](http://localhost:8000).

---

## 🚢 Deploying to Vercel (Step-by-Step)

### Method A: Deploy via GitHub (Recommended)
1. **Push your latest changes to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare project for Vercel deployment with comprehensive documentation"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New..."** $\rightarrow$ **"Project"**.
4. Select your GitHub repository: `Resource-Alocation-game`.
5. Keep default settings (Framework Preset: **Other**, Root Directory: `./`).
6. Click **Deploy**. Vercel will automatically provision an HTTPS live URL (e.g., `https://resource-alocation-game.vercel.app`).
7. Every future `git push` to `main` will automatically trigger a production deployment!

### Method B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Log in and deploy
vercel
```

---

## 🧮 OS Algorithms Implemented

### Banker's Algorithm (Safety & Request)
- **Safety Algorithm:**
  1. Let $Work = Available$ and $Finish[i] = \text{false}$ for all $i$.
  2. Find an index $i$ such that $Finish[i] == \text{false}$ and $Need_i \le Work$.
  3. If found: $Work = Work + Allocation_i$, $Finish[i] = \text{true}$, repeat step 2.
  4. If all $Finish[i] == \text{true}$, system is in a **Safe State**.
- **Resource Request Algorithm:**
  - Validates $Request_i \le Need_i$ and $Request_i \le Available$.
  - Simulates allocation and verifies whether resulting state remains safe before granting.

### CPU Scheduling Algorithms
| Algorithm | Mode | Selection Criteria | Typical Advantage |
| :--- | :--- | :--- | :--- |
| **FCFS** | Non-preemptive | Lowest Arrival Time | Simple, zero scheduling overhead |
| **SJF** | Non-preemptive | Shortest Burst Time | Minimizes average waiting time |
| **SRTF** | Preemptive | Shortest Remaining Burst | Optimal average turnaround time |
| **Round Robin** | Preemptive | Time Quantum slice ($q$) | Fair response time for interactive systems |
| **Priority** | Both | Highest priority rank | Favors mission-critical processes |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Vedant Raut**
- GitHub: [@rautvedant81-dev](https://github.com/rautvedant81-dev)
- Project: [Resource-Alocation-game](https://github.com/rautvedant81-dev/Resource-Alocation-game)
