# Cloudflare Pages deployment

The `madcn` project uses Direct Upload and `main` is its production branch.
The Pages workflow tests a revision before uploading the staged static files.
Use GitHub environments named `preview` and `production`, with
`CLOUDFLARE_ACCOUNT_ID` and a `CLOUDFLARE_API_TOKEN` granted Pages Edit for
this account. Pull requests from forks run the component workflow without
Cloudflare credentials. Trusted branches can produce previews at
`https://pr-N.madcn.pages.dev`, including the comparison at `/tests/reference/`.

For a manual preview from a checked-out revision:

```sh
npm ci
npm test
npx vite build --config tests/reference/vite.config.mjs
node scripts/stage-pages.mjs --preview
npx wrangler pages deploy .pages-stage --project-name madcn --branch qa
bash scripts/verify-pages.sh https://qa.madcn.pages.dev
```

For production, stage without `--preview` and deploy with `--branch main`.
Confirm the active deployment in Cloudflare Pages. To restore an older
production version, use **Deployments → Rollback to this deployment** for
the known-good build and verify the production URLs.
