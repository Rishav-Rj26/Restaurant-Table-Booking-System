# Requirements Specification
## Restaurant Table Booking System

This document breaks the PRD into testable functional (FR) and non-functional (NFR) requirements. Each FR maps to endpoints in `api.md` and collections in `database.md`.

---

## 1. Functional Requirements

### 1.1 Authentication & Accounts
- **FR-1.1** System supports two account types: `user` (diner) and `restaurant_owner`/`staff`.
- **FR-1.2** Users register/login via email + password (bcrypt-hashed, JWT session).
- **FR-1.3** Passwords must be ≥8 chars; reset-password flow via emailed token.
- **FR-1.4** Restaurant staff accounts are scoped to one or more restaurants (role: `owner`, `manager`, `host`).
- **FR-1.5** (v1.1) OAuth login (Google) as an alternative to email/password.

### 1.2 Restaurant Registration & Management
- **FR-2.1** Restaurant owner can register a restaurant with: name, address (with geocoordinates), cuisine type(s), contact info, ambiance type, dietary options offered.
- **FR-2.2** Owner can define table configuration: table groups by seating capacity and count (e.g., 4 tables of 2, 6 tables of 4).
- **FR-2.3** Owner can edit table configuration, restaurant profile, and operating hours.
- **FR-2.4** Owner can view/manage upcoming bookings in a dashboard (list + calendar/timeline view).
- **FR-2.5** Owner can manually cancel or modify a booking (e.g., reassign table).
- **FR-2.6** System supports multiple staff accounts per restaurant with role-based permissions.

### 1.3 Search & Discovery
- **FR-3.1** Users can search restaurants by location (radius from a point or city), cuisine, ambiance, and dietary options.
- **FR-3.2** Users can filter by date, time, and party size; results show **only** restaurants with a table that can be held for that slot.
- **FR-3.3** Availability check must be real-time and consistent — a table shown as available must remain reservable through checkout unless the hold expires.
- **FR-3.4** Search results show restaurant rating (v1.1), price range indicator (booking fee), and thumbnail.

### 1.4 Booking Flow
- **FR-4.1** User selects a restaurant, date/time, and party size, then is shown specific available tables/slots.
- **FR-4.2** Selecting a slot creates a temporary **hold** (default TTL: 10 minutes) preventing other users from booking the same table/slot.
- **FR-4.3** User pays a booking fee (Stripe test mode, e.g., $5) to confirm the booking.
- **FR-4.4** On payment success: booking status → `confirmed`; a unique booking code is generated (format `XX-RESTAURANTSLUG-XXXX`); a QR code encoding `{bookingId, bookingCode}` is generated.
- **FR-4.5** On payment failure: hold is released (or retry allowed within TTL); user sees an actionable error.
- **FR-4.6** Confirmation email sent with booking details, QR code image, and cancellation link/policy.
- **FR-4.7** Held-but-unpaid bookings auto-expire and release the table after TTL.
- **FR-4.8** Users can cancel a confirmed booking; refund logic follows the restaurant's cancellation policy (time-based).

### 1.5 Verification / Check-in
- **FR-5.1** Staff can scan a booking's QR code via a mobile-friendly camera page.
- **FR-5.2** Staff can manually enter the booking code as a fallback.
- **FR-5.3** On successful verification: booking status → `present`; table status updates in real time on the dashboard (all connected staff clients see the update, e.g. via WebSocket).
- **FR-5.4** Duplicate or invalid code scans return a clear error and do not alter table state.
- **FR-5.5** At end of service window (or manually), unconfirmed bookings can be marked `no_show`.

### 1.6 Analytics & Reporting (Restaurant Dashboard)
- **FR-6.1** Table turnover rate by time slot and day.
- **FR-6.2** Peak booking hours/days (heatmap or bar chart data).
- **FR-6.3** Revenue analytics: booking-fee revenue, revenue per table/hour, trend over time.
- **FR-6.4** Average party size and average booking-to-arrival lead time.
- **FR-6.5** Popular cuisine/ambiance/dietary preferences among bookers.
- **FR-6.6** No-show rate and attendance rate reporting.
- **FR-6.7** Staffing recommendation: derived heuristic (e.g., recommended host/server count per hour block based on historical booking density) — clearly labeled as a heuristic, not a guarantee.

### 1.7 Add-on Features (v1.1+)
- **FR-7.1** Users can rate/review a restaurant after a `present` booking is closed.
- **FR-7.2** Email (and later SMS) reminders sent N hours before a booking.
- **FR-7.3** Waitlist: if no table is available, user can join a waitlist and is notified if a slot opens (via cancellation).
- **FR-7.4** Multi-location: an owner account can manage multiple restaurant documents under one brand/organization; analytics can be viewed per-location or aggregated.

---

## 2. Non-Functional Requirements

### 2.1 Performance
- **NFR-1** Search/availability queries return in < 500ms p95 for a metro-area query.
- **NFR-2** Analytics dashboard queries return in < 2s for a 90-day window (pre-aggregated where needed).
- **NFR-3** System supports at least 100 concurrent bookings/sec at target scale (design goal, not load-tested in MVP).

### 2.2 Consistency & Correctness
- **NFR-4** No two confirmed bookings may occupy the same table for overlapping time windows (enforced via atomic hold + unique index, see `database.md` §Concurrency).
- **NFR-5** Payment and booking-confirmation must be consistent: a booking is never `confirmed` without a successful payment record, and never charges without eventually reaching `confirmed` or `refunded`.

### 2.3 Security
- **NFR-6** All passwords hashed (bcrypt, cost ≥ 10); JWTs signed, short-lived access token + refresh token.
- **NFR-7** All payment handling via Stripe (test mode); no raw card data touches our servers (Stripe Elements/Checkout).
- **NFR-8** Role-based access control enforced server-side on every restaurant-management and staff endpoint.
- **NFR-9** Rate limiting on auth and booking endpoints to prevent abuse/scraping.

### 2.4 Availability & Reliability
- **NFR-10** Expired holds are reliably released (TTL index or scheduled job) even if the server restarts.
- **NFR-11** Email delivery failures are retried/queued and do not block booking confirmation to the user in-app.

### 2.5 Usability
- **NFR-12** Fully responsive UI (mobile, tablet, desktop) — required since the check-in flow is typically used on a phone/tablet at the host stand.
- **NFR-13** Check-in flow (scan → confirmed) completes in ≤ 3 user actions.

### 2.6 Maintainability
- **NFR-14** TypeScript across backend; typed API contracts shared or documented (`api.md`).
- **NFR-15** Environment-based config (no secrets in source); `.env` documented in `AGENTS.md`.

## 3. Traceability Summary

| Requirement group | Primary API endpoints | Primary DB collections |
|---|---|---|
| Auth | `/auth/*` | `users`, `staff` |
| Restaurant mgmt | `/restaurants/*` | `restaurants`, `tables` |
| Search | `/search/restaurants` | `restaurants`, `tables`, `bookings` |
| Booking | `/bookings/*`, `/payments/*` | `bookings`, `holds`, `payments` |
| Check-in | `/checkin/*` | `bookings`, `tables` |
| Analytics | `/analytics/*` | `bookings`, `payments`, `restaurants` |
| Reviews | `/reviews/*` | `reviews` |
