# Architecture Document
## Restaurant Table Booking System

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **React** (Vite) + TypeScript | Screens designed in **Stitch**, exported and wired into React components. Tailwind CSS for styling (Stitch exports Tailwind-friendly markup). |
| Backend | **Node.js + Express + TypeScript** | REST API, layered architecture (routes → controllers → services → models). |
| Database | **MongoDB** (Atlas or self-hosted) + **Mongoose** ODM | Document model fits nested restaurant/table config well; see `database.md`. |
| Real-time | **Socket.io** | Table-status and dashboard live updates. |
| Payments | **Stripe** (test mode), Stripe Checkout or Elements | No card data touches our server. |
| Auth | **JWT** (access + refresh tokens), bcrypt | Role-based middleware. |
| QR Codes | `qrcode` (Node) to generate, a browser camera lib (e.g. `html5-qrcode`) to scan | |
| Email | Nodemailer + a transactional provider (e.g. SMTP/SendGrid), test mode = Ethereal/console in dev | |
| Caching/Locking | MongoDB TTL index + `findOneAndUpdate` atomic ops for holds (Redis optional upgrade, not required for MVP) | |
| Hosting (suggested) | Frontend: Vercel/Netlify. Backend: Render/Railway/Fly.io. DB: MongoDB Atlas. | Not prescriptive — any Node-friendly host works. |

## 2. High-Level Architecture

```
                        ┌─────────────────────────┐
                        │        React SPA         │
                        │  (Stitch-designed UI)     │
                        │  - Diner app              │
                        │  - Restaurant dashboard    │
                        │  - Staff check-in view     │
                        └────────────┬─────────────┘
                                     │ HTTPS (REST) + WSS (Socket.io)
                                     ▼
                        ┌─────────────────────────┐
                        │       Express API         │
                        │  ┌─────────────────────┐  │
                        │  │ Routes / Controllers │  │
                        │  ├─────────────────────┤  │
                        │  │  Services (business  │  │
                        │  │  logic: booking hold,│  │
                        │  │  availability, etc.) │  │
                        │  ├─────────────────────┤  │
                        │  │  Mongoose Models      │  │
                        │  └─────────────────────┘  │
                        │  Middleware: auth, RBAC,  │
                        │  rate-limit, validation   │
                        └───┬───────────┬────────┬──┘
                            │           │        │
                 ┌──────────▼──┐ ┌──────▼───┐ ┌──▼─────────┐
                 │  MongoDB     │ │  Stripe   │ │  Email      │
                 │  (Atlas)     │ │  API      │ │  Provider   │
                 └──────────────┘ └───────────┘ └─────────────┘
```

## 3. Module Breakdown (Backend)

```
/src
  /config          # env, db connection, stripe init, socket init
  /models          # Mongoose schemas (see database.md)
  /routes          # thin route definitions per resource
  /controllers     # request/response handling, calls services
  /services        # booking.service.ts, availability.service.ts,
                    # payment.service.ts, analytics.service.ts,
                    # qrcode.service.ts, email.service.ts
  /middleware      # auth.ts, rbac.ts, validate.ts, rateLimit.ts
  /jobs            # holdExpiry.job.ts (or rely on Mongo TTL index),
                    # reminder.job.ts (v1.1)
  /sockets         # table-status namespace, dashboard namespace
  /utils           # bookingCode generator, date/time helpers
  /types           # shared TS types/interfaces
  app.ts
  server.ts
```

## 4. Key Flows

### 4.1 Availability & Booking Hold (prevents double-booking)
1. User submits search (date, time, party size, filters) → API queries `restaurants`/`tables`, excluding tables with an overlapping **active** booking or **unexpired** hold for that slot.
2. User selects a slot → API creates a `hold` document (`status: pending`, `expiresAt: now + 10min`) via an atomic `findOneAndUpdate`/insert with a **unique compound index** on `{table, dateSlot}` for active holds/bookings — this is what makes the guarantee safe under concurrency.
3. Client proceeds to payment (Stripe) referencing the `holdId`.
4. Stripe webhook (`payment_intent.succeeded`) → `payment.service` marks payment `succeeded`, converts the `hold` into a `booking` with `status: confirmed`, generates booking code + QR, triggers `email.service`.
5. If payment fails or the hold TTL expires first, the hold is deleted/expired (MongoDB TTL index) and the table becomes searchable again.

This hold→payment→confirm sequence is the mechanism behind the "availability guarantee" and the "no double-booking" NFR.

### 4.2 Check-in / Verification
1. Staff opens check-in page (mobile-friendly), scans QR (client-side decode) or types the code.
2. Client sends `{bookingCode}` to `/checkin/verify`.
3. Server validates booking exists, belongs to this restaurant, status is `confirmed`, and date/time is today → sets `status: present`, `checkedInAt: now`.
4. Server emits a Socket.io event on the restaurant's room (`restaurant:{id}:tables`) so all staff dashboards update table status live.

### 4.3 Analytics
- MVP: computed on-demand via MongoDB aggregation pipelines over `bookings`/`payments`, scoped by restaurant + date range.
- If data volume grows, add a scheduled job to pre-aggregate daily rollups into an `analytics_daily` collection (documented as a future optimization, not required for MVP).

## 5. Frontend Architecture

- **Stitch** is used as the UI design tool: screens/flows are designed there first (see `design.md` for the screen list and design tokens), then exported as HTML/CSS or React+Tailwind and adapted into the app's component library.
- App structure:
  ```
  /src
    /app            # routing, layout shells (Diner / Owner / Staff)
    /features
      /auth
      /search
      /booking
      /checkin
      /dashboard
      /analytics
    /components      # shared UI (Button, Card, Modal, QRDisplay...)
    /hooks
    /services        # api client (fetch/axios wrapper), socket client
    /types
  ```
- Three "surfaces" in one SPA, gated by role/route: **Diner app**, **Restaurant owner dashboard**, **Staff check-in view** (optimized for mobile/tablet).
- State: React Query (or SWR) for server state/caching; lightweight local state (Zustand/Context) for UI state such as the active booking-hold countdown timer.

## 6. Concurrency & Data Integrity Notes

- Table-slot uniqueness enforced at the **database layer** (unique index), not just app logic, so race conditions under load can't create overlapping bookings.
- Holds have a hard TTL; UI shows a countdown so users understand the guarantee window.
- Stripe webhooks are the source of truth for payment status (not just client-side confirmation), to avoid trusting the browser.

## 7. Security Notes

- JWT access token (short TTL, e.g., 15 min) + refresh token (httpOnly cookie).
- RBAC middleware checks `req.user.role` and restaurant ownership/staff-membership before allowing restaurant-scoped writes.
- Input validation (e.g., Zod or Joi) on every mutating endpoint.
- Stripe webhook signature verification required.

## 8. Environments

- `local` — Mongo via Docker, Stripe test keys, console/Ethereal email.
- `staging` — Atlas dev cluster, Stripe test keys.
- `production` (out of scope for this challenge) — Atlas prod cluster, Stripe live keys.

Environment variables are documented in `AGENTS.md`.
