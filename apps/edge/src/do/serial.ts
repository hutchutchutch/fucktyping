/** Serializes stateful WebSocket turns across external awaits without blocking the
 * Durable Object's entire event loop via blockConcurrencyWhile(). */
export class SerialTaskQueue {
  private tail: Promise<void> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(() => task(), () => task());
    this.tail = result.then(() => undefined, () => undefined);
    return result;
  }
}
