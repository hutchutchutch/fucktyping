import { describe, expect, it } from "vitest";

import type { Env } from "../env";
import { emptyDraft } from "./draft";
import { LLMAuthoringBrain } from "./agent";

describe("LLMAuthoringBrain", () => {
  it("runs the configured Workers AI model and translates tool calls", async () => {
    const requests: { model: string; input: unknown }[] = [];
    const env = {
      AI_TEXT_MODEL: "@cf/zai-org/glm-4.7-flash",
      AI: {
        run: async (model: string, input: unknown) => {
          requests.push({ model, input });
          return {
            choices: [{
              message: {
                content: "I added a rating question.",
                tool_calls: [{
                  type: "function",
                  function: {
                    name: "add_question",
                    arguments: JSON.stringify({ prompt: "Rate today", expectedResponseFormat: "number" }),
                  },
                }],
              },
            }],
          };
        },
      },
    } as unknown as Env;

    const turn = await new LLMAuthoringBrain(env).respond(
      [{ role: "user", content: "Add a rating" }],
      emptyDraft("form-1"),
    );

    expect(requests).toHaveLength(1);
    expect(requests[0].model).toBe("@cf/zai-org/glm-4.7-flash");
    expect(turn.text).toBe("I added a rating question.");
    expect(turn.mutations).toMatchObject([{
      kind: "add_question",
      question: { id: "q1", prompt: "Rate today", expectedResponseFormat: "number" },
    }]);
  });

  it("accepts object-valued tool arguments from the binding", async () => {
    const env = {
      AI_TEXT_MODEL: "@cf/zai-org/glm-4.7-flash",
      AI: {
        run: async () => ({
          choices: [{ message: { tool_calls: [{ function: { name: "set_form_meta", arguments: { name: "Check-in" } } }] } }],
        }),
      },
    } as unknown as Env;

    const turn = await new LLMAuthoringBrain(env).respond([], emptyDraft("form-1"));
    expect(turn.mutations).toEqual([{ kind: "set_meta", name: "Check-in", description: undefined }]);
    expect(turn.text).toContain("updated the form details");
  });
});
