# Novo Shuttle – Refund Policy & Process

## Overview

Novo Shuttle provides a structured and transparent refund process designed to protect both customers and the business.

Refunds are processed securely through Paystack and follow strict internal approval workflows.

---

# Refund Eligibility

A booking is eligible for refund if:

- Payment has been successfully completed.
- The booking has not already been refunded.
- Cancellation occurs within approved policy time window.

Refunds may not be granted if:

- Service has already been rendered.
- The request violates agreed booking terms.

---

# Refund Process

## Step 1: Refund Request

Customer submits a refund request.

Booking status changes to:
REFUND_REQUESTED

---

## Step 2: Internal Review

Admin reviews the request.

If approved:
- Booking moves to REFUND_PENDING.
- Refund request sent to Paystack.

If rejected:
- Booking remains PAID.

---

## Step 3: Payment Processor Handling

Paystack processes the refund.

Possible outcomes:
- Processed (successful)
- Failed

---

## Step 4: Final Status

If processed:
- Booking marked as REFUNDED.
- Customer receives confirmation email.

If failed:
- Booking restored to PAID.
- Customer notified accordingly.

---

# Refund Timeline

Most refunds are processed instantly or within minutes.

However, actual bank reversal may take:

- 24–72 hours depending on bank.

---

# Payment Security

Novo Shuttle uses:

- Secure Paystack infrastructure
- Encrypted payment processing
- Webhook verification
- Fraud prevention safeguards

Refunds cannot be manually manipulated in the database.

All financial actions are validated against Paystack records.

---

# Transparency & Customer Communication

Customers receive email notifications for:

- Refund initiated
- Refund completed
- Refund failure (if applicable)

---

# Compliance

All refunds follow:

- Payment processor regulations
- Financial compliance best practices
- Internal auditing controls

---

# Contact

For refund inquiries:

support@novocars.com
