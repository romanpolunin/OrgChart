# Org chart layout (TypeScript)

TypeScript port of the C# layout engine in `RomanPolunin.OrgChart.Net`. The demo is a static page. `index.html` imports the layout module and the page module. It does not fetch chart data.

## Scripts

From this directory, with [Bun](https://bun.sh):

```
bun install
bun test
bun run check
bun run build
bun run preview
```

`bun test` checks the seeded random sequence, every built-in strategy, collapse, and a chart whose coordinates match the C# engine.

`bun run check` runs `tsc --noEmit`.

`bun run build` writes `demo/orgchart.js` and `demo/demo.js`. `demo/index.html` imports `./orgchart.js` and `./demo.js`, then calls `mount`. Open the printed address from `bun run preview`. A browser will not load those imports from a `file://` page.

## Layout

`src/` is the layout engine. `src/index.ts` is the public entry. `src/browser.ts` is the browser bundle entry and also exports the seeded chart generator. `demo/` is the studio page. `test/` holds the Bun tests.
