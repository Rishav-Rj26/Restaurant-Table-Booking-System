# AGENTS.md
## Restaurant Table Booking System

This file orients any AI coding agent (or new engineer) working in this repository. Read this first, then the linked docs as needed for the task at hand.

---

## 1. Project Docs Map

| File | Read when... |
|---|---|
| `PRD.md` | You need to understand *why* a feature exists or what's in/out of scope. |
| `requirements.md` | You need the exact functional/non-functional spec for a feature (FR-x.x / NFR-x). |
| `architecture.md` | You need to understand system design, data flow, or where new code belongs. |
| `design.md` | You're building/editing UI — screen list, design tokens, component inventory. |
| `database.md` | You're touching MongoDB schemas, indexes, or queries. |
| `api.md` | You're implementing or calling an endpoint — exact request/response shapes. |

Always check whether a change affects one of these docs and update it in the same PR — these files are the source of truth, not tribal knowledge.

---

## 2. Tech Stack Summary

- **Frontend:** React + TypeScript (Vite), Tailwind CSS, UI screens designed in **Stitch** then implemented as components.
- **Backend:** Node.js + Express + TypeScript, layered `routes → controllers → services → models`.
- **Database:** MongoDB + Mongoose.
- **Payments:** Stripe (test mode only).
- **Real-time:** Socket.io.
- **QR:** `qrcode` (generate), `html5-qrcode` (scan).
- **Email:** Nodemailer (Ethereal/console in dev).

Full rationale in `architecture.md`.

---

## 3. Repo Structure (target layout)

```
/apps
  /web              # React frontend
    /src
      /app
      /features     # auth, search, booking, checkin, dashboard, analytics
      /components
      /hooks
      /services
      /types
  /api              # Express backend
    /src
      /config
      /models
      /routes
      /controllers
      /services
      /middleware
      /jobs
      /sockets
      /utils
      /types
/docs               # this file + PRD/requirements/architecture/design/database/api
```

---

## 4. Environment Variables

Backend (`/apps/api/.env`):
```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/restaurant_booking
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_FROM=no-reply@example.com
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

Frontend (`/apps/web/.env`):
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SOCKET_URL=http://localhost:4000
```

Never commit real secrets. Use test-mode Stripe keys only, per `PRD.md` §7 constraints.

---

## 5. Local Setup (assumed commands — adjust once package.json exists)

```bash
# Backend
cd apps/api
npm install
npm run dev            # ts-node-dev / nodemon on PORT 4000

# Frontend
cd apps/web
npm install
npm run dev             # vite dev server on 5173

# Mongo (local, via Docker)
docker run -d -p 27017:27017 --name booking-mongo mongo:7
```

---

## 6. Coding Conventions

- **TypeScript strict mode** everywhere; no `any` without a comment justifying it.
- **Validation** on every mutating endpoint (Zod/Joi) before it reaches a service.
- **Business logic lives in `/services`**, not in controllers or route handlers — controllers only parse req/format res.
- **Database writes that affect availability (holds, bookings) must go through `services/availability.service.ts` / `services/booking.service.ts`** — never write directly to `holds`/`bookings` from a controller, since the double-booking guard (see `database.md` §4) depends on consistent handling of the partial unique indexes and error codes.
- **Stripe webhook is the only place that confirms a payment** — never mark a booking `confirmed` from a client-triggered endpoint.
- **All new endpoints must be added to `api.md`** in the same change.
- **All new/changed collections or indexes must be reflected in `database.md`.**
- **Naming:** REST routes are plural nouns (`/restaurants`, `/bookings`); Mongoose models are singular PascalCase (`Restaurant`, `Booking`).

---

## 7. Testing Expectations

- Unit test services, especially `availability.service.ts` (concurrency/hold logic) and `analytics.service.ts` (aggregation correctness).
- Integration test the hold → payment webhook → confirmed booking flow end-to-end against a test Mongo instance.
- Do not skip tests for the double-booking guard — this is the core reliability guarantee of the product (NFR-4 in `requirements.md`).

---

## 8. What NOT to Do

- Don't process real payments — Stripe test mode only.
- Don't store raw card data — use Stripe Elements/Checkout only.
- Don't bypass the `holds` collection to book a table directly — this breaks the availability guarantee.
- Don't hardcode restaurant-specific values (fees, cancellation windows) — these are per-restaurant fields (`database.md` §2.3).
- Don't build UI ad hoc — check `design.md` for the screen/component inventory and existing design tokens first, since screens originate in Stitch.

---

## 9. Open Questions (carried from PRD.md — confirm before building the related feature)

- Refund policy automation vs. manual staff action.
- OAuth timing (MVP vs v1.1).
- SMS reminders timing (MVP vs v1.1).

If you're an agent picking up a task touching these areas, flag the open question to the user rather than assuming.
