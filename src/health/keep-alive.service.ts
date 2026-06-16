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
    } catch (err) {
      this.logger.warn(
        `Keep-alive ping failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
