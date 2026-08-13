# Product Requirements Document (PRD)
## Restaurant Table Booking System

**Version:** 1.0
**Status:** Draft
**Owner:** Product

---

## 1. Problem Statement

Restaurants lose revenue to no-shows and have no easy way to forecast demand or staff accordingly. Diners struggle to find restaurants with real, guaranteed availability that also matches their preferences (cuisine, ambiance, dietary needs). There is no lightweight, guaranteed-booking system that connects a paid reservation to a fast, low-friction attendance check-in.

This product solves three problems at once:
1. **Restaurants** get a dashboard to manage tables and see actionable analytics (turnover, peak hours, revenue, staffing).
2. **Diners** get guaranteed table availability, filtered search, and a simple pay-to-book flow with a QR confirmation.
3. **Front-of-house staff** get a fast QR/code-based check-in flow that reduces no-shows (via a paid, non-refundable-by-default booking fee) and produces attendance reporting.

## 2. Goals & Non-Goals

### Goals
- Let restaurants register, configure tables, and manage bookings.
- Let users search/filter restaurants by location, cuisine, ambiance, dietary options, date/time, and party size, and see only **confirmed-available** tables.
- Let users pay a small booking fee (test-mode Stripe) to guarantee a table.
- Issue a unique booking code + QR code per booking, emailed to the user.
- Let restaurant staff verify attendance via QR scan or manual code entry, in real time.
- Provide restaurant owners with an analytics dashboard (turnover, peak hours, revenue, staffing recommendations, customer preferences).
- Support reviews, notifications, waitlists, and multi-location chains as secondary (v1.1) features.

### Non-Goals (v1)
- Native mobile apps (mobile-responsive web only).
- Full POS / kitchen management integration.
- Dynamic/surge pricing engine (only "recommendations," not automated pricing).
- Multi-currency / multi-language support.
- Production-grade payment processing (test mode only for this challenge).

## 3. Target Users / Personas

| Persona | Description | Key Needs |
|---|---|---|
| **Diner (Dana)** | Wants a table tonight for 4, gluten-free options, casual ambiance | Fast filtered search, guaranteed availability, simple payment, easy check-in |
| **Restaurant Owner (Omar)** | Manages a mid-size restaurant, wants fewer no-shows and better staffing | Dashboard, analytics, table config, no-show reports |
| **Host/Staff (Hana)** | Front desk, needs to seat guests quickly | QR scanner, manual code fallback, real-time table status |
| **Chain Manager (Chris)** | Manages multiple locations under one brand | Multi-location dashboard, cross-location analytics (v1.1) |

## 4. User Stories (high priority, MVP)

- As a diner, I can search restaurants by date, time, party size, cuisine, ambiance, and dietary filters, and only see options with real availability.
- As a diner, I can select a table, pay a booking fee, and receive a booking code + QR code by email and in-app.
- As a diner, I can view my upcoming and past bookings.
- As a restaurant owner, I can register my restaurant and configure my tables (size, count).
- As a restaurant owner, I can view a dashboard of today's bookings and table status.
- As a restaurant owner, I can view analytics: turnover rate, peak hours, revenue, average party size, no-show rate.
- As staff, I can scan a QR code (or type a code) to mark a booking "Present" and free/occupy the table in real time.
- As a diner, I receive an email confirmation with my QR code after payment succeeds.
- As a diner, if payment fails, I am shown a clear error and can retry.

## 5. Functional Scope (maps to detailed requirements.md)

1. Restaurant registration & table/profile management
2. Restaurant analytics dashboard
3. User auth (email/password; OAuth optional v1.1)
4. Search & filter with real-time availability guarantee
5. Booking flow with Stripe test-mode payment
6. Booking code + QR code generation and email delivery
7. QR/manual check-in verification, real-time table status
8. No-show / attendance reporting
9. (v1.1) Reviews, notifications, waitlist, multi-location

## 6. Success Metrics

- Booking completion rate (search → paid booking) > 60% in usability testing
- Check-in flow takes < 10 seconds per guest (scan-to-confirm)
- Dashboard analytics load in < 2s for a 90-day window
- No double-booked tables (0% overlap defect rate in QA)

## 7. Key Constraints & Assumptions

- Payments: Stripe **test mode** only; no real money moves.
- Database: **MongoDB** (documented in `database.md`).
- UI screens are designed in **Stitch** and implemented as React components (see `design.md`).
- "Availability guarantee" means the system uses a locking/reservation-hold mechanism so a table shown as available cannot be double-booked before payment completes (see `architecture.md`).

## 8. Release Plan

| Phase | Scope |
|---|---|
| **MVP (v1.0)** | Sections 1–8 of Functional Scope (core booking loop end-to-end) |
| **v1.1** | Reviews, notifications, waitlist |
| **v1.2** | Multi-location chain support |

## 9. Open Questions

- Do booking fees get refunded automatically on cancellation, or only manually by restaurant staff? (Default assumed: refundable up to N hours before booking, configurable per restaurant — confirm.)
- Should OAuth (Google) be MVP or v1.1? (Assumed v1.1.)
- Do we need SMS (Twilio) in MVP, or is email sufficient? (Assumed email-only for MVP, SMS in v1.1.)
