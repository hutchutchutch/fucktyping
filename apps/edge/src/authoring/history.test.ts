import { describe, expect, it } from "vitest";

import { appendBoundedMessage } from "./history";

describe("bounded authoring history", () => {
  it("keeps only the most recent configured number of messages", () => {
    const messages = [
      { role: "assistant" as const, content: "one" },
      { role: "user" as const, content: "two" },
      { role: "assistant" as const, content: "three" },
    ];
    appendBoundedMessage(messages, { role: "user", content: "four" }, 3);
    expect(messages.map((message) => message.content)).toEqual(["two", "three", "four"]);
  });

  it("drops old turns to stay within the model context character budget", () => {
    const messages = [
      { role: "assistant" as const, content: "12345" },
      { role: "user" as const, content: "67890" },
    ];
    appendBoundedMessage(messages, { role: "assistant", content: "latest" }, 40, 10);
    expect(messages).toEqual([{ role: "assistant", content: "latest" }]);
  });
});
