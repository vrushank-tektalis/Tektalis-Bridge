# Tektalis Bridge — Client & Developer Project Management System

> "Connecting Clients, Developers & Projects"

Tektalis Bridge is a centralized, production-ready SaaS project management and real-time communication platform connecting **Clients**, **Developers**, and **Administrators**.

---

## 🚀 Key Capabilities

1. **Role-Based Access Control (RBAC):**
   - **CLIENT**: Register independently, describe project ideas, review and approve AI requirement extractions, track live projects across 12 lifecycle stages, communicate with developers in project chat rooms.
   - **DEVELOPER**: Invited/created solely by administrators, browse open projects, submit join requests, access technical task boards, log and fix bug tickets, participate in Developer-Only technical chats and company-wide Organization Chat.
   - **ADMIN**: Complete system governance, client & developer lifecycle management, project assignments, stage overrides, system analytics, and developer staffing approvals.

2. **AI-Powered Requirement Extraction:**
   - Free-text product descriptions transformed into structured architecture and functional requirements using Google Gemini LLM with Pydantic schema validation.
   - Interactive review flow: Clients can accept, edit, or reject recommendations before project creation.

3. **Real-Time Communication (WebSockets):**
   - Client Project Chat (Client + Assigned Devs + Admin)
   - Developer-Only Chat (Assigned Devs + Admin; Client strictly excluded)
   - Organization-Wide Developer Chat
   - Instant notification delivery and online presence

4. **Lifecycle & Quality Tracking:**
   - 12 Distinct Stages: `DRAFT`, `REQUIREMENT_ANALYSIS`, `PLANNING`, `DEVELOPMENT`, `CODE_REVIEW`, `TESTING`, `BUG_FIXING`, `UAT`, `DEPLOYMENT`, `PRODUCTION`, `MAINTENANCE`, `COMPLETED`
   - Real-time Task Board (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`)
   - Bug Tracking (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL` severity and status workflow)
   - Audit trail activity logging for all project events

5. **Analytics & Operations:**
   - Recharts-driven visual dashboard: status breakdown, stage distributions, developer utilization, and bug severity charts.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios
- **Backend**: Python 3.11, FastAPI, Motor (Async MongoDB), Pydantic v2, SlowAPI Rate Limiting, Python-Jose (JWT), Passlib (Bcrypt)
- **Database**: MongoDB 6.0
- **Real-Time**: WebSockets
- **Containerization**: Docker & Docker Compose

---

## 📦 Quick Start with Docker (Recommended)

Make sure **Docker Desktop** is running.

```bash
# Clone and enter directory
cd "Tektalis Bridge"

# Launch MongoDB, Backend, and Frontend containers
docker-compose up --build
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MongoDB**: `localhost:27017`

---

## 💻 Manual Local Development

### 1. MongoDB
Ensure MongoDB is running locally on port 27017:
```bash
docker run -d -p 27017:27017 --name tektalis_mongo mongo:6.0
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Default Credentials

The platform automatically bootstraps the initial system administrator on first startup:

- **Email**: `admin@tektalis.com`
- **Password**: `Admin@123456`
- **Role**: `ADMIN`

*Clients can register themselves directly on the `/signup` page.*  
*Developers must be created by the Administrator via `/admin/developers`.*

---

## 📡 API Reference Overview

| Module | Route | Method | Description |
|---|---|---|---|
| **Auth** | `/api/v1/auth/login` | POST | Authenticate & get JWT pair |
| **Auth** | `/api/v1/auth/signup` | POST | Client registration |
| **Projects** | `/api/v1/projects` | GET / POST | List / Create projects |
| **Projects** | `/api/v1/projects/{id}/stage` | PUT | Update project stage |
| **AI** | `/api/v1/ai/analyze-project` | POST | AI requirement extraction |
| **Developers**| `/api/v1/developers` | GET / POST | Manage developer team |
| **Requests** | `/api/v1/projects/{id}/developer-requests` | POST | Developer request to join |
| **Tasks** | `/api/v1/projects/{id}/tasks` | GET / POST | Project task management |
| **Bugs** | `/api/v1/projects/{id}/bugs` | GET / POST | Bug reporting & triage |
| **Chat WS** | `/ws/chat/{room_id}` | WS | Real-time chat channel |
| **Notif WS** | `/ws/notifications` | WS | Real-time alert stream |
| **Admin** | `/api/v1/admin/dashboard` | GET | System-wide statistics |
| **Admin** | `/api/v1/admin/analytics` | GET | Analytical data for charts |
