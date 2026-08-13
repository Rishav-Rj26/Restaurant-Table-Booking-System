# API Specification
## Restaurant Table Booking System

Base URL: `/api/v1`
Auth: `Authorization: Bearer <accessToken>` unless marked public.
Content type: `application/json` unless noted.

---

## 1. Auth

### `POST /auth/register` (public)
Register a diner.
```json
// Request
{ "name": "Dana Lee", "email": "dana@example.com", "password": "••••••••" }
// Response 201
{ "user": { "id": "...", "name": "Dana Lee", "email": "dana@example.com" },
  "accessToken": "...", "refreshToken": "..." }
```

### `POST /auth/login` (public)
```json
{ "email": "dana@example.com", "password": "••••••••" }
```

### `POST /auth/refresh` (public, cookie or body refreshToken)
Returns a new access token.

### `POST /auth/logout`
Invalidates refresh token.

### `POST /auth/staff/register` (public, restaurant onboarding)
```json
{ "name": "Omar", "email": "omar@bistro.com", "password": "••••••••", "role": "owner" }
```

### `POST /auth/staff/login` (public)

---

## 2. Restaurants

### `POST /restaurants` (auth: staff/owner)
Create restaurant profile.
```json
{
  "name": "LA Bistro",
  "address": { "line1": "...", "city": "Los Angeles", "state": "CA", "zip": "90001",
               "country": "US", "lat": 34.05, "lng": -118.24 },
  "contact": { "phone": "...", "email": "..." },
  "cuisineTypes": ["French","Italian"],
  "ambiance": "fine_dining",
  "dietaryOptions": ["vegetarian","gluten_free"],
  "operatingHours": [{ "day": 1, "openTime": "17:00", "closeTime": "23:00" }],
  "bookingFee": { "amount": 5, "currency": "usd" },
  "tables": [ { "label": "T-1", "capacity": 2 }, { "label": "T-2", "capacity": 4 } ]
}
```
Response `201`: restaurant object + created `tables`.

### `GET /restaurants/:id` (public)
Full restaurant profile (no table-level availability — use `/search` or `/restaurants/:id/availability`).

### `PATCH /restaurants/:id` (auth: owner/manager of that restaurant)
Partial update of profile fields.

### `GET /restaurants/:id/tables` (auth: staff of that restaurant)
List table configuration.

### `POST /restaurants/:id/tables` (auth: owner/manager)
Add a table. `{ "label": "T-10", "capacity": 6 }`

### `PATCH /restaurants/:id/tables/:tableId` (auth: owner/manager)
Edit/deactivate a table.

### `GET /restaurants/:id/availability?date=&time=&partySize=` (public)
Returns available tables for that restaurant/slot (used on the restaurant detail page).
```json
{ "slots": [ { "tableId": "...", "capacity": 4, "slotStart": "...", "slotEnd": "..." } ] }
```

### `GET /restaurants/:id/bookings` (auth: staff) `?date=&status=`
Dashboard booking list.

---

## 3. Search

### `GET /search/restaurants` (public)
Query params: `lat, lng, radiusKm, date, time, partySize, cuisine[], ambiance, dietary[], page, limit`

Returns only restaurants with **at least one confirmed-available table** for the given date/time/partySize (server checks `tables` minus active `bookings`/`holds`).

```json
{
  "results": [
    { "id": "...", "name": "LA Bistro", "cuisineTypes": ["French"], "ambiance": "fine_dining",
      "dietaryOptions": ["vegetarian"], "distanceKm": 1.2, "ratingAvg": 4.6,
      "bookingFee": { "amount": 5, "currency": "usd" }, "photo": "..." }
  ],
  "page": 1, "totalPages": 3
}
```

---

## 4. Bookings (Hold → Pay → Confirm)

### `POST /bookings/hold` (auth: user)
Creates a temporary hold on a specific table/slot.
```json
{ "restaurantId": "...", "tableId": "...", "slotStart": "2026-08-20T19:00:00Z", "partySize": 4 }
```
Response `201`:
```json
{ "holdId": "...", "expiresAt": "2026-08-20T18:10:00Z" }
```
`409` if the slot was just taken (`{"error": "slot_unavailable"}`).

### `POST /payments/intent` (auth: user)
Creates a Stripe PaymentIntent for a hold.
```json
{ "holdId": "..." }
```
Response:
```json
{ "clientSecret": "pi_..._secret_...", "amount": 5, "currency": "usd" }
```

### `POST /payments/webhook` (public, Stripe-signed)
Stripe webhook receiver. On `payment_intent.succeeded`:
- Converts hold → `bookings` doc (`status: confirmed`)
- Generates `bookingCode` + QR
- Creates `payments` doc (`status: succeeded`)
- Triggers confirmation email
- Emits `booking:confirmed` socket event to the restaurant room

On `payment_intent.payment_failed`: marks `payments` doc failed; hold remains until TTL so the user can retry.

### `GET /bookings/me` (auth: user)
List the logged-in user's bookings (`?status=upcoming|past`).

### `GET /bookings/:id` (auth: user, or staff of the restaurant)
Booking detail (includes QR code URL, restaurant info).

### `POST /bookings/:id/cancel` (auth: user or staff)
Cancels a `confirmed` booking; triggers refund per restaurant policy.
```json
{ "reason": "change_of_plans" }
```

---

## 5. Check-in / Verification

### `POST /checkin/verify` (auth: staff)
```json
{ "bookingCode": "LA-BISTRO-8F3K", "restaurantId": "..." }
```
Response `200`:
```json
{ "booking": { "id": "...", "status": "present", "partySize": 4, "tableLabel": "T-2" } }
```
Errors: `404 booking_not_found`, `409 already_checked_in`, `403 wrong_restaurant`, `410 expired_or_wrong_date`.

Also emits a socket event `table:status_changed` to `restaurant:{id}:tables`.

### `POST /checkin/no-show/:bookingId` (auth: staff)
Marks a booking `no_show` (e.g., run at end of service or manually).

---

## 6. Analytics (auth: staff of the restaurant)

### `GET /analytics/:restaurantId/overview?from=&to=`
```json
{
  "turnoverByHour": [ { "hour": 19, "avgTurnoverMinutes": 75, "bookings": 42 } ],
  "peakHours": [ { "day": "Fri", "hour": 19, "bookings": 58 } ],
  "revenue": { "total": 1240, "byDay": [ { "date": "2026-08-10", "amount": 85 } ] },
  "avgPartySize": 3.4,
  "avgLeadTimeHours": 26.5,
  "noShowRate": 0.06,
  "popularCuisinePreferences": [ { "cuisine": "Italian", "count": 120 } ],
  "staffingRecommendation": [ { "hour": 19, "recommendedHosts": 2, "recommendedServers": 5 } ]
}
```

---

## 7. Reviews (v1.1, auth: user)

### `POST /reviews`
```json
{ "bookingId": "...", "rating": 5, "comment": "Great service!" }
```
### `GET /restaurants/:id/reviews` (public)

---

## 8. Waitlist (v1.1, auth: user)

### `POST /waitlist`
```json
{ "restaurantId": "...", "desiredSlotStart": "...", "partySize": 2 }
```

---

## 9. WebSocket Events (Socket.io)

| Event | Room | Payload | Trigger |
|---|---|---|---|
| `booking:confirmed` | `restaurant:{id}:tables` | `{ bookingId, tableId, slotStart }` | Payment succeeds |
| `table:status_changed` | `restaurant:{id}:tables` | `{ tableId, status: "present"\|"available" }` | Check-in / booking end |
| `hold:expiring_soon` | `user:{id}` | `{ holdId, secondsLeft }` | 60s before hold TTL |

---

## 10. Standard Error Shape

```json
{ "error": { "code": "slot_unavailable", "message": "This table was just booked. Please choose another slot." } }
```

Common codes: `validation_error`, `unauthorized`, `forbidden`, `not_found`, `slot_unavailable`, `payment_failed`, `already_checked_in`.

## 11. Pagination Convention

List endpoints accept `page` (1-indexed) and `limit` (default 20, max 100), return `{ results, page, totalPages, totalCount }`.
