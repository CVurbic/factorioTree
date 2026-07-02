# Crafting Tree — Current State Snapshot (2026-07-02)

Status audit of the core recipe-tree feature (not the Blueprints page). Captured before a planned mobile-first redesign, so future work has a clear "before" reference.

## Architecture

- Plain React hooks in `App.tsx` — no context/reducer. State: `activeItemIds`, `quantity`, `modalOpen`, `theme`, `collapsedMap`, `blueprintSearch`.
- Canvas is ReactFlow v12 (`@xyflow/react`). Custom node type `factorioNode` (`FactorioNode.tsx`), custom frame node `treeFrame` (`TreeFrame.tsx`), custom edge `conveyor` (`ConveyorEdge.tsx`).
- Multiple item trees coexist on one canvas: each active item gets its own `TreeFrame` container, node/edge IDs namespaced with `t${i}__`, frames laid out left-to-right with a 380px gap (`TREE_GAP`).
- `buildTree.ts` recursively walks `recipes-generated.ts` from a root item (depth-first). Cycle detection via an immutable `visited` Set threaded through recursion; hard depth cap of 20. Quantity scaling flows top-down (`craftsNeeded = amount / recipe.resultAmount`). Raw materials aggregated separately across all active trees.

## What's implemented and working

- Full recursive crafting tree, quantity scaling (1–100,000)
- Collapse/expand subtrees — persists across re-root and page refresh
- Multi-item canvas, draggable + resizable frames, positions persisted
- Usage lookup: hover a node, press **U** → popup of recipes that use it → click to extend the tree upward (rescales quantities); touch devices get a button instead of the U key
- Double-click a node to re-root the tree there; collapse state carries over to the new root
- Item picker: category tabs, search-by-name, auto-opens on empty canvas
- Raw materials panel, aggregated totals, resizable width
- PNG export (`html-to-image`, 2x pixel ratio)
- Dark/light theme toggle
- Mobile handling exists but is a parallel branch, not a shared foundation: touch detection via `'ontouchstart' in window`, tap-to-show tooltips instead of hover, a tap button instead of the U key

**Keyboard shortcuts actually wired:** U (usage popup), B (find blueprints for item), Delete/Backspace (remove selected frame), Escape (close picker/popup). That's it.

**Persistence (localStorage only, no backend sync):** `ft-items`, `ft-collapsed-map`, `ft-frame-pos`, `ft-theme`, `ft-raw-panel-w`.

## Known rough edges

- Frame-position localStorage parsing fails silently on corruption (no user-facing error/recovery)
- `uidCounter` in `buildFlowElements` is scoped per call — theoretically collision-prone if the same tree were built twice in one render cycle, though this doesn't happen in current code paths

## `RedesignGuide.txt` is aspirational, not implemented reality

That file describes a much more ambitious "production engineering simulator" vision. None of the following exist in the codebase today:

- Tabbed node headers (production/modules/details)
- Module slots, productivity/speed module math
- Power draw (kW) figures
- Quality tiers (Uncommon/Rare/Epic/Legendary color coding)
- Throughput-based conveyor edge animation speed (current edges animate at a fixed 1.1s regardless of flow rate)
- Efficiency percentages, bottleneck/status-aware node coloring
- Q (clear), E (toolbar toggle), Ctrl+F (search focus), Shift+click (copy/paste node settings) shortcuts

What *is* real from that doc: the dark skeuomorphic palette, inset shadows/beveled edges, group-based node accent colors, and animated (if not dynamic) conveyor chevrons.

## Why mobile-first isn't a trivial "nail mobile, desktop follows free" here

The desktop experience is built on interactions that don't scale down from mobile — they're additive: hover tooltips, keyboard shortcuts, drag-to-reposition frames, side-by-side multi-tree comparison. A real mobile-first pass likely needs a different interaction metaphor for small screens (e.g. drill-down/breadcrumb navigation through the tree) rather than a scaled-down version of the same 2D graph — meaning desktop and mobile should be treated as two intentional designs sharing the same underlying engine (`buildTree.ts` is screen-size-agnostic), not one flowing automatically into the other.
