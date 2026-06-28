import { useState, useRef } from 'react'
import type { RawMaterial } from '../utils/buildTree'
import { fmtAmount } from '../utils/fmt'

interface Props {
  items: RawMaterial[]
  quantity: number
  side?: 'left' | 'right'
}

export function RawMaterialsPanel({ items, quantity, side = 'right' }: Props) {
  const [open, setOpen] = useState(() => window.innerWidth >= 640)
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({})
  const [width, setWidth] = useState(() => {
    try { return parseInt(localStorage.getItem('ft-raw-panel-w') ?? '') || 220 }
    catch { return 220 }
  })
  const [resizing, setResizing] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    const startX = e.clientX
    const startW = widthRef.current
    const onMove = (ev: MouseEvent) => {
      const delta = side === 'left' ? ev.clientX - startX : startX - ev.clientX
      const newW = Math.max(160, Math.min(600, startW + delta))
      setWidth(newW)
      widthRef.current = newW
    }
    const onUp = () => {
      setResizing(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      try { localStorage.setItem('ft-raw-panel-w', String(widthRef.current)) } catch {}
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      ...(side === 'left' ? { left: 12 } : { right: 12 }),
      width: open ? width : 38,
      background: 'var(--th-bg-surf)',
      border: '1px solid var(--th-br)',
      boxShadow: 'var(--shadow-outset)',
      borderRadius: 2,
      overflow: 'hidden',
      zIndex: 100,
      transition: resizing ? 'none' : 'width 0.2s',
      userSelect: 'none',
    }}>
      {/* titlebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        padding: open ? '0 10px' : '0',
        height: 28,
        borderBottom: open ? '1px solid var(--th-br)' : 'none',
        background: 'linear-gradient(180deg, var(--th-grad-from) 0%, var(--th-grad-to) 100%)',
        cursor: 'pointer',
      }} onClick={() => setOpen(o => !o)}>
        {open && (
          <span style={{
            color: '#FF9F1C',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Titillium Web', sans-serif",
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Raw Materials
          </span>
        )}
        <svg
          width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--th-tx-vmut)" strokeWidth={2}
          style={{
            transform: side === 'left'
              ? (open ? 'rotate(180deg)' : 'rotate(0deg)')
              : (open ? 'rotate(0deg)' : 'rotate(180deg)'),
            flexShrink: 0, transition: 'transform 0.2s',
          }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* resize handle */}
      {open && (
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            ...(side === 'left' ? { right: 0 } : { left: 0 }),
            width: 5, cursor: 'col-resize', zIndex: 10,
            background: 'rgba(255,255,255,0.04)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,159,28,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        />
      )}

      {/* list */}
      {open && (
        <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          {items.length === 0 && (
            <div style={{ color: 'var(--th-tx-vmut)', fontSize: 11, padding: '10px 12px', fontFamily: 'monospace' }}>None</div>
          )}
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 10px',
                borderBottom: '1px solid var(--th-br-hdr)',
              }}
            >
              {/* icon in recessed well */}
              <div style={{
                width: 22, height: 22, overflow: 'hidden', flexShrink: 0,
                background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3)',
              }}>
                {!imgFailed[item.id] ? (
                  <img
                    src={`/icons/${item.id}.png`}
                    alt=""
                    style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                    onError={() => setImgFailed(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <span style={{ fontSize: 7, color: 'var(--th-tx-vmut)', fontFamily: 'monospace' }}>
                    {item.id.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <span style={{
                flex: 1,
                fontSize: 11,
                fontFamily: "'Titillium Web', sans-serif",
                color: item.isFluid ? '#22d3ee' : 'var(--th-tx-sec)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </span>

              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#FF9F1C',
                flexShrink: 0,
                fontFamily: 'monospace',
              }}>
                {fmtAmount(item.amount)}
              </span>
            </div>
          ))}

          {items.length > 0 && (
            <div style={{
              padding: '5px 10px',
              color: 'var(--th-tx-faint)',
              fontSize: 9,
              fontFamily: 'monospace',
              textAlign: 'right',
              borderTop: '1px solid var(--th-br-hdr)',
            }}>
              {items.length} material{items.length !== 1 ? 's' : ''}{quantity > 1 ? ` · ×${quantity}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
