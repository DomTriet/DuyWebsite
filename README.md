# Diem Tam BDS — Vietnamese Real Estate Platform

[![Stack](https://img.shields.io/badge/Stack-Angular%20%7C%20Node.js%20%7C%20Supabase-blue)](#tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-3--Tier%20GUI--BLL--DAL-orange)](#architecture)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%26%20Railway-green)](#deployment)

A full-featured Vietnamese real estate platform with a multi-theme engine, admin dashboard, community forum, multilingual support, and a hero banner slider — built for the domain **bdsdiemtam.com**.

---

## Features

### Multi-Theme Engine
- **Dynamic loading:** automatically renders the correct theme (Luxury, Minimalist, Eco-Green, or fully Custom) based on per-project configuration stored in the database.
- **Custom Theme Builder:** drag-and-drop block editor lets admins design a project page — colors, fonts, layout blocks, footer — with a live preview, no code required.
- **Performance:** Angular lazy-loading ensures each theme's bundle is only downloaded when needed.

### Property Management
- Full CRUD for listings with soft delete, media gallery (Cloudinary), and per-property theme override (`detail_theme`).
- Flexible `attributes` JSONB column: bedrooms, area, floor, orientation, legal status, etc. — preset fields per property type, custom fields on demand.
- Search & filter: keyword, price range, area range, bedrooms, property type, category, project, sort.

### Admin & Agent Portal
- **RBAC:** strict role separation between Admin, Agent, and Member.
- **Agent dashboard:** manage own listings and leads; no access to other agents' sensitive data.
- **Lead CRM:** capture inquiries, assign to agents, track status, add notes; instant email notification via Resend API.

### Community Forum
- Post creation with admin approval queue and automatic spam/profanity detection.
- Comments, reactions (like/heart), and violation reports.
- Admin toggle to show/hide the Forum from public navigation — off by default, switchable any time without a code change.
- Security: `GET /forum/:id` only returns approved posts; pending post UUIDs cannot be accessed by guests.

### Homepage Hero Slider
- Admin-managed banners (title, subtitle, image, CTA button, sort order, active toggle).
- Native CSS Scroll Snap slider — no extra library, auto-advances every 5 seconds.
- Falls back to a static hero if no active banners exist.

### Multilingual
- Static UI: Vietnamese, English, Korean, Chinese — user switches instantly via flag selector.
- Dynamic content (property titles, project descriptions, blogs, sections): auto-translated via MyMemory API, admin-reviewed before publishing.

### Blog / CMS
- Block-based editor: Text, Image, Video, Header blocks stored as JSONB.
- Admin publishes directly; Agent posts go through a pending → approved workflow.
- Blogs can be linked to a specific property or project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 17+ (standalone), RxJS, TailwindCSS, ngx-translate |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL 15), JSONB, Row Level Security |
| **Realtime** | Socket.io (lead & notification events) |
| **Media** | Cloudinary (image/video upload) |
| **Email** | Resend API (leads, approval notifications) |
| **Hosting** | Vercel (frontend SPA), Railway (Node.js API) |

---

## Architecture

Three-tier separation — every layer is independently deployable:

```
GUI  (Angular)      →  frontend/    — components, themes, admin dashboard
BLL  (Node/Express) →  backend/     — API routes, auth, business logic
DAL  (Supabase)     →  database/    — PostgreSQL, RLS policies, migrations
```

**Security model:** Row Level Security is enforced at the database level as a second line of defense. The backend uses `service_role_key` only for trusted operations (logs, admin writes); all guest queries use `anon_key` and are constrained by RLS policies.

---

## Project Structure

```
├── database/     SQL migrations (run in numbered order on Supabase)
├── backend/      Express API, controllers, services, middlewares
├── frontend/     Angular app — guest UI, admin dashboard, theme engine
└── docs/         API reference, database schema, deployment guide, user manual
```

---

## Local Setup

### 1. Database
Run all SQL files in `database/` on Supabase SQL Editor in numbered order (`01_` → `19_`).

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in Supabase, Cloudinary, Resend keys
npm run dev               # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
ng serve                  # starts on http://localhost:4200
```

---

## Deployment

| Service | Platform | Config file |
|---|---|---|
| Frontend SPA | Vercel | `frontend/vercel.json` |
| Backend API | Railway | `backend/Procfile`, `backend/render.yaml` |
| Database | Supabase | hosted, no infra to manage |

Production URLs: `https://bdsdiemtam.com` (frontend) · `https://api.bdsdiemtam.com` (API)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step guide including DNS setup.

---

## Roadmap

- [x] Phase 1 — Database schema, RLS policies, seed data
- [x] Phase 2 — REST API, authentication, business logic
- [x] Phase 3 — Admin & Agent dashboard
- [x] Phase 4 — Multi-theme engine, guest UI, SEO, i18n, hero slider, forum
- [x] Phase 5 — Deployment config, documentation
- [ ] Phase 6 — E2E tests (Playwright)
- [ ] Phase 7 — Second-hand marketplace (individual listings, MoMo payment)
