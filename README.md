# 🚀 TaskFlow — Team Task Manager

> A production-grade full-stack task management app with role-based access control, Kanban boards, and real-time dashboards.

![Tech Stack](https://img.shields.io/badge/Frontend-React_+_Vite-61dafb?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js_+_Express-68a063?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)
![Deployment](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?style=flat-square)

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup/login with token-based sessions
- 👑 **Role-Based Access** — Admin and Member roles (global + per-project)
- 📁 **Project Management** — Create, manage, and track multiple projects
- 📋 **Kanban Board** — Drag-friendly task columns (To Do → In Progress → Review → Done)
- ✅ **Task Management** — Priority, deadlines, assignments, descriptions
- 👥 **Team Management** — Invite members by email, set project roles
- 📊 **Dashboard** — Stats, progress, overdue alerts, recent activity
- 🚨 **Overdue Detection** — Visual highlights for late tasks/projects
- 📱 **Responsive** — Works on mobile and desktop

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deployment | Railway |

---

## 🚀 Deploy on Railway (Step-by-Step)

### Step 1: Create Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 2: Deploy Backend

1. Push your code to a GitHub repo (two folders: `backend/` and `frontend/`)
2. In Railway → **New Project** → **Deploy from GitHub repo**
3. Select your repo → Choose **backend** as root directory (or use monorepo settings)
4. Railway will auto-detect Node.js and run `npm start`

**Add Environment Variables in Railway (Backend):**
```
DATABASE_URL     = (auto-filled when you add PostgreSQL)
JWT_SECRET       = your-random-secret-string-min-32-chars
NODE_ENV         = production
FRONTEND_URL     = https://your-frontend.up.railway.app
PORT             = (Railway sets this automatically)
```

5. Add PostgreSQL: In your project → **New** → **Database** → **PostgreSQL**
6. Railway auto-injects `DATABASE_URL` — the app creates tables on first start ✅

### Step 3: Deploy Frontend

1. In Railway → **New Service** → **GitHub repo** → Select `frontend` folder
2. Add Environment Variable:
```
VITE_API_URL = https://your-backend.up.railway.app/api
```
3. Railway builds with `npm run build` and serves `dist/`

### Step 4: Connect Frontend ↔ Backend

- Copy your backend Railway URL (e.g., `https://taskflow-backend.up.railway.app`)
- Set it as `VITE_API_URL` in frontend env vars
- Copy frontend URL → set as `FRONTEND_URL` in backend env vars
- Redeploy both services

### ✅ Verify Deployment
Visit `https://your-backend.up.railway.app/health` — should return:
```json
{ "status": "OK", "message": "Team Task Manager API is running 🚀" }
```

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL URL and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

App runs at: `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project detail + tasks + members |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (owner/admin) |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | List tasks |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PUT | `/api/tasks/:taskId` | Update task |
| DELETE | `/api/tasks/:taskId` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | User dashboard data |

---

## 🗄 Database Schema

```
users         → id, name, email, password, role, avatar, created_at
projects      → id, name, description, status, owner_id, deadline, created_at
project_members → project_id, user_id, role, joined_at
tasks         → id, title, description, status, priority, project_id, assigned_to, created_by, deadline
comments      → id, task_id, user_id, content, created_at
```

---

## 👑 Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Delete project | ✅ (own) | ❌ |
| Add members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update tasks | ✅ | ✅ |
| Delete tasks | ✅ | ✅ |
| View team tab | ✅ | ❌ |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/database.js     # PostgreSQL + auto-init
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── middleware/auth.js      # JWT + RBAC
│   │   ├── routes/index.js
│   │   └── server.js
│   ├── .env.example
│   ├── railway.toml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetail.jsx   # Kanban board
│   │   │   └── MyTasksPage.jsx
│   │   ├── utils/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Full design system
│   ├── .env.example
│   ├── railway.toml
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🎨 Design System

- **Fonts**: Syne (headings) + DM Sans (body)
- **Theme**: Dark mode with purple accent (`#6c63ff`)
- **Status colors**: Green (done), Blue (in-progress), Yellow (review/high), Red (urgent/overdue)
- **Components**: Cards, Badges, Modals, Toast notifications, Kanban columns

---

*Built with ❤️ — Top 1% quality full-stack application*
