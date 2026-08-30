import { expect, test } from "@playwright/test";

test("creator gate authenticates, opens the same-origin studio, and locks again", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "FuckTyping Studio" })).toBeVisible();
  const accessKey = page.getByLabel("Creator access key");
  await accessKey.fill("incorrect-key");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByRole("alert")).toHaveText("invalid access key");

  await accessKey.fill("e2e-creator-key");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByText("Build a voice form", { exact: true })).toBeVisible();
  await expect(page.getByText("New form", { exact: true })).toBeVisible();

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
  expect(await health.json()).toEqual({ status: "ok", env: "production" });
});

test("responder captures then removes bearer material from its URL", async ({ page }) => {
  await page.goto("/respond/form-1#token=not-a-real-token");
  await expect(page).toHaveURL("http://127.0.0.1:18999/respond/form-1");
  await expect(page.getByText("Connecting…", { exact: true })).toBeVisible();
});
