import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { recipes } from './data/recipes-generated'
import { buildFlowElements, getRawMaterials } from './utils/buildTree'
import type { FactorioNodeData } from './types'
import { FactorioNode } from './components/FactorioNode'
import { TreeFrame } from './components/TreeFrame'
import { ItemPickerModal } from './components/ItemPickerModal'
import { RawMaterialsPanel } from './components/RawMaterialsPanel'
import { BlueprintsPanel } from './components/BlueprintsPanel'
import { Legend } from './components/Legend'

const nodeTypes: NodeTypes = { factorioNode: FactorioNode, treeFrame: TreeFrame }
const TREE_GAP = 380

// ── storage helpers ───────────────────────────────────────────────────────────

function loadStorage<T>(key: string, fallback: T, parse: (v: string) => T): T {
  try {
    const s = localStorage.getItem(key)
    return s !== null ? parse(s) : fallback
  } catch { return fallback }
}

function validItemId(id: string) { return recipes.some(r => r.id === id) }

// ── FlowCanvas (needs ReactFlowProvider context) ──────────────────────────────

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  activeKey: string   // changes when active items list changes → triggers fitView
  nodeTypes: NodeTypes
  onNodeDoubleClick: (treeIndex: number, recipeId: string) => void
  onRemoveTree: (treeIndex: number) => void
  exportName: string
}

function FlowCanvas({ nodes, edges, activeKey, nodeTypes, onNodeDoubleClick, onRemoveTree, exportName }: FlowCanvasProps) {
  const { fitView, getNodes } = useReactFlow()
  const [flowNodes, setFlowNodes] = useNodesState(nodes)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges)
  const flowRef = useRef<HTMLDivElement>(null)

  // Frame positions persist across rebuilds (collapse/expand) and page refresh
  const framePos = useRef<Map<string, { x: number; y: number }>>(
    (() => {
      try {
        const s = localStorage.getItem('ft-frame-pos')
        if (s) return new Map(Object.entries(JSON.parse(s)) as [string, { x: number; y: number }][])
      } catch { /* */ }
      return new Map()
    })(),
  )

  // Capture frame drags + persist
  function handleNodesChange(changes: NodeChange[]) {
    let dirty = false
    for (const c of changes) {
      if (c.type === 'position' && c.id.endsWith('__frame') && c.position) {
        framePos.current.set(c.id, c.position)
        dirty = true
      }
    }
    if (dirty) {
      localStorage.setItem('ft-frame-pos', JSON.stringify(Object.fromEntries(framePos.current)))
    }
    setFlowNodes(nds => applyNodeChanges(changes, nds) as Node[])
  }

  // Rebuild: restore frame positions; clean up stale entries for removed frames
  useEffect(() => {
    const newFrameIds = new Set(nodes.filter(n => n.id.endsWith('__frame')).map(n => n.id))
    let dirty = false
    for (const key of framePos.current.keys()) {
      if (!newFrameIds.has(key)) { framePos.current.delete(key); dirty = true }
    }
    if (dirty) localStorage.setItem('ft-frame-pos', JSON.stringify(Object.fromEntries(framePos.current)))

    setFlowNodes(nodes.map(n =>
      n.id.endsWith('__frame') && framePos.current.has(n.id)
        ? { ...n, position: framePos.current.get(n.id)! }
        : n,
    ))
    setFlowEdges(edges)
  }, [nodes, edges, setFlowNodes, setFlowEdges])

  // Delete key removes selected frame
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

  async function handleExport() {
    try {
      const { toPng } = await import('html-to-image')
      const el = flowRef.current
      if (!el) return
      const dataUrl = await toPng(el, { backgroundColor: '#0d1117', pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${exportName}-crafting-tree.png`
      a.click()
    } catch (e) { console.error('Export failed', e) }
  }

  return (
    <div ref={flowRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
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
        defaultEdgeOptions={{ type: 'step' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#21262d" gap={24} size={1.5} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={node => {
            const colors: Record<string, string> = {
              'logistics': '#3b82f6', 'production': '#f97316',
              'intermediate-products': '#94a3b8', 'space': '#a855f7',
              'combat': '#ef4444', 'fluids': '#22d3ee', 'signals': '#22c55e',
            }
            return colors[(node.data as FactorioNodeData)?.group] ?? '#4b5563'
          }}
          maskColor="rgba(0,0,0,0.65)"
          style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4 }}
          pannable zoomable
        />
        <Panel position="top-right">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Legend />
            <button
              onClick={handleExport}
              title="Export as PNG"
              style={{
                background: '#161b22', border: '1px solid #30363d',
                borderRadius: 4, color: '#6b7280', width: 28, height: 28,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#c9d1d9'; e.currentTarget.style.borderColor = '#4a90d9' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#30363d' }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // Active items: list of item IDs on canvas (may be empty → triggers picker)
  const [activeItemIds, setActiveItemIds] = useState<string[]>(() =>
    loadStorage('ft-items', [], v => {
      const arr = JSON.parse(v) as string[]
      return arr.filter(validItemId)
    }),
  )

  const [quantity, setQuantity] = useState<number>(1)
  const [modalOpen, setModalOpen] = useState(false)

  // Open picker automatically when canvas is empty (first load or last item removed)
  useEffect(() => {
    if (activeItemIds.length === 0) setModalOpen(true)
  }, [activeItemIds])

  // Collapse state per item: { itemId: Set<recipeId> }
  const [collapsedMap, setCollapsedMap] = useState<Record<string, Set<string>>>(() =>
    loadStorage('ft-collapsed-map', {}, v => {
      const raw = JSON.parse(v) as Record<string, string[]>
      return Object.fromEntries(Object.entries(raw).map(([k, arr]) => [k, new Set<string>(arr)]))
    }),
  )

  // Persist
  useEffect(() => {
    localStorage.setItem('ft-items', JSON.stringify(activeItemIds))
  }, [activeItemIds])

  useEffect(() => {
    const serializable = Object.fromEntries(
      Object.entries(collapsedMap).map(([k, s]) => [k, [...s]])
    )
    localStorage.setItem('ft-collapsed-map', JSON.stringify(serializable))
  }, [collapsedMap])

  // Stable collapse toggle (uses setCollapsedMap only)
  const toggleCollapse = useCallback((itemId: string, recipeId: string) => {
    setCollapsedMap(prev => {
      const current = new Set(prev[itemId] ?? [])
      if (current.has(recipeId)) current.delete(recipeId)
      else current.add(recipeId)
      return { ...prev, [itemId]: current }
    })
  }, [])

  // Add item (from modal)
  function addItem(itemId: string) {
    setActiveItemIds(prev => prev.includes(itemId) ? prev : [...prev, itemId])
    setModalOpen(false)
  }

  // Remove item chip / frame
  const removeItem = useCallback((itemId: string) => {
    setActiveItemIds(prev => prev.filter(id => id !== itemId))
  }, [])

  // Remove by tree index (Del key / frame X button)
  const removeTreeByIndex = useCallback((treeIndex: number) => {
    setActiveItemIds(prev => prev.filter((_, i) => i !== treeIndex))
  }, [])

  // Add item to canvas without opening/closing modal (used from usage popup)
  const addItemToCanvas = useCallback((itemId: string) => {
    setActiveItemIds(prev => prev.includes(itemId) ? prev : [...prev, itemId])
  }, [])

  // Replace a specific tree (double-click node)
  function replaceItem(treeIndex: number, newItemId: string) {
    setActiveItemIds(prev => {
      if (treeIndex < 0 || treeIndex >= prev.length) return prev
      const next = [...prev]
      next[treeIndex] = newItemId
      return next
    })
    setCollapsedMap(prev => ({ ...prev, [newItemId]: new Set() }))
  }

  // Build all trees side by side
  const { nodes, edges } = useMemo(() => {
    const allNodes: Node[] = []
    const allEdges: Edge[] = []
    let xOffset = 0

    for (let i = 0; i < activeItemIds.length; i++) {
      const itemId = activeItemIds[i]
      const collapsed = collapsedMap[itemId] ?? new Set<string>()
      const onToggle = (recipeId: string) => toggleCollapse(itemId, recipeId)

      const { nodes: tNodes, edges: tEdges } = buildFlowElements(
        itemId, quantity, recipes, collapsed, onToggle, addItemToCanvas,
      )

      const prefix = `t${i}__`
      const shifted = tNodes.map(n => ({
        ...n,
        id: `${prefix}${n.id}`,
        position: { x: n.position.x + xOffset, y: n.position.y },
      }))
      const shiftedEdges = tEdges.map(e => ({
        ...e,
        id: `${prefix}${e.id}`,
        source: `${prefix}${e.source}`,
        target: `${prefix}${e.target}`,
      }))

      // Compute bounding box → frame is parent, children get relative positions
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

        // Frame node (parent)
        allNodes.push({
          id: frameId,
          type: 'treeFrame',
          position: { x: frameAbsX, y: frameAbsY },
          style: { width: frameW, height: frameH },
          data: { label: recipe?.name ?? itemId, itemId, onRemove: () => removeItem(itemId) },
          selectable: true,
          draggable: true,
          zIndex: -1,
        } as Node)

        // Children with parentId → positions relative to frame
        const childNodes = tNodes.map(n => ({
          ...n,
          id: `${prefix}${n.id}`,
          parentId: frameId,
          extent: undefined as unknown as 'parent',
          position: {
            x: n.position.x - minLocalX + PAD_X,
            y: n.position.y - minLocalY + PAD_TOP,
          },
        }))
        allNodes.push(...childNodes)
      } else {
        allNodes.push(...shifted)
      }

      allEdges.push(...shiftedEdges)

      if (tNodes.length > 0) {
        const maxX = Math.max(...tNodes.map(n => n.position.x))
        xOffset += maxX + TREE_GAP
      }
    }

    return { nodes: allNodes, edges: allEdges }
  }, [activeItemIds, quantity, collapsedMap, toggleCollapse, removeItem, addItemToCanvas])

  // Aggregate raw materials across all active trees
  const rawMaterials = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number; isFluid: boolean }>()
    for (const itemId of activeItemIds) {
      for (const m of getRawMaterials(itemId, quantity, recipes)) {
        const existing = totals.get(m.id)
        if (existing) existing.amount += m.amount
        else totals.set(m.id, { name: m.name, amount: m.amount, isFluid: m.isFluid })
      }
    }
    return Array.from(totals.entries())
      .map(([id, v]) => ({ id, name: v.name, amount: v.amount, isFluid: v.isFluid }))
      .sort((a, b) => b.amount - a.amount)
  }, [activeItemIds, quantity])

  const activeKey = activeItemIds.join(',')
  const exportName = activeItemIds.join('-')

  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>

        {/* ── header ── */}
        <header style={{
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          minHeight: 44,
          overflowX: 'auto',
        }}>

          {/* logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/icons/groups/production.png"
                style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
              />
            </div>
            <span style={{ color: '#e8d44d', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Crafting Tree
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: '#30363d', flexShrink: 0 }} />

          {/* active item chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
            {activeItemIds.map(itemId => {
              const recipe = recipes.find(r => r.id === itemId)
              return (
                <ItemChip
                  key={itemId}
                  itemId={itemId}
                  name={recipe?.name ?? itemId}
                  onRemove={() => removeItem(itemId)}
                />
              )
            })}
          </div>

          {/* add item button */}
          <button
            onClick={() => setModalOpen(true)}
            title="Add item to canvas"
            style={{
              background: '#21262d', border: '1px solid #30363d',
              borderRadius: 4, color: '#8b949e', fontSize: 12,
              padding: '4px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d333b'; e.currentTarget.style.borderColor = '#4a90d9'; e.currentTarget.style.color = '#c9d1d9' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#21262d'; e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e' }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add item
          </button>

          <div style={{ width: 1, height: 20, background: '#30363d', flexShrink: 0 }} />

          {/* quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ color: '#6b7280', fontSize: 11 }}>×</span>
            <input
              type="number"
              min={1}
              max={100000}
              value={quantity}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 1) setQuantity(v)
              }}
              title="Desired output quantity"
              style={{
                width: 60,
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 4,
                color: '#c9d1d9',
                fontSize: 12,
                padding: '3px 7px',
                outline: 'none',
                fontFamily: 'monospace',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#4a90d9')}
              onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
            />
          </div>

          {/* stats */}
          <div style={{ marginLeft: 'auto', color: '#484f58', fontSize: 11, fontFamily: 'monospace', display: 'flex', gap: 10, flexShrink: 0 }}>
            <span>{nodes.length} nodes</span>
            <span>{edges.length} edges</span>
          </div>
        </header>

        {/* ── canvas ── */}
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            activeKey={activeKey}
            nodeTypes={nodeTypes}
            onNodeDoubleClick={replaceItem}
            onRemoveTree={removeTreeByIndex}
            exportName={exportName}
          />
          <RawMaterialsPanel items={rawMaterials} quantity={quantity} side="left" />
          <BlueprintsPanel activeItemIds={activeItemIds} />
        </div>

        {/* ── modal ── */}
        {modalOpen && (
          <ItemPickerModal
            activeItemIds={activeItemIds}
            onSelect={addItem}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}

// ── item chip ─────────────────────────────────────────────────────────────────

function ItemChip({ itemId, name, onRemove }: { itemId: string; name: string; onRemove?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: '#21262d', border: '1px solid #30363d',
      borderRadius: 4, padding: '3px 6px 3px 5px',
      flexShrink: 0,
    }}>
      {!imgFailed && (
        <div style={{ width: 16, height: 16, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={`/icons/${itemId}.png`}
            style={{ height: 16, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        </div>
      )}
      <span style={{ color: '#c9d1d9', fontSize: 12, whiteSpace: 'nowrap' }}>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4b5563', fontSize: 14, lineHeight: 1,
            padding: '0 0 0 2px', display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
        >
          ×
        </button>
      )}
    </div>
  )
}
