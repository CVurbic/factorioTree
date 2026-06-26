# Factorio Crafting Tree

An interactive crafting tree visualizer for [Factorio](https://factorio.com). Select any craftable item and instantly see its full production chain — ingredients, sub-ingredients, crafting times, and raw material totals. Supports the Space Age DLC.

**[factorio-tree.vercel.app](https://factorio-tree.vercel.app/)**

![Factorio Crafting Tree screenshot](src/assets/hero.png)

## Features

- **Full crafting tree** — recursive breakdown of every ingredient down to raw materials, quantities scaled to your desired output
- **Multi-item canvas** — add multiple items side by side, drag frames anywhere on the canvas
- **Collapse / expand** subtrees to focus on what matters; state survives re-rooting and page refresh
- **Raw materials panel** — aggregated totals across all active trees
- **Usage lookup** — hover any node and press **U** to see every recipe that uses that item; click one to extend the current tree upward to that recipe (quantities rescale automatically)
- **Double-click to re-root** — double-click any node to make it the new root of its tree
- **Blueprint preview** — paste a blueprint string to get a canvas rendering of the entities
- **Item picker** — Factorio-style inventory grid, sorted by group and subgroup
- **Quantity scaling** — set desired output quantity, all amounts update accordingly
- **Export to PNG** — capture the current canvas
- **Persistent state** — last items, collapse state, and frame positions survive page refresh

## Getting started

```bash
npm install
npm run dev
```

Icons and recipe data are included in the repo — no Factorio install needed to run the dev server.

## Regenerating recipe data (optional)

If you want to regenerate the recipe data after a game update:

1. Launch Factorio with `--dump-data` — writes `script-output/data-raw-dump.json`
2. Copy the dump to `src/assets/data-raw-dump.json`
3. Run the generator:

```bash
node scripts/generate-recipes.mjs
```

This rewrites `src/data/recipes-generated.ts` and copies all item icons to `public/icons/`.

## Tech stack

- [Vite](https://vitejs.dev) + [React](https://react.dev) + [TypeScript](https://typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [@xyflow/react](https://reactflow.dev) (ReactFlow v12) for the canvas
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export

## Project structure

```
src/
  components/       # React components (FactorioNode, TreeFrame, ItemPickerModal, …)
  data/             # Generated recipe + item data
  utils/            # buildTree, getRawMaterials
  types.ts
scripts/
  generate-recipes.mjs   # Data pipeline from Factorio dump → TypeScript
public/icons/            # Item and group icons (copied by generator)
```

## Attribution

Factorio and all game content, icons, and data are © [Wube Software](https://www.wube.com). This is an unofficial fan project with no affiliation with Wube Software. Game data is used for non-commercial, informational purposes under fair use principles consistent with Wube's supportive stance toward community tools.

## License

MIT — see [LICENSE](LICENSE) for details.
