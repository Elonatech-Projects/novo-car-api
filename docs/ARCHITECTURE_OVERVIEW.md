# Disclaimer
What we have in this file gives an overview of present (11th Feburary 2026) which is subject to changes in the future, kindly take note.

# Novo Shuttle – Architecture Overview

## System Overview

Novo Shuttle is built using a modular, production-ready backend architecture designed for scalability, maintainability, and financial safety.

Core stack:

- Backend: NestJS
- Database: MongoDB (Mongoose ODM)
- Payments: Paystack
- Maps & Distance: Google Distance Matrix API
- Email Notifications: SMTP-based EmailService
- Deployment: Node.js production environment

---

# High-Level Architecture

Client (Frontend)
        ↓
REST API (NestJS Controllers)
        ↓
Business Logic (Services Layer)
        ↓
MongoDB Database
        ↓
External Services:
    - Paystack (Payments & Refunds)
    - Google Maps (Distance Pricing)
    - SMTP Provider (Email Notifications)

---

# Backend Structure

The backend follows modular NestJS architecture.

## Modules

- BookingModule
- ShuttleBookingModule
- PaymentsModule
- MapsModule
- NotificationsModule
- EmailModule
and many more...

Each module encapsulates:
- Controller (HTTP layer)
- Service (business logic)
- Schema (database structure)
- DTOs (validation)

---

# Design Principles

## 1️⃣ Separation of Concerns

Controllers handle HTTP.
Services handle logic.
Schemas define structure.
External services are isolated.

No business logic inside controllers.

---

## 2️⃣ Financial Safety First

Payments are handled with:

- Webhook-based confirmation (source of truth)
- Signature verification (HMAC SHA512)
- Idempotency guards
- Amount validation against database
- Refund reconciliation

No trust in frontend.
No blind status updates.

---

## 3️⃣ Idempotency Everywhere

We prevent:

- Double payment confirmation
- Double refunds
- Duplicate webhook processing

Guards implemented in:
- Payment verification
- Webhook handler
- Refund webhook handler

---

## 4️⃣ Booking Types

System supports two flows:

### A. Trip Booking
- Fixed price trips
- Price stored in `price`

### B. Shuttle Booking
- Distance-based pricing
- Uses Google Distance Matrix API
- Total calculated and stored in `totalPrice`

Both share the same Paystack infrastructure.

---

## 5️⃣ Pricing Architecture

For Shuttle Bookings:

1. Google Maps API calculates distance (km)
2. Pricing engine computes:
   - Base Fare
   - Service Charge
   - VAT
   - Surge Multiplier
3. Final price stored before payment

Distance is cached for performance optimization.

---

## 6️⃣ Payment Lifecycle

PENDING_PAYMENT  
→ PAID  
→ REFUND_REQUESTED  
→ REFUND_PENDING  
→ REFUNDED  

State transitions are strictly controlled.

---

## 7️⃣ Notifications

NotificationService abstracts:

- Payment confirmation emails
- Refund initiated emails
- Refund completed emails

Emails are executed asynchronously (non-blocking).

Future improvement:
- Replace setImmediate with queue (BullMQ / Redis)

---

# Security Architecture

- Webhook signature verification
- No direct DB status manipulation
- Strict DTO validation
- MongoDB ObjectId validation
- Environment variable protection

---

# Production Readiness

The backend includes:

- Type-safe Paystack responses
- Structured logging
- Error normalization
- Refund verification reconciliation
- Manual refund approval model

---

# Future Improvements (Scalability Roadmap)

- Queue-based email processing
- Redis caching for pricing
- Role-based admin panel
- Refund approval audit log
- Rate limiting
- Request throttling
- Monitoring (Winston + centralized logging)

---

# Conclusion

This backend is designed to:

- Protect financial transactions
- Prevent inconsistent states
- Scale safely
- Remain maintainable for future developers

The architecture prioritizes stability, clarity, and production-grade safety.
