# 🚀 Insight Hub — The Developer Journey & Performance Review

**[→ Live Demo](https://insight-hub-nu.vercel.app/)**

Insight Hub is not just another GitHub stats page. It is an **AI-driven Technical Performance Review** conducted by a witty, "tough-love" Senior Manager. It evaluates not just *how much* you coded, but the **quality** of your workflow, your commit habits, and your technical footprint.

Sign in with GitHub. Get audited. Face the roast.

---

## 🤔 The Problem It Solves

GitHub's contribution graph tells you frequency, but it doesn't tell you **impact** or **craftsmanship**. Are your commit messages just "fix" and "wip"? Do you delete more code than you write (good refactoring)? Are you a weekend warrior or a 9-to-5 grinder? 

Insight Hub leverages AI to analyze your raw technical signals and provides a narrative journey of your career progress.

---

## 🎬 What It Does

### 1. The Manager Terminal (The Dashboard)
A wide-screen, data-dense report utilizing the full expanse of your monitor to show:
- **The Grind:** A 28-day **Monthly Velocity Grid** (GitHub heatmap style) to track your consistency.
- **The Craft:** A quality audit of your **Commit Messages** and **Code Churn** (Additions vs. Deletions).
- **The Impact:** Your top repositories ranked by contribution, paired with **AI-generated technical summaries**.
- **Manager's Notes:** Sassy, technical critiques from your "Senior Manager" AI persona.

### 2. The Wrapped Story (The Cinematic Recap)
A 10-slide, Instagram-style cinematic retrospective:
- **Weekly Sync:** Professional summary of your last 7 days.
- **Weapon of Choice:** Top languages stack.
- **Engineering Audit:** Visualization of your code churn and habits.
- **The Verdict:** The final Architect's Roast and Archetype reveal.

---

## ⚙️ Engineering Decisions Worth Noting

### 🤖 "Witty Manager" Persona Engine
We standardized a centralized **Senior Engineering Manager** persona across all LLM prompts. The engine uses **Groq (Llama 3.3 70B)** for primary high-speed generation and **Google Gemini 1.5 Flash** as a fallback. The persona is designed for "tough love"—technically accurate critiques that motivate growth through humor.

### ⚡ Deep-Dive GraphQL Data Layer
We expanded GitHub's GraphQL v4 query to fetch:
- **Commit History:** Pulling actual message strings from the default branch of top repositories.
- **Code Churn:** Aggregating `additions` and `deletions` from your recent Pull Requests.
- **File Metadata:** Fetching README blobs and root trees to generate project-specific AI summaries.

### 🗄️ Smart Cache Invalidation
To ensure your performance review reflects your latest work, the system automatically **invalidates the Redis cache** whenever a fresh database sync is triggered. This ensures that the moment you improve your habits, your manager notices.

### 🔐 Multi-IP & Cross-Domain Auth
Designed to handle local development (localhost) and production (Neon/Vercel) seamlessly. We use a short-lived token passing strategy to bridge the gap between our FastAPI backend and Next.js frontend without requiring third-party cookies.

---

## 🏗️ Architecture

```
User (GitHub OAuth)
        │
        ▼
  FastAPI Backend (Neon/Koyeb)
        │
        ├── GitHub GraphQL API v4  ──→ History, Churn, & Metadata
        ├── Redis                  ──→ Performance Cache (Smart Invalidation)
        ├── PostgreSQL (SQLModel)  ──→ Technical Audit Logs & Archetypes
        └── AI Persona Engine
              ├── Groq / Llama 3.3 70B   (The Witty Manager)
              └── Google Gemini 1.5 Flash (Fallback)
        │
        ▼
  Next.js Frontend (Vercel)
        │
        ├── Framer Motion          ──→ Scroll-telling & Story transitions
        ├── Tailwind CSS v4        ──→ Wide-screen Bento Layout
        └── Shadcn UI              ──→ Component Architecture
```

---

## 🛠️ Tech Stack

**Backend:** Python 3.12, FastAPI, SQLModel (async), PostgreSQL (Neon), Redis, Groq API, Google GenAI, GitHub GraphQL API v4

**Frontend:** Next.js 16+ (Turbopack), TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, Axios

---

## 💻 Running Locally

```bash
# 1. Start Redis and Postgres (locally or via Docker)

# 2. Backend Setup
cd server
cp .env.example .env   # Add GitHub OAuth, Groq, and Gemini keys
pip install -r requirements.txt
python -m app.main     # Runs with reload enabled

# 3. Frontend Setup
cd client
npm install
npm run dev
```

---

## 💡 Why I Built This

I wanted to move beyond "vanity metrics" and build a tool that actually critiques developer habits in a fun, engaging way. Evolving this project from a simple slide-show into a full "Developer Journey" was an exercise in managing data density, refining AI personalities, and optimizing wide-screen UI layouts.

**[Launch your review → insight-hub-nu.vercel.app](https://insight-hub-nu.vercel.app/)**
