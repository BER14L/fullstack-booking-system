# SmartReserve

A production-grade, full-stack booking platform built with Next.js, Node/Express, Prisma, PostgreSQL, and Stripe. SmartReserve demonstrates clean architecture, JWT-based authentication with role-based access control, concurrency-safe booking logic, real payment integration, transactional email, Docker deployment, and Swagger-documented REST APIs.

> **Architecture philosophy:** Routes → Controllers → Services → Prisma (DB). Controllers never touch the database directly; all business rules live in the service layer so they can be tested, reused, and composed.

---

## Table of contents

1. [Feature overview](#feature-overview)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Quick start](#quick-start)
5. [Environment variables](#environment-variables)
6. [Database & Prisma](#database--prisma)
7. [API reference](#api-reference)
8. [Frontend](#frontend)
9. [Docker](#docker)
10. [Deployment (Vercel + Render + Supabase)](#deployment-vercel--render--supabase)
11. [Security notes](#security-notes)
12. [Roadmap](#roadmap)

---

## Feature overview

- **Authentication**: register/login, bcrypt password hashing, short-lived JWT access tokens, role-based middleware (`USER`, `ADMIN`).
- **Bookings**: create, list, cancel. Double-booking is prevented at two layers — a Postgres unique constraint on `(date, startTime)` and a Prisma `$transaction` with row-level read.
- **Payments**: Stripe Checkout sessions. Bookings become `CONFIRMED` only after a verified `checkout.session.completed` webhook.
- **Admin**: view all users, view all bookings, dashboard analytics (total bookings, revenue, breakdown by status).
- **Email**: Nodemailer-powered booking confirmations with HTML templates.
- **Security**: Helmet, CORS allowlist, express-rate-limit, Zod input validation, centralized error handler.
- **Docs**: Swagger UI at `/api/docs` generated from JSDoc annotations.
- **DevOps**: Dockerfiles + `docker-compose.yml` for zero-config local dev.

---

## Tech stack

| Layer     | Tooling                                                                 |
|-----------|-------------------------------------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios, React Hook Form |
| Backend   | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL                     |
| Auth      | JWT (access tokens), bcrypt                                              |
| Payments  | Stripe (Checkout + Webhooks)                                             |
| Email     | Nodemailer (SMTP)                                                        |
| Security  | Helmet, CORS, express-rate-limit, Zod                                    |
| Docs      | swagger-jsdoc + swagger-ui-express                                       |
| DevOps    | Docker, docker-compose, dotenv                                           |

---

## Project structure

```
smartreserve/
├── backend/
│   ├── src/
│   │   ├── config/          # env, prisma client, swagger, stripe
│   │   ├── controllers/     # thin HTTP handlers
│   │   ├── middleware/      # auth, role, error, rate limiter, validation
│   │   ├── routes/          # express routers
│   │   ├── services/        # business logic (DB-touching)
│   │   ├── utils/           # jwt, password, ApiError, asyncHandler
│   │   ├── validators/      # Zod schemas
│   │   └── server.ts        # app bootstrap
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # App Router pages
│   ├── components/          # shared UI
│   ├── hooks/               # useAuth, etc.
│   ├── lib/                 # axios instance, helpers
│   ├── services/            # API client wrappers
│   ├── types/               # shared TS types
│   ├── Dockerfile
│   ├── .env.example
│   ├── next.config.js
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick start

### Prerequisites
- Node 20+
- Docker & docker-compose (recommended) **or** a local PostgreSQL 15+ instance
- A Stripe account (test keys are enough)
- An SMTP provider (Mailtrap, Resend, SendGrid, Gmail app password, etc.)

### 1. Clone & install

```bash
git clone https://github.com/your-username/smartreserve.git
cd smartreserve
```

### 2. Spin up everything with Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker-compose up --build
```

- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- Web: http://localhost:3000

### 3. Run without Docker

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run dev

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. The most important ones:

**Backend**
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — at least 32 random bytes in production
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `CORS_ORIGIN` — comma-separated allowlist

**Frontend**
- `NEXT_PUBLIC_API_URL` — e.g. `http://localhost:4000/api`

---

## Database & Prisma

Run migrations:

```bash
cd backend
npx prisma migrate dev          # dev (creates migration + applies)
npx prisma migrate deploy       # prod (applies existing migrations)
npx prisma studio               # GUI at http://localhost:5555
```

Seed (optional):

```bash
npx prisma db seed
```

Key design choices:
- **UUID** primary keys (`@default(uuid())`) — safe to expose in URLs.
- **Unique composite index** on `(date, startTime)` — Postgres guarantees no two confirmed bookings share a slot, even under concurrent writes.
- **Status enum** (`CONFIRMED`, `CANCELLED`, `PENDING_PAYMENT`) — Stripe flips pending → confirmed via webhook.
- **Indexes** on `userId` and `status` for dashboard queries.

---

## API reference

Interactive docs: `GET /api/docs`

| Method | Route                        | Auth       | Description                          |
|--------|------------------------------|------------|--------------------------------------|
| POST   | `/api/auth/register`         | public     | Create an account                    |
| POST   | `/api/auth/login`            | public     | Exchange credentials for a JWT       |
| GET    | `/api/auth/me`               | user       | Current user profile                 |
| GET    | `/api/bookings`              | user       | My bookings                          |
| POST   | `/api/bookings`              | user       | Create booking + Stripe session      |
| DELETE | `/api/bookings/:id`          | user       | Cancel my booking                    |
| GET    | `/api/admin/users`           | admin      | List all users                       |
| GET    | `/api/admin/bookings`        | admin      | List all bookings                    |
| GET    | `/api/admin/analytics`       | admin      | Dashboard metrics                    |
| POST   | `/api/payments/webhook`      | Stripe sig | Stripe event handler (raw body)      |

---

## Frontend

Next.js 14 App Router. Key flows:

- `/register`, `/login` — React Hook Form + Zod, stores JWT in an httpOnly-simulated cookie (see `lib/authStorage.ts`).
- `/bookings` — authenticated user dashboard.
- `/bookings/new` — form → POST `/bookings` → redirects to Stripe Checkout.
- `/payment/success`, `/payment/cancel` — Stripe redirect targets.
- `/admin` — gated by role on both client and server.

Styling uses Tailwind utility classes; no component library was added to keep bundle size honest for the portfolio demo.

---

## Docker

Top-level `docker-compose.yml` runs three services: `db` (Postgres), `backend`, and `frontend`. Volumes persist Postgres data between restarts. The backend waits for the db healthcheck before migrating.

```bash
docker-compose up --build      # start
docker-compose down -v         # stop and wipe data
```

---

## Deployment (Vercel + Render + Supabase)

### 1. Database — Supabase
1. Create a new project at supabase.com.
2. Go to **Project settings → Database** and copy the connection string.
3. Use the `postgresql://...pooler.supabase.com:6543/...?pgbouncer=true&connection_limit=1` URL for `DATABASE_URL` in serverless environments, or the direct `:5432` URL for long-lived processes like Render.

### 2. Backend — Render
1. New → **Web Service** → connect the repo.
2. Root directory: `backend`.
3. Build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`.
4. Start: `node dist/server.js`.
5. Add env vars from `.env.example`. Set `NODE_ENV=production` and `CORS_ORIGIN=https://your-vercel-domain.vercel.app`.
6. After first deploy, register the Stripe webhook URL: `https://your-backend.onrender.com/api/payments/webhook` and put the signing secret in `STRIPE_WEBHOOK_SECRET`.

### 3. Frontend — Vercel
1. Import the repo, set **Root directory** to `frontend`.
2. `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`.
3. Deploy.

### 4. Post-deploy checklist
- [ ] `/api/docs` loads and shows all endpoints
- [ ] Register a user → verify row in Supabase
- [ ] Create a booking → complete Stripe test checkout → verify booking flips to `CONFIRMED`
- [ ] Email arrives in inbox
- [ ] Admin user (promoted manually in DB with `UPDATE "User" SET role = 'ADMIN' WHERE email='...';`) can reach `/admin`

---

## Security notes

- Tokens are signed with HS256 and a 1-hour expiry; rotate `JWT_SECRET` to invalidate all sessions.
- Passwords are hashed with bcrypt cost 12.
- The Stripe webhook uses `express.raw()` and `stripe.webhooks.constructEvent` to verify signatures — never process events without this check.
- `helmet()` sets secure headers; `express-rate-limit` caps `/api/auth/*` at 10 req/min per IP.
- All user input flows through Zod schemas before reaching the service layer.
- `dotenv` is only loaded outside production; in production, set real environment variables on the host.

---

## Roadmap

- [ ] Refresh tokens + httpOnly cookie storage
- [ ] OAuth providers (Google)
- [ ] Multi-resource booking (rooms, staff, equipment)
- [ ] Recurrence & availability rules
- [ ] i18n

---

## License

MIT — do what you like, attribution appreciated.
