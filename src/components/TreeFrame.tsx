import { NodeResizer, type Node, type NodeProps } from '@xyflow/react'

export interface TreeFrameData {
  label: string
  itemId: string
  onRemove: () => void
  initialWidth?: number
  initialHeight?: number
  [key: string]: unknown
}

type TreeFrameNodeType = Node<TreeFrameData, 'treeFrame'>

export function TreeFrame({ data, selected }: NodeProps<TreeFrameNodeType>) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#1d1c1d',
      border: `2px solid ${selected ? '#FF9F1C88' : '#111111'}`,
      borderRadius: 2,
      cursor: 'grab',
      position: 'relative',
      boxShadow: selected
        ? 'inset 1px 1px 0 rgba(255,255,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.45), 0 0 12px rgba(255,159,28,0.15)'
        : 'inset 1px 1px 0 rgba(255,255,255,0.07), inset -1px -1px 0 rgba(0,0,0,0.4)',
    }}>

      <NodeResizer
        isVisible={selected}
        minWidth={data.initialWidth ?? 200}
        minHeight={data.initialHeight ?? 80}
        handleStyle={{ width: 8, height: 8, background: '#FF9F1C', border: '1px solid #1d1c1d', borderRadius: 2 }}
        lineStyle={{ border: '1px dashed #FF9F1C66' }}
      />

      {/* titlebar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 28,
        background: 'linear-gradient(180deg, #2c2a2b 0%, #252325 100%)',
        borderBottom: '1px solid #111',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        paddingLeft: 10,
        paddingRight: 36,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {/* item icon */}
        <div style={{ width: 16, height: 16, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={`/icons/${data.itemId}.png`}
            alt=""
            style={{ height: 16, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
        </div>

        {/* item name */}
        <span style={{
          color: '#FF9F1C',
          fontSize: 10,
          fontFamily: "'Titillium Web', sans-serif",
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {data.label}
        </span>

        {/* drag grip */}
        <svg style={{ marginLeft: 4, opacity: 0.25, flexShrink: 0 }} width={12} height={10} viewBox="0 0 12 10" fill="#FFE6C0">
          <circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="10" cy="2" r="1.2"/>
          <circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
        </svg>
      </div>

      {/* × remove button */}
      <button
        onClick={e => { e.stopPropagation(); data.onRemove() }}
        onMouseDown={e => e.stopPropagation()}
        title="Remove from canvas"
        style={{
          position: 'absolute', top: 4, right: 6, zIndex: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#5a5458', fontSize: 16, lineHeight: 1,
          padding: '1px 4px', display: 'flex', alignItems: 'center',
          fontFamily: 'monospace',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#5a5458')}
      >
        ×
      </button>
    </div>
  )
}
