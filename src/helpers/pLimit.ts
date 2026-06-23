'use strict';

/**
 * Creates a concurrency limiter that ensures at most `concurrency` async tasks
 * run simultaneously. Returns a scheduler function with the same call signature
 * as the p-limit package: `limit(fn, ...args)` enqueues the task and returns a
 * Promise that resolves/rejects with the task's result.
 */
export function pLimit(concurrency: number): <T>(fn: () => T | Promise<T>) => Promise<T> {
  let active = 0;
  const queue: Array<() => void> = [];

  function next(): void {
    if (queue.length === 0 || active >= concurrency) return;
    active++;
    const run = queue.shift()!;
    run();
  }

  return function limit<T>(fn: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        Promise.resolve()
          .then(() => fn())
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
  };
}
