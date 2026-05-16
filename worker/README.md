# Worker — landing-page-generator

Cloudflare Worker. Holds your Anthropic API key, proxies streaming responses, applies the style block to the system prompt.

## Deploy (first time)

Run in terminal:

```sh
cd /Users/emil/Code/landing-page-generator/worker
npx wrangler@latest login
npx wrangler@latest deploy
npx wrangler@latest secret put ANTHROPIC_API_KEY
# paste the key when prompted, hit return
```

After deploy, wrangler prints the Worker URL like:
`https://landing-page-generator-worker.YOUR-SUBDOMAIN.workers.dev`

Update `WORKER_URL` (top of `app.js` in repo root) with that URL.

## Redeploy

Run in terminal:

```sh
cd /Users/emil/Code/landing-page-generator/worker && npx wrangler@latest deploy
```

## Rotate the key

```sh
cd /Users/emil/Code/landing-page-generator/worker && npx wrangler@latest secret put ANTHROPIC_API_KEY
```

## Local dev (optional)

```sh
cd /Users/emil/Code/landing-page-generator/worker && npx wrangler@latest dev
```

Worker runs at `http://localhost:8787`. Set `WORKER_URL` in `app.js` to that during dev.
