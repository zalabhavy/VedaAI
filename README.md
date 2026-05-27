# VedaAI – AI Assessment Creator

Full-stack AI-powered assessment creator that enables teachers to generate structured question papers using AI.

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Zustand
- **Backend:** Express + TypeScript + MongoDB + Redis + BullMQ + Socket.io
- **AI:** Google Gemini Flash (free tier)
- **PDF Export:** jsPDF + html2canvas

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (Atlas free tier or local)
- Redis (Upstash free tier or local)
- Google Gemini API key (free from https://aistudio.google.com)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment

**Server** — copy `server/.env.example` to `server/.env` and fill in:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
GEMINI_API_KEY=your_key
CLIENT_URL=http://localhost:3000
```

**Client** — `client/.env.local` is pre-configured for local dev.

### 3. Run development
```bash
npm run dev
```
This starts both frontend (port 3000) and backend (port 5000).

## Features
- ✅ Multi-step assignment creation form
- ✅ File upload (PDF/image)
- ✅ AI question paper generation (Gemini)
- ✅ Real-time progress via WebSocket
- ✅ Structured question paper output
- ✅ Difficulty badges (Easy/Moderate/Hard)
- ✅ Answer key toggle
- ✅ PDF download
- ✅ Regenerate questions
- ✅ Mobile responsive
- ✅ Search & filter assignments
- ✅ BullMQ job queue
- ✅ Redis caching
- ✅ Zustand state management
