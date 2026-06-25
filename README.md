# 🎯 CareerLens

> AI-powered resume optimizer that helps you beat ATS systems and land more interviews.

![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-green?style=flat-square)
![React](https://img.shields.io/badge/React-blue?style=flat-square)
![Groq API](https://img.shields.io/badge/Groq_API-orange?style=flat-square)
![KeyBERT](https://img.shields.io/badge/KeyBERT-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

---

## Why CareerLens is Different

Most resume tools give you generic advice like "add more keywords." CareerLens does the actual work.

| Feature | Generic Resume Tools | CareerLens |
|---------|---------------------|------------|
| ATS Scoring | ✅ Basic % match | ✅ Weighted algorithm (Technical 40%, Skills 30%, Experience 20%, Education 10%) |
| Keyword Analysis | ✅ Simple match | ✅ Exact + Partial + Missing with HIGH/MEDIUM/LOW priority |
| Keyword Extraction | ❌ Hardcoded lists | ✅ KeyBERT semantic extraction + regex (finds keywords you'd never think of) |
| Bullet Rewriting | ❌ Templates | ✅ Groq LLM — rewrites YOUR specific bullets with JD keywords embedded naturally |
| Multi-JD Comparison | ❌ | ✅ Find universal keywords across 3 JDs — build one resume that fits all |
| PDF Export | ❌ | ✅ ATS-optimized PDF — no tables, no images, standard fonts, single column |
| Dark/Light Mode | ❌ | ✅ Premium glassmorphism UI with cursor-reactive animated background |
| Cost | 💰 $30/month (Jobscan) | ✅ Free and open source |

---

## The Real Problem CareerLens Solves

**75% of resumes are rejected before a human reads them.**

ATS (Applicant Tracking Systems) are used by 99% of Fortune 500 companies and most startups with 50+ employees. These systems:
- Scan for exact keyword matches
- Reject resumes with tables, columns, text boxes (can't parse them)
- Rank candidates by keyword density
- Never see your actual experience — just pattern matches

CareerLens reverse-engineers this process. It extracts what the ATS is looking for, shows you exactly what's missing, rewrites your bullets to include those keywords naturally, and exports a PDF that ATS systems can actually read.

---

## How Likely Are You to Improve Your Score?

Based on how the algorithm works:

| Situation | Expected Score Improvement |
|-----------|---------------------------|
| You have the skills but wrong keywords | +30 to +50 points |
| You're missing some technical skills | +15 to +25 points |
| Strong match already | +5 to +15 points (fine-tuning) |
| Wrong role entirely | Tool will tell you honestly |

The bullet rewriter alone typically improves perceived relevance significantly — recruiters who DO read resumes spend 6 seconds on average. Action verbs + embedded keywords + quantifiable metrics = they keep reading.

---

## Features in Detail

### 🎯 ATS Score Engine

Weighted scoring algorithm across 4 categories:
- **Technical Skills (40%)** — programming languages, frameworks, tools, platforms
- **Overall Keywords (30%)** — all JD keywords found in resume
- **Experience Requirements (20%)** — years of experience patterns detected
- **Education Requirements (10%)** — degree requirements matched

Scoring: Exact match = 1.0 points | Partial match = 0.5 points | Missing = 0 points

Grades: **A** (85+) · **B** (70–84) · **C** (55–69) · **D** (40–54) · **F** (<40)

### 🔍 Keyword Gap Analysis

Three-tier classification with priority ranking:
- ✅ **Matched** — keyword appears verbatim in your resume
- ⚠️ **Partial** — related words found but not exact phrase
- ❌ **Missing** — not found at all, ranked HIGH/MEDIUM/LOW priority

Priority logic: keywords appearing in both KeyBERT top phrases AND technical skills = HIGH priority. These are the ones to add first.

### ✏️ AI Bullet Point Rewriter

Powered by Groq (llama-3.1-8b-instant at ~200 tokens/second):
- Starts every bullet with a strong action verb
- Naturally embeds 1–2 JD keywords where they fit
- Adds quantifiable metric placeholders (`[X%]`, `[N users]`) where appropriate
- Keeps bullets under 150 characters — optimal for ATS and human readers
- Accept/reject each rewrite individually — you stay in control

**Example:**
- Before: *"Worked on backend APIs for the product team"*
- After: *"Engineered RESTful APIs using FastAPI, reducing response latency by [X%] for [N] daily active users"*

### 📊 Multi-JD Comparison

Targeting multiple similar roles? Paste up to 3 job descriptions and CareerLens:
- Finds keywords that appear in ALL JDs (universal — add these first)
- Finds keywords in 2+ JDs (common — add these second)
- Shows pairwise overlap % between JDs
- Gives a prioritized recommendation: *"Focus on these 8 skills that appear across all 3 job descriptions"*

This is how you build one resume that gets past 3 different ATS systems.

### 📄 PDF Export

ATS-optimized PDF built with ReportLab:
- Standard fonts only (Helvetica) — no custom fonts ATS can't read
- Single column layout — no two-column designs that parse as gibberish
- No tables, no text boxes, no images — pure text flow
- Standard section headers (EXPERIENCE, EDUCATION, SKILLS) — what ATS expects
- Automatically incorporates accepted bullet rewrites

---

## Architecture

```
Resume (PDF/DOCX/TXT)              Job Description Text
        ↓                                  ↓
  resume_parser.py              jd_parser.py
  (PyPDF2/python-docx)          (KeyBERT + regex patterns)
  Extract raw text              Extract & categorize keywords
  Detect sections               technical/soft/experience/education
        ↓                                  ↓
        └──────────────┬───────────────────┘
                       ↓
               ats_scorer.py
       (weighted algorithm → 0-100 score + grade)
                       ↓
           keyword_analyzer.py
    (matched / partial / missing + priority ranking)
                       ↓
            rewriter.py  (optional)
     (Groq LLM → rewrites bullets with JD keywords)
                       ↓
          pdf_generator.py  (optional)
         (ReportLab → ATS-friendly PDF)
                       ↓
              React Dashboard
   (Analyzer · Rewriter · Compare · Export)
   Dark/Light mode · Glassmorphism UI · Cursor glow
```

---

## Tech Stack

### Backend

| Component | Technology | Why |
|-----------|-----------|-----|
| API Server | FastAPI + Uvicorn | Auto-docs, Pydantic validation, fast |
| Keyword Extraction | KeyBERT + sentence-transformers | Semantic keyphrases, not just hardcoded lists |
| LLM (Rewriting) | Groq (llama-3.1-8b-instant) | ~200 tok/s, free tier, natural language rewrites |
| Resume Parsing | PyPDF2 + python-docx | PDF and DOCX support |
| PDF Generation | ReportLab | ATS-compatible PDF output |

### Frontend

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | React + Vite | Fast HMR, component model |
| Styling | Tailwind CSS v4 | Utility-first, dark/light mode |
| Theme | CSS custom properties + Context API | Smooth glassmorphism dark/light switching |
| Icons | Lucide React | Consistent, lightweight |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free Groq API key from [console.groq.com](https://console.groq.com)

### Backend

```bash
cd backend
pip3 install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
python3 -m uvicorn app.main:app --reload --loop asyncio
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description | Input |
|--------|----------|-------------|-------|
| POST | `/api/analyze` | Full ATS analysis | Resume file + JD text |
| POST | `/api/rewrite` | AI bullet rewriting | Bullets + JD keywords + role title |
| POST | `/api/compare` | Multi-JD comparison | 2–3 JD texts |
| POST | `/api/export` | ATS-optimized PDF | Resume data + optional rewrites |
| GET | `/health` | Health check | — |

---

## Project Structure

```
careerlens/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routes
│   │   ├── config.py            # Environment settings
│   │   ├── models/schemas.py    # Pydantic request/response models
│   │   ├── core/
│   │   │   ├── resume_parser.py     # PDF/DOCX/TXT text extraction + section detection
│   │   │   ├── jd_parser.py         # KeyBERT + regex keyword extraction
│   │   │   ├── ats_scorer.py        # Weighted ATS scoring algorithm
│   │   │   ├── keyword_analyzer.py  # Gap analysis with priority ranking
│   │   │   ├── rewriter.py          # Groq LLM bullet point rewriter
│   │   │   ├── multi_jd_analyzer.py # Cross-JD keyword comparison
│   │   │   └── pdf_generator.py     # ReportLab ATS-friendly PDF
│   │   └── routes/
│   │       ├── analyze.py   # POST /api/analyze
│   │       ├── rewrite.py   # POST /api/rewrite
│   │       ├── compare.py   # POST /api/compare
│   │       └── export.py    # POST /api/export
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedBackground.jsx  # Cursor-reactive orb background
│   │   │   ├── Layout.jsx              # Glass sidebar + routing
│   │   │   └── ThemeToggle.jsx         # Dark/light toggle
│   │   ├── context/ThemeContext.jsx    # Theme state + localStorage
│   │   ├── pages/
│   │   │   ├── Analyzer.jsx   # ATS score + keyword gap
│   │   │   ├── Rewriter.jsx   # Bullet rewriter with accept/reject
│   │   │   ├── Compare.jsx    # Multi-JD comparison
│   │   │   └── Export.jsx     # PDF export
│   │   └── services/api.js    # Axios API calls
│   └── package.json
└── README.md
```

---

## Known Limitations

| Limitation | Current Approach | Better Approach |
|------------|-----------------|-----------------|
| Keyword extraction | KeyBERT + regex | Fine-tuned NER model on job postings |
| ATS scoring | Keyword overlap | Real ATS API integration |
| PDF parsing | PyPDF2 text extraction | OCR for scanned PDFs |
| Bullet rewriting | Single Groq call | Multi-turn refinement with user feedback |
| No auth | Single user | JWT + multi-user with saved resumes |

---

## Author

**Rachit Mittal**  
B.Tech CSE, SRMIST NCR Campus (2027)

[GitHub](https://github.com/RachitMittal-20) · [LinkedIn](https://linkedin.com/in/rachit-mittal-354767298)

---

> Built to solve a real problem: most qualified candidates never get interviews because their resume fails an algorithm. CareerLens fixes that.
