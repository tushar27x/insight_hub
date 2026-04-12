# 🚀 Insights Hub: GitHub Wrapped

A visually stunning, AI-powered retrospective of your GitHub contribution year. Insights Hub transforms raw code activity into interactive, shareable "Wrapped" slides using a high-performance FastAPI backend and an immersive Next.js frontend.

---

## ✨ Core Features

### **1. Developer Archetypes**
Our "Insight Engine" analyzes your contribution DNA to classify you into unique personas:
- **🛡️ The Weekend Warrior**: High Saturday/Sunday activity (Implemented).
- **💻 The Code Crusader**: Consistent weekday contributor.
- **🦉 The Night Owl**: (Planned) High activity during 10 PM - 4 AM.
- **🦋 The Social Butterfly**: (Planned) Contributions spread across many organizations.

### **2. AI-Powered "Roasts"**
A dual-engine AI service (Groq Llama 3 & Google Gemini 1.5/2.0) that acts as a "Senior Software Architect" to deliver sharp, technical, and highly personalized roasts based on your specific stats, languages, and social ratio.

### **3. Immersive "Wrapped" UI**
A premium frontend experience featuring:
- **Cinematic Visuals**: Animated background gradients and grainy noise textures.
- **Bento Grid Layout**: Modern masonry-style stats display.
- **Glassmorphism**: High-end blurred containers for AI insights.
- **Fluid Animations**: Staggered entry effects powered by Framer Motion.

---

## 🛠️ Tech Stack

### **Backend (FastAPI)**
- **Language**: Python 3.12+
- **Database**: PostgreSQL with **SQLModel** (Async).
- **Caching**: **Redis** for 24-hour fast-pass data retrieval.
- **Auth**: Secure GitHub OAuth with **HttpOnly JWT sessions**.
- **AI Engines**: 
  - **Groq**: Llama 3.3 70B (Primary).
  - **Google GenAI**: Gemini 1.5 Flash (Fallback).
- **Data**: GitHub GraphQL API (v4) for surgical data fetching.

### **Frontend (Next.js)**
- **Framework**: Next.js 15+ (App Router, TypeScript).
- **Styling**: **Tailwind CSS v4** (Modern CSS-first approach).
- **Components**: **Shadcn UI** foundation.
- **Animations**: **Framer Motion**.
- **Icons**: Lucide React.

---

## 🏗️ Architecture

### **Data Refresh Strategy**
To balance performance with data freshness:
1.  **Redis Hit**: Returns cached insights in <50ms.
2.  **Postgres Hit**: If Redis misses, checks the last sync time.
3.  **7-Day Refresh**: If data is >7 days old, the system automatically triggers a fresh GitHub fetch and AI generation pipeline.

### **Database Schema**
- **`UserInsights`**: Stores metadata, archetypes, and encrypted tokens.
- **`UserTemplates`**: Stores heavy JSON payloads (`stats_json`, `display_json`) for the "Wrapped" experience.

---

## 🚀 Getting Started

### **Backend Setup**
1. Navigate to `/server`.
2. Create a `.env` file with:
   ```env
   DATABASE_URL=postgresql+asyncpg://...
   REDIS_URL=redis://localhost:6379
   GITHUB_CLIENT_ID=your_id
   GITHUB_CLIENT_SECRET=your_secret
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   ```
3. Install dependencies: `pip install -r requirements.txt`.
4. Start the server: `fastapi dev app/main.py`.

### **Frontend Setup**
1. Navigate to `/client`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. Visit `http://localhost:3000`.

---

## ✅ Project Status: Complete
- [x] Phase 1: Backend Foundation (OAuth, GraphQL, DB, Redis).
- [x] Phase 2: AI Integration (Roast Engine, Prompt Engineering).
- [x] Phase 3: Frontend Immersive UI (Next.js, Framer Motion, Tailwind v4).
- [x] Phase 4: Production Polish (CORS, Timezone handling, Error fallback).

Built with ❤️ for the global developer community.
