# 🚀 AI Resume Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://ai-resume-analyzer-sb01.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/santoshbehera01/AI-Resume-Analyzer)

A modern, AI-powered resume optimization platform designed for job seekers and career builders. It combines ATS-style analysis, intelligent resume scoring, PDF reporting, and a ChatGPT-like AI career assistant into a seamless full-stack application built with React and Flask.

---

## 🌟 Project Overview

AI Resume Analyzer is a full-stack, AI-powered web application designed to help job seekers optimize their resumes for modern hiring systems.

The platform simulates real-world Applicant Tracking Systems (ATS) by analyzing resumes against job descriptions, identifying missing skills, and providing actionable improvement insights.

It combines intelligent resume scoring, keyword matching, and an interactive AI career assistant to guide users through resume enhancement and interview preparation.

Built with a modern React frontend and a Flask backend, the application delivers a seamless SaaS-style experience with secure authentication, real-time analysis, and a ChatGPT-like assistant — making it a practical and portfolio-ready solution for career development.

---

## 🔥 Key Features

- 📄 **Resume Upload**
  - Upload PDF resumes
  - Manual text input fallback

- 🎯 **ATS Resume Scoring**
  - Keyword matching
  - Resume-job description comparison
  - Skill gap detection

- 🤖 **AI Career Coach**
  - Chat-based assistant with history
  - Resume-aware responses
  - Interview preparation guidance
  - Voice input & streaming responses

- 🔐 **Authentication System**
  - Email & password login/signup
  - Secure password hashing (Flask + Werkzeug)
  - Protected routes (dashboard, chat, analysis)

- 📊 **Advanced Insights**
  - Multi-role comparison
  - Role-specific recommendations
  - Resume section analysis

- 📥 **PDF Report Export**
  - Download ATS analysis reports

---

## 🛠️ Tech Stack

**Frontend**

- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- React Router DOM
- TanStack React Query
- Sonner notifications
- PDF.js and jsPDF for PDF handling and report export

**Backend**

- Python
- Flask
- Flask-CORS
- Werkzeug security
- Static file serving for production

**Database**

- SQLite
- Local user authentication table

---

### 🤖 AI Integration
- Supabase Edge Functions  
- Resume analysis & career chat  
- Context-aware AI assistant  
- Streaming responses 

---

## 🎨 UI/UX Highlights

- Clean SaaS-style dashboard  
- Fully responsive (mobile + desktop)  
- Sidebar-based navigation
- AI chat interface with quick prompts and export capabilities

---

## ⚙️ How It Works

1. Open the landing page and create an account or log in.
2. Upload a resume PDF or paste resume text directly.
3. Optionally paste a target job description for better matching.
4. Review ATS scoring, skill gap analysis, and multi-role recommendations.
5. Use the AI Career Assistant to refine resume language, practice interviews, and get career guidance.

---

## 🚀 Installation & Setup

### 🔹 Frontend

```bash
git clone https://github.com/santoshbehera01/AI-Resume-Analyzer.git
cd "AI Resume Analyzer"
npm install
```

Create a `.env` file in the project root and add your Supabase values:

```env
VITE_SUPABASE_URL="https://your-supabase-url"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Start the frontend server:

```bash
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install flask flask-cors werkzeug
python app.py
```

The backend uses `database.db` for local user storage and serves the React app when deployed from the `dist` folder.

---

## 🎯 Use Cases

- Resume optimization for internships & jobs  
- ATS compatibility checking  
- Skill gap analysis  
- AI-based resume improvement  
- Interview preparation with AI  

---

## 🚀 Future Enhancements

- Full Supabase authentication integration  
- Save user analysis history  
- Resume performance analytics dashboard  
- Role-specific AI prompts  
- Team collaboration features  

---

## 👨‍💻 Author

**Santosh Kumar**  
B.Tech CSE Student | Aspiring Software Developer  

---

## ⭐ Support

If you found this project useful:

- ⭐ Star the repository  
- 📢 Share with others  
- 🤝 Contribute ideas or improvements  