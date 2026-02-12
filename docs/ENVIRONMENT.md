# Novo Shuttle – Environment Configuration

This document outlines all required environment variables.

---

# Required Variables

## Core

NODE_ENV=production
PORT=4000

---

## Database

MONGO_URI=mongodb://...

---

## Paystack

PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

---

## Frontend

FRONTEND_URL=https://yourfrontenddomain.com

---

## Google Maps

GOOGLE_MAPS_API_KEY=xxxxx

Required APIs:
- Distance Matrix API
- Maps JavaScript API (if frontend uses it)

Billing must be enabled.

---

## Email (SMTP)

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=info@novocars.com

---

# Security Notes

1. Never commit .env files.
2. Production must use live Paystack keys.
3. Webhook must use production domain.
4. Disable development signature bypass in production.
5. Use HTTPS in production.

---

# Production Checklist

- [ ] Paystack test mode fully validated
- [ ] Refund flow tested
- [ ] Webhook signature verified
- [ ] Google Maps billing enabled
- [ ] Logs reviewed
- [ ] All TypeScript errors resolved
- [ ] Email delivery tested
