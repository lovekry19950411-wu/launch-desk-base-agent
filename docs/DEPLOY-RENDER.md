# Move Launch Desk Base Agent off Vercel

Vercel deployment is paused, so use Render as the fastest replacement for the public demo.

## Render setup

1. Go to Render and create a new Web Service.
2. Connect GitHub repo:
   `https://github.com/lovekry19950411-wu/launch-desk-base-agent`
3. Use these settings:
   - Runtime: Node
   - Build command: `npm ci`
   - Start command: `npm start`
   - Plan: Free is enough for the public proof demo
4. Add environment variable after Render gives you a URL:
   - `PUBLIC_BASE_URL=https://your-render-url.onrender.com`

## What this deploy serves

- `/` public Base Agent demo page
- `/api/status` public agent status
- `/api/catalog` public API catalog
- `/api/proof` public Base/x402 proof
- `/api/run-demo` simulated runtime POST endpoint
- `/openapi.json` API schema
- `/owner-deploy` owner deployment helper page

## Do not upload

Keep these local only:

- `.env`
- `.env.local`
- private keys
- wallet secret files
- `node_modules`
