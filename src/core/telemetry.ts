/**
 * @file src/core/telemetry.ts
 * @description Non-blocking batch telemetry emitter for ai-shield events.
 *
 * Requirements:
 *   - Asynchronous and non-blocking (zero latency impact on HTTP request handling).
 *   - Uses native Node.js global fetch.
 *   - Flushes events in batches every 5 seconds OR immediately when queue hits 20 items.
 *   - Fire-and-forget: errors are silently swallowed to preserve host application resilience.
 */

import { createHash } from 'node:crypto';
import type { TelemetryEvent } from '../types/index.js';

export const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
export const MAX_BATCH_SIZE = 20;
export const DEFAULT_DASHBOARD_URL = 'https://telemetry.ai-shield.dev/v1/events';

/**
 * Computes a privacy-preserving SHA-256 hash of a client IP address.
 */
export function hashClientIp(ip: string): string {
  if (!ip) return 'anonymous';
  return createHash('sha256').update(ip).digest('hex');
}

export interface TelemetryEmitterOptions {
  apiKey: string;
  dashboardUrl?: string | undefined;
  flushIntervalMs?: number | undefined;
  batchSize?: number | undefined;
  fetchFn?: typeof fetch | undefined;
}

/**
 * In-memory batched telemetry emitter.
 */
export class TelemetryEmitter {
  private readonly apiKey: string;
  private readonly dashboardUrl: string;
  private readonly flushIntervalMs: number;
  private readonly batchSize: number;
  private readonly fetchFn: typeof fetch;

  private buffer: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;

  constructor(options: TelemetryEmitterOptions) {
    this.apiKey = options.apiKey;
    this.dashboardUrl = options.dashboardUrl ?? DEFAULT_DASHBOARD_URL;
    this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
    this.batchSize = options.batchSize ?? MAX_BATCH_SIZE;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;

    this.startTimer();
  }

  /**
   * Queue an event into the in-memory buffer.
   * Flushes immediately if buffer capacity is reached.
   */
  emit(event: TelemetryEvent): void {
    if (this.isDestroyed) return;

    this.buffer.push(event);

    if (this.buffer.length >= this.batchSize) {
      // Non-blocking fire-and-forget flush
      void this.flush();
    }
  }

  /**
   * Drains the current buffer and sends events via HTTP POST.
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    // Drain buffer atomically
    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      await this.fetchFn(this.dashboardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          events: batch,
          count: batch.length,
          sentAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Fire-and-forget: telemetry errors must never throw or affect app execution
    }
  }

  /**
   * Current number of buffered events pending transmission.
   */
  get queueLength(): number {
    return this.buffer.length;
  }

  /**
   * Starts background interval flusher.
   */
  private startTimer(): void {
    if (this.flushTimer !== null) return;

    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.flushIntervalMs);

    // Unref timer so process can terminate naturally
    if (typeof this.flushTimer === 'object' && this.flushTimer !== null) {
      (this.flushTimer as NodeJS.Timeout).unref?.();
    }
  }

  /**
   * Stops timer and drains any remaining events.
   */
  async destroy(): Promise<void> {
    this.isDestroyed = true;
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}
