# 🚀 Insights Hub: GitHub Wrapped

A visually stunning, AI-powered retrospective of your GitHub contribution activity. Insights Hub transforms raw code data into a cinematic, interactive "Story" experience using a high-performance FastAPI backend and a modern Next.js frontend.

---

## ✨ Core Features

### **1. Instagram Stories-style Dashboard**
Your year in code is now a 9-slide cinematic journey:
- **Slide 1: Weekly Sync**: A professional summary of your last 7 days.
- **Slide 2: Personal Intro**: Total commits and PRs reveal.
- **Slide 3: Consistency**: Your active contribution days tracked.
- **Slide 4: Weekly Rhythm**: Emerald-themed heatmap of your recent activity.
- **Slide 5: Weapon of Choice**: Your top 5 most used languages.
- **Slide 6: Social Connectivity**: Solo vs. collaborative commit ratio.
- **Slide 7: Archetype Reveal**: Your assigned developer persona (e.g., Weekend Warrior).
- **Slide 8: Architect Review**: A technical, witty AI roast of your code habits.
- **Slide 9: Retrospective Card**: A dense summary for sharing.

### **2. AI-Powered "Roasts" & Reviews**
Dual AI engines analyze your stats to provide:
- **Architect Review**: A sharp, developer-centric roast.
- **Weekly Sync**: A professional summary of your recent rhythm as a "Tech Lead".

### **3. Immersive UX**
- **Mobile First**: Optimized for a native-feeling story experience on mobile devices.
- **Desktop Adaptation**: Constrained phone-frame layout on large screens for visual impact.
- **Interactive Navigation**: Tap to advance/rewind and hold-to-pause functionality.
- **Cinematic Backgrounds**: Fluid gradients, grainy noise textures, and floating UI elements.

---

## 🛠️ Tech Stack

### **Backend (FastAPI)**
- **Language**: Python 3.12+
- **Database**: PostgreSQL with **SQLModel** (Async).
- **Caching**: **Redis** for 24-hour fast-pass data retrieval.
- **Auth**: Secure GitHub OAuth with **Authorization Header Bearer tokens**.
- **Cross-Domain**: Specialized handshake for multi-platform (Koyeb/Vercel) deployments.
- **AI Engines**: 
  - **Groq**: Llama 3.3 70B (Primary).
  - **Google GenAI**: Gemini 1.5 Flash (Fallback).
- **Data**: GitHub GraphQL API (v4) for surgical data fetching.

### **Frontend (Next.js)**
- **Framework**: Next.js 16+ (Turbopack, TypeScript).
- **Middleware**: Server-side route protection and redirection.
- **Styling**: **Tailwind CSS v4** & **Shadcn UI**.
- **Animations**: **Framer Motion** for fluid story transitions.

---

## 🏗️ Architecture & Deployment

### **Multi-Platform Deployment Handshake**
Since the frontend and backend are on different domains (Vercel and Koyeb), we've implemented a robust authentication handshake:
1.  **Backend Redirect**: Passes the session token via a temporary query parameter to the dashboard.
2.  **Frontend Sync**: Dashboard captures the token and stores it in `localStorage` for API calls and `Cookie` for Middleware.
3.  **Authorization Interceptor**: Axios automatically attaches the `Bearer` token to all requests, bypassing cross-site cookie restrictions.

### **Project Status: 🎉 Complete**
- [x] Phase 1: Backend Foundation (OAuth, GraphQL, DB, Redis).
- [x] Phase 2: AI Integration (Roast Engine, Prompt Engineering).
- [x] Phase 3: Immersive Story UI (Instagram Stories Layout).
- [x] Phase 4: Production Polish (Cross-domain Auth, Error handling).

Built with ❤️ for the global developer community.
