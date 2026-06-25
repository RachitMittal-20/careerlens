# 🎯 CareerLens

> AI-powered resume optimizer with ATS scoring, keyword gap analysis, bullet point rewriting, and PDF export.

![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-green?style=flat-square)
![React](https://img.shields.io/badge/React-blue?style=flat-square)
![Groq](https://img.shields.io/badge/Groq-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

**Beat the bots. Get the interview.**

---

## The Problem

75% of resumes are rejected by ATS (Applicant Tracking Systems) before a human ever sees them. CareerLens helps you optimize your resume for both ATS systems and human recruiters.

---

## Features

- 🎯 **ATS Score (0–100)** with letter grade and category breakdown (Technical 40%, Skills 30%, Experience 20%, Education 10%)
- 🔍 **Keyword Gap Analysis** — matched ✅, missing ❌, and partial ⚠️ keywords with HIGH / MEDIUM / LOW priority ranking
- ✏️ **AI Bullet Point Rewriter** — Groq-powered rewrites with JD keywords naturally embedded, accept/reject per bullet
- 📊 **Multi-JD Comparison** — find universal and common keywords across up to 3 job descriptions
- 📄 **PDF Export** — clean, ATS-friendly PDF with standard fonts and single-column layout
- 🌙 **Dark / Light mode** toggle with localStorage persistence

---

## How It Works

```
Resume (PDF/DOCX/TXT)           Job Description
         │                              │
         ▼                              ▼
   Resume Parser              JD Parser (KeyBERT + Regex)
  (extract text,              (extract keywords,
  detect sections)             categorize by type)
         │                              │
         └──────────────┬───────────────┘
                        ▼
             ATS Scorer (weighted algorithm)
            Keyword Analyzer (gap analysis)
                        │
                        ▼
              AI Rewriter (Groq LLM)
            PDF Generator (ReportLab)
                        │
                        ▼
         React Dashboard (Dark/Light mode)
```

---

## Tech Stack

### Backend

| Component | Technology | Why |
|-----------|-----------|-----|
| API Server | FastAPI + Uvicorn | Auto-docs, fast, Pydantic validation |
| Keyword Extraction | KeyBERT + sentence-transformers | Semantic keyword extraction, no spaCy dependency |
| LLM (Rewriting) | Groq (llama-3.1-8b-instant) | Fast inference, free tier |
| Resume Parsing | PyPDF2 + python-docx | PDF and DOCX support |
| PDF Generation | ReportLab | ATS-friendly PDF output |

### Frontend

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | React + Vite | Fast HMR, component model |
| Styling | Tailwind CSS v4 | Dark/light mode, utility-first |
| Icons | Lucide React | Consistent, lightweight |
| Theme | Context API + localStorage | Persistent dark/light preference |

---

## Quick Start

**Prerequisites:** Python 3.11+, Node.js 18+, Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
pip3 install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
python3 -m uvicorn app.main:app --reload --loop asyncio
# API  → http://localhost:8000
# Docs → http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

---

## ATS Score Algorithm

| Category | Weight | What it checks |
|----------|--------|----------------|
| Technical Skills | 40% | Programming languages, frameworks, tools |
| Overall Keywords | 30% | All JD keywords found in resume |
| Experience | 20% | Years of experience requirements |
| Education | 10% | Degree requirements |

**Matching:** Exact match = 1.0 · Partial match (all words present) = 0.5 · No match = 0.0

**Grades:** A (85+) · B (70–84) · C (55–69) · D (40–54) · F (<40)

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Upload resume + JD text → ATS score + keyword analysis |
| `POST` | `/api/rewrite` | AI rewrite bullet points with JD keywords |
| `POST` | `/api/compare` | Compare up to 3 JDs, find common keywords |
| `POST` | `/api/export` | Generate ATS-optimized PDF |
| `GET`  | `/health` | Health check |

---

## Project Structure

```
careerlens/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration
│   │   ├── config.py            # Pydantic settings (GROQ_API_KEY)
│   │   ├── core/
│   │   │   ├── resume_parser.py # PDF/DOCX/TXT extraction + section detection
│   │   │   ├── jd_parser.py     # KeyBERT + regex keyword extraction
│   │   │   ├── ats_scorer.py    # Weighted ATS scoring algorithm
│   │   │   ├── keyword_analyzer.py # Matched/missing/partial gap analysis
│   │   │   ├── rewriter.py      # Groq LLM bullet point rewriting
│   │   │   ├── multi_jd_analyzer.py # Multi-JD keyword comparison
│   │   │   └── pdf_generator.py # ReportLab ATS-friendly PDF
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   └── routes/
│   │       ├── analyze.py       # POST /api/analyze
│   │       ├── rewrite.py       # POST /api/rewrite
│   │       ├── compare.py       # POST /api/compare
│   │       └── export.py        # POST /api/export
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Analyzer.jsx     # Resume upload, ATS score, keyword analysis
    │   │   ├── Rewriter.jsx     # AI bullet point rewriter with accept/reject
    │   │   ├── Compare.jsx      # Multi-JD comparison with overlap matrix
    │   │   └── Export.jsx       # PDF export with ATS tips
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar nav + page outlet
    │   │   └── ThemeToggle.jsx  # Dark/light mode button
    │   ├── context/
    │   │   └── ThemeContext.jsx # Theme state + localStorage persistence
    │   └── services/
    │       └── api.js           # Axios API client
    ├── vite.config.js           # Vite + Tailwind plugin + /api proxy
    └── tailwind.config.js
```

---

## Author

**Rachit Mittal** — B.Tech CSE, SRMIST NCR (2027)

- GitHub: [RachitMittal-20](https://github.com/RachitMittal-20)
- LinkedIn: [rachit-mittal-354767298](https://linkedin.com/in/rachit-mittal-354767298)

---

*Built as a portfolio project demonstrating AI-powered full-stack development.*
