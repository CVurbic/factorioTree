import { useState, useEffect, useCallback } from 'react'
import { supabase, type Blueprint } from '../lib/supabase'
import { recipes } from '../data/recipes-generated'

interface Props {
  activeItemIds: string[]
  quantity: number
  onLoadBlueprint: (items: string[], quantity: number) => void
}

const VOTED_KEY = 'ft-voted-blueprints'

function getVoted(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]') as string[]) }
  catch { return new Set() }
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function BlueprintsPanel({ activeItemIds, quantity, onLoadBlueprint }: Props) {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<'browse' | 'share'>('browse')

  // Browse
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [voted, setVoted] = useState<Set<string>>(getVoted)

  // Share form
  const [formName, setFormName] = useState('')
  const [formAuthor, setFormAuthor] = useState(() => {
    try { return localStorage.getItem('ft-author') ?? '' } catch { return '' }
  })
  const [formDesc, setFormDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchBlueprints = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    setLoading(false)
    if (error) { setFetchError(error.message); return }
    if (data) setBlueprints(data as Blueprint[])
  }, [])

  useEffect(() => {
    if (open && tab === 'browse') fetchBlueprints()
  }, [open, tab, fetchBlueprints])

  async function handleUpvote(e: React.MouseEvent, bp: Blueprint) {
    e.stopPropagation()
    if (voted.has(bp.id)) return
    const { error } = await supabase.rpc('increment_upvotes', { blueprint_id: bp.id })
    if (!error) {
      const next = new Set(voted)
      next.add(bp.id)
      setVoted(next)
      localStorage.setItem(VOTED_KEY, JSON.stringify([...next]))
      setBlueprints(prev => prev.map(b => b.id === bp.id ? { ...b, upvotes: b.upvotes + 1 } : b))
    }
  }

  async function handleSubmit() {
    if (!formName.trim() || activeItemIds.length === 0) return
    setSubmitting(true)
    setSubmitError(null)
    const author = formAuthor.trim() || 'Anonymous'
    localStorage.setItem('ft-author', author)
    const { error } = await supabase.from('blueprints').insert({
      name: formName.trim(),
      description: formDesc.trim() || null,
      author,
      items: activeItemIds,
      quantity,
    })
    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    setSubmitted(true)
    setFormName('')
    setFormDesc('')
    setTimeout(() => { setSubmitted(false); setTab('browse') }, 1800)
  }

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: open ? 268 : 40,
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 6,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 100,
      transition: 'width 0.2s',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 100px)',
    }}>
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        padding: open ? '8px 10px' : '8px',
        background: '#1c2128',
        cursor: 'pointer',
        flexShrink: 0,
        borderBottom: open ? '1px solid #21262d' : 'none',
      }} onClick={() => setOpen(o => !o)}>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              Blueprints
            </span>
          </div>
        )}
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, transition: 'transform 0.2s' }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {open && (
        <>
          {/* tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
            {(['browse', 'share'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '6px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t ? '#c9d1d9' : '#4b5563',
                fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.05em',
                borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent',
                transition: 'color 0.15s',
                textTransform: 'uppercase',
              }}>
                {t === 'browse' ? 'Browse' : 'Share'}
              </button>
            ))}
          </div>

          {/* ── browse tab ── */}
          {tab === 'browse' && (
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#4b5563', fontSize: 11 }}>Loading…</div>
              )}
              {!loading && fetchError && (
                <div style={{ padding: '12px', color: '#ef4444', fontSize: 11 }}>{fetchError}</div>
              )}
              {!loading && !fetchError && blueprints.length === 0 && (
                <div style={{ padding: '16px 12px', color: '#4b5563', fontSize: 11 }}>
                  No blueprints yet — be the first to share!
                </div>
              )}
              {blueprints.map(bp => (
                <div
                  key={bp.id}
                  title="Click to load this blueprint"
                  style={{ padding: '8px 10px', borderBottom: '1px solid #1c2128', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1c2128')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => onLoadBlueprint(bp.items, bp.quantity)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bp.name}
                      </div>
                      <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>
                        {bp.author} · {fmtDate(bp.created_at)} · {bp.items.length} item{bp.items.length !== 1 ? 's' : ''} · ×{bp.quantity}
                      </div>
                      {bp.description && (
                        <div style={{
                          color: '#6b7280', fontSize: 10, marginTop: 3, lineHeight: 1.4,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {bp.description}
                        </div>
                      )}
                    </div>
                    {/* upvote button */}
                    <button
                      onClick={e => handleUpvote(e, bp)}
                      title={voted.has(bp.id) ? 'Already upvoted' : 'Upvote'}
                      style={{
                        flexShrink: 0,
                        background: voted.has(bp.id) ? '#0f2a0f' : 'none',
                        border: `1px solid ${voted.has(bp.id) ? '#22c55e44' : '#30363d'}`,
                        borderRadius: 4,
                        cursor: voted.has(bp.id) ? 'default' : 'pointer',
                        color: voted.has(bp.id) ? '#22c55e' : '#6b7280',
                        fontSize: 10, padding: '3px 6px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                        lineHeight: 1,
                      }}
                      onMouseEnter={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#22c55e' }}
                      onMouseLeave={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#6b7280' }}
                    >
                      <span>▲</span>
                      <span style={{ fontFamily: 'monospace' }}>{bp.upvotes}</span>
                    </button>
                  </div>
                  {/* item icon previews */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
                    {bp.items.slice(0, 8).map(id => (
                      <div key={id} style={{ width: 18, height: 18, overflow: 'hidden', background: '#0d1117', borderRadius: 2, border: '1px solid #2a2e3d' }}>
                        <img
                          src={`/icons/${id}.png`} alt=""
                          style={{ height: 18, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                        />
                      </div>
                    ))}
                    {bp.items.length > 8 && (
                      <span style={{ color: '#4b5563', fontSize: 10, alignSelf: 'center' }}>+{bp.items.length - 8}</span>
                    )}
                  </div>
                </div>
              ))}
              {!loading && (
                <button
                  onClick={fetchBlueprints}
                  style={{
                    width: '100%', padding: '8px', background: 'none', border: 'none',
                    cursor: 'pointer', color: '#4b5563', fontSize: 10, fontFamily: 'monospace',
                    borderTop: blueprints.length > 0 ? '1px solid #1c2128' : 'none',
                    marginTop: 'auto', flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                >
                  ↻ Refresh
                </button>
              )}
            </div>
          )}

          {/* ── share tab ── */}
          {tab === 'share' && (
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '10px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ color: '#22c55e', fontSize: 15, marginBottom: 6 }}>✓ Shared!</div>
                  <div style={{ color: '#4b5563', fontSize: 11 }}>Redirecting to browse…</div>
                </div>
              ) : (
                <>
                  {/* canvas preview */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: '#4b5563', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      Canvas ({activeItemIds.length} item{activeItemIds.length !== 1 ? 's' : ''} · ×{quantity})
                    </div>
                    {activeItemIds.length === 0 ? (
                      <div style={{ color: '#6b7280', fontSize: 11 }}>Canvas is empty — add items first.</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {activeItemIds.map(id => {
                          const r = recipes.find(rx => rx.id === id)
                          return (
                            <div key={id} title={r?.name ?? id} style={{ width: 22, height: 22, overflow: 'hidden', background: '#0d1117', borderRadius: 2, border: '1px solid #2a2e3d' }}>
                              <img
                                src={`/icons/${id}.png`} alt=""
                                style={{ height: 22, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                                onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <InputField label="Name *" value={formName} onChange={setFormName} placeholder="e.g. Science Pack Setup" maxLength={80} />
                  <InputField label="Author" value={formAuthor} onChange={setFormAuthor} placeholder="Anonymous" maxLength={40} />
                  <InputField label="Description" value={formDesc} onChange={setFormDesc} placeholder="Optional notes…" maxLength={300} multiline />

                  {submitError && (
                    <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 8 }}>{submitError}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !formName.trim() || activeItemIds.length === 0}
                    style={{
                      width: '100%', padding: '7px', marginTop: 2,
                      background: (!formName.trim() || activeItemIds.length === 0) ? '#1c2128' : '#0f2a0f',
                      border: `1px solid ${(!formName.trim() || activeItemIds.length === 0) ? '#30363d' : '#22c55e55'}`,
                      borderRadius: 4,
                      cursor: (submitting || !formName.trim() || activeItemIds.length === 0) ? 'not-allowed' : 'pointer',
                      color: (!formName.trim() || activeItemIds.length === 0) ? '#4b5563' : '#22c55e',
                      fontSize: 12, fontFamily: 'monospace',
                    }}
                  >
                    {submitting ? 'Sharing…' : 'Share Blueprint'}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, maxLength, multiline }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; maxLength?: number; multiline?: boolean
}) {
  const common: React.CSSProperties = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 4,
    color: '#c9d1d9', fontSize: 11, padding: '5px 8px', outline: 'none',
    fontFamily: 'monospace', boxSizing: 'border-box', resize: 'none',
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#4b5563', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
        {label}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          style={common}
          onFocus={e => (e.currentTarget.style.borderColor = '#4a90d9')}
          onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={common}
          onFocus={e => (e.currentTarget.style.borderColor = '#4a90d9')}
          onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
        />
      )}
    </div>
  )
}
