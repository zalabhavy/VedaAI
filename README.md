# VedaAI — AI-Powered Assessment Creator

> An intelligent platform for teachers to generate, manage, and distribute AI-powered question papers using Groq LLM, built with Next.js, Express, MongoDB, Redis, and BullMQ.

---

## 📸 Features at a Glance

| Feature | Description |
|---|---|
| 🤖 AI Question Generation | Generate full question papers using Groq (LLaMA 3.3 70B) |
| 📄 Multiple Question Types | MCQ, Short Answer, Long Answer, True/False, Fill in the Blanks |
| 🎯 Difficulty Control | Mix Easy / Moderate / Hard questions |
| 📁 File Upload | Upload PDFs or images as reference material |
| ⚡ Real-time Progress | WebSocket-based live progress during generation |
| 📥 Download as PDF | Export generated papers as PDF |
| 🖨️ Print Support | Clean print layout with hidden UI elements |
| 🔑 Answer Key | Toggle answer key view |
| 🔄 Regenerate | Re-generate paper with same settings |
| 📚 My Library | Browse all completed question papers |
| 🏠 Home Dashboard | Stats overview with recent assignments |
| 👥 My Groups | Class group management |
| 🔧 Settings | Update name/email, persist across app |
| 📱 Fully Responsive | Mobile-first design with bottom navigation |
| 🎨 Filter & Sort | Sort assignments by date or title |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 14)                      │
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Home    │  │Assignments│  │  Create  │  │ View Paper  │  │
│  │Dashboard │  │  List     │  │  Form    │  │+ Answer Key │  │
│  └──────────┘  └───────────┘  └──────────┘  └─────────────┘  │
│                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────────────┐   │
│  │      Zustand Store      │  │    Socket.io Client       │   │
│  │  assignmentStore.ts     │  │  (real-time progress)     │   │
│  │  userStore.ts (persist) │  └───────────────────────────┘   │
│  └─────────────────────────┘                                   │
└──────────────────────────┬──────────────────────┬─────────────┘
                           │ HTTP REST             │ WebSocket
                           ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express + Node.js)                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  REST API   │  │  Socket.io   │  │   BullMQ Worker      │  │
│  │ /assignments│  │ (rooms by    │  │ (question-generation │  │
│  │   CRUD      │  │ assignmentId)│  │  queue)              │  │
│  └──────┬──────┘  └──────────────┘  └──────────┬───────────┘  │
│         │                                        │              │
│         ▼                                        ▼              │
│  ┌─────────────┐                      ┌─────────────────────┐  │
│  │   MongoDB   │◄─────────────────────│    Groq AI API      │  │
│  │   (Atlas)   │                      │  (LLaMA 3.3 70B)    │  │
│  └─────────────┘                      └─────────────────────┘  │
│                                                                 │
│  ┌─────────────┐                                               │
│  │    Redis    │  BullMQ job queue + paper cache (1hr TTL)     │
│  │  (Upstash)  │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Assignment Generation Flow

```
User fills Create form
        │
        ▼
POST /api/assignments
        │
        ├─► Save to MongoDB  (status: "pending")
        ├─► Add job to BullMQ Queue (Redis)
        └─► Return { assignmentId }
                   │
                   ▼
        Client navigates to /assignments/:id
        Socket.io joins room: "assignment:<id>"
                   │
                   ▼
        BullMQ Worker picks up job
        │
        ├─► Emit progress: 10%   (started)
        ├─► Load assignment from MongoDB
        ├─► Emit progress: 20%   (loaded)
        ├─► Build AI prompt (subject, board, types, difficulty…)
        ├─► Call Groq API (LLaMA 3.3 70B)
        ├─► Emit progress: 20-75% (every 2s during generation)
        ├─► Parse & validate JSON response
        ├─► Emit progress: 85%   (saving)
        ├─► Save generatedPaper to MongoDB
        ├─► Cache paper in Redis (1hr TTL)
        └─► Emit: 100% + "paper-ready" event
                   │
                   ▼
        Client auto-redirects to /assignments/:id/view
```

---

## 📁 Project Structure

```
VedaAI/
├── client/                           # Next.js 14 App Router
│   ├── public/
│   │   └── logo.avif
│   └── src/
│       ├── app/
│       │   ├── (main)/               # Route group — shared layout
│       │   │   ├── layout.tsx        # Sidebar + TopBar + MobileBottomNav
│       │   │   ├── page.tsx          # Home dashboard
│       │   │   ├── assignments/
│       │   │   │   ├── page.tsx          # List with search/sort
│       │   │   │   ├── create/
│       │   │   │   │   └── page.tsx      # Create form + file upload
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx      # Real-time progress
│       │   │   │       └── view/
│       │   │   │           └── page.tsx  # Paper + PDF + print
│       │   │   ├── groups/page.tsx
│       │   │   ├── library/page.tsx
│       │   │   ├── ai-toolkit/page.tsx
│       │   │   └── settings/page.tsx
│       │   ├── layout.tsx            # Root HTML shell
│       │   └── globals.css
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── TopBar.tsx
│       │   ├── MobileSidebar.tsx
│       │   ├── MobileBottomNav.tsx
│       │   └── VedaLogo.tsx
│       ├── lib/
│       │   ├── api.ts                # Axios API client
│       │   └── socket.ts             # Socket.io singleton
│       └── store/
│           ├── assignmentStore.ts    # Zustand (assignments)
│           └── userStore.ts          # Zustand + localStorage persist
│
├── server/                           # Express + Node.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                 # MongoDB connection
│   │   │   └── redis.ts              # Upstash Redis connection
│   │   ├── models/
│   │   │   └── Assignment.ts         # Mongoose schema
│   │   ├── routes/
│   │   │   └── assignments.ts        # REST CRUD + multer upload
│   │   ├── services/
│   │   │   └── aiService.ts          # Groq prompt builder + parser
│   │   ├── workers/
│   │   │   └── questionWorker.ts     # BullMQ job processor
│   │   └── index.ts                  # Express + Socket.io entry
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework with file-based routing |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | Client state management |
| Socket.io Client | Real-time WebSocket |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|---|---|
| Express.js | REST API server |
| TypeScript (tsx) | Type safety + fast dev execution |
| Socket.io | WebSocket server (rooms per assignment) |
| BullMQ | Async job queue for AI generation |
| Multer | File upload handling |
| Mongoose | MongoDB ODM |

### Infrastructure
| Tech | Purpose |
|---|---|
| MongoDB Atlas | Database for assignments + papers |
| Redis (Upstash) | BullMQ queue + paper cache (1hr TTL) |
| Groq API | LLM inference — LLaMA 3.3 70B Versatile |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account → [cloud.mongodb.com](https://cloud.mongodb.com) (free tier)
- Upstash Redis → [upstash.com](https://upstash.com) (free tier)
- Groq API key → [console.groq.com](https://console.groq.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/zalabhavy/VedaAI.git
cd VedaAI
```

### 2. Install dependencies

```bash
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 3. Configure environment variables

**`server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vedaai
REDIS_URL=rediss://default:<password>@<host>:<port>
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:3000
```

**`client/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Whitelist your IP in MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** → **Add IP Address**
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm

### 5. Start the app

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:5000

---

## 📡 API Reference

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assignments` | List all assignments |
| `POST` | `/api/assignments` | Create + queue generation job |
| `GET` | `/api/assignments/:id` | Get single assignment with paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment |

### POST body fields (multipart/form-data)

| Field | Type | Description |
|---|---|---|
| `title` | string | Assignment title |
| `subject` | string | Subject name |
| `class` | string | Class / grade |
| `board` | string | CBSE / ICSE / State Board |
| `totalMarks` | number | Total marks for paper |
| `timeAllowed` | string | e.g. `"2 hours"` |
| `dueDate` | string | ISO date string |
| `questionTypes` | JSON string | `[{ type, count, marksEach }]` |
| `difficulty` | JSON string | `{ easy, medium, hard }` percentages |
| `file` | File | Optional reference PDF or image |

### WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `join-assignment` | Client → Server | `{ assignmentId }` |
| `status` | Server → Client | `{ assignmentId, status, progress }` |
| `paper-ready` | Server → Client | `{ assignmentId }` |

---

## 🎨 Pages Overview

| Page | Route | Description |
|---|---|---|
| 🏠 Home | `/` | Stats cards + recent assignments |
| 📋 Assignments | `/assignments` | Full list with search + sort |
| ➕ Create | `/assignments/create` | Form to configure a new paper |
| ⚡ Progress | `/assignments/:id` | Live generation progress via WebSocket |
| 📄 View Paper | `/assignments/:id/view` | Generated paper, answer key, PDF, print |
| 👥 My Groups | `/groups` | Class group cards |
| 📚 My Library | `/library` | All completed question papers |
| 🔧 AI Toolkit | `/ai-toolkit` | AI tools collection |
| ⚙️ Settings | `/settings` | Profile name/email + preferences |

---

## 🧠 AI Prompt Design

`aiService.ts` builds a structured prompt including:

- **Subject context** — subject, class, board, chapter/topic
- **Paper structure** — total marks, time limit, due date
- **Per-type breakdown** — question type + count + marks each
- **Difficulty distribution** — Easy / Moderate / Hard percentages
- **Reference material** — extracted text from uploaded file (if any)
- **Strict JSON schema** — enforced output format, always parseable

Response pipeline:
1. JSON extraction (regex strips markdown fences)
2. Schema validation (counts, marks arithmetic)
3. Question renumbering + difficulty normalization
4. Save to MongoDB → cache in Redis (1hr TTL)

---

## 📱 Mobile Experience

- **Bottom navigation** — 4 quick-access tabs (Home, Assignments, Library, AI Toolkit)
- **Hamburger sidebar** — full navigation + settings link + school info
- **Mobile TopBar** — back button auto-shows on nested pages
- **Single-column layout** on mobile, grid on tablet/desktop
- **Touch-optimized** buttons, inputs, and modal drawers

---

## 🗂️ State Management

### `assignmentStore` (Zustand)
Holds the assignments array fetched from the API. Used on the list page, home dashboard, and library.

### `userStore` (Zustand + localStorage persist)
Stores `name` and `email` — survives page refresh. Updated from Settings and displayed in the TopBar.

---

## 🔐 Security Notes

- `.env` files are git-ignored — never committed
- API keys live server-side only, never in client bundles
- File uploads validated before AI processing
- MongoDB Atlas IP whitelisting recommended for production

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [zalabhavy](https://github.com/zalabhavy)
