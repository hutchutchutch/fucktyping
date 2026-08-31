import type { DraftFormConfig, DraftQuestion } from "./draft";
import type { Mutation } from "./tools";

/** Pure: apply one mutation to a draft, returning a new draft (no in-place edits). */
export function applyMutation(form: DraftFormConfig, m: Mutation): DraftFormConfig {
  switch (m.kind) {
    case "set_meta":
      return {
        ...form,
        name: m.name ?? form.name,
        description: m.description ?? form.description,
      };
    case "set_opening":
      return { ...form, openingActivity: { prompt: m.prompt } };
    case "set_closing":
      return { ...form, closingActivity: { prompt: m.prompt } };
    case "add_question": {
      const questions = [...form.questions];
      const pos = m.position == null ? questions.length : clamp(m.position, 0, questions.length);
      questions.splice(pos, 0, m.question);
      return { ...form, questions };
    }
    case "update_question":
      return {
        ...form,
        questions: form.questions.map((q) => (q.id === m.id ? { ...q, ...m.patch } : q)),
      };
    case "remove_question":
      return { ...form, questions: form.questions.filter((q) => q.id !== m.id) };
    case "reorder_questions": {
      const byId = new Map(form.questions.map((q) => [q.id, q]));
      const ordered: DraftQuestion[] = [];
      for (const id of m.order) {
        const q = byId.get(id);
        if (q) ordered.push(q);
      }
      // keep any questions the reorder list omitted, in their original order
      for (const q of form.questions) {
        if (!m.order.includes(q.id)) ordered.push(q);
      }
      return { ...form, questions: ordered };
    }
  }
}

export function applyMutations(form: DraftFormConfig, mutations: Mutation[]): DraftFormConfig {
  return mutations.reduce(applyMutation, form);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
