# Design Document
## Restaurant Table Booking System — UI built with Stitch

This doc lists the screens, flows, and design tokens needed to design this product in **Stitch** (Google's AI UI design tool) and hand it off to engineering as React components. Treat each "Screen" heading below as one Stitch prompt/frame; keep naming consistent so exported components map 1:1 to `/src/features/*` in `architecture.md`.

---

## 1. Product Surfaces (3 apps in 1 codebase)

1. **Diner web app** — search, book, pay, view QR, my bookings, reviews
2. **Restaurant owner dashboard** — desktop-first, table config, bookings, analytics
3. **Staff check-in view** — mobile/tablet-first, QR scanner + manual code

---

## 2. Design Tokens (define these first in Stitch, reuse everywhere)

| Token | Suggestion |
|---|---|
| Primary color | Deep terracotta / warm red (appetite-associated, differentiates from generic blue SaaS) |
| Secondary color | Charcoal / deep green accent |
| Success (present/confirmed) | Green |
| Warning (hold expiring) | Amber |
| Error (no-show/failed) | Red |
| Font — headings | A confident serif or semi-bold geometric sans (restaurant/hospitality feel) |
| Font — body | Clean sans-serif, high legibility at small sizes (staff will read this on a phone in low light) |
| Corner radius | Medium-large (12–16px) — friendly, modern |
| Spacing scale | 4/8/12/16/24/32 |

Keep the **diner app** warm/inviting; keep the **staff check-in view** high-contrast and large-tap-target (it's used quickly, often one-handed, at a host stand).

---

## 3. Screen List by Surface

### 3.1 Diner App
1. **Landing / Search** — location input, date/time/party-size picker, filter chips (cuisine, ambiance, dietary), restaurant result cards (photo, name, cuisine, ambiance badge, distance, rating, booking fee).
2. **Restaurant Detail** — hero photo, description, dietary/ambiance badges, table/time picker (only real available slots shown), map, reviews (v1.1).
3. **Booking Checkout** — selected slot summary, party size, hold countdown timer (visible, e.g. "Reserved for 9:42"), payment form (Stripe Elements), total.
4. **Booking Confirmation** — success state, large QR code, booking code, "Add to calendar," restaurant address/directions link, cancellation policy text.
5. **My Bookings** — upcoming (with QR access) / past (with "leave a review" CTA, v1.1) tabs.
6. **Payment Failed / Retry** — clear error, remaining hold time, retry button.
7. **Auth** — login, register, forgot password.

### 3.2 Restaurant Owner Dashboard
8. **Onboarding / Registration** — multi-step: profile → address/hours → ambiance/dietary tags → table configuration (add table groups: capacity × count) → booking fee/cancellation policy.
9. **Dashboard Home** — today's bookings timeline, live table status grid (available / held / occupied / present), quick stats (bookings today, no-show rate, revenue today).
10. **Bookings List/Calendar** — filter by date/status, manual cancel/reassign.
11. **Table Management** — edit table groups, deactivate a table.
12. **Analytics Dashboard** — turnover-by-hour chart, peak-hours heatmap, revenue trend line chart, avg party size / lead time stat cards, popular cuisine/ambiance breakdown, staffing recommendation panel (framed as a suggestion, not a mandate).
13. **Staff Management** — invite/manage host/manager accounts, roles.
14. **(v1.1) Multi-location switcher** — org-level view aggregating locations.

### 3.3 Staff Check-in View (mobile/tablet)
15. **Check-in Home** — big "Scan QR" button + manual code entry field, today's booking count.
16. **Scanner** — full-screen camera view, large success/error feedback (color + icon + haptic-style visual pulse).
17. **Manual Entry** — numeric/alphanumeric code pad, submit.
18. **Confirmation Toast/State** — party name, size, table assigned, "Seated ✓" with undo (in case of mis-scan).
19. **No-show list** — end-of-night list of unconfirmed bookings to mark no-show.

---

## 4. Key UI/UX Rules

- **Availability guarantee visibility:** Anywhere a slot is selected but not yet paid, show the countdown timer prominently (component: `HoldCountdown`) so diners understand why speed matters — this reflects the 10-minute hold in `architecture.md`.
- **Never show a slot in search results that isn't truly bookable** — search screen and restaurant-detail screen must call the same availability logic (`GET /search/restaurants`, `GET /restaurants/:id/availability`) so there's no bait-and-switch.
- **QR code is the hero of the confirmation screen** — large, high-contrast, downloadable/screenshot-friendly, also emailed.
- **Staff scanner must work one-handed in low light** — large tap targets (min 44px), strong color feedback (green flash = success, red = error), minimal text.
- **Dashboard analytics should lead with the "so what," not just the number** — e.g., pair "Peak hours: Fri/Sat 7–9pm" with the staffing recommendation card right next to it.
- **Mobile-responsive throughout** (NFR-12 in `requirements.md`) — design each screen mobile-first in Stitch, then adapt to desktop for the owner dashboard specifically (dashboard benefits from wider layouts: side-nav + multi-column stat cards).

---

## 5. Component Inventory (for React implementation after Stitch export)

Reusable components to extract from Stitch frames:
`RestaurantCard`, `FilterChipGroup`, `SlotPicker`, `HoldCountdown`, `QRDisplay`, `BookingStatusBadge`, `TableStatusGrid`, `StatCard`, `TrendChart` (wraps a charting lib), `HeatmapGrid`, `Scanner`, `CodeEntryPad`, `Toast/ConfirmationBanner`, `RoleGuardedNav`.

Map each 1:1 to a folder in `/src/components` so design handoff stays traceable.

---

## 6. Handoff Workflow (Stitch → React)

1. Design each screen in Stitch using the tokens in §2.
2. Export Stitch output (HTML/CSS or React+Tailwind, depending on Stitch's export mode).
3. Drop exported markup into the matching `/src/features/<surface>/<Screen>.tsx`, replacing static content with props/data from the API (`api.md`) and Socket.io events where relevant (live table status, hold countdown).
4. Wire up client-side validation and loading/error states (Stitch exports are static — these must be added).
5. Verify responsiveness at 375px (mobile), 768px (tablet, staff view), 1280px+ (owner dashboard).
