'use strict';

import { describe, expect, it } from 'vitest';
import { pLimit } from '../../src/helpers/pLimit.js';

describe('pLimit', () => {
  it('executes a single task and resolves its return value', async () => {
    const limit = pLimit(1);
    const result = await limit(() => 42);
    expect(result).toBe(42);
  });

  it('limits concurrent executions to the specified concurrency', async () => {
    const limit = pLimit(2);
    let active = 0;
    let maxActive = 0;

    const task = (): Promise<void> =>
      new Promise((resolve) => {
        active++;
        maxActive = Math.max(maxActive, active);
        setTimeout(() => {
          active--;
          resolve();
        }, 10);
      });

    await Promise.all([limit(task), limit(task), limit(task), limit(task)]);
    expect(maxActive).toBe(2);
  });

  it('does not allow concurrency+1 tasks simultaneously — >= not >', async () => {
    const concurrency = 3;
    const limit = pLimit(concurrency);
    let running = 0;
    let exceeded = false;

    const task = (): Promise<void> =>
      new Promise((resolve) => {
        running++;
        if (running > concurrency) exceeded = true;
        setTimeout(() => {
          running--;
          resolve();
        }, 20);
      });

    await Promise.all(Array.from({ length: concurrency + 2 }, () => limit(task)));
    expect(exceeded).toBe(false);
  });

  it('runs tasks sequentially at concurrency=1', async () => {
    const limit = pLimit(1);
    const order: number[] = [];

    await Promise.all([
      limit(async () => {
        await new Promise<void>((r) => setTimeout(r, 10));
        order.push(1);
      }),
      limit(async () => {
        order.push(2);
      }),
      limit(async () => {
        order.push(3);
      }),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });

  it('starts a queued task immediately after a running task completes', async () => {
    const limit = pLimit(1);
    const started: number[] = [];

    await Promise.all([
      limit(async () => {
        started.push(1);
        await new Promise<void>((r) => setTimeout(r, 10));
      }),
      limit(async () => {
        started.push(2);
      }),
    ]);

    expect(started).toEqual([1, 2]);
  });
});
