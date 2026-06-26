// Extracts Factorio entity sprites and builds a manifest for the blueprint renderer.
// Prerequisites:
//   1. Run Factorio once with --dump-data to generate data-raw-dump.json
//      (it's already at %APPDATA%\Factorio\script-output\data-raw-dump.json)
//   2. Run: node scripts/extract-sprites.mjs

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { homedir } from 'os'

const FACTORIO_DATA = 'C:/Program Files (x86)/Steam/steamapps/common/Factorio/data'
const DUMP_PATH = join(homedir(), 'AppData/Roaming/Factorio/script-output/data-raw-dump.json')
const OUT_DIR = 'public/entities'

// Maps __mod__ prefixes to filesystem paths
const MOD_ROOTS = {
  '__base__':       join(FACTORIO_DATA, 'base'),
  '__core__':       join(FACTORIO_DATA, 'core'),
  '__space-age__':  join(FACTORIO_DATA, 'space-age'),
  '__quality__':    join(FACTORIO_DATA, 'quality'),
}

function resolvePath(p) {
  for (const [prefix, root] of Object.entries(MOD_ROOTS)) {
    if (p.startsWith(prefix + '/')) return join(root, p.slice(prefix.length + 1))
  }
  return p
}

// Belt direction row mapping (0-indexed rows in the sprite sheet)
// From Lua comments: east=0, west=1, north=2, south=3
// Blueprint direction: 0=north, 2=east, 4=south, 6=west
const BELT_DIR_ROWS = { 0: 2, 2: 0, 4: 3, 6: 1 } // blueprint_dir → sheet row

// Entity types that can appear in blueprints
const ENTITY_TYPES = [
  'assembling-machine', 'furnace',
  'transport-belt', 'splitter', 'underground-belt',
  'inserter',
  'container', 'logistic-container',
  'electric-pole',
  'beacon', 'lab', 'radar',
  'solar-panel', 'accumulator',
  'offshore-pump', 'pipe', 'storage-tank', 'pump',
  'mining-drill', 'boiler', 'generator', 'reactor', 'roboport',
  'rocket-silo', 'turret', 'artillery-turret',
  'wall', 'gate', 'train-stop', 'straight-rail', 'curved-rail',
  'programmable-speaker', 'arithmetic-combinator', 'decider-combinator',
  'constant-combinator', 'power-switch', 'accumulator',
]

// Skip non-gameplay entities
const SKIP_NAMES = new Set([
  'factorio-logo-11tiles', 'factorio-logo-16tiles', 'factorio-logo-22tiles',
  'crash-site-chest-1', 'crash-site-chest-2', 'crash-site-spaceship',
  'crash-site-spaceship-wreck-big-1', 'crash-site-spaceship-wreck-big-2',
  'crash-site-spaceship-wreck-medium-1', 'crash-site-spaceship-wreck-medium-2',
  'crash-site-spaceship-wreck-medium-3', 'bottomless-chest', 'red-chest', 'blue-chest',
  'captive-biter-spawner',
])

function getTileSize(entity) {
  const sb = entity.selection_box
  if (sb) {
    return {
      tileW: Math.round(sb[1][0] - sb[0][0]),
      tileH: Math.round(sb[1][1] - sb[0][1]),
    }
  }
  return { tileW: 1, tileH: 1 }
}

// Get first non-shadow, non-glow, non-light layer from a sprite
function mainLayer(sprite) {
  if (!sprite) return null
  if (Array.isArray(sprite.layers)) {
    return sprite.layers.find(
      l => !l.draw_as_shadow && !l.draw_as_light && !l.draw_as_glow
    ) ?? sprite.layers[0]
  }
  return sprite
}

function copyFile(srcFactorioPath, destName) {
  const src = resolvePath(srcFactorioPath)
  if (!existsSync(src)) {
    console.warn(`  MISSING: ${src}`)
    return false
  }
  copyFileSync(src, join(OUT_DIR, destName))
  return true
}

function spriteSize(layer) {
  const scale = layer.scale ?? 1
  const w = (layer.size ?? layer.width ?? 64) * scale
  const h = (layer.size ?? layer.height ?? 64) * scale
  return { w: Math.round(w), h: Math.round(h) }
}

// ── Extractors per sprite pattern ─────────────────────────────────────────────

function extractSimple(name, layer, tileW, tileH) {
  if (!layer?.filename) return null
  const file = `${name}.png`
  if (!copyFile(layer.filename, file)) return null
  const srcW = layer.size ?? layer.width ?? 64
  const srcH = layer.size ?? layer.height ?? 64
  const scale = layer.scale ?? 1
  return {
    type: 'simple', file,
    srcW, srcH,
    w: Math.round(srcW * scale), h: Math.round(srcH * scale),
    shiftX: layer.shift?.[0] ?? 0,
    shiftY: layer.shift?.[1] ?? 0,
    tileW, tileH,
  }
}

function extractSheet(name, layer, tileW, tileH) {
  if (!layer?.filename) return null
  const file = `${name}.png`
  if (!copyFile(layer.filename, file)) return null
  const srcW = layer.size ?? layer.width ?? 64
  const srcH = layer.size ?? layer.height ?? 64
  const scale = layer.scale ?? 1
  const dirCount = layer.direction_count ?? 1
  const frameCount = layer.frame_count ?? 1
  // Determine layout: multiple frames → directions stack vertically (rows)
  //                   single frame   → directions stack horizontally (columns)
  const lineLength = layer.line_length ?? (frameCount > 1 ? frameCount : dirCount)
  const dirAxis = frameCount > 1 ? 'v' : 'h'
  return {
    type: 'sheet', file,
    srcW, srcH,
    frameW: Math.round(srcW * scale), frameH: Math.round(srcH * scale),
    directionCount: dirCount,
    frameCount,
    lineLength,
    dirAxis,
    shiftX: layer.shift?.[0] ?? 0,
    shiftY: layer.shift?.[1] ?? 0,
    tileW, tileH,
  }
}

function extractBelt(name, animSet, tileW, tileH) {
  if (!animSet?.filename) return null
  const file = `${name}.png`
  if (!copyFile(animSet.filename, file)) return null
  const srcW = animSet.size ?? animSet.width ?? 64
  const srcH = animSet.size ?? animSet.height ?? 64
  const scale = animSet.scale ?? 1
  return {
    type: 'belt', file,
    srcW, srcH,
    frameW: Math.round(srcW * scale), frameH: Math.round(srcH * scale),
    frameCount: animSet.frame_count ?? 1,
    directionCount: animSet.direction_count ?? 1,
    directionRows: BELT_DIR_ROWS,
    tileW, tileH,
  }
}

function extractDirectional(name, struct, tileW, tileH) {
  const dirs = {}
  for (const dir of ['north', 'east', 'south', 'west']) {
    let spr = struct[dir]
    if (!spr) continue
    spr = mainLayer(spr)
    if (!spr?.filename) continue
    const file = `${name}-${dir}.png`
    if (!copyFile(spr.filename, file)) continue
    const srcW = spr.size ?? spr.width ?? 64
    const srcH = spr.size ?? spr.height ?? 64
    const scale = spr.scale ?? 1
    dirs[dir] = {
      file, srcW, srcH,
      frameW: Math.round(srcW * scale), frameH: Math.round(srcH * scale),
      frameCount: spr.frame_count ?? 1,
      lineLength: spr.line_length ?? spr.frame_count ?? 1,
      shiftX: spr.shift?.[0] ?? 0,
      shiftY: spr.shift?.[1] ?? 0,
    }
  }
  if (Object.keys(dirs).length === 0) return null
  return { type: 'directional', ...dirs, tileW, tileH }
}

// ── Main entity extractor ──────────────────────────────────────────────────────

function extractEntity(name, entity) {
  const { tileW, tileH } = getTileSize(entity)

  // 1. Underground belt — use direction_in.north/east/south/west
  if (entity.structure?.direction_in?.north) {
    return extractDirectional(name, entity.structure.direction_in, tileW, tileH)
  }

  // 2. Splitter — structure.north/east/south/west (before belt_animation_set check)
  if (entity.structure?.north) {
    return extractDirectional(name, entity.structure, tileW, tileH)
  }

  // 3. Belt animation (transport belts only — no structure.north)
  if (entity.belt_animation_set?.animation_set) {
    return extractBelt(name, entity.belt_animation_set.animation_set, tileW, tileH)
  }

  // 4. graphics_set.animation with N/E/S/W (oil-refinery, chemical-plant, mining-drill, offshore-pump)
  if (entity.graphics_set?.animation?.north) {
    return extractDirectional(name, entity.graphics_set.animation, tileW, tileH)
  }

  // 5. graphics_set.animation (assembling machines, furnaces, etc.)
  if (entity.graphics_set?.animation) {
    const layer = mainLayer(entity.graphics_set.animation)
    if (layer?.filename) {
      if (layer.direction_count) return extractSheet(name, layer, tileW, tileH)
      return extractSimple(name, layer, tileW, tileH)
    }
  }

  // 6. graphics_set.animation_list (beacon)
  if (entity.graphics_set?.animation_list?.[0]?.animation) {
    const layer = mainLayer(entity.graphics_set.animation_list[0].animation)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 7. picture (chests, solar-panel, etc.)
  if (entity.picture) {
    const layer = mainLayer(entity.picture)
    if (layer?.filename) {
      if (layer.direction_count) return extractSheet(name, layer, tileW, tileH)
      return extractSimple(name, layer, tileW, tileH)
    }
  }

  // 8. Inserter platform picture
  if (entity.platform_picture?.sheet?.filename) {
    const sheet = entity.platform_picture.sheet
    if (sheet.direction_count) return extractSheet(name, sheet, tileW, tileH)
    return extractSimple(name, sheet, tileW, tileH)
  }

  // 9. animation (logistic chests, etc.)
  if (entity.animation) {
    const layer = mainLayer(entity.animation)
    if (layer?.filename) {
      if (layer.direction_count) return extractSheet(name, layer, tileW, tileH)
      return extractSimple(name, layer, tileW, tileH)
    }
  }

  // 10. pictures.layers (electric-pole, radar with direction_count)
  if (entity.pictures?.layers) {
    const layer = mainLayer(entity.pictures)
    if (layer?.filename) {
      if (layer.direction_count) return extractSheet(name, layer, tileW, tileH)
      return extractSimple(name, layer, tileW, tileH)
    }
  }

  // 11. pictures.north.structure (boiler, heat-exchanger)
  if (entity.pictures?.north?.structure) {
    const struct = {}
    for (const dir of ['north', 'east', 'south', 'west']) {
      if (entity.pictures[dir]?.structure) struct[dir] = entity.pictures[dir].structure
    }
    return extractDirectional(name, struct, tileW, tileH)
  }

  // 12. pictures.north (directional without structure wrapper — pump-like, boiler variants)
  if (entity.pictures?.north?.filename) {
    return extractDirectional(name, entity.pictures, tileW, tileH)
  }

  // 13. pictures.picture.sheets (storage-tank)
  if (entity.pictures?.picture?.sheets) {
    const layer = entity.pictures.picture.sheets.find(s => !s.draw_as_shadow)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 14. pictures — pipe/straight_vertical fallback
  if (entity.pictures) {
    const variant = entity.pictures.straight_vertical_single ??
                    entity.pictures.straight_vertical ??
                    entity.pictures.structure_render_layer_0 ??
                    null
    if (variant) {
      const layer = mainLayer(variant)
      if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
    }
  }

  // 15. animations.north/east/south/west (pump)
  if (entity.animations?.north) {
    return extractDirectional(name, entity.animations, tileW, tileH)
  }

  // 16. sprites.north/east/south/west (combinators)
  if (entity.sprites?.north) {
    return extractDirectional(name, entity.sprites, tileW, tileH)
  }

  // 17. chargable_graphics.picture (accumulator)
  if (entity.chargable_graphics?.picture) {
    const layer = mainLayer(entity.chargable_graphics.picture)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 18. base (roboport)
  if (entity.base) {
    const layer = mainLayer(entity.base)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 19. horizontal_animation (steam-engine — east/west oriented)
  if (entity.horizontal_animation) {
    const layer = mainLayer(entity.horizontal_animation)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 20. base_day_sprite (rocket-silo)
  if (entity.base_day_sprite) {
    const layer = mainLayer(entity.base_day_sprite)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 21. graphics_set.idle_animation (centrifuge, foundry, electromagnetic-plant)
  if (entity.graphics_set?.idle_animation) {
    const layer = mainLayer(entity.graphics_set.idle_animation)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 22. off_animation / on_animation (lab)
  if (entity.off_animation ?? entity.on_animation) {
    const layer = mainLayer(entity.off_animation ?? entity.on_animation)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  // 23. sprite (programmable-speaker)
  if (entity.sprite) {
    const layer = mainLayer(entity.sprite)
    if (layer?.filename) return extractSimple(name, layer, tileW, tileH)
  }

  return null
}

// ── Run ────────────────────────────────────────────────────────────────────────

console.log('Reading data dump…')
const rawData = JSON.parse(readFileSync(DUMP_PATH, 'utf8'))

mkdirSync(OUT_DIR, { recursive: true })

const manifest = {}
let extracted = 0, skipped = 0

for (const type of ENTITY_TYPES) {
  if (!rawData[type]) continue
  for (const [name, entity] of Object.entries(rawData[type])) {
    if (SKIP_NAMES.has(name)) continue
    const entry = extractEntity(name, entity)
    if (entry) {
      manifest[name] = entry
      extracted++
    } else {
      console.log(`  skipped (no sprite): ${name} [${type}]`)
      skipped++
    }
  }
}

writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\nDone. Extracted: ${extracted}  Skipped: ${skipped}`)
console.log(`Manifest written to ${OUT_DIR}/manifest.json`)
