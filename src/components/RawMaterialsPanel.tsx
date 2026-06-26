import { useState, useRef } from 'react'
import type { RawMaterial } from '../utils/buildTree'
import { fmtAmount } from '../utils/fmt'

interface Props {
  items: RawMaterial[]
  quantity: number
  side?: 'left' | 'right'
}

const PANEL_STYLE = {
  background: '#272526',
  border: '1px solid #111',
  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.5)',
  borderRadius: 2,
}

export function RawMaterialsPanel({ items, quantity, side = 'right' }: Props) {
  const [open, setOpen] = useState(true)
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
      ...PANEL_STYLE,
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
        borderBottom: open ? '1px solid #111' : 'none',
        background: 'linear-gradient(180deg, #2c2a2b 0%, #252325 100%)',
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
          width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5a5458" strokeWidth={2}
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
            <div style={{ color: '#5a5458', fontSize: 11, padding: '10px 12px', fontFamily: 'monospace' }}>None</div>
          )}
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 10px',
                borderBottom: '1px solid #1a1919',
              }}
            >
              {/* icon in recessed well */}
              <div style={{
                width: 22, height: 22, overflow: 'hidden', flexShrink: 0,
                background: '#1b1b1b', border: '1px solid #111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)',
              }}>
                {!imgFailed[item.id] ? (
                  <img
                    src={`/icons/${item.id}.png`}
                    alt=""
                    style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                    onError={() => setImgFailed(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <span style={{ fontSize: 7, color: '#5a5458', fontFamily: 'monospace' }}>
                    {item.id.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* name */}
              <span style={{
                flex: 1,
                fontSize: 11,
                fontFamily: "'Titillium Web', sans-serif",
                color: item.isFluid ? '#22d3ee' : '#A19E9A',
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
              color: '#3a3638',
              fontSize: 9,
              fontFamily: 'monospace',
              textAlign: 'right',
              borderTop: '1px solid #1a1919',
            }}>
              {items.length} material{items.length !== 1 ? 's' : ''}{quantity > 1 ? ` · ×${quantity}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
