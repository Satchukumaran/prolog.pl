# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

A rule-based financial advisory system.

- **Backend (`/prolog`)**: SWI-Prolog expert system exposed as a JSON HTTP API.
- **Frontend (`/web`)**: Next.js (App Router) app with a form and results view.
- **Flow**: Browser form → Next.js API route → Prolog HTTP server → JSON → Browser.

Prolog is the single source of truth for advice logic. The frontend only collects input and renders output. Do not reimplement advice rules in JavaScript.

## Repository layout

```
/prolog
  rules.pl        # facts, derived predicates, advice rules (pure logic, no I/O)
  server.pl       # HTTP server, JSON handlers, input validation
  tests.pl        # plunit tests
/web
  app/page.js             # form + results UI
  app/api/advise/route.js # proxy to Prolog service
  .env.local              # PROLOG_URL (not committed)
AGENTS.md
```

Adjust paths above if the actual layout differs, and keep this section current.

## Commands

| Task | Command |
|------|---------|
| Start Prolog API | `cd prolog && swipl server.pl` (port 8080) |
| Run Prolog tests | `cd prolog && swipl -g run_tests -t halt tests.pl` |
| Start frontend | `cd web && npm run dev` (port 3000) |
| Lint frontend | `cd web && npm run lint` |
| Build frontend | `cd web && npm run build` |

Before finishing any change, run the Prolog tests and the frontend lint/build for whichever side you touched.

## Architecture rules

1. **Keep logic pure.** Rules in `rules.pl` take client data as an argument (for example `advice(Client, Advice)`). Do not use global `assert`/`retract` state for per-request data; it is unsafe under concurrent requests.
2. **Separate concerns.** `rules.pl` has no HTTP or I/O. `server.pl` handles transport, parsing, and validation only.
3. **The browser never calls Prolog directly.** All calls go through the Next.js API route. The Prolog URL comes from `PROLOG_URL`, never hardcoded.
4. **JSON contract is stable.** Changing request or response fields requires updating the Prolog handler, the API route, the UI, and the tests together.

## API contract

`POST /advise`

Request:

```json
{
  "age": 30,
  "income": 5000,
  "expenses": 3000,
  "savings": 10000,
  "debt": 0,
  "risk": "low | medium | high",
  "horizon": 10
}
```

Response:

```json
{
  "advice": [{ "text": "string", "reason": "string" }],
  "savingsRate": 0.4
}
```

Error responses use an HTTP error status and `{ "error": "message" }`.

## Prolog conventions

- JSON strings arrive as strings; convert enum-like values (such as `risk`) to atoms before matching.
- Validate all inputs in `server.pl` (numbers present, non-negative, `risk` in the allowed set) and reject bad input with a 400 before it reaches the rules.
- Every piece of advice carries a human-readable `reason`. Add one with each new rule.
- Name predicates in `snake_case`; document each with a `%!` PlDoc comment stating its arguments.
- Guard against division by zero and missing data in derived predicates.
- Add or update a plunit test for every new or changed rule, using representative client profiles (low income, high debt, no emergency fund, high risk with long horizon, and so on).

## Frontend conventions

- Next.js App Router, functional components, hooks.
- Client components that use state start with `"use client"`.
- Convert numeric inputs to numbers before sending; show loading and error states.
- Render advice and its reason; never display raw server errors to users.
- Keep styling simple and consistent with existing components.

## Do

- Make small, focused changes and explain what changed and why.
- Update tests and this file when behavior or structure changes.
- Ask before adding dependencies.

## Don't

- Don't commit secrets or `.env*` files.
- Don't move advice logic into the frontend.
- Don't present output as licensed financial advice. The UI must keep a visible disclaimer that results are general guidance only.
- Don't change the API contract without updating every layer listed above.

## Deployment notes

- Frontend can be hosted on Vercel; the Prolog service cannot run there. Host it separately (VPS, Render, Fly.io, or Docker with the `swipl` image) and set `PROLOG_URL` in the frontend environment.
- Restrict CORS on the Prolog server to the known frontend origin in production.
