import { expect, test, type Page } from "@playwright/test";

async function completeRespondentSession(page: Page, responderUrl: string, formId: string) {
  return page.evaluate(async ({ responderUrl, formId }) => {
    const url = new URL(responderUrl);
    const token = new URLSearchParams(url.hash.slice(1)).get("token");
    if (!token) throw new Error("responder URL did not include a token fragment");
    const sessionId = `browser-${Date.now()}-${crypto.randomUUID()}`;
    const socketUrl = `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}/forms/${formId}/session?session=${sessionId}`;

    return new Promise<{ sessionId: string; replies: { text: string; done: boolean }[] }>((resolve, reject) => {
      const replies: { text: string; done: boolean }[] = [];
      const timeout = window.setTimeout(() => {
        socket.close();
        reject(new Error("respondent WebSocket timed out"));
      }, 60_000);
      const socket = new WebSocket(socketUrl, ["fucktyping", `fucktyping-auth.${token}`]);
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
  }, { responderUrl, formId });
}

function testForm(id: string, opening: string) {
  return {
    id,
    name: id,
    openingActivity: { prompt: opening },
    questions: [{
      id: "worked",
      prompt: "Did it work?",
      expectedResponseFormat: "yes_no",
      required: true,
      maxAttempts: 2,
    }],
    closingActivity: { prompt: "Complete." },
  };
}

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
  expect(await health.json()).toMatchObject({
    status: "ok",
    env: process.env.E2E_ENV ?? "production",
    versionId: expect.any(String),
  });
});

test("responder captures then removes fragment bearer material from its URL", async ({ page }) => {
  await page.goto("/respond/form-1#token=not-a-real-token");
  await expect(page).toHaveURL(/\/respond\/form-1$/);
  await expect(page.getByText("Invalid or expired link.", { exact: true })).toBeVisible();
});

test("an authorized respondent socket cannot switch to a different form", async ({ page, request }) => {
  const suffix = `${Date.now()}-${crypto.randomUUID()}`;
  const authorizedId = `authorized-${suffix}`;
  const otherId = `other-${suffix}`;
  const headers = { authorization: "Bearer e2e-creator-key" };
  const [authorized, other] = await Promise.all([
    request.post("/forms", { headers, data: { config: testForm(authorizedId, "Authorized opening.") } }),
    request.post("/forms", { headers, data: { config: testForm(otherId, "Private other opening.") } }),
  ]);
  expect(authorized.status()).toBe(200);
  expect(other.status()).toBe(200);
  const created = await authorized.json() as { responderUrl: string };

  const firstReply = await page.evaluate(async ({ responderUrl, authorizedId, otherId }) => {
    const url = new URL(responderUrl);
    const token = new URLSearchParams(url.hash.slice(1)).get("token");
    if (!token) throw new Error("missing token");
    const socketUrl = `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}/forms/${authorizedId}/session?session=cross-form-check`;
    return new Promise<{ text: string; done: boolean }>((resolve, reject) => {
      const socket = new WebSocket(socketUrl, ["fucktyping", `fucktyping-auth.${token}`]);
      const timeout = window.setTimeout(() => reject(new Error("socket timed out")), 10_000);
      socket.onerror = () => reject(new Error("socket failed"));
      socket.onopen = () => socket.send(JSON.stringify({ type: "start", form_id: otherId }));
      socket.onmessage = (event) => {
        window.clearTimeout(timeout);
        socket.close();
        resolve(JSON.parse(String(event.data)) as { text: string; done: boolean });
      };
    });
  }, { responderUrl: created.responderUrl, authorizedId, otherId });

  expect(firstReply).toMatchObject({ type: "assistant", done: false });
  expect(firstReply.text).toContain("Authorized opening.");
  expect(firstReply.text).not.toContain("Private other opening.");
});

test("respondent reload resumes the same session and supports a typed answer", async ({ page, request }) => {
  const formId = `resume-${Date.now()}-${crypto.randomUUID()}`;
  const created = await request.post("/forms", {
    headers: { authorization: "Bearer e2e-creator-key" },
    data: { config: testForm(formId, "Resume opening.") },
  });
  expect(created.status()).toBe(200);
  const { responderUrl } = await created.json() as { responderUrl: string };

  await page.goto(responderUrl);
  await expect(page.locator(".responder-question")).toHaveText("Resume opening. Did it work?");
  await expect(page).toHaveURL(new RegExp(`/respond/${formId}$`));

  await page.reload();
  await expect(page.locator(".responder-question")).toHaveText("Did it work?");
  await page.getByLabel("Or type your answer").fill("yes");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("heading", { name: "All done ✓" })).toBeVisible();

  await page.goto("/");
  await page.getByLabel("Creator access key").fill("e2e-creator-key");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await page.getByRole("button", { name: formId, exact: true }).click();
  await expect(page.locator(".responses-head")).toContainText(formId);
  await expect(page.locator(".response-card dd")).toHaveText("true");

  await page.getByRole("button", { name: "Create share link" }).click();
  await expect(page.getByRole("link", { name: /Open respondent form/ })).toHaveAttribute("href", /#token=/);
});

test("staging authors, publishes, and completes the returned respondent link", async ({ page }) => {
  test.skip(
    !process.env.E2E_CREATOR_KEY || process.env.E2E_FULL_FLOW !== "1",
    "requires an explicit deployed-environment full-flow opt in",
  );
  test.setTimeout(90_000);

  await page.goto("/");
  await page.getByLabel("Creator access key").fill(process.env.E2E_CREATOR_KEY!);
  await page.getByRole("button", { name: "Enter studio" }).click();

  const composer = page.getByPlaceholder("Describe your form, or refine a question…");
  await composer.fill(
    "Create a form named Launch AI Smoke. Open with 'Thanks for testing.' Ask one required yes or no question: 'Did the launch check work?' Close with 'Validation complete.'",
  );
  const send = page.getByRole("button", { name: "Send" });
  await expect(send).toBeEnabled({ timeout: 15_000 });
  await send.click();

  const publish = page.getByRole("button", { name: "Publish" });
  await expect(publish).toBeEnabled({ timeout: 60_000 });
  await publish.click();
  await expect(page.getByText(/Published ✓/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Did the launch check work?", { exact: true })).toBeVisible();
  const respondentLink = page.getByRole("link", { name: /Open respondent form/ });
  const responderUrl = await respondentLink.getAttribute("href");
  expect(responderUrl).toMatch(/\/respond\/.+#token=/);
  const formId = new URL(responderUrl!).pathname.split("/").pop()!;
  const result = await completeRespondentSession(page, responderUrl!, formId);
  expect(result.replies.at(-1)).toMatchObject({ text: "Validation complete.", done: true });
});

test("staging completes a signed respondent WebSocket session", async ({ page, request }) => {
  test.skip(
    !process.env.E2E_CREATOR_KEY || process.env.E2E_FULL_FLOW !== "1",
    "requires an explicit deployed-environment full-flow opt in",
  );

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

  const result = await completeRespondentSession(page, body.responderUrl, body.formId);

  expect(result.replies).toHaveLength(2);
  expect(result.replies[0].done).toBe(false);
  expect(result.replies[1]).toMatchObject({ text: "Launch check complete.", done: true });
  expect(result.sessionId).toMatch(/^browser-/);
});
