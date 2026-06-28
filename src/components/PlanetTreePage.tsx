import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
  type NodeChange,
} from '@xyflow/react'

import { recipes } from '../data/recipes-generated'
import { recipeCategories } from '../data/recipe-categories'
import { PLANETS, BASE_CATEGORIES, isRecipeOnPlanet } from '../data/planets'
import { buildFlowElements, getRawMaterials } from '../utils/buildTree'
import type { FactorioNodeData } from '../types'
import { FactorioNode } from './FactorioNode'
import { TreeFrame } from './TreeFrame'
import { ConveyorEdge } from './ConveyorEdge'
import { ItemPickerModal } from './ItemPickerModal'
import { RawMaterialsPanel } from './RawMaterialsPanel'
import { Legend } from './Legend'

const nodeTypes: NodeTypes = { factorioNode: FactorioNode, treeFrame: TreeFrame }
const edgeTypes: EdgeTypes = { conveyor: ConveyorEdge }
const TREE_GAP = 380

function loadStorage<T>(key: string, fallback: T, parse: (v: string) => T): T {
  try {
    const s = localStorage.getItem(key)
    return s !== null ? parse(s) : fallback
  } catch { return fallback }
}

function validItemId(id: string) { return recipes.some(r => r.id === id) }

// ── inner canvas (needs ReactFlow context) ─────────────────────────────────────

function PlanetFlowCanvas({ nodes, edges, activeKey, onNodeDoubleClick, onRemoveTree, exportName }: {
  nodes: Node[]
  edges: Edge[]
  activeKey: string
  onNodeDoubleClick: (treeIndex: number, recipeId: string) => void
  onRemoveTree: (treeIndex: number) => void
  exportName: string
}) {
  const { fitView, getNodes } = useReactFlow()
  const [flowNodes, setFlowNodes] = useNodesState(nodes)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges)

  useEffect(() => {
    setFlowNodes(nodes)
    setFlowEdges(edges)
  }, [nodes, edges, setFlowNodes, setFlowEdges])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const selectedFrame = getNodes().find(n => n.selected && n.id.endsWith('__frame'))
      if (!selectedFrame) return
      const match = selectedFrame.id.match(/^t(\d+)__/)
      if (match) { e.preventDefault(); onRemoveTree(parseInt(match[1])) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [getNodes, onRemoveTree])

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2, minZoom: 0.05, maxZoom: 2, duration: 400 }), 60)
    return () => clearTimeout(t)
  }, [activeKey, fitView])

  function handleNodesChange(changes: NodeChange[]) {
    setFlowNodes(nds => applyNodeChanges(changes, nds) as Node[])
  }

  async function handleExport() {
    try {
      const { toPng } = await import('html-to-image')
      const el = document.querySelector('.react-flow') as HTMLElement
      if (!el) return
      const dataUrl = await toPng(el, { backgroundColor: '#0d1117', pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${exportName}-crafting-tree.png`
      a.click()
    } catch (e) { console.error('Export failed', e) }
  }

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeDoubleClick={(_, node) => {
        const d = node.data as FactorioNodeData
        if (d.isRaw) return
        const match = node.id.match(/^t(\d+)__/)
        if (match) onNodeDoubleClick(parseInt(match[1]), d.recipeId)
      }}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnScroll
      minZoom={0.05}
      maxZoom={3}
    >
      <Background variant={BackgroundVariant.Dots} color="var(--th-dot)" gap={24} size={1.5} />
      <Controls showInteractive={false} />
      <Panel position="top-right">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <Legend />
          <button
            onClick={handleExport}
            title="Export as PNG"
            style={{
              background: 'var(--th-bg-rf)', border: '1px solid var(--th-br-rf)',
              borderRadius: 4, color: 'var(--th-tx-mut)', width: 28, height: 28,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--th-tx-body)'; e.currentTarget.style.borderColor = '#4a90d9' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--th-tx-mut)'; e.currentTarget.style.borderColor = 'var(--th-br-rf)' }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </Panel>
    </ReactFlow>
  )
}

// ── PlanetTreePage ─────────────────────────────────────────────────────────────

export function PlanetTreePage() {
  const [selectedPlanet, setSelectedPlanet] = useState('all')
  const [quantity, setQuantity] = useState<number>(() =>
    loadStorage('ft-planet-qty', 1, v => { const n = parseInt(v, 10); return isNaN(n) ? 1 : n }),
  )
  const [activeItemIds, setActiveItemIds] = useState<string[]>(() =>
    loadStorage('ft-planet-items', [], v => (JSON.parse(v) as string[]).filter(validItemId)),
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [collapsedMap, setCollapsedMap] = useState<Record<string, Set<string>>>({})

  useEffect(() => { if (activeItemIds.length === 0) setModalOpen(true) }, [activeItemIds])
  useEffect(() => { localStorage.setItem('ft-planet-items', JSON.stringify(activeItemIds)) }, [activeItemIds])
  useEffect(() => { localStorage.setItem('ft-planet-qty', String(quantity)) }, [quantity])

  // Set of recipe IDs allowed on the selected planet
  const allowedIds = useMemo<Set<string> | undefined>(() => {
    if (selectedPlanet === 'all') return undefined
    const allowed = new Set<string>()
    for (const r of recipes) {
      const cat = recipeCategories[r.id] ?? 'crafting'
      if (isRecipeOnPlanet(cat, selectedPlanet)) allowed.add(r.id)
    }
    return allowed
  }, [selectedPlanet])

  const toggleCollapse = useCallback((itemId: string, recipeId: string) => {
    setCollapsedMap(prev => {
      const current = new Set(prev[itemId] ?? [])
      if (current.has(recipeId)) current.delete(recipeId)
      else current.add(recipeId)
      return { ...prev, [itemId]: current }
    })
  }, [])

  function addItem(itemId: string) {
    setActiveItemIds(prev => prev.includes(itemId) ? prev : [...prev, itemId])
    setModalOpen(false)
  }

  const removeItem = useCallback((itemId: string) => {
    setActiveItemIds(prev => prev.filter(id => id !== itemId))
  }, [])

  const removeTreeByIndex = useCallback((treeIndex: number) => {
    setActiveItemIds(prev => prev.filter((_, i) => i !== treeIndex))
  }, [])

  function replaceItem(treeIndex: number, newItemId: string) {
    const oldItemId = activeItemIds[treeIndex]
    setCollapsedMap(prev => ({ ...prev, [newItemId]: new Set(prev[oldItemId] ?? []) }))
    setActiveItemIds(prev => {
      if (treeIndex < 0 || treeIndex >= prev.length) return prev
      const next = [...prev]; next[treeIndex] = newItemId; return next
    })
  }

  const { nodes, edges } = useMemo(() => {
    const allNodes: Node[] = []
    const allEdges: Edge[] = []
    let xOffset = 0

    for (let i = 0; i < activeItemIds.length; i++) {
      const itemId = activeItemIds[i]
      const collapsed = collapsedMap[itemId] ?? new Set<string>()
      const onToggle = (recipeId: string) => toggleCollapse(itemId, recipeId)
      const onExtendToParent = (newRootId: string) => replaceItem(i, newRootId)
      const { nodes: tNodes, edges: tEdges } = buildFlowElements(itemId, quantity, collapsed, onToggle, onExtendToParent)

      const prefix = `t${i}__`

      if (tNodes.length > 0) {
        const PAD_X = 52, PAD_TOP = 40, PAD_BOT = 32
        const NODE_W = 160, NODE_H = 64
        const localXs = tNodes.map(n => n.position.x)
        const localYs = tNodes.map(n => n.position.y)
        const minLocalX = Math.min(...localXs)
        const minLocalY = Math.min(...localYs)
        const maxLocalX = Math.max(...localXs)
        const maxLocalY = Math.max(...localYs)
        const frameW = maxLocalX - minLocalX + NODE_W + PAD_X * 2
        const frameH = maxLocalY - minLocalY + NODE_H + PAD_TOP + PAD_BOT
        const frameAbsX = minLocalX + xOffset - PAD_X
        const frameAbsY = minLocalY - PAD_TOP
        const recipe = recipes.find(r => r.id === itemId)
        const frameId = `${prefix}frame`

        allNodes.push({
          id: frameId,
          type: 'treeFrame',
          position: { x: frameAbsX, y: frameAbsY },
          style: { width: frameW, height: frameH },
          data: { label: recipe?.name ?? itemId, itemId, onRemove: () => removeItem(itemId), initialWidth: frameW, initialHeight: frameH },
          selectable: true, draggable: true, zIndex: -1,
        } as Node)

        allNodes.push(...tNodes.map(n => ({
          ...n,
          id: `${prefix}${n.id}`,
          parentId: frameId,
          extent: 'parent' as const,
          position: { x: n.position.x - minLocalX + PAD_X, y: n.position.y - minLocalY + PAD_TOP },
        })))

        xOffset += maxLocalX - minLocalX + NODE_W + TREE_GAP
      }

      allEdges.push(...tEdges.map(e => ({
        ...e, id: `${prefix}${e.id}`,
        source: `${prefix}${e.source}`, target: `${prefix}${e.target}`,
      })))
    }

    return { nodes: allNodes, edges: allEdges }
  }, [activeItemIds, quantity, collapsedMap, toggleCollapse, removeItem])

  const rawMaterials = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number; isFluid: boolean }>()
    for (const itemId of activeItemIds) {
      for (const m of getRawMaterials(itemId, quantity)) {
        const existing = totals.get(m.id)
        if (existing) existing.amount += m.amount
        else totals.set(m.id, { name: m.name, amount: m.amount, isFluid: m.isFluid })
      }
    }
    return Array.from(totals.entries())
      .map(([id, v]) => ({ id, name: v.name, amount: v.amount, isFluid: v.isFluid }))
      .sort((a, b) => b.amount - a.amount)
  }, [activeItemIds, quantity])

  const activeKey = activeItemIds.join(',') + selectedPlanet
  const exportName = activeItemIds.join('-')

  // Count how many recipes are available on the selected planet
  const planetRecipeCount = allowedIds?.size ?? recipes.length

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── planet selector bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderBottom: '1px solid var(--th-br)',
        background: 'var(--th-bg-hdr)', flexShrink: 0, flexWrap: 'wrap', rowGap: 6,
      }}>
        <span style={{
          color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: "'Titillium Web', sans-serif",
          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0,
        }}>
          Planet
        </span>

        {PLANETS.map(p => {
          const isActive = selectedPlanet === p.id
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlanet(p.id)}
              style={{
                padding: '3px 10px', flexShrink: 0,
                background: isActive ? 'var(--th-bg-well)' : 'none',
                border: `1px solid ${isActive ? p.color + '55' : 'var(--th-br-hdr)'}`,
                borderRadius: 1, cursor: 'pointer',
                color: isActive ? p.color : 'var(--th-tx-vmut)',
                fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = p.color; e.currentTarget.style.borderColor = p.color + '44' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--th-tx-vmut)'; e.currentTarget.style.borderColor = 'var(--th-br-hdr)' } }}
            >
              {p.name}
            </button>
          )
        })}

        <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: 'monospace', marginLeft: 4 }}>
          {planetRecipeCount} recipes
        </span>

        <div style={{ flex: 1 }} />

        {/* item chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {activeItemIds.map(itemId => {
            const recipe = recipes.find(r => r.id === itemId)
            return (
              <PlanetChip key={itemId} itemId={itemId} name={recipe?.name ?? itemId} onRemove={() => removeItem(itemId)} />
            )
          })}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--th-bg-surf)', border: '1px solid var(--th-br)',
              borderRadius: 1, color: 'var(--th-tx-sec)', fontSize: 10,
              padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF9F1C'; e.currentTarget.style.borderColor = '#FF9F1C55' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--th-tx-sec)'; e.currentTarget.style.borderColor = 'var(--th-br)' }}
          >
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>

        {/* qty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Qty</span>
          <input
            type="number" min={1} max={100000} value={quantity}
            onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 1) setQuantity(v) }}
            style={{
              width: 56, background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
              borderRadius: 1, color: 'var(--th-tx)', fontSize: 11, padding: '2px 5px',
              outline: 'none', fontFamily: 'monospace',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
          />
        </div>
      </div>

      {/* ── canvas ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <PlanetFlowCanvas
          nodes={nodes}
          edges={edges}
          activeKey={activeKey}
          onNodeDoubleClick={replaceItem}
          onRemoveTree={removeTreeByIndex}
          exportName={exportName}
        />
        <RawMaterialsPanel items={rawMaterials} quantity={quantity} side="left" />
      </div>

      {modalOpen && (
        <ItemPickerModal
          activeItemIds={activeItemIds}
          allowedIds={allowedIds}
          onSelect={addItem}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

function PlanetChip({ itemId, name, onRemove }: { itemId: string; name: string; onRemove: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'var(--th-bg-surf)', border: '1px solid var(--th-br)', borderRadius: 1,
      padding: '2px 5px 2px 4px', flexShrink: 0,
    }}>
      {!imgFailed && (
        <div style={{ width: 14, height: 14, overflow: 'hidden', flexShrink: 0 }}>
          <img src={`/icons/${itemId}.png`} style={{ height: 14, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }} onError={() => setImgFailed(true)} />
        </div>
      )}
      <span style={{ color: 'var(--th-tx)', fontSize: 10, whiteSpace: 'nowrap', fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{name}</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--th-tx-vmut)', fontSize: 13, lineHeight: 1, padding: '0 0 0 1px' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
      >×</button>
    </div>
  )
}
