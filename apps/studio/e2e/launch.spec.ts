import { expect, test } from "@playwright/test";

test("creator gate authenticates, opens the same-origin studio, and locks again", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "FuckTyping Studio" })).toBeVisible();
  const accessKey = page.getByLabel("Creator access key");
  await accessKey.fill("incorrect-key");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByRole("alert")).toHaveText("invalid access key");

  await accessKey.fill(process.env.E2E_CREATOR_KEY ?? "e2e-creator-key");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByText("Build a voice form", { exact: true })).toBeVisible();
  await expect(page.getByText("New form", { exact: true })).toBeVisible();

  if (process.env.E2E_SCREENSHOT_PATH) {
    await page.screenshot({ path: process.env.E2E_SCREENSHOT_PATH, fullPage: true });
  }

  await page.getByRole("button", { name: "Lock studio" }).click();
  await expect(page.getByRole("heading", { name: "FuckTyping Studio" })).toBeVisible();
});

test("static shell has launch security headers and health identifies the environment", async ({ request }) => {
  const shell = await request.get("/");
  expect(shell.status()).toBe(200);
  expect(shell.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(shell.headers()["x-content-type-options"]).toBe("nosniff");
  expect(shell.headers()["referrer-policy"]).toBe("no-referrer");

  const health = await request.get("/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({
    status: "ok",
    env: process.env.E2E_ENV ?? "production",
  });
});

test("responder captures then removes bearer material from its URL", async ({ page }) => {
  await page.goto("/respond/form-1#token=not-a-real-token");
  await expect(page).toHaveURL(/\/respond\/form-1$/);
  await expect(page.getByText("Connecting…", { exact: true })).toBeVisible();
});

test("staging authors and publishes a form with Workers AI", async ({ page }) => {
  test.skip(!process.env.E2E_CREATOR_KEY, "requires a deployed environment creator key");

  await page.goto("/");
  await page.getByLabel("Creator access key").fill(process.env.E2E_CREATOR_KEY!);
  await page.getByRole("button", { name: "Enter studio" }).click();

  await page.getByPlaceholder("Describe your form, or refine a question…").fill(
    "Create a form named Launch AI Smoke. Open with 'Thanks for testing.' Ask one required yes or no question: 'Did the launch check work?' Close with 'Validation complete.'",
  );
  await page.getByRole("button", { name: "Send" }).click();

  const publish = page.getByRole("button", { name: "Publish" });
  await expect(publish).toBeEnabled({ timeout: 60_000 });
  await publish.click();
  await expect(page.getByText(/Published ✓/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Did the launch check work?", { exact: true })).toBeVisible();
});

test("staging completes a signed respondent WebSocket session", async ({ page, request }) => {
  test.skip(!process.env.E2E_CREATOR_KEY, "requires a deployed environment creator key");

  const id = `launch-${Date.now()}`;
  const created = await request.post("/forms", {
    headers: { authorization: `Bearer ${process.env.E2E_CREATOR_KEY}` },
    data: {
      config: {
        id,
        name: "Launch respondent smoke",
        openingActivity: { prompt: "Welcome to the launch check." },
        questions: [
          {
            id: "worked",
            prompt: "Did the launch check work?",
            expectedResponseFormat: "yes_no",
            required: true,
            maxAttempts: 2,
          },
        ],
        closingActivity: { prompt: "Launch check complete." },
      },
      callbackUrl: "https://httpbin.org/status/204",
      meta: { source: "launch-e2e" },
      ttlDays: 1,
    },
  });
  expect(created.status()).toBe(200);
  const body = await created.json() as { formId: string; responderUrl: string };
  expect(body.formId).toBe(id);

  const result = await page.evaluate(async ({ responderUrl, formId }) => {
    const url = new URL(responderUrl);
    const token = new URLSearchParams(url.hash.slice(1)).get("token");
    if (!token) throw new Error("responder URL did not include a token fragment");
    const sessionId = `browser-${Date.now()}`;
    const socketUrl = `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}/forms/${formId}/session?session=${sessionId}&token=${encodeURIComponent(token)}`;

    return new Promise<{ sessionId: string; replies: { text: string; done: boolean }[] }>((resolve, reject) => {
      const replies: { text: string; done: boolean }[] = [];
      const timeout = window.setTimeout(() => {
        socket.close();
        reject(new Error("respondent WebSocket timed out"));
      }, 60_000);
      const socket = new WebSocket(socketUrl);
      socket.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("respondent WebSocket failed"));
      };
      socket.onopen = () => socket.send(JSON.stringify({ type: "start", form_id: formId }));
      socket.onmessage = (event) => {
        const reply = JSON.parse(String(event.data)) as { text: string; done: boolean };
        replies.push(reply);
        if (replies.length === 1) {
          socket.send(JSON.stringify({ type: "user_answer", text: "yes" }));
        } else if (reply.done) {
          window.clearTimeout(timeout);
          socket.close();
          resolve({ sessionId, replies });
        }
      };
    });
  }, { responderUrl: body.responderUrl, formId: body.formId });

  expect(result.replies).toHaveLength(2);
  expect(result.replies[0].done).toBe(false);
  expect(result.replies[1]).toMatchObject({ text: "Launch check complete.", done: true });
  expect(result.sessionId).toMatch(/^browser-/);
});
