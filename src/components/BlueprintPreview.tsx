import { useEffect, useRef, useState } from 'react'

interface Entity {
  entity_number: number
  name: string
  position: { x: number; y: number }
  direction?: number
}

const TILE = 14
const PAD = 1.5

function entityColor(name: string): string {
  if (name.includes('transport-belt')) return '#FF9F1C'
  if (name.includes('splitter'))        return '#22d3ee'
  if (name.includes('inserter'))        return '#22c55e'
  if (name.includes('assembling'))      return '#4a90d9'
  if (name.includes('furnace'))         return '#ef4444'
  if (name.includes('pipe'))            return '#9ca3af'
  if (name.includes('chest'))           return '#d97706'
  if (name.includes('pole'))            return '#fbbf24'
  if (name.includes('mining-drill'))    return '#a78bfa'
  if (name.includes('beacon'))          return '#06b6d4'
  if (name.includes('roboport'))        return '#3b82f6'
  if (name.includes('lab'))             return '#8b5cf6'
  if (name.includes('rail'))            return '#78716c'
  if (name.includes('pump'))            return '#60a5fa'
  if (name.includes('tank'))            return '#94a3b8'
  if (name.includes('reactor'))         return '#f87171'
  if (name.includes('turret'))          return '#fb923c'
  return '#6b7280'
}

function entitySize(name: string, direction?: number): [number, number] {
  const d = direction ?? 0
  const horiz = d === 2 || d === 6
  if (name.includes('splitter'))              return horiz ? [2, 1] : [1, 2]
  if (name.includes('assembling-machine'))    return [3, 3]
  if (name.includes('electric-furnace'))      return [3, 3]
  if (name.includes('steel-furnace') || name.includes('stone-furnace')) return [2, 2]
  if (name.includes('electric-mining-drill')) return [3, 3]
  if (name.includes('oil-refinery'))          return [5, 5]
  if (name.includes('chemical-plant'))        return [3, 3]
  if (name.includes('roboport'))              return [4, 4]
  if (name.includes('solar-panel'))           return [3, 3]
  if (name.includes('accumulator'))           return [2, 2]
  if (name.includes('substation'))            return [2, 2]
  if (name.includes('storage-tank'))          return [2, 2]
  if (name.includes('pumpjack'))              return [3, 3]
  if (name.includes('beacon'))               return [3, 3]
  if (name.includes('lab'))                  return [3, 3]
  if (name.includes('centrifuge'))           return [3, 3]
  if (name.includes('radar'))               return [3, 3]
  if (name.includes('nuclear-reactor'))     return [4, 4]
  if (name.includes('heat-exchanger'))      return [3, 3]
  if (name.includes('steam-turbine'))       return horiz ? [2, 3] : [3, 2]
  return [1, 1]
}

async function decodeBlueprintString(str: string): Promise<Entity[]> {
  const b64 = str.slice(1)
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  await writer.write(bytes)
  await writer.close()

  const reader = ds.readable.getReader()
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

  const json = JSON.parse(new TextDecoder().decode(buf))
  return json.blueprint?.entities ?? []
}

function draw(canvas: HTMLCanvasElement, entities: Entity[]) {
  if (!entities.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const lefts  = entities.map(e => e.position.x - entitySize(e.name, e.direction)[0] / 2)
  const tops   = entities.map(e => e.position.y - entitySize(e.name, e.direction)[1] / 2)
  const rights = entities.map(e => e.position.x + entitySize(e.name, e.direction)[0] / 2)
  const bots   = entities.map(e => e.position.y + entitySize(e.name, e.direction)[1] / 2)

  const minX = Math.min(...lefts)  - PAD
  const minY = Math.min(...tops)   - PAD
  const maxX = Math.max(...rights) + PAD
  const maxY = Math.max(...bots)   + PAD

  const W = Math.ceil((maxX - minX) * TILE)
  const H = Math.ceil((maxY - minY) * TILE)
  canvas.width  = W
  canvas.height = H

  // bg
  ctx.fillStyle = '#1a1819'
  ctx.fillRect(0, 0, W, H)

  // grid lines
  ctx.strokeStyle = '#252323'
  ctx.lineWidth = 0.5
  for (let tx = 0; tx <= Math.ceil(maxX - minX); tx++) {
    ctx.beginPath(); ctx.moveTo(tx * TILE, 0); ctx.lineTo(tx * TILE, H); ctx.stroke()
  }
  for (let ty = 0; ty <= Math.ceil(maxY - minY); ty++) {
    ctx.beginPath(); ctx.moveTo(0, ty * TILE); ctx.lineTo(W, ty * TILE); ctx.stroke()
  }

  // entities
  entities.forEach(e => {
    const [w, h] = entitySize(e.name, e.direction)
    const px = (e.position.x - w / 2 - minX) * TILE
    const py = (e.position.y - h / 2 - minY) * TILE
    const pw = w * TILE - 1
    const ph = h * TILE - 1
    const col = entityColor(e.name)

    ctx.fillStyle   = col + '44'
    ctx.fillRect(px + 0.5, py + 0.5, pw, ph)
    ctx.strokeStyle = col
    ctx.lineWidth   = 1
    ctx.strokeRect(px + 0.5, py + 0.5, pw, ph)

    // direction dot for 1×1 entities
    if (w === 1 && h === 1 && e.direction !== undefined) {
      const cx = px + pw / 2 + 0.5
      const cy = py + ph / 2 + 0.5
      const r  = Math.min(pw, ph) * 0.18
      const dx = e.direction === 2 ? r : e.direction === 6 ? -r : 0
      const dy = e.direction === 4 ? r : e.direction === 0 ? -r : 0
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

interface Props {
  blueprintString: string
}

export function BlueprintPreview({ blueprintString }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    setState('loading')
    decodeBlueprintString(blueprintString)
      .then(entities => {
        if (canvasRef.current) draw(canvasRef.current, entities)
        setState('ok')
      })
      .catch(() => setState('error'))
  }, [blueprintString])

  if (state === 'error') {
    return (
      <div style={{
        height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a1819', border: '1px solid #111',
        color: '#5a5458', fontSize: 9, fontFamily: 'monospace',
      }}>
        invalid blueprint
      </div>
    )
  }

  return (
    <div style={{
      background: '#1a1819', border: '1px solid #111',
      boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)',
      overflow: 'hidden', position: 'relative',
      minHeight: state === 'loading' ? 40 : undefined,
    }}>
      {state === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#5a5458', fontSize: 9, fontFamily: 'monospace',
        }}>
          …
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }}
      />
    </div>
  )
}
