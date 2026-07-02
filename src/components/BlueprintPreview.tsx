import { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Entity {
  entity_number: number
  name: string
  position: { x: number; y: number }
  direction?: number
}

interface SimpleEntry {
  type: 'simple'
  file: string; srcW: number; srcH: number; w: number; h: number
  shiftX: number; shiftY: number; tileW: number; tileH: number
}
interface BeltEntry {
  type: 'belt'
  file: string; srcW: number; srcH: number; frameW: number; frameH: number
  frameCount: number; directionCount: number
  directionRows: Record<string, number>
  tileW: number; tileH: number
}
interface DirData {
  file: string; srcW: number; srcH: number; frameW: number; frameH: number
  frameCount: number; lineLength: number; shiftX: number; shiftY: number
}
interface DirectionalEntry {
  type: 'directional'
  north?: DirData; east?: DirData; south?: DirData; west?: DirData
  tileW: number; tileH: number
}
interface SheetEntry {
  type: 'sheet'
  file: string; srcW: number; srcH: number; frameW: number; frameH: number
  directionCount: number; frameCount: number; lineLength: number; dirAxis: 'h' | 'v'
  shiftX: number; shiftY: number; tileW: number; tileH: number
}
type ManifestEntry = SimpleEntry | BeltEntry | DirectionalEntry | SheetEntry

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_TILE = 64
const MIN_TILE = 10
const PAD      = 1.5

// Blueprint direction → sprite direction name
const DIR_NAME: Record<number, string> = {
  0: 'north', 2: 'east', 4: 'east', 6: 'west', 8: 'south', 10: 'west', 12: 'west', 14: 'north',
}

// Blueprint direction → 4-step direction index (N=0, E=1, S=2, W=3)
const DIR_IDX4: Record<number, number> = {
  0: 0, 2: 1, 4: 1, 6: 3, 8: 2, 10: 3, 12: 3, 14: 0,
}

// ── Module-level caches ────────────────────────────────────────────────────────

let manifestCache: Record<string, ManifestEntry> | null = null
let manifestFetch: Promise<Record<string, ManifestEntry>> | null = null
const imgCache = new Map<string, HTMLImageElement | null>()

async function loadManifest(): Promise<Record<string, ManifestEntry>> {
  if (manifestCache) return manifestCache
  if (!manifestFetch) {
    manifestFetch = fetch('/entities/manifest.json')
      .then(r => r.json())
      .then(m => { manifestCache = m; return m })
      .catch(() => { manifestFetch = null; return {} })
  }
  return manifestFetch
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (imgCache.has(src)) return Promise.resolve(imgCache.get(src)!)
  return new Promise(resolve => {
    const img = new Image()
    img.onload  = () => { imgCache.set(src, img);   resolve(img) }
    img.onerror = () => { imgCache.set(src, null);  resolve(null) }
    img.src = src
  })
}

// ── Blueprint decoding ─────────────────────────────────────────────────────────

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  for (const fmt of ['deflate', 'deflate-raw'] as CompressionFormat[]) {
    try {
      const ds = new DecompressionStream(fmt)
      const writer = ds.writable.getWriter()
      const reader = ds.readable.getReader()
      writer.write(bytes as unknown as ArrayBuffer).then(() => writer.close()).catch(() => {})
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }
      const total = chunks.reduce((s, c) => s + c.length, 0)
      const buf = new Uint8Array(total)
      let off = 0
      for (const c of chunks) { buf.set(c, off); off += c.length }
      return buf
    } catch { /* try next */ }
  }
  throw new Error('inflate failed')
}

function extractEntities(json: Record<string, unknown>, bookIndex?: number): Entity[] {
  const bp = json.blueprint as { entities?: Entity[] } | undefined
  if (bp?.entities?.length) return bp.entities
  const book = json.blueprint_book as {
    blueprints?: { blueprint?: { entities?: Entity[] } }[]
  } | undefined
  if (book?.blueprints) {
    if (bookIndex != null) return book.blueprints[bookIndex]?.blueprint?.entities ?? []
    for (const item of book.blueprints) {
      const ents = item.blueprint?.entities
      if (ents?.length) return ents
    }
  }
  return []
}

async function decode(str: string, bookIndex?: number): Promise<Entity[]> {
  const binary = atob(str.slice(1))
  const bytes  = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const buf  = await inflate(bytes)
  const json = JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
  return extractEntities(json, bookIndex)
}

// ── Tile size (handles direction-dependent sizes like splitters) ──────────────

function entityTileSize(name: string, dir?: number): [number, number] {
  const d  = dir ?? 0
  const ew = d === 4 || d === 12 || d === 2 || d === 6
  if (name.includes('splitter'))              return ew ? [1, 2] : [2, 1]
  if (name.includes('assembling-machine'))    return [3, 3]
  if (name.includes('electric-furnace'))      return [3, 3]
  if (name.includes('steel-furnace') || name.includes('stone-furnace')) return [2, 2]
  if (name.includes('electric-mining-drill')) return [3, 3]
  if (name.includes('big-mining-drill'))      return [4, 4]
  if (name.includes('oil-refinery'))          return [5, 5]
  if (name.includes('chemical-plant'))        return [3, 3]
  if (name.includes('roboport'))              return [4, 4]
  if (name.includes('solar-panel'))           return [3, 3]
  if (name.includes('accumulator'))           return [2, 2]
  if (name.includes('substation'))            return [2, 2]
  if (name.includes('storage-tank'))          return [3, 3]
  if (name.includes('pumpjack'))              return [3, 3]
  if (name.includes('beacon'))                return [3, 3]
  if (name.includes('lab'))                   return [3, 3]
  if (name.includes('centrifuge'))            return [3, 3]
  if (name.includes('radar'))                 return [3, 3]
  if (name.includes('nuclear-reactor'))       return [4, 4]
  if (name.includes('heat-exchanger'))        return [3, 3]
  if (name.includes('steam-turbine'))         return ew ? [3, 2] : [2, 3]
  if (name.includes('rocket-silo'))           return [9, 9]
  if (name.includes('electromagnetic-plant')) return [5, 5]
  if (name.includes('cryogenic-plant'))       return [5, 5]
  if (name.includes('biolab'))                return [4, 4]
  if (name.includes('crusher'))               return ew ? [2, 3] : [3, 2]
  if (name.includes('recycler'))              return ew ? [3, 5] : [5, 3]
  if (name.includes('foundry'))               return [4, 4]
  if (name.includes('biochamber'))            return [4, 4]
  if (name.includes('fusion-reactor'))        return [8, 8]
  if (name.includes('space-platform-hub'))    return [7, 7]
  if (name.includes('asteroid-collector'))    return [5, 5]
  if (name.includes('agricultural-tower'))    return [4, 4]
  if (name.includes('boiler'))                return ew ? [3, 2] : [2, 3]
  return [1, 1]
}

// ── Canvas drawing ─────────────────────────────────────────────────────────────

interface SpriteCmd {
  img:  HTMLImageElement
  sx: number; sy: number; sw: number; sh: number
  dx: number; dy: number; dw: number; dh: number
}

function getSpriteCmd(
  entry: ManifestEntry,
  dir: number,
  dx: number, dy: number, dw: number, dh: number,
  imgs: Map<string, HTMLImageElement | null>,
): SpriteCmd | null {
  if (entry.type === 'simple') {
    const img = imgs.get(entry.file)
    if (!img) return null
    return { img, sx: 0, sy: 0, sw: entry.srcW, sh: entry.srcH, dx, dy, dw, dh }
  }

  if (entry.type === 'belt') {
    const img = imgs.get(entry.file)
    if (!img) return null
    const row = entry.directionRows[dir] ?? entry.directionRows[0] ?? 2
    return { img, sx: 0, sy: row * entry.srcH, sw: entry.srcW, sh: entry.srcH, dx, dy, dw, dh }
  }

  if (entry.type === 'directional') {
    const dirName = DIR_NAME[dir] ?? 'north'
    const d = (entry[dirName as keyof DirectionalEntry] as DirData | undefined)
           ?? entry.north ?? entry.east ?? entry.south ?? entry.west
    if (!d) return null
    const img = imgs.get(d.file)
    if (!img) return null
    return { img, sx: 0, sy: 0, sw: d.srcW, sh: d.srcH, dx, dy, dw, dh }
  }

  if (entry.type === 'sheet') {
    const img = imgs.get(entry.file)
    if (!img) return null
    const dirIdx = DIR_IDX4[dir] ?? 0
    const col = dirIdx % entry.lineLength
    const row = Math.floor(dirIdx / entry.lineLength)
    const sx = col * entry.srcW
    const sy = row * entry.srcH
    return { img, sx, sy, sw: entry.srcW, sh: entry.srcH, dx, dy, dw, dh }
  }

  return null
}

function collectFiles(entry: ManifestEntry): string[] {
  if (entry.type === 'directional') {
    return (['north', 'east', 'south', 'west'] as const)
      .map(d => entry[d]?.file)
      .filter(Boolean) as string[]
  }
  return [(entry as { file: string }).file]
}

// ── Main component ─────────────────────────────────────────────────────────────

// ── Render data stored per blueprint load ─────────────────────────────────────

interface RenderData {
  entities: Entity[]
  manifest: Record<string, ManifestEntry>
  imgMap: Map<string, HTMLImageElement | null>
  minX: number; minY: number
  boundsW: number; boundsH: number
  baseTileSize: number
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  data: RenderData,
  zoom: number,
  ox: number, oy: number,
  vpW: number, vpH: number,
) {
  const ts = data.baseTileSize * zoom
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, vpW, vpH)

  // Grid lines (only in visible range)
  ctx.strokeStyle = '#1e1c1e'
  ctx.lineWidth = 0.5
  const gx0 = Math.floor(-ox / ts)
  const gy0 = Math.floor(-oy / ts)
  const gx1 = Math.ceil((vpW - ox) / ts)
  const gy1 = Math.ceil((vpH - oy) / ts)
  for (let gx = gx0; gx <= gx1; gx++) {
    const x = gx * ts + ox
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, vpH); ctx.stroke()
  }
  for (let gy = gy0; gy <= gy1; gy++) {
    const y = gy * ts + oy
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(vpW, y); ctx.stroke()
  }

  for (const e of data.entities) {
    const dir = e.direction ?? 0
    const [tW, tH] = entityTileSize(e.name, dir)
    const dx = (e.position.x - tW / 2 - data.minX) * ts + ox
    const dy = (e.position.y - tH / 2 - data.minY) * ts + oy
    const dw = tW * ts
    const dh = tH * ts

    // Skip fully out-of-viewport entities
    if (dx + dw < 0 || dy + dh < 0 || dx > vpW || dy > vpH) continue

    const entry = data.manifest[e.name]
    if (entry) {
      const cmd = getSpriteCmd(entry, dir, dx, dy, dw, dh, data.imgMap)
      if (cmd) {
        ctx.drawImage(cmd.img, cmd.sx, cmd.sy, cmd.sw, cmd.sh, cmd.dx, cmd.dy, cmd.dw, cmd.dh)
        continue
      }
    }

    const iconImg = data.imgMap.get(`icon:${e.name}`)
    if (iconImg) {
      const iconSize = Math.min(dw, dh) * 0.8
      ctx.drawImage(iconImg, 0, 0, 64, 64,
        dx + (dw - iconSize) / 2, dy + (dh - iconSize) / 2, iconSize, iconSize)
    } else {
      ctx.fillStyle = '#3a3638'
      ctx.fillRect(dx + 1, dy + 1, dw - 2, dh - 2)
    }
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  blueprintString?: string
  stringUrl?: string
  maxW?: number
  maxH?: number
  zoomable?: boolean
  onStats?: (stats: { entityCount: number; tilesW: number; tilesH: number }) => void
  bookIndex?: number
}

export function BlueprintPreview({ blueprintString, stringUrl, maxW = 258, maxH = 220, zoomable = false, onStats, bookIndex }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderRef    = useRef<RenderData | null>(null)

  const [status, setStatus] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading')
  const [zoom, setZoom]     = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const zoomRef   = useRef(zoom)
  const offsetRef = useRef(offset)
  zoomRef.current   = zoom
  offsetRef.current = offset

  // Center content in viewport at zoom=1
  const centeredOffset = useCallback((data: RenderData) => ({
    x: (maxW - data.boundsW * data.baseTileSize) / 2,
    y: (maxH - data.boundsH * data.baseTileSize) / 2,
  }), [maxW, maxH])

  const resetView = useCallback(() => {
    const data = renderRef.current
    setZoom(1)
    setOffset(data ? centeredOffset(data) : { x: 0, y: 0 })
  }, [centeredOffset])

  // Phase 1: decode + load images (once per blueprint)
  useEffect(() => {
    if (!blueprintString && !stringUrl) { setStatus('empty'); return }
    let cancelled = false
    setStatus('loading')
    renderRef.current = null

    ;(async () => {
      try {
        let str = blueprintString
        if (!str) {
          const res = await fetch(stringUrl!)
          if (cancelled) return
          if (!res.ok) throw new Error('fetch failed')
          str = (await res.text()).trim()
        }
        const [entities, manifest] = await Promise.all([decode(str!, bookIndex), loadManifest()])
        if (cancelled) return
        if (!entities.length) { setStatus('empty'); return }

        const lefts  = entities.map(e => e.position.x - entityTileSize(e.name, e.direction)[0] / 2)
        const tops   = entities.map(e => e.position.y - entityTileSize(e.name, e.direction)[1] / 2)
        const rights = entities.map(e => e.position.x + entityTileSize(e.name, e.direction)[0] / 2)
        const bots   = entities.map(e => e.position.y + entityTileSize(e.name, e.direction)[1] / 2)
        const leftMin  = Math.min(...lefts)
        const topMin   = Math.min(...tops)
        const rightMax = Math.max(...rights)
        const botMax   = Math.max(...bots)
        const minX    = leftMin - PAD
        const minY    = topMin - PAD
        const boundsW = rightMax + PAD - minX
        const boundsH = botMax + PAD - minY
        const baseTileSize = Math.max(MIN_TILE, Math.min(MAX_TILE, maxW / boundsW, maxH / boundsH))

        onStats?.({
          entityCount: entities.length,
          tilesW: Math.round(rightMax - leftMin),
          tilesH: Math.round(botMax - topMin),
        })

        const needed = new Set<string>()
        const fallbackNeeded = new Set<string>()
        for (const e of entities) {
          const entry = manifest[e.name]
          if (entry) collectFiles(entry).forEach(f => needed.add(f))
          else        fallbackNeeded.add(e.name)
        }

        const imgMap = new Map<string, HTMLImageElement | null>()
        await Promise.all([
          ...[...needed].map(f => loadImage(`/entities/${f}`).then(img => imgMap.set(f, img))),
          ...[...fallbackNeeded].map(n => loadImage(`/icons/${n}.png`).then(img => imgMap.set(`icon:${n}`, img))),
        ])
        if (cancelled) return

        const data: RenderData = { entities, manifest, imgMap, minX, minY, boundsW, boundsH, baseTileSize }
        renderRef.current = data
        const initOffset = centeredOffset(data)
        setZoom(1)
        setOffset(initOffset)
        setStatus('ok')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => { cancelled = true }
  }, [blueprintString, stringUrl, bookIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2: redraw on zoom/offset/status change
  useEffect(() => {
    if (status !== 'ok') return
    const data = renderRef.current
    if (!data) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawScene(ctx, data, zoom, offset.x, offset.y, maxW, maxH)
  }, [status, zoom, offset, maxW, maxH])

  // Wheel zoom (passive:false needed to preventDefault)
  useEffect(() => {
    if (!zoomable) return
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      const newZoom = Math.max(0.25, Math.min(12, zoomRef.current * factor))
      const ratio = newZoom / zoomRef.current
      setZoom(newZoom)
      setOffset(o => ({
        x: mx - (mx - o.x) * ratio,
        y: my - (my - o.y) * ratio,
      }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomable])

  // Mouse drag pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomable) return
    e.preventDefault()
    const start = { startX: e.clientX, startY: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
    setIsDragging(true)
    const onMove = (ev: MouseEvent) => {
      setOffset({
        x: start.ox + ev.clientX - start.startX,
        y: start.oy + ev.clientY - start.startY,
      })
    }
    const onUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [zoomable])

  // Button zoom (zoom around viewport center)
  const zoomBy = useCallback((factor: number) => {
    setZoom(z => {
      const nz = Math.max(0.25, Math.min(12, z * factor))
      const ratio = nz / z
      setOffset(o => ({
        x: maxW / 2 - (maxW / 2 - o.x) * ratio,
        y: maxH / 2 - (maxH / 2 - o.y) * ratio,
      }))
      return nz
    })
  }, [maxW, maxH])

  if (!blueprintString && !stringUrl) return null
  if (status === 'loading') return <StatusBox maxW={zoomable ? maxW : undefined}>...</StatusBox>
  if (status === 'error')   return <StatusBox maxW={zoomable ? maxW : undefined}>invalid blueprint</StatusBox>
  if (status === 'empty')   return <StatusBox maxW={zoomable ? maxW : undefined}>no entities</StatusBox>

  const canvas = (
    <canvas
      ref={canvasRef}
      width={maxW}
      height={maxH}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  )

  if (!zoomable) {
    return (
      <div style={{
        background: '#1a1819', border: '1px solid #111',
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)',
        overflow: 'hidden', display: 'flex', justifyContent: 'center',
      }}>
        {canvas}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', background: '#1a1819', border: '1px solid #111', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)' }}>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onDoubleClick={resetView}
        style={{ overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        {canvas}
      </div>

      {/* zoom controls */}
      <div style={{
        position: 'absolute', bottom: 8, right: 8,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(13,12,13,0.85)', border: '1px solid #2a2829',
        borderRadius: 2, padding: '2px 4px',
      }}>
        <ZoomBtn onClick={() => zoomBy(1 / 1.25)}>−</ZoomBtn>
        <span
          onClick={resetView}
          style={{ color: '#5a5458', fontSize: 9, fontFamily: 'monospace', minWidth: 32, textAlign: 'center', cursor: 'pointer' }}
          title="Reset view"
        >
          {Math.round(zoom * 100)}%
        </span>
        <ZoomBtn onClick={() => zoomBy(1.25)}>+</ZoomBtn>
      </div>

      {zoom <= 1.01 && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          color: '#2a2829', fontSize: 9, fontFamily: 'monospace', pointerEvents: 'none',
        }}>
          scroll · drag · dbl-click reset
        </div>
      )}
    </div>
  )
}

function ZoomBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6b6060', fontSize: 14, lineHeight: 1, padding: '0 3px',
        fontFamily: 'monospace', display: 'flex', alignItems: 'center',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#FF9F1C')}
      onMouseLeave={e => (e.currentTarget.style.color = '#6b6060')}
    >
      {children}
    </button>
  )
}

function StatusBox({ children, maxW }: { children: React.ReactNode; maxW?: number }) {
  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a1819', border: '1px solid #111',
      color: '#5a5458', fontSize: 9, fontFamily: 'monospace',
      ...(maxW ? { width: maxW } : {}),
    }}>
      {children}
    </div>
  )
}
