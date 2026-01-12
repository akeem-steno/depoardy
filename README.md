# Depoardy (Guru Embed)

This repo is prepped to deploy your React JSX game to **GitHub Pages**, so you can embed it in **Guru**.

## Local run

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

1) Push this repo to GitHub.
2) In GitHub: **Settings → Pages**
   - **Source:** *GitHub Actions*
3) Push to `main` (or re-run the workflow).

Your site will be available at:
`https://<your-username>.github.io/<your-repo-name>/`

## Embed in Guru

Use an iframe (Guru embed block or HTML):

```html
<iframe
  src="https://<your-username>.github.io/<your-repo-name>/"
  width="100%"
  height="700"
  style="border:0; border-radius: 12px;"
></iframe>
```

> Tip: If Guru feels cramped, increase `height` (e.g., 800–1000).
