import { describe, expect, it } from "vitest";

import { SerialTaskQueue } from "./serial";

describe("SerialTaskQueue", () => {
  it("does not start a second turn until the first external wait completes", async () => {
    const queue = new SerialTaskQueue();
    const events: string[] = [];
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });

    const first = queue.run(async () => {
      events.push("first:start");
      await firstGate;
      events.push("first:end");
    });
    const second = queue.run(async () => {
      events.push("second:start");
      events.push("second:end");
    });

    await Promise.resolve();
    expect(events).toEqual(["first:start"]);
    releaseFirst();
    await Promise.all([first, second]);
    expect(events).toEqual(["first:start", "first:end", "second:start", "second:end"]);
  });

  it("continues after a failed turn", async () => {
    const queue = new SerialTaskQueue();
    const failed = queue.run(async () => { throw new Error("turn failed"); });
    const next = queue.run(async () => "recovered");

    await expect(failed).rejects.toThrow("turn failed");
    await expect(next).resolves.toBe("recovered");
  });
});
