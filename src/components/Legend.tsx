import { useState } from 'react'

const GROUPS = [
  { label: 'Logistics',     color: '#3b82f6' },
  { label: 'Production',    color: '#f97316' },
  { label: 'Intermediate',  color: '#94a3b8' },
  { label: 'Space',         color: '#a855f7' },
  { label: 'Combat',        color: '#ef4444' },
  { label: 'Fluids',        color: '#22d3ee' },
  { label: 'Technology',    color: '#22c55e' },
]

export function Legend() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Legend"
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 4,
          color: '#6b7280',
          width: 28,
          height: 28,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#c9d1d9'; e.currentTarget.style.borderColor = '#4a90d9' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#30363d' }}
      >
        ?
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 36,
          right: 0,
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 6,
          padding: '10px 12px',
          minWidth: 180,
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        }}>
          <div style={{ color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Node Colors
          </div>
          {GROUPS.map(g => (
            <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: g.color, flexShrink: 0 }} />
              <span style={{ color: '#c9d1d9', fontSize: 11 }}>{g.label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #21262d', marginTop: 8, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#22d3ee', opacity: 0.4, flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', fontSize: 11 }}>Dimmer = raw material</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50% 0 0 0', background: '#22d3ee', flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', fontSize: 11 }}>Corner dot = fluid</span>
            </div>
            <div style={{ color: '#9ca3af', fontSize: 11 }}>Double-click node → set as root</div>
            <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>Hover node → see recipe</div>
          </div>
        </div>
      )}
    </div>
  )
}
