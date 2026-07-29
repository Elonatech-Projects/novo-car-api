// src/health/keep-alive.service.ts
//
// Keeps the Render free-tier dyno awake by pinging its own /health endpoint
// on an interval. Render spins the instance down after ~15 min of no inbound
// traffic; a ping every 10 min keeps inbound traffic flowing so it never sleeps.
//
// NOTE: This only works while the instance is already awake (the cron can't run
// while asleep). It prevents the instance from EVER reaching the 15-min idle
// threshold, so in practice it stays up. For full robustness against deploy gaps,
// also use an external pinger (e.g. cron-job.org) hitting /health.
//
// Render automatically injects RENDER_EXTERNAL_URL with the public service URL.
// Locally that var is absent, so the ping is skipped (no need to keep localhost awake).

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  // Render provides RENDER_EXTERNAL_URL; SELF_PING_URL is a manual override.
  private readonly selfUrl =
    process.env.SELF_PING_URL || process.env.RENDER_EXTERNAL_URL;

  // A single ping failure is noise (a transient blip). Several IN A ROW means
  // the instance itself is likely unreachable — that's worth surfacing at
  // `error` level so log-based monitoring actually notices, instead of every
  // failure quietly sitting at `warn` forever.
  private consecutiveFailures = 0;
  private static readonly ALERT_THRESHOLD = 3;

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pingSelf(): Promise<void> {
    if (!this.selfUrl) {
      // No public URL (e.g. local dev) — nothing to keep awake.
      return;
    }

    const url = `${this.selfUrl.replace(/\/$/, '')}/health`;

    try {
      const res = await fetch(url, { method: 'GET' });
      this.logger.debug(`Keep-alive ping → ${url} (${res.status})`);
      this.consecutiveFailures = 0;
    } catch (err) {
      this.consecutiveFailures += 1;
      const message = err instanceof Error ? err.message : String(err);

      if (this.consecutiveFailures >= KeepAliveService.ALERT_THRESHOLD) {
        this.logger.error(
          `Keep-alive ping failed ${this.consecutiveFailures} times in a row — instance may be unreachable: ${message}`,
        );
      } else {
        this.logger.warn(`Keep-alive ping failed: ${message}`);
      }
    }
  }
}
