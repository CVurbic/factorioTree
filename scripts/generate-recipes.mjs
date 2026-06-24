/**
 * Reads data-raw-dump.json → generates src/data/recipes-generated.ts
 * and copies all referenced item icons + group icons to public/icons/
 *
 * Run: node scripts/generate-recipes.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DUMP_PATH    = path.join(ROOT, 'src', 'assets', 'data-raw-dump.json')
const OUT_TS       = path.join(ROOT, 'src', 'data', 'recipes-generated.ts')
const PUBLIC_ICONS = path.join(ROOT, 'public', 'icons')

const FACTORIO_DATA = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Factorio\\data'

const MOD_PATHS = {
  '__base__':          path.join(FACTORIO_DATA, 'base'),
  '__core__':          path.join(FACTORIO_DATA, 'core'),
  '__space-age__':     path.join(FACTORIO_DATA, 'space-age'),
  '__elevated-rails__':path.join(FACTORIO_DATA, 'elevated-rails'),
  '__quality__':       path.join(FACTORIO_DATA, 'quality'),
}

const ITEM_SECTIONS = [
  'item', 'fluid', 'tool', 'module', 'ammo', 'gun', 'armor',
  'capsule', 'rail-planner', 'item-with-entity-data', 'selection-tool',
  'copy-paste-tool', 'car', 'spider-vehicle', 'repair-tool',
  'locomotive', 'cargo-wagon', 'fluid-wagon', 'artillery-wagon',
  'spidertron', 'asteroid-chunk',
]

// Groups to show in the UI (skip editor-only groups)
const VISIBLE_GROUPS = new Set([
  'logistics', 'production', 'intermediate-products',
  'space', 'combat', 'fluids', 'signals',
])

// ── helpers ───────────────────────────────────────────────────────────────────

function idToName(id) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function resolveIcon(iconStr) {
  if (!iconStr) return null
  for (const [token, dir] of Object.entries(MOD_PATHS)) {
    if (iconStr.startsWith(token)) {
      return iconStr.replace(token, dir).replace(/\//g, path.sep)
    }
  }
  return null
}

function getIconPath(entry) {
  if (!entry) return null
  if (entry.icon) return resolveIcon(entry.icon)
  if (Array.isArray(entry.icons) && entry.icons.length > 0) return resolveIcon(entry.icons[0].icon)
  return null
}

function copyFileTo(srcFile, destFile) {
  if (!srcFile || !fs.existsSync(srcFile)) return false
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.copyFileSync(srcFile, destFile)
  return true
}

// ── load dump ─────────────────────────────────────────────────────────────────

console.log('Reading dump…')
const dump = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf8'))
const rawRecipes  = dump.recipe          || {}
const rawGroups   = dump['item-group']   || {}
const rawSubgroups= dump['item-subgroup']|| {}

// Unified item lookup
const allEntries = {}
for (const section of ITEM_SECTIONS) {
  const sec = dump[section]
  if (!sec) continue
  for (const [k, v] of Object.entries(sec)) {
    if (!allEntries[k]) allEntries[k] = v
  }
}
console.log(`Unified item entries: ${Object.keys(allEntries).length}`)

// subgroup → group map
const subgroupToGroup = {}
for (const [subId, sub] of Object.entries(rawSubgroups)) {
  subgroupToGroup[subId] = sub.group || 'other'
}

// itemId → group
function getItemGroup(itemId) {
  const entry = allEntries[itemId]
  if (!entry?.subgroup) return 'other'
  return subgroupToGroup[entry.subgroup] || 'other'
}

// ── process groups ─────────────────────────────────────────────────────────────

const groupIconDir = path.join(PUBLIC_ICONS, 'groups')
fs.mkdirSync(groupIconDir, { recursive: true })

const groups = []
for (const [gId, g] of Object.entries(rawGroups)) {
  if (!VISIBLE_GROUPS.has(gId)) continue
  const iconSrc = resolveIcon(g.icon)
  const iconDest = path.join(groupIconDir, `${gId}.png`)
  const iconOk = copyFileTo(iconSrc, iconDest)
  if (!iconOk) console.warn(`  [group icon missing] ${gId}`)
  groups.push({ id: gId, name: idToName(gId.replace(/-/g, ' ')), order: g.order })
}
groups.sort((a, b) => a.order.localeCompare(b.order))
console.log(`Groups: ${groups.length}`)

// ── build recipe list ──────────────────────────────────────────────────────────

const SKIP_PREFIX = ['parameter-', 'recipe-unknown']

const recipes = []
for (const [key, r] of Object.entries(rawRecipes)) {
  if (SKIP_PREFIX.some(p => key.startsWith(p))) continue
  if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) continue
  if (!Array.isArray(r.results)     || r.results.length === 0)     continue

  const primaryResult = r.results[0]
  const outputId      = primaryResult.name
  const resultAmount  = primaryResult.amount ?? 1

  const ingredients = r.ingredients.map(ing => ({
    id:     ing.name,
    name:   idToName(ing.name),
    amount: ing.amount ?? 1,
    type:   ing.type ?? 'item',
  }))

  const group = getItemGroup(outputId)
  const craftingTime = typeof r.energy_required === 'number' ? r.energy_required : 0.5
  const isFluid = !!(dump.fluid && dump.fluid[outputId])
  const entry = allEntries[outputId]
  const subgroup = entry?.subgroup ?? ''
  const subgroupOrder = rawSubgroups[subgroup]?.order ?? ''
  const itemOrder = entry?.order ?? ''

  recipes.push({ id: outputId, name: idToName(outputId), resultAmount, ingredients, group, craftingTime, isFluid, subgroup, subgroupOrder, itemOrder })
}

// deduplicate by output id
const seen = new Set()
const deduped = recipes.filter(r => {
  if (seen.has(r.id)) return false
  seen.add(r.id)
  return true
})
console.log(`Recipes: ${deduped.length}`)

// ── copy item icons ────────────────────────────────────────────────────────────

fs.mkdirSync(PUBLIC_ICONS, { recursive: true })

const allIds = new Set()
for (const r of deduped) {
  allIds.add(r.id)
  for (const ing of r.ingredients) allIds.add(ing.id)
}

let copied = 0, missing = 0
for (const id of allIds) {
  const entry    = allEntries[id]
  const srcFile  = getIconPath(entry)
  const destFile = path.join(PUBLIC_ICONS, `${id}.png`)
  if (copyFileTo(srcFile, destFile)) copied++
  else { console.warn(`  [no icon] ${id}`); missing++ }
}
console.log(`Item icons: ${copied} copied, ${missing} missing`)

// ── emit TypeScript ────────────────────────────────────────────────────────────

const lines = [
  `// AUTO-GENERATED — do not edit. Run: node scripts/generate-recipes.mjs`,
  ``,
  `export interface Ingredient {`,
  `  id: string`,
  `  name: string`,
  `  amount: number`,
  `  type: 'item' | 'fluid'`,
  `}`,
  ``,
  `export interface Recipe {`,
  `  id: string`,
  `  name: string`,
  `  resultAmount: number`,
  `  ingredients: Ingredient[]`,
  `  group: string`,
  `  craftingTime: number`,
  `  isFluid: boolean`,
  `  subgroup: string`,
  `  subgroupOrder: string`,
  `  itemOrder: string`,
  `}`,
  ``,
  `export interface ItemGroup {`,
  `  id: string`,
  `  name: string`,
  `  order: string`,
  `}`,
  ``,
  `export const itemGroups: ItemGroup[] = ${JSON.stringify(groups, null, 2)}`,
  ``,
  `export const recipes: Recipe[] = ${JSON.stringify(deduped, null, 2)}`,
  ``,
  `export const craftableItems = recipes`,
  ``,
]

fs.writeFileSync(OUT_TS, lines.join('\n'), 'utf8')
console.log(`Written → src/data/recipes-generated.ts`)
