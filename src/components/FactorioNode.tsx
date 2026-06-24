import { useState, useEffect, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'
import type { FactorioNodeData } from '../types'
import { recipes } from '../data/recipes-generated'

type FactorioNodeType = Node<FactorioNodeData, 'factorioNode'>

const GROUP_COLORS: Record<string, { border: string; bg: string; raw: string }> = {
  'logistics':             { border: '#3b82f6', bg: '#141b2d', raw: '#1a2235' },
  'production':            { border: '#f97316', bg: '#1f170e', raw: '#261c10' },
  'intermediate-products': { border: '#94a3b8', bg: '#1c1f26', raw: '#22252d' },
  'space':                 { border: '#a855f7', bg: '#1a1228', raw: '#201630' },
  'combat':                { border: '#ef4444', bg: '#1f1212', raw: '#261616' },
  'fluids':                { border: '#22d3ee', bg: '#0e1c1f', raw: '#122226' },
  'signals':               { border: '#22c55e', bg: '#0f1f15', raw: '#13261b' },
  'other':                 { border: '#4b5563', bg: '#1c1f26', raw: '#22252d' },
}

function fmtAmount(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

function fmtTime(t: number): string {
  return Number.isInteger(t) ? `${t}s` : `${t.toFixed(1)}s`
}

export function FactorioNode({ data }: NodeProps<FactorioNodeType>) {
  const [imgFailed, setImgFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showUsage, setShowUsage] = useState(false)

  // All recipes that use this item as an ingredient
  const usedIn = useMemo(() =>
    recipes.filter(r => r.ingredients.some(ing => ing.id === data.recipeId)),
    [data.recipeId],
  )

  // U key while hovered → toggle usage popup; Escape → close
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

  const colors = GROUP_COLORS[data.group] ?? GROUP_COLORS['other']
  const borderColor = data.isRaw ? colors.raw : colors.border
  const bgColor = data.isRaw ? colors.bg : colors.bg

  const displayAmount = fmtAmount(data.amount)
  const displayTime = fmtTime(data.craftingTime)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 160,
        height: 64,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 8,
        paddingRight: 8,
        userSelect: 'none',
        boxShadow: data.isRaw ? 'none' : `0 0 6px ${borderColor}22`,
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
            background: data.isCollapsed ? borderColor : '#21262d',
            border: `1px solid ${borderColor}`,
            color: data.isCollapsed ? '#fff' : borderColor,
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

      {/* icon */}
      <div style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: 3,
        overflow: 'hidden',
        background: '#0d1117',
        border: `1px solid ${borderColor}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!imgFailed ? (
          <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            <img
              src={`/icons/${data.recipeId}.png`}
              alt={data.name}
              style={{ height: 36, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
              onError={() => setImgFailed(true)}
            />
            {/* fluid overlay */}
            {data.isFluid && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 10, height: 10,
                background: '#22d3ee',
                borderRadius: '50% 0 0 0',
                opacity: 0.8,
              }} />
            )}
          </div>
        ) : (
          <span style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>
            {data.recipeId.slice(0, 3).toUpperCase()}
          </span>
        )}
      </div>

      {/* name */}
      <span style={{
        fontSize: 11,
        lineHeight: 1.25,
        fontWeight: 500,
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        color: data.isRaw ? '#9ca3af' : '#e2e8f0',
      }}>
        {data.name}
      </span>

      {/* bottom badges */}
      <div style={{
        position: 'absolute', bottom: 3, right: 5,
        fontSize: 10, fontWeight: 700, lineHeight: 1,
        color: data.amount > 1 ? '#f0a030' : '#6b7280',
      }}>
        ×{displayAmount}
      </div>

      {!data.isRaw && (
        <div style={{
          position: 'absolute', bottom: 3, left: 8,
          fontSize: 9, lineHeight: 1,
          color: '#4b5563',
        }}>
          ⏱{displayTime}
        </div>
      )}

      {/* right source handle */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', right: -1 }}
      />

      {/* hover tooltip (hidden while usage popup is open) */}
      {hovered && !showUsage && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 12px)',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#1e222a',
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          padding: '10px 12px',
          minWidth: 180,
          maxWidth: 240,
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        }}>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            {data.name}
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 8, display: 'flex', gap: 12 }}>
            <span>⏱ {displayTime}/craft</span>
            <span>→ ×{data.resultAmount}</span>
          </div>
          {data.allIngredients.length > 0 && (
            <>
              <div style={{ color: '#4b5563', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ingredients
              </div>
              {data.allIngredients.map(ing => (
                <div key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 18, height: 18, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={`/icons/${ing.id}.png`}
                      alt=""
                      style={{ height: 18, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                    />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 11 }}>
                    ×{ing.amount} {ing.name}
                  </span>
                </div>
              ))}
            </>
          )}
          {data.isCollapsed && (
            <div style={{ marginTop: 8, color: '#f0a030', fontSize: 10 }}>
              Subtree collapsed — click + to expand
            </div>
          )}
          {!data.isRaw && !data.isCollapsed && (
            <div style={{ marginTop: 8, color: '#4b5563', fontSize: 10 }}>
              Double-click to set as root
            </div>
          )}
          {usedIn.length > 0 && (
            <div style={{ marginTop: 8, color: '#c9a84c', fontSize: 10 }}>
              Press U — used in {usedIn.length} recipe{usedIn.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* usage popup */}
      {showUsage && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#1e222a',
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            width: 280,
            maxHeight: 360,
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px 6px',
            borderBottom: '1px solid #2a2e3d',
            flexShrink: 0,
          }}>
            <div>
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12 }}>Used in</span>
              <span style={{ color: '#c9a84c', fontSize: 12, marginLeft: 5, fontFamily: 'monospace' }}>
                {usedIn.length} recipe{usedIn.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setShowUsage(false) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#4b5563', fontSize: 16, lineHeight: 1, padding: '0 2px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
            >×</button>
          </div>

          {/* list */}
          <div style={{ overflowY: 'auto', padding: '6px 8px', flex: 1 }}>
            {usedIn.length === 0 ? (
              <span style={{ color: '#4b5563', fontSize: 12 }}>Not used in any recipe.</span>
            ) : (
              usedIn.map(r => {
                const ingAmt = r.ingredients.find(ing => ing.id === data.recipeId)?.amount ?? 1
                return (
                  <div
                    key={r.id}
                    onClick={() => { data.onAddItem(r.id); setShowUsage(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 4px',
                      borderRadius: 3,
                      marginBottom: 2,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#262a34')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* result icon */}
                    <div style={{ width: 28, height: 28, overflow: 'hidden', flexShrink: 0, background: '#0d1117', borderRadius: 3, border: '1px solid #2a2e3d' }}>
                      <img
                        src={`/icons/${r.id}.png`}
                        alt=""
                        style={{ height: 28, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                    </div>
                    {/* result name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#c9d1d9', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </div>
                      <div style={{ color: '#4b5563', fontSize: 10, marginTop: 1 }}>
                        ×{ingAmt} needed · ⏱{fmtTime(r.craftingTime)}
                      </div>
                    </div>
                    {/* result amount */}
                    {r.resultAmount > 1 && (
                      <span style={{ color: '#c9a84c', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>
                        →×{r.resultAmount}
                      </span>
                    )}
                    {/* add hint */}
                    <span style={{ color: '#4b5563', fontSize: 13, lineHeight: 1, flexShrink: 0, marginLeft: 'auto' }}>+</span>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: '4px 10px 6px', borderTop: '1px solid #1a1d24', flexShrink: 0 }}>
            <span style={{ color: '#4b5563', fontSize: 10 }}>Press U or Esc to close</span>
          </div>
        </div>
      )}
    </div>
  )
}
