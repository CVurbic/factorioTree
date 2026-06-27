import { useState } from 'react'

const KEY = 'ft-author'

export function getUsername(): string | null {
  try { return localStorage.getItem(KEY) || null } catch { return null }
}

export function saveUsername(name: string): void {
  try { localStorage.setItem(KEY, name) } catch {}
}

export function clearUsername(): void {
  try { localStorage.removeItem(KEY) } catch {}
}

interface Props {
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function UsernameModal({ onConfirm, onCancel }: Props) {
  const [value, setValue] = useState(getUsername() ?? '')
  const trimmed = value.trim()
  const valid = trimmed.length >= 1 && trimmed.length <= 40

  function submit() {
    if (!valid) return
    saveUsername(trimmed)
    onConfirm(trimmed)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#272526', border: '1px solid #111',
          borderTop: '2px solid #FF9F1C', borderRadius: 2,
          width: 340, padding: '20px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ color: '#FFE6C0', fontSize: 15, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", marginBottom: 4 }}>
          Choose a display name
        </div>
        <div style={{ color: '#5a5458', fontSize: 11, fontFamily: 'monospace', marginBottom: 14 }}>
          Shown on blueprints and comments you share.
        </div>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
          maxLength={40}
          placeholder="Your name…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1b1b1b', border: '1px solid #111', borderRadius: 1,
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)',
            color: '#FFE6C0', fontSize: 13, padding: '7px 10px', outline: 'none',
            fontFamily: "'Titillium Web', sans-serif", marginBottom: 12,
            display: 'block',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
          onBlur={e => (e.currentTarget.style.borderColor = '#111')}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={submit}
            disabled={!valid}
            style={{
              flex: 1, padding: '7px',
              background: valid ? '#1a2a1a' : '#1b1b1b',
              border: `1px solid ${valid ? '#22c55e44' : '#111'}`,
              borderRadius: 1, cursor: valid ? 'pointer' : 'not-allowed',
              color: valid ? '#22c55e' : '#5a5458',
              fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 14px', background: 'none', border: '1px solid #1a1919',
              borderRadius: 1, cursor: 'pointer', color: '#5a5458',
              fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A19E9A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a5458')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
