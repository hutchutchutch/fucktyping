import type { Env } from "./env";
import type { FormConfig } from "./forms/types";
import { FormRepository, type CallbackDelivery } from "./forms/repository";

export interface CallbackQueueMessage {
  deliveryId: string;
}

function formatAnswer(value: unknown): string {
  if (value == null || value === "") return "(skipped)";
  return String(value);
}

export function buildCallbackPayload(
  config: FormConfig,
  responses: Record<string, unknown>,
  meta: unknown,
): Record<string, unknown> {
  const summary = config.questions
    .map((question) => `• ${question.prompt} → ${formatAnswer(responses[question.id])}`)
    .join("\n");
  const discordChatId = (meta as { discordChatId?: string } | null)?.discordChatId;
  return {
    formId: config.id,
    formName: config.name,
    responses,
    summary,
    discordChatId,
    meta,
    completedAt: new Date().toISOString(),
  };
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function deliverCallback(env: Env, delivery: CallbackDelivery): Promise<void> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "fucktyping-voice-callback/1.0",
    "idempotency-key": delivery.id,
  };
  if (env.WEBHOOK_SIGNING_SECRET) {
    headers["X-Hub-Signature-256"] = `sha256=${await hmacHex(env.WEBHOOK_SIGNING_SECRET, delivery.payload)}`;
  }
  const response = await fetch(delivery.callbackUrl, {
    method: "POST",
    headers,
    body: delivery.payload,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`callback returned HTTP ${response.status}`);
}

async function consumeMessage(message: Message<CallbackQueueMessage>, env: Env): Promise<void> {
  const deliveryId = message.body?.deliveryId;
  if (typeof deliveryId !== "string" || deliveryId.length > 128) {
    console.error(JSON.stringify({ event: "callback_message_invalid", messageId: message.id }));
    message.ack();
    return;
  }

  const repository = new FormRepository(env);
  const delivery = await repository.claimCallbackDelivery(deliveryId);
  if (!delivery) {
    message.ack();
    return;
  }

  try {
    await deliverCallback(env, delivery);
    await repository.markCallbackDelivered(deliveryId);
    console.log(JSON.stringify({ event: "callback_delivered", deliveryId, formId: delivery.formId }));
    message.ack();
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : "callback failed";
    await repository.markCallbackRetrying(deliveryId, error);
    console.warn(JSON.stringify({ event: "callback_retry", deliveryId, formId: delivery.formId, error }));
    message.retry();
  }
}

export async function consumeCallbackBatch(batch: MessageBatch<CallbackQueueMessage>, env: Env): Promise<void> {
  if (batch.queue.endsWith("-dlq")) {
    await Promise.all(batch.messages.map(async (message) => {
      const deliveryId = message.body?.deliveryId;
      if (typeof deliveryId === "string") {
        await new FormRepository(env).markCallbackFailed(deliveryId, "queue retries exhausted");
        console.error(JSON.stringify({ event: "callback_dead_lettered", deliveryId }));
      }
      message.ack();
    }));
    return;
  }
  await Promise.all(batch.messages.map((message) => consumeMessage(message, env)));
}

export async function sweepPendingCallbacks(env: Env): Promise<void> {
  const repository = new FormRepository(env);
  const deliveryIds = await repository.listPendingCallbackIds(100);
  if (deliveryIds.length === 0) return;
  await env.CALLBACK_QUEUE.sendBatch(deliveryIds.map((deliveryId) => ({ body: { deliveryId } })));
  await Promise.all(deliveryIds.map((deliveryId) => repository.markCallbackQueued(deliveryId)));
  console.log(JSON.stringify({ event: "callback_outbox_swept", count: deliveryIds.length, env: env.APP_ENV }));
}
