import type { Env } from "../env";
import { LLMAuthoringBrain } from "../authoring/agent";
import { emptyDraft, toPublished } from "../authoring/draft";
import { applyMutations } from "../authoring/reducer";
import type { FormConfig } from "./types";

/** Turn a free-text brief (e.g. a cron's "what I need from you") into a runnable
 *  FormConfig, by running the authoring brain once and filling sensible defaults so
 *  the result is always publishable. */
export async function createFormFromBrief(env: Env, brief: string): Promise<FormConfig> {
  let draft = emptyDraft(crypto.randomUUID());

  try {
    const turn = await new LLMAuthoringBrain(env).respond([{ role: "user", content: brief }], draft);
    draft = applyMutations(draft, turn.mutations);
  } catch (err) {
    // If the LLM is unreachable, fall back to a single open-ended question below.
    console.error("createFormFromBrief: authoring brain failed", err);
  }

  if (draft.questions.length === 0) {
    draft.questions.push({
      id: "q1",
      prompt: brief,
      expectedResponseFormat: "text",
      required: true,
      maxAttempts: 3,
    });
  }
  if (!draft.name || draft.name === "Untitled form") draft.name = "Voice check-in";
  if (!draft.openingActivity.prompt) draft.openingActivity.prompt = "Hi! I have a few quick questions for you.";
  if (!draft.closingActivity.prompt) draft.closingActivity.prompt = "That's everything — thanks!";

  return toPublished(draft); // validates against the strict schema
}
