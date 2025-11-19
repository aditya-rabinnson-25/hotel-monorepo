Hotel Management Platform – Multi-Tenant (Next.js + FastAPI + Better Auth)

A full-stack, multi-tenant hotel management system built using Next.js (App Router) and FastAPI, with Better Auth for secure authentication and tenant isolation. Includes reusable HTTP client, markdown documentation pages, Tailwind-based UI, and backend schemas for hotels, users, sessions, devices, and notifications.

🚀 Tech Stack
Frontend (Next.js)

Next.js 14 (App Router)

TypeScript

TailwindCSS

Better Auth (Multi-Tenant Auth System)

React Query (optional)

Shared HTTP Client package

Backend (FastAPI)

FastAPI (Python)

PostgreSQL + SQLAlchemy ORM

JWT Authentication

Multi-Tenant Model

Role-based access control (Admin, Manager, Staff)

Device & Session tracking schemas

Dev Tools

Turborepo Monorepo Structure

Prisma (for Better Auth)

pnpm / npm

⚙️ Features
🔐 Authentication & Authorization

✔ Multi-Tenant login system (Hotel-based user isolation)
✔ Better Auth integration
✔ Secure JWT cookies
✔ Sessions, device tracking, notifications
✔ Protected routes using Next.js middleware

🏨 Hotel Management

✔ Hotel registration schema
✔ Hotel → Users → Sessions linking
✔ Scoped access based on hotel

🎨 UI & Pages

✔ Tailwind UI login page
✔ Dashboard UI
✔ Dynamic sidebar / topbar
✔ Markdown-based static pages (About, Terms, Privacy)

🔗 Shared HTTP Client

✔ Reusable API communication across apps
✔ apiGet, serverGet with cookies
✔ Auto-authenticated requests

📦 Backend API

✔ /auth – login, logout
✔ /hotels – hotel registration
✔ /users – hotel-scoped users
✔ /sessions – Better Auth session sync
✔ /devices – device tracking API

🛠️ Setup Instructions
1. Clone repository
git clone https://github.com/<your-username>/<repo-name>.git
cd hotel-monorepo

2. Install dependencies

For web:

cd apps/web
npm install


For API:

cd ../api
pip install -r requirements.txt

3. Configure environment variables
apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
BETTER_AUTH_SECRET=your_secret
DATABASE_URL="file:./better-auth.db"

apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/hoteldb
JWT_SECRET=your_jwt_secret

4. Run the Project

Frontend:

cd apps/web
npm run dev


Backend:

cd apps/api
uvicorn main:app --reload --port 8001

📁 Folder Structure (Simplified)
hotel-monorepo/
│── apps/
│   ├── web/         → Next.js App (Better Auth)
│   └── api/         → FastAPI Backend
│
│── packages/
│   ├── httpclient/  → Shared fetch wrapper
│   └── ui/          → Shared UI components
