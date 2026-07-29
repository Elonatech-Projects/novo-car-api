// src/common/utils/admin-notification-failure.ts
//
// A failed admin-notification email/SMS was previously only ever written to
// a server log (logger.error), with no way for staff to discover a real
// customer lead (fleet inquiry, quote request, booking, etc.) is sitting in
// the database that nobody was told about. This writes the same failure to
// the existing audit trail (already used for payment events) so it's
// queryable, instead of inventing new infrastructure just for this.
import { Logger } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';

export async function logAdminNotificationFailure(
  auditService: AuditService,
  logger: Logger,
  params: {
    context: string; // e.g. "fleet-management", "custom-quote"
    channel: 'email' | 'sms';
    recipient: string;
    subject: string;
    error: unknown;
  },
): Promise<void> {
  const message =
    params.error instanceof Error ? params.error.message : String(params.error);

  logger.error(
    `ADMIN NOTIFICATION FAILED [${params.context}/${params.channel}] to ${params.recipient} (${params.subject}) — ${message}`,
  );

  try {
    await auditService.log('ADMIN_NOTIFICATION_FAILED', {
      metadata: {
        context: params.context,
        channel: params.channel,
        recipient: params.recipient,
        subject: params.subject,
        errorMessage: message,
      },
    });
  } catch (auditError) {
    // The audit write itself failing is the last-resort case — the logger.error
    // above already ran, so the failure isn't fully silent even if this is.
    logger.error(
      `Failed to record ADMIN_NOTIFICATION_FAILED audit entry: ${
        auditError instanceof Error ? auditError.message : String(auditError)
      }`,
    );
  }
}
