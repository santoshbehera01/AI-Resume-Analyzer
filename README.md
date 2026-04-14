# 🚀 AI Resume Analyzer

A modern AI-powered resume toolkit built for job seekers and career builders. The platform combines ATS-style analysis, resume scoring, PDF reporting, and an AI career coach into a polished React + Flask application.

---

## Project Overview

AI Resume Analyzer is a full-stack portfolio application that helps users evaluate resumes against job descriptions, identify skill gaps, and get AI-generated career guidance. The product includes secure email/password authentication, resume upload, ATS scoring, AI feedback, and a chat-based assistant for interview and resume support.

---

## Key Features

- **Resume upload** with PDF support and manual text entry fallback
- **ATS-style scoring** and keyword matching for resume content
- **Job description analysis** to compare resumes against target roles
- **AI career coach** with chat history, voice input, and response streaming
- **Protected routes** for dashboard, analysis, chat, and settings
- **Multi-role comparison** and role-specific resume insights
- **Downloadable PDF report** generation from analysis results
- **Local auth** using Flask, SQLite, and secure password hashing

---

## Tech Stack

**Frontend**

- React 18
- TypeScript
- Vite
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

**AI**

- Supabase Edge Functions for AI resume analysis and career chat
- Chat assistant with resume context and streaming responses
- AI feedback pipeline connected from frontend to Supabase functions

---

## UI/UX Highlights

- Clean, modern SaaS-style dashboard experience
- Responsive layout for desktop and mobile screens
- Sidebar navigation with protected workspace pages
- Smooth animated loading states and toast feedback
- Card-based resume insights and chart visualizations
- AI chat interface with quick prompts and export capabilities

---

## How It Works

1. Open the landing page and create an account or log in.
2. Upload a resume PDF or paste resume text directly.
3. Optionally paste a target job description for better matching.
4. Review ATS scoring, skill gap analysis, and multi-role recommendations.
5. Use the AI Career Assistant to refine resume language, practice interviews, and get career guidance.

---

## Installation & Setup

### Frontend

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

## Usage / Use Cases

- Optimize resumes for internship and entry-level roles
- Evaluate resumes against job descriptions before applying
- Identify missing technical and soft skills
- Generate AI-backed resume improvement suggestions
- Practice interview answers and career strategy with a chat assistant

---

## Future Enhancements

- Add full Supabase authentication support
- Save analysis history and user reports
- Add analytics dashboards for resume performance over time
- Improve AI prompts with role-specific templates
- Add multi-user collaboration and team resume review

---

## Author

**Santosh Kumar**

B.Tech CSE Student | Aspiring Software Developer

---

## Support

If this project helps your career toolkit, please star the repository and share it with other job seekers.
