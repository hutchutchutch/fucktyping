# Cloudflare private-beta launch runbook

## Live resources

- Staging Worker: `https://fucktyping-edge-staging.hutchenbach.workers.dev`
- Production Worker: `https://fucktyping-edge.hutchenbach.workers.dev`
- Staging D1: `fucktyping-staging` (`3ec19b20-f105-43f5-8b02-c1b1d74e89fa`)
- Production D1: `fucktyping` (`8e652f6b-6712-4b48-9450-ba7651bb8fa4`)

The staging Worker, D1 database, Durable Objects, queues, rate-limit namespaces, and
runtime secrets are isolated from production. The old `fucktyping-studio` Pages project
is not in the request path after cutover; keep it available until production validation
is complete.

## Verified staging baseline

The launch suite exercises creator authentication, security headers, URL-fragment token
scrubbing, a real Workers AI authoring turn, D1 publication, a signed respondent URL,
the Durable Object WebSocket conversation, response persistence, and Queue callback
delivery.

```bash
stage_creator_token=$(security find-generic-password \
  -a fucktyping-staging -s fucktyping-creator-token -w)
E2E_BASE_URL=https://fucktyping-edge-staging.hutchenbach.workers.dev \
E2E_ENV=staging \
E2E_CREATOR_KEY="$stage_creator_token" \
E2E_FULL_FLOW=1 \
npm run test:e2e
```

The staging creator key is stored in macOS Keychain under service
`fucktyping-creator-token`, account `fucktyping-staging`.

## Production rollback points

Captured immediately before the launch migrations and cutover:

- Worker version: `109af385-eec4-4f4f-9766-42cc9f2aaaed`
- D1 Time Travel bookmark: `00000027-00000000-000050d8-0f11bc71fa4e5b62298a9639175d3342`

Worker rollback:

```bash
cd apps/edge
npx wrangler rollback 109af385-eec4-4f4f-9766-42cc9f2aaaed --env="" --yes \
  --message="Rollback private-beta launch"
```

D1 rollback is destructive to writes made after the bookmark. Use it only after
stopping production traffic and explicitly confirming those newer writes may be lost:

```bash
cd apps/edge
npx wrangler d1 time-travel restore fucktyping \
  --bookmark 00000027-00000000-000050d8-0f11bc71fa4e5b62298a9639175d3342 \
  --env=""
```

## Cutover sequence

1. Require a green `CI / Validate launch build` check on `main`.
2. Confirm production has `SESSION_SECRET`, `CREATE_TOKEN`, and
   `WEBHOOK_SIGNING_SECRET` in `wrangler secret list`.
3. Record `wrangler deployments status` and a fresh D1 Time Travel bookmark.
4. From `apps/edge`, run `npm run db:migrate` and `npm run deploy` using the local
   authenticated Wrangler session.
5. Confirm `/health` returns `{"status":"ok","env":"production"}` and run the browser
   suite against the production URL with the production creator key. Do not set
   `E2E_FULL_FLOW`; production smoke tests must not create launch-test records.
6. Verify form/response counts and callback state in D1.
7. Observe errors, latency, and Queue/DLQ state before removing the old Pages project.

The optional GitHub deployment workflow is dispatch-only. It remains available if a
scoped Cloudflare API token is added later, but merging to `main` never deploys by
itself.

Do not restore D1 merely to roll back code. Worker rollback and D1 Time Travel are
separate operations because schema migrations 0003 and 0004 are additive and compatible
with the prior Worker.
