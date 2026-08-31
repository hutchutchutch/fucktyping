import app from "./app";
import { consumeCallbackBatch, sweepPendingCallbacks, type CallbackQueueMessage } from "./callbacks";
import type { Env } from "./env";

// Durable Object classes must be exported from the Worker entrypoint.
export { FormSessionDO } from "./do/FormSessionDO";
export { FormAuthoringDO } from "./do/FormAuthoringDO";

export default {
  fetch: app.fetch,
  queue: (batch: MessageBatch<CallbackQueueMessage>, env: Env) => consumeCallbackBatch(batch, env),
  scheduled: (_controller: ScheduledController, env: Env, ctx: ExecutionContext) => {
    ctx.waitUntil(sweepPendingCallbacks(env));
  },
} satisfies ExportedHandler<Env, CallbackQueueMessage>;
