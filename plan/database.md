# Database Design (MongoDB)
## Restaurant Table Booking System

Database: **MongoDB** (Mongoose ODM). Collections below are documents with embedded sub-documents where data is always read/written together, and references (`ObjectId`) where entities are large, independently queried, or many-to-many.

---

## 1. Collections Overview

| Collection | Purpose |
|---|---|
| `users` | Diner accounts |
| `staff` | Restaurant owner/manager/host accounts |
| `restaurants` | Restaurant profile, ambiance, dietary options, location |
| `tables` | Individual table units (capacity, restaurant ref) |
| `holds` | Temporary reservation locks pending payment (TTL) |
| `bookings` | Confirmed reservations |
| `payments` | Payment/transaction records (Stripe) |
| `reviews` | Post-visit ratings (v1.1) |
| `waitlist` | Waitlist entries (v1.1) |

---

## 2. Schemas

### 2.1 `users`
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,          // null if OAuth-only
  oauth: { provider: String, providerId: String }, // v1.1
  phone: String,
  preferences: {
    cuisines: [String],
    dietary: [String],           // e.g. ["vegan","gluten_free"]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 `staff`
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ["owner", "manager", "host"] },
  restaurants: [ObjectId],       // ref -> restaurants._id (multi-location support)
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 `restaurants`
```js
{
  _id: ObjectId,
  name: String,
  slug: { type: String, unique: true, index: true }, // used in booking codes
  ownerId: ObjectId,             // ref -> staff._id
  address: {
    line1: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    location: {                  // GeoJSON for geo search
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number]      // [lng, lat]
    }
  },
  contact: { phone: String, email: String },
  cuisineTypes: [String],        // ["Italian","Indian",...]
  ambiance: { type: String, enum: ["fine_dining","casual","family_friendly","cafe","bar"] },
  dietaryOptions: [String],      // ["vegetarian","vegan","gluten_free","halal","kosher"]
  operatingHours: [
    { day: Number, openTime: String, closeTime: String } // day: 0-6
  ],
  bookingFee: { amount: Number, currency: { type: String, default: "usd" } },
  cancellationPolicy: { hoursBeforeForRefund: Number },
  photos: [String],              // URLs
  ratingAvg: { type: Number, default: 0 },   // denormalized from reviews
  ratingCount: { type: Number, default: 0 },
  status: { type: String, enum: ["active","pending","suspended"], default: "pending" },
  createdAt: Date,
  updatedAt: Date
}
// Indexes:
// - { "address.location": "2dsphere" }  (geo search)
// - { cuisineTypes: 1, ambiance: 1, dietaryOptions: 1 }
// - { slug: 1 } unique
```

### 2.4 `tables`
```js
{
  _id: ObjectId,
  restaurantId: { type: ObjectId, index: true },
  label: String,                 // "T-12"
  capacity: Number,              // seats
  isActive: { type: Boolean, default: true }
}
// Indexes: { restaurantId: 1, capacity: 1 }
```

> Design note: individual `tables` (not just counts) are modeled as documents so a specific table can be locked/held/booked for a specific slot — this is what makes the "no double-booking" guarantee enforceable via a unique index (see §4).

### 2.5 `holds` (temporary, TTL-expired)
```js
{
  _id: ObjectId,
  tableId: { type: ObjectId, index: true },
  restaurantId: ObjectId,
  userId: ObjectId,
  slotStart: Date,               // reservation start datetime
  slotEnd: Date,
  partySize: Number,
  status: { type: String, enum: ["pending","converted","expired"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date                // createdAt + 10 min
}
// Indexes:
// - { expiresAt: 1 }, { expireAfterSeconds: 0 }   -> TTL auto-delete
// - UNIQUE compound: { tableId: 1, slotStart: 1, status: 1 }
//   partial filter: { status: "pending" }
//   -> prevents two concurrent pending holds on same table/slot
```

### 2.6 `bookings`
```js
{
  _id: ObjectId,
  bookingCode: { type: String, unique: true, index: true }, // "LA-BISTRO-8F3K"
  qrCodeUrl: String,             // generated QR image (stored or data URL)
  userId: { type: ObjectId, index: true },
  restaurantId: { type: ObjectId, index: true },
  tableId: ObjectId,
  slotStart: Date,
  slotEnd: Date,
  partySize: Number,
  status: {
    type: String,
    enum: ["confirmed","present","no_show","cancelled","refunded"],
    default: "confirmed",
    index: true
  },
  paymentId: ObjectId,           // ref -> payments._id
  checkedInAt: Date,
  cancelledAt: Date,
  source: { type: String, enum: ["web","mobile"], default: "web" },
  createdAt: Date,
  updatedAt: Date
}
// Indexes:
// - UNIQUE compound: { tableId: 1, slotStart: 1 } (partial: status in [confirmed, present])
//   -> the authoritative double-booking guard once a hold converts to a booking
// - { restaurantId: 1, slotStart: 1 }  -> dashboard / analytics queries
// - { userId: 1, slotStart: -1 }       -> "my bookings"
```

### 2.7 `payments`
```js
{
  _id: ObjectId,
  bookingId: { type: ObjectId, index: true },
  holdId: ObjectId,
  userId: ObjectId,
  restaurantId: ObjectId,
  stripePaymentIntentId: { type: String, unique: true },
  amount: Number,
  currency: String,
  status: { type: String, enum: ["pending","succeeded","failed","refunded"], index: true },
  failureReason: String,
  refundedAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.8 `reviews` (v1.1)
```js
{
  _id: ObjectId,
  restaurantId: { type: ObjectId, index: true },
  userId: ObjectId,
  bookingId: ObjectId,           // must reference a "present" booking
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: Date
}
// Indexes: { restaurantId: 1, createdAt: -1 }
```

### 2.9 `waitlist` (v1.1)
```js
{
  _id: ObjectId,
  restaurantId: ObjectId,
  userId: ObjectId,
  desiredSlotStart: Date,
  partySize: Number,
  status: { type: String, enum: ["waiting","notified","expired","booked"] },
  createdAt: Date
}
```

---

## 3. Entity Relationship Summary

```
staff (1) ───< restaurants (M)     [ownerId / staff.restaurants[]]
restaurants (1) ───< tables (M)
restaurants (1) ───< bookings (M)
tables (1) ───< holds (M, transient)
tables (1) ───< bookings (M)
users (1) ───< bookings (M)
bookings (1) ─── payments (1)
restaurants (1) ───< reviews (M)
```

## 4. Concurrency & Double-Booking Prevention (critical design detail)

MongoDB doesn't have SQL-style table locks, so uniqueness is enforced via **partial unique indexes**:

```js
// holds collection
db.holds.createIndex(
  { tableId: 1, slotStart: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

// bookings collection
db.bookings.createIndex(
  { tableId: 1, slotStart: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["confirmed","present"] } } }
);
```

Flow: creating a `hold` is a single `insertOne` — if a pending hold already exists for that `{tableId, slotStart}`, MongoDB rejects the duplicate with `E11000`, which the API translates into a "slot no longer available" response. The same pattern guards the `hold → booking` conversion. This removes the need for external distributed locks (e.g., Redis) for MVP scale.

## 5. Seed / Reference Data

- `cuisineTypes`, `ambiance`, `dietaryOptions` are free-text-controlled enums maintained in app config (`/src/config/constants.ts`), not separate collections, since they're small and rarely change. If they grow, promote to a `tags` collection.

## 6. Analytics Query Notes

Aggregation pipelines (examples, implemented in `analytics.service.ts`):
- **Turnover by time slot:** `$match` restaurantId+dateRange → `$group` by hour-of-day → count bookings, avg duration.
- **Revenue trend:** `$match` payments succeeded → `$group` by day → sum `amount`.
- **No-show rate:** `$group` by status → ratio `no_show` / total.
- **Popular preferences:** `$group` bookings by `partySize`/joined restaurant `cuisineTypes`.

For MVP these run on-demand; if latency becomes an issue, add a nightly job writing to `analytics_daily` (documented in `architecture.md` §4.3 as a future optimization).
