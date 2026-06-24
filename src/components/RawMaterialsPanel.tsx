import { useState } from 'react'
import type { RawMaterial } from '../utils/buildTree'

interface Props {
  items: RawMaterial[]
  quantity: number
}

function fmtAmount(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

export function RawMaterialsPanel({ items, quantity }: Props) {
  const [open, setOpen] = useState(true)
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({})

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: open ? 220 : 40,
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 6,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 100,
      transition: 'width 0.2s',
      userSelect: 'none',
    }}>
      {/* header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        padding: open ? '8px 10px' : '8px',
        borderBottom: open ? '1px solid #21262d' : 'none',
        background: '#1c2128',
        cursor: 'pointer',
      }} onClick={() => setOpen(o => !o)}>
        {open && (
          <span style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
            Raw Materials
          </span>
        )}
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2}
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)', flexShrink: 0, transition: 'transform 0.2s' }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* list */}
      {open && (
        <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          {items.length === 0 && (
            <div style={{ color: '#4b5563', fontSize: 11, padding: '10px 12px' }}>None</div>
          )}
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 10px',
                borderBottom: '1px solid #1c2128',
              }}
            >
              {/* icon */}
              <div style={{ width: 20, height: 20, overflow: 'hidden', flexShrink: 0 }}>
                {!imgFailed[item.id] ? (
                  <img
                    src={`/icons/${item.id}.png`}
                    alt=""
                    style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                    onError={() => setImgFailed(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div style={{
                    width: 20, height: 20, background: '#21262d', borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7, color: '#6b7280',
                  }}>
                    {item.id.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* name */}
              <span style={{
                flex: 1,
                fontSize: 11,
                color: item.isFluid ? '#22d3ee' : '#c9d1d9',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </span>

              {/* amount */}
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#f0a030',
                flexShrink: 0,
                fontFamily: 'monospace',
              }}>
                {fmtAmount(item.amount)}
              </span>
            </div>
          ))}

          {/* total count */}
          {items.length > 0 && (
            <div style={{
              padding: '6px 10px',
              color: '#4b5563',
              fontSize: 10,
              fontFamily: 'monospace',
              textAlign: 'right',
            }}>
              {items.length} material{items.length !== 1 ? 's' : ''}{quantity > 1 ? ` · ×${quantity}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
