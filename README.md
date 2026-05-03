# 🚀 Insight Hub — GitHub Wrapped, but Actually Interesting

**[→ Live Demo](https://insight-hub-nu.vercel.app/)**

Most developer dashboards show you a bar chart and call it insight. Insight Hub does something different: it turns your GitHub activity into a **cinematic, Instagram Stories-style retrospective** — complete with an AI that reads your commit history and roasts you for it.

Sign in with GitHub. Get your story. Share the card.

---

## 🤔 The Problem It Solves

GitHub gives you a contribution graph. It tells you *how much* you coded — not *how* you code. Insight Hub answers the questions that actually matter to developers: Am I a weekend warrior or a 9-to-5 grinder? Do I actually collaborate, or do I solo everything? What does my commit history say about me as an engineer?

---

## 🎬 What It Does

Your activity becomes a 9-slide story:

| Slide | What You See |
|-------|-------------|
| 📅 Weekly Sync | A "Tech Lead" summary of your last 7 days |
| 👤 Personal Intro | Your total commits and PRs, revealed cinematically |
| 🔥 Consistency | Active contribution days tracked |
| 📊 Weekly Rhythm | Heatmap of your recent activity |
| ⚔️ Weapon of Choice | Your top 5 languages |
| 🤝 Social Connectivity | Solo vs. collaborative commit ratio |
| 🧠 Archetype Reveal | Your developer persona (e.g., "Weekend Warrior") |
| 🏛️ Architect Review | AI roast of your actual code habits |
| 🃏 Retrospective Card | Shareable summary of your year |

Navigation works like Instagram Stories — tap to advance, tap-and-hold to pause. Mobile-first, with a constrained phone-frame layout on desktop.

---

## ⚙️ Engineering Decisions Worth Noting

### 🤖 Dual AI with Automatic Fallback
Two LLMs power the roast engine: **Groq (Llama 3.3 70B)** as primary, **Google Gemini 1.5 Flash** as fallback. If Groq is rate-limited or down, the system silently switches — users never see an error.

### 🔐 Cross-Domain Auth Without Third-Party Cookies
The frontend (Vercel) and backend (Koyeb) live on different domains. Standard cookie-based sessions don't work cross-domain. The solution: the backend passes the session token as a short-lived query parameter on redirect. The frontend captures it, stores it in `localStorage` for API calls and a cookie for middleware-level route protection. An Axios interceptor attaches the `Bearer` token to every subsequent request automatically.

### ⚡ GitHub GraphQL API (v4) for Efficient Data Fetching
REST API calls for contribution data are expensive — multiple round trips to piece together what GraphQL returns in a single query. Using GitHub's v4 GraphQL API lets us fetch commits, PRs, languages, and collaboration stats in one request, which matters when you're generating a full 9-slide story on the fly.

### 🗄️ Redis Caching (24-hour TTL)
GitHub data doesn't change every second. After the first story generation, the processed data is cached in Redis for 24 hours. Repeat visits are near-instant.

---

## 🏗️ Architecture

```
User (GitHub OAuth)
        │
        ▼
  FastAPI Backend (Koyeb)
        │
        ├── GitHub GraphQL API v4  ──→ Raw contribution data
        ├── Redis                  ──→ 24hr response cache
        ├── PostgreSQL (SQLModel)  ──→ User sessions & aggregates
        └── AI Engine
              ├── Groq / Llama 3.3 70B   (primary)
              └── Google Gemini 1.5 Flash (fallback)
        │
        ▼
  Next.js Frontend (Vercel)
        │
        ├── Framer Motion          ──→ Story transitions
        ├── Tailwind CSS v4        ──→ Styling
        └── Shadcn UI              ──→ Components
```

---

## 🛠️ Tech Stack

**Backend:** Python 3.12, FastAPI, SQLModel (async), PostgreSQL, Redis, Groq API, Google GenAI, GitHub GraphQL API v4

**Frontend:** Next.js 16+ (Turbopack), TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, Axios

**Infrastructure:** Vercel (frontend), Koyeb (backend), GitHub OAuth

---

## 💻 Running Locally

```bash
# Backend
cd server
cp .env.example .env   # Add GitHub OAuth, Groq, and Gemini keys
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd client
npm install
npm run dev
```

---

## 💡 Why I Built This

I wanted to build something that was actually fun to use, not just technically impressive on paper. The engineering challenges — cross-domain auth, LLM fallback chains, GraphQL optimization — came from trying to make the experience feel polished and instant, not from engineering for its own sake.

The result: a deployed, production app that real developers can use right now.

**[Try it → insight-hub-nu.vercel.app](https://insight-hub-nu.vercel.app/)**
