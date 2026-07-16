# Novo Backend — Architecture Reference

**For Claude sessions:** read this file first before exploring the codebase.
It exists so a new session doesn't need re-explaining from scratch. Trust it
for the modules marked ✅ Verified (read directly from source, current as of
the date in the Session Log). Modules marked ⬜ Not yet mapped haven't been
read closely — don't assume their behavior, go read the source before acting
on them.

**Maintenance rule:** after any material backend change, append a dated entry
to the **Session Log** at the bottom. Don't rewrite history above it — this
file grows forward, like a changelog. If a module's documented behavior
actually changes, update that module's section AND log the change.

Stack: **NestJS + Mongoose (MongoDB)**. Auth: JWT via Passport
(`JwtAuthGuard` for riders, `JwtAdminGuard` for admin). Payments: **Paystack**
(webhook-primary, manual-verify fallback). Local: `http://localhost:4000`.

**See also — `BACKEND.md`** (same folder): the maintainer-authored, canonical
doc for module inventory (live vs. legacy), ops/deployment, roadmap, and the
full endpoint map. Read that one for breadth. This file (`ARCHITECTURE.md`)
is the narrower, session-continuity companion — deep, source-verified notes
on the modules a session has actually worked in, plus the append-only
Session Log. When the two disagree, that's a real discrepancy to flag to the
user, not something to silently resolve either way — see §2's `city` entry
for a live example.

---

## 1. The NShuttle booking chain — how the core modules interact

This is the one flow worth understanding end-to-end before touching anything
in `city`, `schedule`, `shuttle-services`, or `payments`:

```
City (city module)
  Just a name+code lookup table. Codes are auto-generated: lowercase,
  first 3 letters of the name (e.g. "Lekki Phase 1" -> "lek").
  Referenced by CODE (not ObjectId) in Schedule.from / Schedule.to.

        │
        ▼
Schedule (schedule module) — a recurring bookable route+time
  One document = one route, one direction, one departure time, one price.
  A round trip is TWO Schedule documents (e.g. "lek-ber" and "ber-lek"),
  NOT one document with two legs — this was a deliberate decision, see
  Session Log 2026-07-09. Referenced by OBJECT ID in Shuttle.schedule.

        │  GET /schedules/routes   — public, all active, no date
        │  GET /schedules/search   — public, ?from&to&departureDate,
        │                            returns live `seatsAvailable` per result
        ▼
Shuttle (shuttle-services module) — "the booking" itself
  POST /shuttle-services/create (JwtAuthGuard) — creates a RESERVED booking
  inside a Mongo transaction: validates both schedules, checks live seat
  availability PER LEG, computes price server-side (never trusts the
  client), sets a 15-minute expiresAt lock.
  status: RESERVED -> PAID | EXPIRED | REFUND_PENDING -> REFUNDED | CANCELLED

        │  POST /payments/shuttle-services/:bookingId/initialize
        ▼
Payments (payments module) — Paystack integration
  initialize -> returns {reference, email, amount} for the Paystack popup.
  POST /payments/webhook is the AUTHORITATIVE confirmation path (Paystack
  calls us). GET /payments/verify/:reference is a manual fallback if the
  webhook is late/missed. Either path: marks Shuttle PAID, sends
  confirmation email + SMS to passengers, refunds late payments against
  expired bookings automatically.
```

**Key rule baked into this design:** seat availability is checked
independently per leg (outbound vs return), because outbound and return can
be different vehicles with different capacities/prices/schedules. Don't
"simplify" this into one shared check — it was already broken once that way
(see the bug-fix comment in `shuttle-services.service.ts`'s
`getAvailableSeats`) and fixed deliberately.

---

## 2. Module reference

### ✅ `city` — Verified 2026-07-09

> ⚠️ **Status conflict with `BACKEND.md`:** that doc lists `city` under
> "Legacy / overlapping — candidates for removal," described as "likely
> dead." It is **not dead** — `GET /cities` is what powers the NShuttle
> frontend's From/To city picker, confirmed live this session with real
> data (`lek`, `ber`, `lag`, `abj`, `enu`), and `Schedule.from`/`to`
> reference these codes directly. Flagged to the user 2026-07-09 — do not
> delete this module in any legacy-cleanup pass without re-confirming.

- **Schema** (`city/schema/city.schema.ts`): `name` (stored lowercase),
  `code` (auto-generated: lowercase, first 3 letters of name, collision-safe
  via numeric suffix), `isActive`.
- **Endpoints** (`city.controller.ts`):
  - `GET /cities` — public, active cities only.
  - `GET /cities/admin` — admin, all cities including inactive.
  - `POST /cities` — admin, create (code is server-generated, not
    client-supplied).
  - `PATCH /cities/:id` — admin, rename (code regenerates if name changes).
  - `PATCH /cities/:id/toggle` — admin, soft delete via isActive.
- **Gotcha:** frontend display names must be title-cased — the DB stores
  them lowercase.

### ✅ `schedule` — Verified 2026-07-09

- **Schema** (`schedule/schema/schedule.schema.ts`): `code` (unique),
  `name?` (display-only, e.g. "Lekki Phase 1 → Berger" — not required, don't
  assume it's always present), `from`/`to` (**city codes**, not names),
  `departureTime`, `capacity`, `basePrice`, `operatingDays` (MON..SUN),
  `vehicle?`, `vehicleImages: string[]` (can be empty — frontend falls back
  to a Bus-icon placeholder), `plans: SchedulePlan[]` (bookable bundles:
  `key`/`label`/`trips`/`price` — e.g. single/round/weekly/monthly),
  `isActive`.
- **Endpoints** (`schedule.controller.ts`):
  - `GET /schedules/routes` — public, all active schedules, no date context.
  - `GET /schedules/search?from&to&departureDate` — public. Filters by
    `operatingDays` matching that date's weekday. **Each result includes a
    live `seatsAvailable` field** (added 2026-07-09 — see below).
  - `POST /schedules` , `GET /schedules`, `PATCH /schedules/:id`,
    `PATCH /schedules/:id/toggle`, `DELETE /schedules/:id` — all
    `JwtAdminGuard`. `from`/`to` are immutable after creation (route can't
    be changed, only other fields).
- **`getAvailableSeats(scheduleId, date)`** (added 2026-07-09): live seats
  remaining = `capacity - sum(seatCount of RESERVED+PAID Shuttle bookings
  matching this schedule+date, on EITHER outbound or return role)`. This is
  read-only/best-effort for display — the real, transaction-locked check
  happens in `shuttle-services.service.ts` at booking time.
- **Gotcha:** a schedule's `from`/`to` are codes ("lek"), never names — if
  you need a display name and don't have the paired City doc handy, prefer
  the schedule's own `name` field (split on "→") over trying to re-derive it.

### ✅ `shuttle-services` — Verified 2026-07-09

- **Schema** (`shuttle-services/schema/shuttle-service.schema.ts`):
  `schedule: { outbound: ObjectId(Schedule), return?: ObjectId(Schedule) }`,
  `isRoundTrip`, `userId`, `travelDate`, `returnDate?`, `seatCount`,
  `totalAmount` (server-computed, never trust client), `planKey?`/`planLabel?`/`planTrips?`
  (set only if a bundle plan was purchased instead of a plain trip),
  `status` (see enum below), `expiresAt`, `paidAt?`, `paymentReference?`,
  `paymentVerified`, `passengers: ShuttlePassenger[]` (`fullName`, `email`,
  `phone`, `isPrimary` — exactly one passenger must be primary).
- **Status enum** (`common/enums/shuttle-booking.enum.ts`): `reserved` →
  `paid` | `expired` → (`refund_pending` → `refunded`) | `cancelled`.
- **Endpoints** (`shuttle-services.controller.ts`):
  - `POST /shuttle-services/create` (`JwtAuthGuard`) — the only user-facing
    endpoint. Runs inside a Mongo transaction: validates schedules are
    active, checks operatingDays against travelDate/returnDate, cleans up
    expired reservations, checks seat availability per leg, computes price
    (plan price if `planKey` given, else `outbound.basePrice +
    return?.basePrice`, × seatCount), creates a RESERVED booking with a
    15-minute `expiresAt`.
  - `GET /shuttle-services` — admin, filtered list (isRoundTrip, status,
    seatCount, travelDate, paginated).
  - `GET /shuttle-services/all` — admin, unfiltered.
  - `DELETE /shuttle-services/:id` — admin, blocked for `reserved`/`paid`/
    `refund_pending` (payment may be in-flight or needs the refund flow).
- **Gotcha:** the frontend currently books each leg's `planKey` as
  `"single"` always (real two-schedule round trips, not the bundle-plan
  feature). The `weekly`/`monthly`/`round`-on-one-schedule bundle plans
  exist in the data model but aren't wired to any frontend flow yet —
  intentional, deferred for a future subscription-purchase feature (see
  Session Log 2026-07-09).

### ✅ `payments` — Verified 2026-07-09

- **Endpoints** (`payments.controller.ts`):
  - `POST /payments/shuttle-services/:bookingId/initialize` (also aliased
    at `/payments/initialize/service/:bookingId`) — validates booking is
    `RESERVED` and not expired, initializes a Paystack transaction,
    idempotent (reuses the existing reference if called twice).
  - `POST /payments/webhook` — Paystack → us. HMAC-signature verified,
    timing-safe compare. **Authoritative** confirmation path. Routes by
    `metadata.source` (`"booking"` vs `"shuttle-services"`). Marks the
    booking `PAID` inside a transaction; if payment arrives after the
    15-min window expired, auto-triggers a Paystack refund instead and
    emails both admin + customer.
  - `GET /payments/verify/:reference` — manual fallback (called when the
    frontend redirects back from Paystack and the webhook hasn't landed
    yet). Idempotent.
  - There's also a **separate, older** `bookingModel`/`UserBooking` payment
    path (`source: "booking"`) — unrelated to shuttle-services, don't
    conflate the two when reading this file.
- **On confirmed payment:** sends a confirmation email + a receipt email
  (separate try/catch each, one failing doesn't block the other) to the
  account holder + all passenger emails + admin/ops emails, and an SMS to
  every passenger phone.
- **Money units (from `BACKEND.md` §7.3, confirmed against `payments.service.ts`):**
  everything Paystack-facing is in **kobo** — the `* 100` conversion happens
  right at the `initializeShuttleServicesPayment` boundary. `Shuttle.totalAmount`
  and everything the frontend displays are plain Naira. Don't double-convert.

### ⬜ Not yet mapped (source-verified)

Nothing below has been read closely by a Claude session yet — purpose and
live/legacy status are sourced from `BACKEND.md`, not from reading the
module's actual code. Treat as a good starting map, not ground truth;
schema fields, gotchas, and exact endpoint behavior are still unknown until
someone reads the source (the `city` entry above is a cautionary tale about
trusting a "legacy" label without checking).

**Live** (per `BACKEND.md` §5 — safe to build on, but still unverified by
a session):

| Module | Base route | Purpose |
|---|---|---|
| `admin` | `/admin` | Admin auth + management (`super_admin`/`admin` roles, 4-super-admin cap) |
| `auth` | `/auth` | End-user accounts — required before booking a shuttle |
| `shuttle-booking` | `/booking-form` | Other shuttle kinds — airport, events, business, tour (distinct from `shuttle-services`) |
| `cars` | `/cars` | Car rentals catalogue (admin CRUD + public list) |
| `car-rentals` | `/car-rentals` | Car rental enquiry form |
| `airport-transfer` | `/airport-transfer` | Airport transfer form |
| `booking-request` | `/booking-request` | Shuttle booking requests (admin reviews) |
| `career-jobs` | `/career-jobs` | Job postings (admin) |
| `job-application` | `/job-applications` | Applications to postings |
| `contact-us` | `/contact-us` | Contact form |
| `custom-quote` | `/custom-quote` | Custom quote form |
| `lease-options` | `/lease-options` | Leasing consultation form |
| `mo-services` | `/mo-services` | MO services form |
| `verification-services` | `/verification-services` | Verification services form |
| `newsletter` | `/newsletter` | Subscribe/unsubscribe + admin subscriber management |
| `subscription` | `/subscription` | Newsletter-related subscription records |
| `newsroom` | `/newsroom` | News/blog posts (admin) |
| `fleet-management` | `/fleet-management` | Fleet management enquiry |
| `notifications` (+ `notifications/sms`) | — (service) | Unified email (Brevo) + SMS (Termii) |
| `mail` | — (service) | Handlebars template rendering + send |
| `health` | `/health` | Liveness probe + keep-alive target |
| `drivers` | — | Scaffolding for a planned v2 drivers dashboard |
| `od-school`, `interstate-booking` | — | Not in `BACKEND.md`'s table (may postdate it) — status unconfirmed |
| `common/cloudinary` | — (service) | Image upload backing (used by `cars`, `newsroom`) |

**Legacy / likely dead** (per `BACKEND.md` §5 — "must be confirmed before
deletion," don't build new features on these):

`booking`, `shuttle-trip`, `trips`, `one-way`, `guest-booking`,
`paystack-bookings`, `pricing`, `fleetvehicle`, `chat` (abandoned —
was a scrapped ChatGPT integration), `audit` (abandoned), `maps` (tied to
the unbuilt route-tracking feature — `GOOGLE_MAPS_API_KEY` exists but
unwired).

`city` was also on this legacy list — **reclassified above, don't trust
this list's "dead" label without checking**, same as we had to for `city`.

---

## 3. Frontend integration notes (nshuttle repo)

- Frontend lives at `Desktop/Novo/nshuttle` — reads this API via
  `NEXT_PUBLIC_API_URL` (currently `http://localhost:4000` for local dev;
  will switch to the Render URL once ready per user).
- Frontend's `Schedule`/`City` types (`nshuttle/src/types/schedule.ts`)
  mirror this backend's shape field-for-field on purpose — if you change a
  field name here, update that file too.
- Checkout (`nshuttle/src/components/app/CheckoutClient.tsx`) does **not**
  yet call `shuttle-services/create` or `payments/.../initialize` — it's
  still writing to a local `localStorage` stub. Wiring it to the real
  booking+payment endpoints above is the next real integration step.

---

## Session Log

**2026-07-09** — Initial version of this file created.
- Documented `city`, `schedule`, `shuttle-services`, `payments` (the full
  NShuttle booking chain) from direct source reading.
- Added `ScheduleService.getAvailableSeats()` and wired live
  `seatsAvailable` into `GET /schedules/search` results (previously the
  endpoint only returned static `capacity`).
- Fixed CORS in `main.ts`: was hardcoded to 3 specific localhost ports:
  broke every time a dev server used a different port. Now any
  `http://localhost:<port>` origin is allowed unconditionally (not gated on
  `NODE_ENV`, since this project's `.env` sets `NODE_ENV=production` even
  for local runs — that flag isn't a reliable dev/prod signal here).
- Decision: round-trip stays modeled as **two separate Schedule documents**
  (`Shuttle.schedule.outbound`/`.return`), not merged into one — confirmed
  with the user after flagging that merging would require rewriting the
  already-working, transaction-tested per-leg seat-availability logic, and
  would lose the ability for outbound/return to have different
  capacity/price/vehicle.
- Confirmed live against the running backend (not mocked): full
  search → results → result → checkout flow on the frontend now shows real
  Lekki Phase 1 → Berger schedule data, real vehicle photo, and real
  `seatsAvailable`.

**2026-07-09 (later same day)** — Cross-referenced against the maintainer's
`BACKEND.md` (comprehensive, pre-existing doc in this same folder — see the
"See also" note at the top of this file).
- Filled in the "not yet mapped" module list with purpose + live/legacy
  status sourced from `BACKEND.md` §5, split into Live vs. Legacy tables.
  Still source-unverified — a claim from `BACKEND.md`, not from reading code.
- Found and flagged a real discrepancy: `BACKEND.md` marks `city` as
  legacy/candidate-for-removal, but it's confirmed live and load-bearing for
  the NShuttle search flow. Reclassified in this doc; raised with the user
  for confirmation before any cleanup pass touches it.
- Added the kobo/Naira unit note from `BACKEND.md` §7.3 to the `payments`
  section (confirmed consistent with the `* 100` conversion read directly
  in `payments.service.ts` earlier).
- Raised a question with the user about `.env`'s `NODE_ENV=production` for
  local runs — **resolved**: grepped the whole `src/` tree, only one other
  place branches on it (`common/logger/winston.logger.ts` — log level
  `info` vs `debug`, and whether local `logs/*.log` files get written).
  No auth/security/business logic depends on it. User confirmed: leave it
  as-is.

**2026-07-16** — Round-6 client-feedback session (main-website repo drove most
of the work; backend changes below).
- Fixed the "no email after Verification Service form" bug:
  `verification-services.service.ts` referenced mail template
  `verification-service-admin`, but no such `.hbs` existed in
  `src/mail/templates/` — `compileTemplate` threw, the catch swallowed it,
  request still saved. Created `verification-service-admin.hbs` (matches the
  `contact-us-admin.hbs` style, fields: name/email/company/serviceType/message).
- Also added a requester acknowledgment email: new
  `verification-service-user.hbs` + second `sendTemplateEmail` call in
  `createVerificationRequest` (same swallow-and-log error handling as the
  admin email, so email failure never fails the request).
- Verified live against the locally running backend: POST
  `/verification-services/create` → 201, record persisted.
- Note: Paystack config across backend `.env` (`sk_test_…`) and the NShuttle
  app (`pk_test_…`) is the developer's TEST account — the client flagged that
  the Paystack account shown at checkout "is not ours"; swapping in the
  client's own live keys is pending them providing keys.
