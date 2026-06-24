import { useState, useEffect, useCallback } from 'react'
import { supabase, type Blueprint } from '../lib/supabase'
import { recipes } from '../data/recipes-generated'

interface Props {
  activeItemIds: string[]
}

const VOTED_KEY = 'ft-voted-blueprints'

function getVoted(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]') as string[]) }
  catch { return new Set() }
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

type SortKey = 'upvotes' | 'downloads' | 'created_at'

export function BlueprintsPanel({ activeItemIds }: Props) {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<'browse' | 'share'>('browse')

  // Browse
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [voted, setVoted] = useState<Set<string>>(getVoted)
  const [sort, setSort] = useState<SortKey>('upvotes')
  const [copied, setCopied] = useState<string | null>(null)

  // Share form
  const [formName, setFormName] = useState('')
  const [formAuthor, setFormAuthor] = useState(() => {
    try { return localStorage.getItem('ft-author') ?? '' } catch { return '' }
  })
  const [formDesc, setFormDesc] = useState('')
  const [formString, setFormString] = useState('')
  const [formItemQuery, setFormItemQuery] = useState('')
  const [formItemIds, setFormItemIds] = useState<string[]>([])
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchBlueprints = useCallback(async (sortKey: SortKey = sort) => {
    setLoading(true)
    setFetchError(null)
    let query = supabase
      .from('blueprints')
      .select('*')
      .order(sortKey, { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (activeItemIds.length > 0) {
      query = query.overlaps('item_ids', activeItemIds)
    }

    const { data, error } = await query
    setLoading(false)
    if (error) { setFetchError(error.message); return }
    if (data) setBlueprints(data as Blueprint[])
  }, [sort, activeItemIds])

  useEffect(() => {
    if (open && tab === 'browse') fetchBlueprints(sort)
  }, [open, tab, sort, activeItemIds, fetchBlueprints])

  async function handleCopy(bp: Blueprint) {
    try {
      await navigator.clipboard.writeText(bp.blueprint_string)
      setCopied(bp.id)
      setTimeout(() => setCopied(null), 2000)
      supabase.rpc('increment_downloads', { blueprint_id: bp.id }).then(() => {
        setBlueprints(prev => prev.map(b => b.id === bp.id ? { ...b, downloads: b.downloads + 1 } : b))
      })
    } catch {
      // clipboard denied — show string in prompt as fallback
      window.prompt('Copy this blueprint string:', bp.blueprint_string)
    }
  }

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
    if (!formName.trim() || !formString.trim() || formItemIds.length === 0) return
    if (!formString.trim().match(/^[0-9]/)) {
      setSubmitError('Invalid blueprint string — must start with a version digit (e.g. 0e…)')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    const author = formAuthor.trim() || 'Anonymous'
    localStorage.setItem('ft-author', author)
    const { error } = await supabase.from('blueprints').insert({
      name: formName.trim(),
      description: formDesc.trim() || null,
      author,
      blueprint_string: formString.trim(),
      item_ids: formItemIds,
    })
    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    setSubmitted(true)
    setFormName(''); setFormDesc(''); setFormString('')
    setFormItemIds([]); setFormItemQuery('')
    setTimeout(() => { setSubmitted(false); setTab('browse') }, 1800)
  }

  const itemResults = formItemQuery.length > 0
    ? recipes
        .filter(r => r.name.toLowerCase().includes(formItemQuery.toLowerCase()) && !formItemIds.includes(r.id))
        .slice(0, 8)
    : []

  const activeItemNames = activeItemIds
    .map(id => recipes.find(r => r.id === id)?.name ?? id)
    .join(', ')

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: open ? 280 : 40,
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
            {activeItemIds.length > 0 && (
              <span style={{
                background: '#0f2a0f', border: '1px solid #22c55e44',
                borderRadius: 3, padding: '1px 5px',
                color: '#22c55e', fontSize: 9, fontFamily: 'monospace',
              }}>
                {activeItemIds.length} item{activeItemIds.length !== 1 ? 's' : ''}
              </span>
            )}
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
              {/* filter info */}
              {activeItemIds.length > 0 && (
                <div style={{
                  padding: '5px 10px', borderBottom: '1px solid #21262d',
                  color: '#4b5563', fontSize: 9, fontFamily: 'monospace',
                  flexShrink: 0,
                }}>
                  Showing blueprints for: <span style={{ color: '#8b949e' }}>{activeItemNames}</span>
                </div>
              )}

              {/* sort bar */}
              <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
                {([
                  { key: 'upvotes' as const, label: '▲ Votes' },
                  { key: 'downloads' as const, label: '↓ Copies' },
                  { key: 'created_at' as const, label: '✦ New' },
                ]).map(({ key, label }) => (
                  <button key={key} onClick={() => setSort(key)} style={{
                    flex: 1, padding: '3px 0', background: sort === key ? '#0f1f2e' : 'none',
                    border: `1px solid ${sort === key ? '#4a90d944' : '#21262d'}`,
                    borderRadius: 3, cursor: 'pointer',
                    color: sort === key ? '#4a90d9' : '#4b5563',
                    fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.04em',
                    transition: 'color 0.15s, background 0.15s',
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#4b5563', fontSize: 11 }}>Loading…</div>
              )}
              {!loading && fetchError && (
                <div style={{ padding: '12px', color: '#ef4444', fontSize: 11 }}>{fetchError}</div>
              )}
              {!loading && !fetchError && blueprints.length === 0 && (
                <div style={{ padding: '16px 12px', color: '#4b5563', fontSize: 11 }}>
                  {activeItemIds.length > 0
                    ? 'No blueprints for this item yet — be the first to share one!'
                    : 'No blueprints yet — be the first to share!'}
                </div>
              )}

              {blueprints.map(bp => {
                return (
                  <div key={bp.id} style={{ padding: '8px 10px', borderBottom: '1px solid #1c2128' }}>
                    {/* item icons + name row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      {/* item icons */}
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0, flexWrap: 'wrap', maxWidth: 48 }}>
                        {bp.item_ids.map(id => (
                          <div key={id} style={{ width: 20, height: 20, background: '#0d1117', borderRadius: 2, border: '1px solid #2a2e3d', overflow: 'hidden' }}>
                            <img
                              src={`/icons/${id}.png`} alt=""
                              title={recipes.find(r => r.id === id)?.name ?? id}
                              style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                              onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.opacity = '0' }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {bp.name}
                        </div>
                        <div style={{ color: '#4b5563', fontSize: 10, marginTop: 1 }}>
                          {bp.item_ids.map(id => recipes.find(r => r.id === id)?.name ?? id).join(', ')} · {bp.author} · {fmtDate(bp.created_at)}
                          {bp.downloads > 0 && <span style={{ color: '#4a90d966' }}> · {bp.downloads} cop{bp.downloads !== 1 ? 'ies' : 'y'}</span>}
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
                    </div>

                    {/* action row */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* copy button */}
                      <button
                        onClick={() => handleCopy(bp)}
                        style={{
                          flex: 1, padding: '4px 8px',
                          background: copied === bp.id ? '#0f2a0f' : '#0d1117',
                          border: `1px solid ${copied === bp.id ? '#22c55e55' : '#30363d'}`,
                          borderRadius: 4, cursor: 'pointer',
                          color: copied === bp.id ? '#22c55e' : '#8b949e',
                          fontSize: 10, fontFamily: 'monospace',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (copied !== bp.id) e.currentTarget.style.color = '#c9d1d9' }}
                        onMouseLeave={e => { if (copied !== bp.id) e.currentTarget.style.color = '#8b949e' }}
                      >
                        {copied === bp.id ? '✓ Copied!' : '⧉ Copy String'}
                      </button>
                      {/* upvote */}
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
                          fontSize: 10, padding: '3px 7px',
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
                  </div>
                )
              })}

              {!loading && (
                <button
                  onClick={() => fetchBlueprints(sort)}
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
                  {/* blueprint string */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: '#4b5563', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                      Blueprint String *
                    </div>
                    <textarea
                      value={formString}
                      onChange={e => setFormString(e.target.value)}
                      placeholder="Paste your Factorio blueprint string here (0e…)"
                      rows={4}
                      style={{
                        width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 4,
                        color: '#c9d1d9', fontSize: 10, padding: '5px 8px', outline: 'none',
                        fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical',
                        wordBreak: 'break-all',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#4a90d9')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
                    />
                    {formString && !formString.trim().match(/^[0-9]/) && (
                      <div style={{ color: '#f0a030', fontSize: 9, marginTop: 2 }}>
                        Blueprint strings start with a digit (e.g. 0e…)
                      </div>
                    )}
                  </div>

                  {/* item picker */}
                  <div style={{ marginBottom: 8, position: 'relative' }}>
                    <div style={{ color: '#4b5563', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                      Produces Items *
                    </div>
                    {/* selected chips */}
                    {formItemIds.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                        {formItemIds.map(id => {
                          const name = recipes.find(r => r.id === id)?.name ?? id
                          return (
                            <div key={id} style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#0d1117', border: '1px solid #30363d',
                              borderRadius: 3, padding: '2px 5px',
                            }}>
                              <div style={{ width: 14, height: 14, overflow: 'hidden', flexShrink: 0 }}>
                                <img src={`/icons/${id}.png`} alt="" style={{ height: 14, imageRendering: 'pixelated', display: 'block' }} />
                              </div>
                              <span style={{ color: '#c9d1d9', fontSize: 10, fontFamily: 'monospace' }}>{name}</span>
                              <button
                                onClick={() => setFormItemIds(prev => prev.filter(x => x !== id))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 11, padding: '0 0 0 2px', lineHeight: 1 }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                              >×</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {/* search input */}
                    <input
                      type="text"
                      value={formItemQuery}
                      onChange={e => { setFormItemQuery(e.target.value); setShowItemPicker(true) }}
                      onFocus={e => { setShowItemPicker(true); e.currentTarget.style.borderColor = '#4a90d9' }}
                      onBlur={e => { setTimeout(() => setShowItemPicker(false), 150); e.currentTarget.style.borderColor = '#30363d' }}
                      placeholder={formItemIds.length === 0 ? 'Search item name…' : 'Add another item…'}
                      style={{
                        width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 4,
                        color: '#c9d1d9', fontSize: 11, padding: '5px 8px', outline: 'none',
                        fontFamily: 'monospace', boxSizing: 'border-box',
                      }}
                    />
                    {showItemPicker && itemResults.length > 0 && (
                      <div style={{
                        position: 'absolute', left: 0, right: 0, top: '100%',
                        background: '#1c2128', border: '1px solid #30363d', borderRadius: 4,
                        zIndex: 200, marginTop: 2, overflow: 'hidden',
                      }}>
                        {itemResults.map(r => (
                          <div
                            key={r.id}
                            onMouseDown={() => {
                              setFormItemIds(prev => prev.includes(r.id) ? prev : [...prev, r.id])
                              setFormItemQuery('')
                              setShowItemPicker(false)
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ width: 18, height: 18, flexShrink: 0, background: '#0d1117', borderRadius: 2, overflow: 'hidden' }}>
                              <img src={`/icons/${r.id}.png`} alt="" style={{ height: 18, imageRendering: 'pixelated', display: 'block' }} />
                            </div>
                            <span style={{ color: '#c9d1d9', fontSize: 11, fontFamily: 'monospace' }}>{r.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <InputField label="Name *" value={formName} onChange={setFormName} placeholder="e.g. Inserter Factory" maxLength={80} />
                  <InputField label="Author" value={formAuthor} onChange={setFormAuthor} placeholder="Anonymous" maxLength={40} />
                  <InputField label="Description" value={formDesc} onChange={setFormDesc} placeholder="Optional notes…" maxLength={300} multiline />

                  {submitError && (
                    <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 8 }}>{submitError}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !formName.trim() || !formString.trim() || formItemIds.length === 0}
                    style={{
                      width: '100%', padding: '7px', marginTop: 2,
                      background: (!formName.trim() || !formString.trim() || formItemIds.length === 0) ? '#1c2128' : '#0f2a0f',
                      border: `1px solid ${(!formName.trim() || !formString.trim() || formItemIds.length === 0) ? '#30363d' : '#22c55e55'}`,
                      borderRadius: 4,
                      cursor: (submitting || !formName.trim() || !formString.trim() || formItemIds.length === 0) ? 'not-allowed' : 'pointer',
                      color: (!formName.trim() || !formString.trim() || formItemIds.length === 0) ? '#4b5563' : '#22c55e',
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
