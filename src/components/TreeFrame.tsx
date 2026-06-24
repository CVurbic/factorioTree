import type { Node, NodeProps } from '@xyflow/react'

export interface TreeFrameData {
  label: string
  itemId: string
  onRemove: () => void
  [key: string]: unknown
}

type TreeFrameNodeType = Node<TreeFrameData, 'treeFrame'>

export function TreeFrame({ data, selected }: NodeProps<TreeFrameNodeType>) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.018)',
      border: `1px solid ${selected ? '#4a90d9' : '#2a2e3d'}`,
      borderRadius: 8,
      cursor: 'grab',
      position: 'relative',
      boxShadow: selected ? '0 0 0 1px #4a90d922 inset' : 'none',
    }}>
      {/* X remove button */}
      <button
        onClick={e => { e.stopPropagation(); data.onRemove() }}
        onMouseDown={e => e.stopPropagation()}
        title="Remove from canvas"
        style={{
          position: 'absolute', top: 4, right: 6, zIndex: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#4b5563', fontSize: 15, lineHeight: 1,
          padding: '1px 3px', display: 'flex', alignItems: 'center',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
      >
        ×
      </button>
      {/* drag label strip at top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 28,
        borderRadius: '7px 7px 0 0',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid #2a2e3d',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ width: 14, height: 14, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={`/icons/${data.itemId}.png`}
            alt=""
            style={{ height: 14, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
        </div>
        <span style={{
          color: '#4b5563',
          fontSize: 10,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}>
          {data.label}
        </span>
        {/* drag grip dots */}
        <svg style={{ marginLeft: 4, opacity: 0.35 }} width={12} height={10} viewBox="0 0 12 10" fill="#6b7280">
          <circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="10" cy="2" r="1.2"/>
          <circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
        </svg>
      </div>
    </div>
  )
}
