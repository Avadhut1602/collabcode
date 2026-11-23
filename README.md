# CollabCode 🚀 – Advanced AI-Powered Collaborative Coding Platform

![CollabCode Banner](https://img.shields.io/badge/CollabCode-v2.0.0-6366f1?style=for-the-badge&logo=codeforces&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-VS_Code-007acc?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47a248?style=for-the-badge&logo=mongodb&logoColor=white)

**CollabCode** is a modern, enterprise-ready, AI-powered collaborative cloud development environment (IDE) built for high-velocity software engineering teams, hackathons, remote pair-programming, and technical interviews.

Inspired by industry leaders like **VS Code, GitHub, Replit, and Linear**, CollabCode delivers instant real-time code synchronization, multi-file project workspaces, multi-language isolated execution, context-aware AI developer assistance, deep version history with colorized line diffs, threaded chat with code snippet sharing, granular role-based permissions (RBAC), and personal developer analytics.

---

## 📑 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [Complete Feature Inventory (12 Phases)](#-complete-feature-inventory)
  - [1. Modern Architecture & Hybrid DB](#1-modern-architecture--hybrid-db)
  - [2. Professional SaaS UI/UX & Themes](#2-professional-saas-uiux--themes)
  - [3. Multi-File Collaborative IDE](#3-multi-file-collaborative-ide)
  - [4. Real Isolated Code Execution Engine](#4-real-isolated-code-execution-engine)
  - [5. Context-Aware AI Coding Assistant](#5-context-aware-ai-coding-assistant)
  - [6. Code Version History & Visual Diffs](#6-code-version-history--visual-diffs)
  - [7. Advanced Team Chat & Code Snippets](#7-advanced-team-chat--code-snippets)
  - [8. Project Management & Role-Based Access Control](#8-project-management--rbac)
  - [9. Notification Center & User Profiles](#9-notification-center--user-profiles)
  - [10. Personal Coding Analytics](#10-personal-coding-analytics)
  - [11. Security Hardening & Rate Limiting](#11-security-hardening--rate-limiting)
  - [12. Verification & Automated Test Suite](#12-verification--automated-test-suite)
- [Directory Structure](#-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Real Code Execution Engine Setup](#-real-code-execution-engine-setup)
- [AI Coding Assistant Setup](#-ai-coding-assistant-setup)
- [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
- [Socket.IO Real-Time Event Architecture](#-socketio-real-time-event-architecture)
- [Production Deployment](#-production-deployment)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🏛️ Architectural Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CollabCode Client (React 19)                    │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────┐  │
│  │   Monaco Editor  │  │   File Explorer   │  │   AI Coding Panel   │  │
│  │  Live Cursor Sync│  │ Multi-File Tree   │  │ 12 Dev Capabilities │  │
│  └────────▲─────────┘  └────────▲──────────┘  └──────────▲──────────┘  │
│           │                     │                        │             │
│  ┌────────▼─────────────────────▼────────────────────────▼──────────┐  │
│  │           Axios REST Interceptors + Socket.IO Client             │  │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ HTTP / WebSocket (Port 5000)
┌──────────────────────────────▼─────────────────────────────────────────┐
│                     CollabCode Server (Node.js & Express)              │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌───────────────┐ │
│  │ Helmet & Rate Limiters│ │ Socket.IO Handshake  │ │ JWT Auth Guard│ │
│  └───────────────────────┘ └──────────────────────┘ └───────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Controller & Service Layer                      │  │
│  │  • Auth & User Profiles   • Multi-File Room Management           │  │
│  │  • Piston Execution Proxy • Google Gemini / OpenAI Service       │  │
│  │  • Version Snapshots      • Threaded Chat & Reactions            │  │
│  └──────────────────┬─────────────────────────────┬─────────────────┘  │
└─────────────────────┼─────────────────────────────┼────────────────────┘
                      │                             │
┌─────────────────────▼────────┐ ┌──────────────────▼────────────────────┐
│      MongoDB / In-Memory     │ │      Execution Engines & AI APIs      │
│  • Users, Rooms, Snapshots   │ │  • Piston Code Execution API          │
│  • Messages, Execution Logs  │ │  • Local Isolated VM Sandbox Fallback │
│  • Notifications & Analytics │ │  • Google Gemini 1.5 / OpenAI GPT-4o  │
└──────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 🚀 Complete Feature Inventory

### 1. Modern Architecture & Hybrid DB
- **Zero-Friction Startup**: Automatically detects MongoDB. If a local or cloud instance is unavailable, it spins up an embedded, zero-configuration in-memory MongoDB server (`mongodb-memory-server`) seeded with comprehensive starter data.
- **Modern React 19 Frontend**: Leverages Vite 8.3 for lightning-fast HMR and optimized production builds.
- **Strict Data Integrity**: Comprehensive Mongoose schemas with validation, cascade protection, and pre-save password encryption using `bcryptjs`.

### 2. Professional SaaS UI/UX & Themes
- **Modern SaaS Landing Page**: Includes an interactive live code preview hero, 4-step collaboration workflow, AI feature showcase, technology breakdown, and interactive FAQs.
- **Three Enterprise Themes**: Full theme switching engine supporting:
  - `vs-dark`: Default dark theme tuned for developer comfort.
  - `light`: Clean, high-contrast light theme with crisp borders.
  - `hc-black`: High-contrast black theme designed for accessibility.
- **Fluid Layouts**: Collapsible panels, fluid breadcrumbs, tab overflow scroll, and responsive layouts across desktops, tablets, and laptops.

### 3. Multi-File Collaborative IDE
- **VS Code-Inspired File Explorer**:
  - Create, rename, delete files and nested folders with instant validation.
  - Visual language icons for `.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.cpp`, `.c`, `.java`, `.html`, `.css`, `.json`, `.md`, and `.txt`.
  - Multi-tab file management with active indicators, unsaved status, and close actions.
- **Full Monaco Editor Integration**:
  - Full syntax highlighting, auto-indentation, bracket matching, code folding, minimap, and search-and-replace.
  - Dynamic font size adjustment (12px - 24px) and line height controls.
  - Auto-format code shortcut button and full-screen distraction-free mode.
- **Real-Time Collaboration via Socket.IO**:
  - Instant code synchronization broadcast to room peers.
  - Live collaborator cursor markers with unique user colors and hover name tags.
  - Real-time presence drawer with active member badges and join/leave toast notifications.
  - Typing indicators in chat and workspace header.

### 4. Real Isolated Code Execution Engine
- **Multi-Language Support**: Executes **JavaScript**, **Python**, **C**, **C++**, and **Java**.
- **Real Execution Architecture**:
  - Integrated with the **Piston High-Performance Isolated Execution API**.
  - Built-in local isolated VM sandbox fallback for JavaScript and Python with timeout protection.
  - Real standard input (`stdin`) support for interactive competitive programming tasks.
  - Standard output (`stdout`), standard error (`stderr`), and compilation error diagnostics.
  - Accurate runtime execution telemetry (elapsed milliseconds and execution status badge).
  - Searchable execution history tab recording previous runs and logs in MongoDB.

### 5. Context-Aware AI Coding Assistant
Accessible through the right sidebar panel with 12 specialized actions:
1. **Explain Selected Code**: Deep-dive walkthrough of selected logic.
2. **Explain Entire File**: High-level architectural and algorithmic summary.
3. **Detect Potential Bugs**: Security flaws, off-by-one errors, memory leaks, and unhandled edge cases.
4. **Suggest Bug Fixes**: Actionable corrected code snippets with rationale.
5. **Generate from Prompt**: Natural-language to idiomatic code synthesis.
6. **Optimize Code**: Algorithmic complexity reduction and memory efficiency improvements.
7. **Generate Documentation**: Comprehensive JSDoc, Docstring, or Doxygen documentation.
8. **Generate Comments**: In-line explanatory comments for complex control flows.
9. **Explain Compiler Errors**: Human-readable error analysis and repair suggestions.
10. **Coding Best Practices**: Clean architecture, SOLID principles, and stylistic conventions.
11. **Generate Unit Tests**: Jest, PyTest, or JUnit test suites with full branch coverage.
12. **Language Converter**: Automatic code translation between JS, Python, C++, and Java.

*Editor Integration*: One-click **Insert Code at Cursor** or **Replace Selected Code** with user confirmation.
*Graceful Degradation*: When no external AI key is supplied, displays a helpful in-app configuration card with step-by-step instructions.

### 6. Code Version History & Visual Diffs
- **Automated Snapshots**: Background snapshots triggered during significant editing milestones.
- **Manual Milestones**: Users can save named checkpoints with custom descriptions.
- **Colorized Line Diff Viewer**: Side-by-side or unified line-by-line comparison highlighting additions (green) and deletions (red).
- **Non-Destructive Restoration**: Reverting to a previous snapshot creates a new checkpoint without destroying intervening history.

### 7. Advanced Team Chat & Code Snippets
- **Threaded Replies**: Quote and reply directly to specific team messages.
- **Rich Code Snippets**: Modal dialog to share syntax-highlighted code blocks with language tagging.
- **Message Reactions**: Real-time emoji reactions with participant counters.
- **Message Lifecycle**: Edit and delete messages with role-based permissions (authors or room owners).
- **Real-Time Indicators**: Live typing notifications and unread message indicators.

### 8. Project Management & RBAC
- **Four Granular Roles**:
  - `Owner`: Full administrative authority, role reassignment, and project deletion.
  - `Admin`: Workspace configuration, file management, and member role moderation.
  - `Editor`: Real-time code editing, file creation, code execution, and chat participation.
  - `Viewer`: Read-only code inspection, test-run execution, and chat discussion.
- **Project Duplication & Forking**: One-click duplication to branch new experiments.
- **Project Archiving**: Archive stale rooms to declutter the dashboard.
- **Favorites & Search**: Star preferred workspaces and filter by language, tag, or ownership.

### 9. Notification Center & User Profiles
- **Notification Drawer**: In-app notifications for room invitations, member joins, chat mentions, and system updates.
- **Developer Profile Customization**:
  - Custom display name, bio, and avatar.
  - Programming interest tags (e.g., React, Python, C++, Go).
  - Default programming language and IDE theme preference.
  - Granular notification preferences.

### 10. Personal Coding Analytics
- **Language Distribution**: Breakdown of projects and files authored by language.
- **Execution Telemetry**: Total program executions, success vs. runtime error ratios, and average latency.
- **Weekly Activity Chart**: Visual bar graph of workspace commits and edits over time.
- **Recent Execution Logs**: Inspect historical runs, status codes, and outputs.

### 11. Security Hardening & Rate Limiting
- **HTTP Security Headers**: Powered by `helmet`.
- **DDoS & Brute-Force Protection**: Tiered rate limiters on `/api/auth/login` (100 req / 15 min) and `/api/execute/run` (30 req / min).
- **JWT WebSocket Handshake**: Socket connections validate JWT credentials prior to joining rooms.
- **Safe Evaluation**: Sandboxed execution guarantees arbitrary user code never runs inside the main Express runtime.

---

## 📁 Directory Structure

```
WEB_PROJ/
├── index.html                   # HTML entry point with meta tags & fonts
├── vite.config.js               # Vite 8.3 configuration with React plugin
├── package.json                 # Client & workspace dependencies
├── README.md                    # Comprehensive documentation (this file)
│
├── src/                         # React 19 Frontend
│   ├── main.jsx                 # Client entry point
│   ├── App.jsx                  # React Router v7 routes
│   ├── api/
│   │   └── api.js               # Axios instance with JWT interceptor
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state, theme management, notifications
│   ├── styles/
│   │   └── global.css           # Design tokens, themes (vs-dark, light, hc-black)
│   ├── components/
│   │   ├── Navbar.jsx           # Global responsive navigation & profile drawer
│   │   ├── RoomCard.jsx         # Dashboard project card with stats & actions
│   │   ├── FileExplorer.jsx     # Multi-file tree explorer with CRUD operations
│   │   ├── VersionHistory.jsx   # Snapshot timeline & side-by-side diff viewer
│   │   ├── UserList.jsx         # Collaborator presence & RBAC role manager
│   │   ├── OutputPanel.jsx      # Terminal stdout/stderr, stdin, & history
│   │   ├── AIPanel.jsx          # AI assistant with 12 developer actions
│   │   └── ChatPanel.jsx        # Team chat with code snippet modal & reactions
│   └── pages/
│       ├── Landing.jsx          # Marketing landing page & live mockup
│       ├── Login.jsx            # Sign-in with password toggle & demo buttons
│       ├── Signup.jsx           # Sign-up with password strength meter
│       ├── ForgotPassword.jsx   # Two-step password reset workflow
│       ├── Dashboard.jsx        # Project hub with filters, search, & templates
│       ├── Room.jsx             # Flagship IDE collaborative workspace
│       ├── Analytics.jsx        # Personal telemetry & execution statistics
│       └── Profile.jsx          # User settings & preferences
│
└── server/                      # Node.js & Express Backend
    ├── server.js                # Express app & Socket.IO real-time server
    ├── package.json             # Server dependencies
    ├── seed.js                  # Database seeder with realistic demo data
    ├── test-server.js           # Automated 10-step verification test suite
    ├── config/
    │   └── db.js                # MongoDB connection with in-memory fallback
    ├── middleware/
    │   ├── auth.js              # JWT verification middleware
    │   └── rbac.js              # Role-based access control middleware
    ├── models/
    │   ├── User.js              # User model with bcrypt pre-save hashing
    │   ├── Room.js              # Multi-file room schema with member roles
    │   ├── Message.js           # Chat message schema with replies & reactions
    │   ├── VersionSnapshot.js   # Code snapshot schema for diff history
    │   ├── ExecutionLog.js      # Code execution telemetry schema
    │   └── Notification.js      # In-app notifications schema
    ├── controllers/
    │   ├── authController.js    # Auth, profile, notifications, & analytics
    │   ├── roomController.js    # Multi-file CRUD, roles, duplicates, snapshots
    │   ├── executionController.js # Piston execution proxy & sandboxed runner
    │   └── aiController.js       # Contextual AI assistant service
    └── routes/
        ├── auth.js              # Auth & profile routes
        ├── rooms.js             # Room & multi-file routes
        ├── execution.js         # Code execution routes
        └── ai.js                # AI assistant routes
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: *(Optional)* Local daemon or MongoDB Atlas URI. If omitted, CollabCode automatically initializes an embedded memory database.

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd "C:\Users\AVADHUT DHOTRE\Downloads\WEB_PROJ"
   ```

2. **Install root & frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   npm install --prefix server
   ```

### Environment Configuration

Create or verify the environment files:

#### Frontend `.env` (Project Root)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend `.env` (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coding_platform
JWT_SECRET=supersecretkey_collabcode_jwt_token_2026
JWT_EXPIRES_IN=7d

# Optional: Code Execution API (Piston is free and public; defaults to https://emkc.org/api/v2/piston)
PISTON_API_URL=https://emkc.org/api/v2/piston/execute

# Optional: AI Provider (Set one to enable live AI responses)
GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

#### Option A: Concurrent Development Mode (Recommended)
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:5000](http://localhost:5000)

#### Option B: Independent Processes
Start backend:
```bash
cd server
npm run dev
```
In a second terminal, start frontend:
```bash
npm run client:dev
```

---

## 👥 Pre-Seeded Demo Accounts

CollabCode includes realistic demo developer accounts pre-seeded with multi-file workspaces across JavaScript, Python, C++, and Java:

| Name | Email | Password | Primary Role |
|---|---|---|---|
| **Alex Johnson** | `alex@example.com` | `Demo@123` | Full-Stack Lead (Owner) |
| **Priya Sharma** | `priya@example.com` | `Demo@123` | Backend Architect (Admin) |
| **Rohan Mehta** | `rohan@example.com` | `Demo@123` | Frontend Engineer (Editor) |
| **Sneha Kulkarni** | `sneha@example.com` | `Demo@123` | Systems Programmer (Editor) |
| **Arjun Nair** | `arjun@example.com` | `Demo@123` | Junior Developer (Viewer) |

> 💡 *Note: The login page includes quick-fill buttons for instant one-click login as Alex or Priya.*

---

## ⚙️ Real Code Execution Engine Setup

CollabCode executes code without running untrusted user scripts directly on your host machine:

1. **Piston API Integration (Default)**:
   - Uses the public, battle-tested [Piston Engine](https://github.com/engineer-man/piston) at `https://emkc.org/api/v2/piston/execute`.
   - Supports JavaScript (Node.js), Python 3, C (GCC), C++ (G++), and Java (OpenJDK).
   - Handles `stdin` parameters, compilation flags, memory limits, and timeouts.
2. **Local Isolated VM Sandbox Fallback**:
   - If the external execution service is unreachable or offline, CollabCode falls back to an isolated in-process Node.js `vm` sandbox for JavaScript and a child process worker for Python with a strict 5000ms timeout guard.
3. **Execution Telemetry**:
   - Every execution captures `stdout`, `stderr`, compilation errors, execution duration in milliseconds, and status codes.
   - Logs are persisted in MongoDB to power the **Personal Coding Analytics** dashboard.

---

## 🤖 AI Coding Assistant Setup

The AI Assistant is designed to be plug-and-play with enterprise providers:

1. **Google Gemini (Recommended)**:
   - Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
   - Add to `server/.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
2. **OpenAI**:
   - Obtain an API key from [platform.openai.com](https://platform.openai.com/).
   - Add to `server/.env`:
     ```env
     OPENAI_API_KEY=sk-proj-...
     ```
3. **Zero-Configuration Fallback**:
   - If neither API key is set, the AI Panel does **not** fail or return fake mock data. It gracefully displays a step-by-step setup guide with copyable `.env` snippets while keeping all other IDE features 100% operational.

---

## 📡 Comprehensive REST API Reference

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile (bio, interests, theme) | Yes |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using reset token | No |
| `GET` | `/api/auth/notifications` | Fetch in-app notifications | Yes |
| `PUT` | `/api/auth/notifications/:id/read` | Mark notification as read | Yes |
| `GET` | `/api/auth/analytics` | Fetch personal coding metrics | Yes |
| `POST` | `/api/auth/favorites/:roomId` | Toggle room favorite status | Yes |

### Workspaces & Multi-File Management (`/api/rooms`)
| Method | Endpoint | Description | Role Required |
|---|---|---|:---:|
| `GET` | `/api/rooms` | List active workspaces for user | Viewer |
| `POST` | `/api/rooms` | Create new multi-file workspace | Authenticated |
| `POST` | `/api/rooms/join` | Join workspace by 6-char roomCode | Authenticated |
| `GET` | `/api/rooms/:id` | Fetch complete workspace details | Viewer |
| `PUT` | `/api/rooms/:id` | Update project metadata/settings | Admin |
| `DELETE` | `/api/rooms/:id` | Permanently delete workspace | Owner |
| `POST` | `/api/rooms/:id/fork` | Fork/duplicate workspace | Authenticated |
| `POST` | `/api/rooms/:id/files` | Create a new file or folder | Editor |
| `PUT` | `/api/rooms/:id/files/:fileId` | Update file content / rename | Editor |
| `DELETE` | `/api/rooms/:id/files/:fileId` | Delete file or folder | Admin |
| `GET` | `/api/rooms/:id/versions` | List snapshot version history | Viewer |
| `POST` | `/api/rooms/:id/versions` | Create manual snapshot milestone | Editor |
| `POST` | `/api/rooms/:id/versions/:vId/restore` | Restore previous snapshot | Admin |
| `GET` | `/api/rooms/:id/messages` | Fetch room chat messages | Viewer |
| `POST` | `/api/rooms/:id/messages` | Send message with code snippet | Viewer |
| `PUT` | `/api/rooms/:id/messages/:mId` | Edit sent message | Author / Admin |
| `DELETE` | `/api/rooms/:id/messages/:mId` | Delete chat message | Author / Owner |
| `POST` | `/api/rooms/:id/messages/:mId/react` | Toggle emoji reaction | Viewer |
| `PUT` | `/api/rooms/:id/members/:userId` | Update member role | Owner |

### Execution & AI (`/api/execute` & `/api/ai`)
| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `POST` | `/api/execute/run` | Execute code across 5 languages | Yes |
| `GET` | `/api/execute/history/:roomId`| Retrieve room execution history | Yes |
| `POST` | `/api/ai/query` | Query AI assistant (12 actions) | Yes |

---

## 🔌 Socket.IO Real-Time Event Architecture

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ roomId, token }` | Authenticates and joins socket to room channel |
| `room-presence-update` | Server ➔ Client | `[ { socketId, id, name, cursorColor } ]` | Broadcasts current active online members |
| `code-change` | Client ➔ Server | `{ roomId, fileId, content }` | Transmits delta editor change to peers |
| `code-update` | Server ➔ Client | `{ fileId, content, updatedBy }` | Applies remote editor change |
| `cursor-move` | Client ➔ Server | `{ roomId, cursorPosition, selection }` | Transmits line/col cursor coordinates |
| `cursor-update` | Server ➔ Client | `{ socketId, user, cursorPosition }` | Renders remote cursor marker & label |
| `user-typing` | Client ➔ Server | `{ roomId, isTyping }` | Broadcasts active typing indicator |
| `file-created` | Client ➔ Server | `{ roomId, file }` | Syncs newly created file across trees |
| `file-deleted` | Client ➔ Server | `{ roomId, fileId }` | Syncs file deletion across clients |
| `send-message` | Client ➔ Server | `{ roomId, message }` | Broadcasts new chat message |
| `message-reaction` | Client ➔ Server | `{ roomId, messageId, reactions }` | Broadcasts emoji reaction update |

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set the build command: `npm run client:build`
2. Set the publish directory: `dist`
3. Configure environment variable:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

### Backend (Render / Railway / Heroku / DigitalOcean / AWS EC2)
1. Root directory: `server`
2. Start command: `node server.js`
3. Environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabcode?retryWrites=true&w=majority
   JWT_SECRET=production_strong_jwt_secret_phrase
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_production_gemini_key
   ```

---

## 📜 License & Acknowledgments

- **License**: MIT License – free for academic, personal, and commercial development.
- **Monaco Editor**: Developed by Microsoft, powering Visual Studio Code.
- **Piston Engine**: Open-source high performance code execution engine by Engineer Man.
- **Built with ❤️ for modern collaborative engineering teams.**
