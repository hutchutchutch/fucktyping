# @fucktyping/edge

The production Cloudflare Worker for FuckTyping. It serves the Studio SPA and API from
one origin, runs creator and respondent sessions in Durable Objects, calls Workers AI,
stores forms/responses/callback state in D1, and delivers completion callbacks through
Cloudflare Queues.

```text
browser ──HTTPS/WS──▶ Worker + static assets
                          ├── Durable Objects (authoring and response sessions)
                          ├── Workers AI (GLM authoring/validation and Whisper STT)
                          ├── D1 (forms, responses, callback outbox)
                          └── Queue consumer (signed completion callbacks)
```

## Security model

- `POST /auth/creator` exchanges the private-beta access key for a short-lived,
  HMAC-signed creator token.
- Creator routes require an `authoring` token; response routes require a form-bound
  `respond` token.
- Respondent bearer material is placed in the URL fragment and removed by the client
  immediately after loading.
- Native Worker rate limits protect authentication and public endpoints.
- Completion callbacks accept only public HTTPS targets and are signed when
  `WEBHOOK_SIGNING_SECRET` is configured.

## Local development

```bash
cd apps/edge
npm ci
npm run db:migrate:local
npm run dev
```

Wrangler may use `.dev.vars` for local-only values. Never commit that file.

```dotenv
SESSION_SECRET=replace-with-a-long-random-value
CREATE_TOKEN=your-private-beta-access-key
WEBHOOK_SIGNING_SECRET=replace-with-a-different-random-value
```

The deterministic validator remains available if an AI request fails, but both
authoring and validation normally call the configured Workers AI binding directly.

## Verification

```bash
npm test
npm run typecheck
npm run types:worker -- --check
npm run build:studio
npx wrangler deploy --dry-run --env=""
npx wrangler deploy --dry-run --env staging
```

The browser suite lives in `apps/studio` and starts this Worker locally:

```bash
npm --prefix ../studio run test:e2e
```

## Deployments

Staging is a separate Worker with isolated D1, Durable Objects, queues, rate-limit
namespaces, and secrets.

```bash
# Configure each environment once (commands prompt without printing the value).
npx wrangler secret put SESSION_SECRET --env staging
npx wrangler secret put CREATE_TOKEN --env staging
npx wrangler secret put WEBHOOK_SIGNING_SECRET --env staging

# Then migrate and deploy.
npm run db:migrate:staging
npm run deploy:staging
```

Production uses the same commands without `--env staging`. The primary private-beta
cutover is intentionally manual through an authenticated local Wrangler session; see
`docs/cloudflare-launch-runbook.md`. The optional GitHub deployment workflow is
dispatch-only and records the current Worker deployment and D1 Time Travel bookmark
before it applies additive migrations.

If GitHub deployment is enabled later, configure these environment secrets for both
`staging` and `production`:

- `CLOUDFLARE_API_TOKEN`: scoped to Workers Scripts, D1, Queues, and Workers Tail read.
- `CLOUDFLARE_ACCOUNT_ID`: the account containing the configured resource IDs.

Runtime secrets (`SESSION_SECRET`, `CREATE_TOKEN`, and `WEBHOOK_SIGNING_SECRET`) live in
Cloudflare, not GitHub. Rotate creator/session secrets independently per environment.
