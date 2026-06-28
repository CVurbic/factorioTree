import { useState, useEffect, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'
import type { FactorioNodeData } from '../types'
import { recipes } from '../data/recipes-generated'
import { fmtAmount } from '../utils/fmt'

type FactorioNodeType = Node<FactorioNodeData, 'factorioNode'>

const GROUP_COLORS: Record<string, { accent: string }> = {
  'logistics':             { accent: '#4a90d9' },
  'production':            { accent: '#FF9F1C' },
  'intermediate-products': { accent: '#A19E9A' },
  'space':                 { accent: '#a855f7' },
  'combat':                { accent: '#ef4444' },
  'fluids':                { accent: '#22d3ee' },
  'signals':               { accent: '#22c55e' },
  'other':                 { accent: '#6b6060' },
}

function fmtTime(t: number): string {
  return Number.isInteger(t) ? `${t}s` : `${t.toFixed(1)}s`
}

export function FactorioNode({ data }: NodeProps<FactorioNodeType>) {
  const [imgFailed, setImgFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showUsage, setShowUsage] = useState(false)
  const [touchTooltip, setTouchTooltip] = useState(false)
  const isTouchDevice = 'ontouchstart' in window

  const usedIn = useMemo(() =>
    recipes.filter(r => r.ingredients.some(ing => ing.id === data.recipeId)),
    [data.recipeId],
  )

  useEffect(() => {
    if (!hovered && !showUsage) return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.key === 'u' || e.key === 'U') && hovered) { e.preventDefault(); setShowUsage(v => !v) }
      if (e.key === 'Escape') setShowUsage(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hovered, showUsage])

  useEffect(() => {
    if (!touchTooltip) return
    const handler = () => setTouchTooltip(false)
    window.addEventListener('touchstart', handler)
    return () => window.removeEventListener('touchstart', handler)
  }, [touchTooltip])

  const { accent } = GROUP_COLORS[data.group] ?? GROUP_COLORS['other']
  const displayAmount = fmtAmount(data.amount)
  const displayTime = fmtTime(data.craftingTime)

  const showTooltip = hovered || touchTooltip

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={e => { if (e.touches.length > 1) return; e.stopPropagation(); setTouchTooltip(v => !v) }}
      style={{
        position: 'relative',
        width: 160,
        height: 64,
        background: data.isRaw ? 'var(--th-bg-deep)' : 'var(--th-bg-surf)',
        border: `1px solid var(--th-br-sep)`,
        borderTop: `2px solid ${data.isRaw ? 'var(--th-br-sep)' : accent + '99'}`,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        userSelect: 'none',
        boxShadow: data.isRaw
          ? 'inset 1px 1px 0 rgba(255,255,255,0.04), inset -1px -1px 0 rgba(0,0,0,0.20)'
          : 'inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.25)',
        opacity: data.isRaw ? 0.85 : 1,
        cursor: 'default',
      }}
    >
      {/* left target handle */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', left: -1 }}
      />

      {/* collapse / expand button */}
      {data.hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); data.onToggleCollapse(data.recipeId) }}
          title={data.isCollapsed ? 'Expand' : 'Collapse'}
          style={{
            position: 'absolute',
            left: -14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: data.isCollapsed ? accent : 'var(--th-bg-hdr)',
            border: `1px solid ${accent}`,
            color: data.isCollapsed ? '#0d0c0d' : accent,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
          }}
        >
          {data.isCollapsed ? '+' : '−'}
        </button>
      )}

      {/* icon well — recessed */}
      <div style={{
        width: 48,
        height: 64,
        flexShrink: 0,
        background: 'var(--th-bg-well)',
        borderRight: '1px solid var(--th-br)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -1px -1px 0 rgba(255,255,255,0.04)',
      }}>
        {!imgFailed ? (
          <div style={{ width: 36, height: 36, overflow: 'hidden', position: 'relative' }}>
            <img
              src={`/icons/${data.recipeId}.png`}
              alt={data.name}
              style={{ height: 36, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
              onError={() => setImgFailed(true)}
            />
            {data.isFluid && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 8, height: 8,
                background: '#22d3ee',
                borderRadius: '50% 0 0 0',
                opacity: 0.9,
              }} />
            )}
          </div>
        ) : (
          <span style={{ fontSize: 9, color: 'var(--th-tx-mut)', textAlign: 'center', lineHeight: 1.2, fontFamily: 'monospace' }}>
            {data.recipeId.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>

      {/* content area */}
      <div style={{ flex: 1, padding: '6px 8px', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{
          fontSize: 11,
          lineHeight: 1.25,
          fontWeight: 600,
          fontFamily: "'Titillium Web', sans-serif",
          color: data.isRaw ? 'var(--th-tx-sec)' : 'var(--th-tx)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {data.name}
        </span>

        {!data.isRaw && (
          <span style={{
            fontSize: 9,
            color: 'var(--th-tx-mut)',
            marginTop: 3,
            fontFamily: 'monospace',
          }}>
            ⏱ {displayTime}
          </span>
        )}
      </div>

      {/* amount badge — top right */}
      <div style={{
        position: 'absolute',
        top: 3, right: 5,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'monospace',
        color: data.amount > 1 ? '#FF9F1C' : 'var(--th-tx-mut)',
        lineHeight: 1,
      }}>
        ×{displayAmount}
      </div>

      {/* right source handle */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', right: -1 }}
      />

      {/* hover / touch tooltip */}
      {showTooltip && !showUsage && (
        <div
          onTouchStart={e => { if (e.touches.length === 1) e.stopPropagation() }}
          style={{
            position: 'absolute',
            left: 'calc(100% + 14px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--th-bg-surf)',
            border: `1px solid ${accent}55`,
            borderTop: `2px solid ${accent}`,
            borderRadius: 2,
            padding: '10px 12px',
            minWidth: 185,
            maxWidth: 245,
            zIndex: 9999,
            pointerEvents: touchTooltip ? 'auto' : 'none',
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ color: 'var(--th-tx)', fontWeight: 700, fontSize: 13, marginBottom: 6, fontFamily: "'Titillium Web', sans-serif", letterSpacing: '0.04em' }}>
            {data.name}
          </div>
          <div style={{ color: 'var(--th-tx-sec)', fontSize: 11, marginBottom: 8, display: 'flex', gap: 12, fontFamily: 'monospace' }}>
            <span>⏱ {displayTime}/craft</span>
            <span>→ ×{data.resultAmount}</span>
          </div>
          {data.allIngredients.length > 0 && (
            <>
              <div style={{ color: 'var(--th-tx-mut)', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Titillium Web', sans-serif" }}>
                Ingredients
              </div>
              {data.allIngredients.map(ing => (
                <div key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 18, height: 18, overflow: 'hidden', flexShrink: 0, background: 'var(--th-bg-well)', borderRadius: 1 }}>
                    <img
                      src={`/icons/${ing.id}.png`}
                      alt=""
                      style={{ height: 18, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                    />
                  </div>
                  <span style={{ color: 'var(--th-tx-sec)', fontSize: 11, fontFamily: 'monospace' }}>
                    ×{ing.amount} {ing.name}
                  </span>
                </div>
              ))}
            </>
          )}
          {data.isCollapsed && (
            <div style={{ marginTop: 8, color: '#FF9F1C', fontSize: 10, fontFamily: 'monospace' }}>
              Subtree collapsed — tap + to expand
            </div>
          )}
          {!data.isRaw && !data.isCollapsed && (
            <div style={{ marginTop: 8, color: 'var(--th-tx-mut)', fontSize: 10, fontFamily: 'monospace' }}>
              {isTouchDevice ? 'Double-tap to set as root' : 'Double-click to set as root'}
            </div>
          )}
          {usedIn.length > 0 && !isTouchDevice && (
            <div style={{ marginTop: 6, color: '#c9a84c', fontSize: 10, fontFamily: 'monospace' }}>
              Press U — extend tree up ({usedIn.length} recipe{usedIn.length !== 1 ? 's' : ''})
            </div>
          )}
          {usedIn.length > 0 && isTouchDevice && (
            <button
              onTouchStart={e => { e.stopPropagation(); setShowUsage(true); setTouchTooltip(false) }}
              style={{
                marginTop: 8, width: '100%', padding: '6px 8px',
                background: 'var(--th-bg-deep)', border: `1px solid ${accent}44`,
                borderRadius: 2, cursor: 'pointer',
                color: '#c9a84c', fontSize: 10, fontFamily: 'monospace',
                textAlign: 'left',
              }}
            >
              ↑ Used in {usedIn.length} recipe{usedIn.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* usage popup */}
      {showUsage && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 'calc(100% + 14px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--th-bg-surf)',
            border: `1px solid ${accent}55`,
            borderTop: `2px solid ${accent}`,
            borderRadius: 2,
            width: 280,
            maxHeight: 360,
            zIndex: 9999,
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px 6px',
            borderBottom: '1px solid var(--th-br-hdr)',
            flexShrink: 0,
            background: 'var(--th-bg-deep)',
          }}>
            <div>
              <span style={{ color: 'var(--th-tx)', fontWeight: 700, fontSize: 12, fontFamily: "'Titillium Web', sans-serif" }}>Used in</span>
              <span style={{ color: '#FF9F1C', fontSize: 12, marginLeft: 5, fontFamily: 'monospace' }}>
                {usedIn.length} recipe{usedIn.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setShowUsage(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--th-tx-mut)', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-mut)')}
            >×</button>
          </div>

          <div style={{ overflowY: 'auto', padding: '6px 8px', flex: 1, background: 'var(--th-bg-deep)' }}>
            {usedIn.length === 0 ? (
              <span style={{ color: 'var(--th-tx-mut)', fontSize: 12, fontFamily: 'monospace' }}>Not used in any recipe.</span>
            ) : (
              usedIn.map(r => {
                const ingAmt = r.ingredients.find(ing => ing.id === data.recipeId)?.amount ?? 1
                return (
                  <div
                    key={r.id}
                    onClick={() => { data.onExtendToParent(r.id); setShowUsage(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 4px', borderRadius: 1, marginBottom: 2, cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--th-bg-surf)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 28, height: 28, overflow: 'hidden', flexShrink: 0, background: 'var(--th-bg-well)', border: '1px solid var(--th-br)' }}>
                      <img
                        src={`/icons/${r.id}.png`} alt=""
                        style={{ height: 28, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--th-tx)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>
                        {r.name}
                      </div>
                      <div style={{ color: 'var(--th-tx-mut)', fontSize: 10, marginTop: 1, fontFamily: 'monospace' }}>
                        ×{ingAmt} needed · ⏱{fmtTime(r.craftingTime)}
                      </div>
                    </div>
                    {r.resultAmount > 1 && (
                      <span style={{ color: '#FF9F1C', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>
                        →×{r.resultAmount}
                      </span>
                    )}
                    <span style={{ color: 'var(--th-tx-mut)', fontSize: 11, flexShrink: 0, marginLeft: 'auto' }}>↑</span>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: '5px 10px', borderTop: '1px solid var(--th-br-hdr)', flexShrink: 0, background: 'var(--th-bg-deep)' }}>
            <span style={{ color: 'var(--th-tx-mut)', fontSize: 10, fontFamily: 'monospace' }}>Press U or Esc to close</span>
          </div>
        </div>
      )}
    </div>
  )
}
