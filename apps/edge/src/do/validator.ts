import type { Env } from "../env";
import type { Question } from "../forms/types";

export interface ValidationResult {
  isValid: boolean;
  extractedValue: unknown;
  confidence: number;
  reason: string;
}

/** Decides whether a spoken answer satisfies a question and extracts a normalized value. */
export interface AnswerValidator {
  validate(question: Question, userResponse: string): Promise<ValidationResult>;
}

/** Local models often wrap JSON in ```json fences or surrounding prose. Pull out the
 *  JSON object so JSON.parse succeeds. */
export function extractJson(s: string): string {
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : s;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start >= 0 && end > start ? body.slice(start, end + 1) : body.trim();
}

/** Ported from the legacy engine/prompts.js generateValidationPrompt. */
function buildValidationPrompt(q: Question, userResponse: string): string {
  return [
    `You are validating a user's spoken response to this question:`,
    `"${q.prompt}"`,
    ``,
    `Expected format: ${q.expectedResponseFormat}`,
    q.options ? `Valid options: ${q.options.join(", ")}` : "",
    q.validResponseExample ? `Example valid response: "${q.validResponseExample}"` : "",
    q.invalidResponseExample ? `Example invalid response: "${q.invalidResponseExample}"` : "",
    ``,
    `User's response: "${userResponse}"`,
    ``,
    `Return ONLY a JSON object: {"isValid": bool, "extractedValue": <normalized value or null>, "confidence": 0..1, "reason": string}.`,
    `Accept natural speech variations (e.g. "yeah"/"nope" for yes/no, spelled-out numbers).`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Workers-AI-backed validator with a deterministic fallback so form completion is not
 * coupled to inference availability. */
export class Validator implements AnswerValidator {
  constructor(private env: Env) {}

  async validate(q: Question, userResponse: string): Promise<ValidationResult> {
    try {
      const data = await this.env.AI.run(this.env.AI_TEXT_MODEL as "@cf/zai-org/glm-4.7-flash", {
        temperature: 0,
        max_completion_tokens: 300,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: buildValidationPrompt(q, userResponse) }],
      }) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(extractJson(content)) as Partial<ValidationResult>;
      return {
        isValid: Boolean(parsed.isValid),
        extractedValue: parsed.extractedValue ?? null,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
        reason: typeof parsed.reason === "string" ? parsed.reason : "",
      };
    } catch (err) {
      return heuristicValidate(q, userResponse);
    }
  }
}

const YES = /\b(yes|yeah|yep|yup|sure|of course|definitely|correct|affirmative)\b/i;
const NO = /\b(no|nope|nah|never|negative|not really)\b/i;
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

/** Deterministic fallback validation — no network. */
export function heuristicValidate(q: Question, text: string): ValidationResult {
  const t = text.trim();
  const lower = t.toLowerCase();
  switch (q.expectedResponseFormat) {
    case "yes_no": {
      if (YES.test(lower)) return ok(true);
      if (NO.test(lower)) return ok(false);
      return bad("not a yes/no answer");
    }
    case "number": {
      const digit = t.match(/-?\d+(\.\d+)?/);
      if (digit) return ok(Number(digit[0]));
      for (const [word, n] of Object.entries(NUMBER_WORDS)) {
        if (new RegExp(`\\b${word}\\b`, "i").test(lower)) return ok(n);
      }
      return bad("no number found");
    }
    case "email": {
      const m = t.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      return m ? ok(m[0]) : bad("no email found");
    }
    case "multiple_choice": {
      const match = (q.options ?? []).find((o) => lower.includes(o.toLowerCase()));
      return match ? ok(match) : bad("no option matched");
    }
    case "phone": {
      const digits = t.replace(/\D/g, "");
      return digits.length >= 7 ? ok(digits) : bad("not enough digits");
    }
    case "date":
    case "text":
    default:
      return t.length > 0 ? ok(t) : bad("empty response");
  }

  function ok(value: unknown): ValidationResult {
    return { isValid: true, extractedValue: value, confidence: 0.6, reason: "heuristic match" };
  }
  function bad(reason: string): ValidationResult {
    return { isValid: false, extractedValue: null, confidence: 0.6, reason };
  }
}
