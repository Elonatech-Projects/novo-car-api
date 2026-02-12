# Novo Shuttle – Payment Flow Documentation

## Overview

This document explains the complete payment and refund lifecycle for the Novo Shuttle system.

The system integrates with Paystack and follows a secure, idempotent, production-grade flow.

---

# 1️⃣ PAYMENT INITIALIZATION FLOW

### Endpoint
POST /payments/initialize/:bookingId

### Steps

1. Validate MongoDB ObjectId.
2. Fetch booking from database.
3. Ensure:
   - Booking exists
   - Email exists
   - Booking is not already PAID
4. Generate unique reference:
   Format: NOVO-{last8chars}-{timestamp}
5. Convert amount to kobo (NGN × 100).
6. Call Paystack initialize endpoint.
7. Save paymentReference to booking.
8. Return authorization URL to frontend.

---

# 2️⃣ PAYMENT VERIFICATION FLOW (Fallback)

### Endpoint
GET /payments/verify/:reference

This is a fallback mechanism.

Primary confirmation is handled via webhook.

### Steps

1. Call Paystack verify endpoint.
2. Ensure status === "success".
3. Extract metadata.sourceId.
4. Fetch booking.
5. If already PAID → return safely (idempotent).
6. Mark booking as:
   - status = PAID
   - paidAt = current date
7. Send confirmation email asynchronously.

---

# 3️⃣ WEBHOOK FLOW (Primary Payment Confirmation)

### Endpoint
POST /payments/webhook

This is the authoritative source of truth.

### Security

- HMAC SHA512 signature verification
- Raw body validation
- Idempotency guards
- Amount validation

### Steps

1. Verify Paystack signature.
2. Parse raw JSON body.
3. Confirm event type:
   - charge.success
4. Extract metadata.source + sourceId.
5. Fetch booking.
6. If:
   - Already PAID
   - Already REFUND_PENDING
   - Already REFUNDED
   → Exit safely.
7. Validate amount.
8. Update booking:
   - status = PAID
   - paidAt = event.data.paid_at
9. Send confirmation email.

---

# 4️⃣ REFUND FLOW

## Refund Request

### Endpoint
POST /payments/refund

Flow:

1. Validate booking.
2. Ensure status === PAID.
3. Mark booking as:
   - REFUND_REQUESTED (manual approval model)
4. Send refund initiated email.

---

## Refund Approval

### Endpoint
POST /payments/approve-refund/:bookingId

1. Ensure booking status === REFUND_REQUESTED.
2. Mark as REFUND_PENDING.
3. Call Paystack refund endpoint.

---

## Refund Webhook

Events:
- refund.processed
- refund.failed

Steps:

1. Find booking via paymentReference.
2. Idempotency guard:
   - if refundedFinalized === true → exit.
3. If processed:
   - status = REFUNDED
   - refundedFinalized = true
4. If failed:
   - status = PAID
   - refundedFinalized = true
5. Send refund completion email.

---

# 5️⃣ REFUND VERIFICATION (Manual Reconciliation)

### Endpoint
GET /payments/refund/verify/:reference

1. Fetch booking.
2. If not REFUND_PENDING → return.
3. Call Paystack verify refund.
4. If processed → mark REFUNDED.
5. If failed → revert to PAID.

---

# Booking Status Lifecycle

PENDING_PAYMENT  
→ PAID  
→ REFUND_REQUESTED  
→ REFUND_PENDING  
→ REFUNDED  

---

# Idempotency Protection

Implemented in:

- Payment verification
- Webhook processing
- Refund webhook handling

Ensures:

- No double charges
- No double refunds
- No duplicate state transitions

---

# Architecture Principles

- Webhook is source of truth.
- Verification endpoint is fallback only.
- All money updates must be validated against Paystack.
- Email notifications are asynchronous.
- Status changes must be controlled and validated.

---

# Deployment Checklist

Before production:

- NODE_ENV=production
- PAYSTACK_SECRET_KEY set
- Webhook URL configured in Paystack dashboard
- HTTPS enabled
- Logging level reduced
- No signature bypass in production
