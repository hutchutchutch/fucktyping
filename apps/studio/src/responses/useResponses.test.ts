import { describe, expect, it } from "vitest";

import { parseResponsesPayload } from "./useResponses";

describe("response viewer protocol", () => {
  const payload = {
    form: {
      id: "form-1",
      name: "Check-in",
      questions: [{ id: "q1", prompt: "How are you?" }],
    },
    responses: [{
      id: "response-1",
      formId: "form-1",
      sessionId: "session-1",
      answers: { q1: "Great" },
      createdAt: "2026-09-02T12:00:00.000Z",
    }],
  };

  it("accepts the owner-scoped form and response contract", () => {
    expect(parseResponsesPayload(payload)).toEqual(payload);
  });

  it("rejects malformed nested records", () => {
    expect(parseResponsesPayload({ ...payload, form: { ...payload.form, questions: [{}] } })).toBeNull();
    expect(parseResponsesPayload({ ...payload, responses: [{ ...payload.responses[0], answers: [] }] })).toBeNull();
    expect(parseResponsesPayload({ ...payload, responses: [{ ...payload.responses[0], createdAt: "nope" }] })).toBeNull();
  });
});
