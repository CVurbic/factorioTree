import { useState, useMemo, useEffect, useRef } from 'react'
import { recipes, itemGroups } from '../data/recipes-generated'

interface Props {
  onSelect: (itemId: string) => void
  onClose: () => void
  activeItemIds?: string[]
  allowedIds?: Set<string>
}

// Pre-sort all recipes by subgroup order, then item order within each group
const itemsByGroup: Record<string, typeof recipes> = {}
for (const g of itemGroups) {
  itemsByGroup[g.id] = recipes
    .filter(r => r.group === g.id)
    .sort((a, b) => {
      const sg = a.subgroupOrder.localeCompare(b.subgroupOrder)
      if (sg !== 0) return sg
      return a.itemOrder.localeCompare(b.itemOrder)
    })
}

function groupBySubgroup(items: typeof recipes) {
  const out: Array<{ subgroup: string; items: typeof recipes }> = []
  for (const item of items) {
    const last = out[out.length - 1]
    if (last && last.subgroup === item.subgroup) last.items.push(item)
    else out.push({ subgroup: item.subgroup, items: [item] })
  }
  return out
}

export function ItemPickerModal({ onSelect, onClose, activeItemIds = [], allowedIds }: Props) {
  const [activeGroup, setActiveGroup] = useState(itemGroups[0]?.id ?? '')
  const [filter, setFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const poolByGroup = useMemo(() => {
    if (!allowedIds) return itemsByGroup
    const out: Record<string, typeof recipes> = {}
    for (const g of itemGroups) out[g.id] = (itemsByGroup[g.id] ?? []).filter(r => allowedIds.has(r.id))
    return out
  }, [allowedIds])

  const visibleGroups = itemGroups.filter(g => (poolByGroup[g.id]?.length ?? 0) > 0)

  const pool = useMemo(
    () => allowedIds ? recipes.filter(r => allowedIds.has(r.id)) : recipes,
    [allowedIds],
  )

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return null
    const q = filter.toLowerCase()
    return pool
      .filter(r => r.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const sg = a.subgroupOrder.localeCompare(b.subgroupOrder)
        return sg !== 0 ? sg : a.itemOrder.localeCompare(b.itemOrder)
      })
  }, [filter, pool])

  const subgroupedItems = useMemo(() =>
    filteredItems ? null : groupBySubgroup(poolByGroup[activeGroup] ?? []),
    [activeGroup, filteredItems, poolByGroup],
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--th-bg-modal)',
          border: '1px solid var(--th-br-lt)',
          borderRadius: 4,
          width: 680,
          maxWidth: '95vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px var(--th-br), 0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── top bar: title + search + close ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          borderBottom: '1px solid var(--th-br-mid)',
          flexShrink: 0,
          background: 'var(--th-bg-modal-h)',
        }}>
          <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.06em', flexShrink: 0 }}>
            {activeItemIds.length > 0 ? 'Add item to canvas' : 'Select item'}
          </span>

          <div style={{ position: 'relative', flex: 1 }}>
            <svg
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--th-tx-vmut)' }}
              width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--th-bg-input)', border: '1px solid var(--th-br-mid)',
                borderRadius: 3, color: 'var(--th-tx-body)', fontSize: 12,
                padding: '5px 8px 5px 26px', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br-mid)')}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--th-tx-vmut)', fontSize: 18, lineHeight: 1, padding: '2px 4px',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--th-tx-body)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
          >
            ×
          </button>
        </div>

        {/* ── category tabs ── */}
        {!filter && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--th-br-mid)',
            background: 'var(--th-bg-modal-h)',
            flexShrink: 0,
            overflowX: 'auto',
          }}>
            {visibleGroups.map(g => {
              const isActive = g.id === activeGroup
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  title={g.name}
                  style={{
                    background: isActive ? 'var(--th-bg-modal)' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #c9a84c' : '2px solid transparent',
                    borderTop: isActive ? '1px solid var(--th-br-lt)' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    flexShrink: 0,
                    position: 'relative',
                    marginTop: isActive ? -1 : 0,
                  }}
                >
                  <div style={{ width: 32, height: 32, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={`/icons/groups/${g.id}.png`}
                      alt={g.name}
                      style={{ height: 32, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                    />
                  </div>
                  <span style={{
                    fontSize: 9,
                    color: isActive ? '#c9a84c' : 'var(--th-tx-vmut)',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}>
                    {poolByGroup[g.id]?.length ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── item grid ── */}
        <div style={{
          overflowY: 'auto',
          padding: '8px 8px',
          flex: 1,
        }}>
          {filteredItems !== null ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {filteredItems.length === 0 && (
                <span style={{ color: 'var(--th-tx-vmut)', fontSize: 12, padding: 8 }}>No items found.</span>
              )}
              {filteredItems.map(item => (
                <ItemTile key={item.id} item={item} onSelect={onSelect} isActive={activeItemIds.includes(item.id)} />
              ))}
            </div>
          ) : (
            subgroupedItems!.map((sg, i) => (
              <div key={sg.subgroup || i}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 6 }}>
                  {sg.items.map(item => (
                    <ItemTile key={item.id} item={item} onSelect={onSelect} isActive={activeItemIds.includes(item.id)} />
                  ))}
                </div>
                {i < subgroupedItems!.length - 1 && (
                  <div style={{ height: 1, background: 'var(--th-bg-deep)', margin: '2px 0 6px' }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── single item tile ──────────────────────────────────────────────────────────

interface TileProps {
  item: typeof recipes[number]
  onSelect: (id: string) => void
  isActive?: boolean
}

function ItemTile({ item, onSelect, isActive }: TileProps) {
  const [hovered, setHovered] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <button
      onClick={() => onSelect(item.id)}
      title={item.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive ? '#1a2a1a' : hovered ? 'var(--th-bg-hover)' : 'var(--th-bg-item)',
        border: `1px solid ${isActive ? '#22c55e' : hovered ? '#c9a84c' : 'var(--th-br-mid)'}`,
        borderRadius: 2,
        width: 46,
        height: 46,
        padding: 3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        boxShadow: hovered ? `0 0 0 1px #c9a84c44` : 'none',
      }}
    >
      {!imgFailed ? (
        <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={`/icons/${item.id}.png`}
            alt={item.name}
            style={{ height: 36, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <span style={{ fontSize: 8, color: 'var(--th-tx-vmut)', textAlign: 'center', lineHeight: 1.2 }}>
          {item.id.slice(0, 4).toUpperCase()}
        </span>
      )}

      {item.resultAmount > 1 && (
        <span style={{
          position: 'absolute', bottom: 1, right: 2,
          fontSize: 9, fontWeight: 700, color: '#c9a84c', lineHeight: 1,
          fontFamily: 'monospace',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          {item.resultAmount}
        </span>
      )}
    </button>
  )
}
