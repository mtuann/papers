# Research Papers website

Static Next.js site for [mtuann.github.io/papers](https://mtuann.github.io/papers/). It reads
`public/data/topics.json` and `public/data/<topic>.json`, which `../run.sh --push` regenerates and pushes;
GitHub Actions (`.github/workflows/deploy.yml`) then rebuilds the site.

```bash
npm install
npm run dev        # http://localhost:3000/?topic=llm_serving
```

Topics, descriptions and counts come from `shiny/config.py` in the parent folder; there is nothing to edit here
when a topic is added or hidden. UI: `app/page.tsx` (filters, list), `components/PaperCard.tsx`, colours in `tailwind.config.js`.
