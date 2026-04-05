# 🚀 Insights Hub: GitHub Wrapped

A visually stunning, AI-powered retrospective of your GitHub contribution year. Insights Hub transforms raw code activity into interactive, shareable "Wrapped" slides using a high-performance FastAPI backend and a modern Next.js frontend.

---

## 🛠️ Tech Stack

### **Backend (FastAPI)**
- **API**: FastAPI (Python)
- **Data Fetching**: GitHub GraphQL API (v4)
- **AI Service**: LLM-powered (OpenAI/Gemini) for "Roasts" and Personality summaries.
- **Persistence**: PostgreSQL (SQLAlchemy/SQLModel)
- **Caching**: Redis (24-hour TTL)
- **Task Management**: Weekly refresh logic (7-day window).

### **Frontend (Next.js)**
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS & Framer Motion (for animations).
- **Data Fetching**: TanStack Query (React Query).

---

## 🧠 Core Features

### **1. Developer Archetypes**
Our "Insight Engine" categorizes every user into unique archetypes based on their contribution DNA:
- **🦉 The Night Owl**: 10 PM - 4 AM coding sessions.
- **🛡️ The Weekend Warrior**: High Saturday/Sunday activity.
- **✨ The Polisher**: High PR review-to-commit ratio.
- **🦋 The Social Butterfly**: Contributions spread across many organizations.
- **🧨 The Force Pusher**: Frequent history overrides.

### **2. AI-Powered "Roasts"**
A dedicated AI Service translates raw stats into witty, developer-centric copy. Each "Wrapped" slide includes a personalized caption (e.g., *"Indentation is your love language, but we need to talk about that YAML addiction."*).

### **3. The "Weekly Refresh" Strategy**
To ensure consistency and high performance:
- **Redis Layer**: Fast-pass caching (24-hour TTL) to avoid repeated database hits.
- **PostgreSQL Layer**: Source of truth with a `7-day refresh logic`.
- **Workflow**:
    1.  Check Redis.
    2.  If Miss: Check PostgreSQL `updated_at`.
    3.  If `< 7 days`: Re-populate Redis and serve.
    4.  If `> 7 days` or New: Trigger the GitHub + AI Pipeline.

---

## 🏗️ Data Architecture (Phase 1)

### **Database Schema**
- **`UserInsights` (Index)**: 
    - `user_id` (PK, GitHub ID)
    - `user_name` (GitHub Login)
    - `archetype`
    - `updated_at` (Last Sync Timestamp)
- **`UserTemplates` (Content)**:
    - `user_id` (FK)
    - `stats_json`: Raw yearly metrics (Heatmaps, Languages, Commit Timing).
    - `display_json`: AI-generated captions and UI-ready strings.

---

## 📅 Roadmap

### **Phase 1: Backend Foundation (Current)**
- [ ] GitHub OAuth Integration.
- [ ] GitHub GraphQL Data Fetching (Heatmap, Repos, Profile).
- [ ] Insight Engine: Archetype & Timing calculations.
- [ ] AI Service: Prompt engineering & "Roast" generation.
- [ ] Database & Redis implementation.

### **Phase 2: Frontend Setup**
- [ ] Next.js Boilerplate with Tailwind.
- [ ] Authentication Flow (Connect with GitHub).
- [ ] "Wrapped" Interactive Slide UI.

### **Phase 3: Final Polish**
- [ ] Social sharing (Image export).
- [ ] Mobile optimization.
- [ ] Global Leaderboards (optional).
