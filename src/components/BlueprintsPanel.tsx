import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { supabase, type Blueprint } from '../lib/supabase'
import { recipes } from '../data/recipes-generated'
import { BlueprintPreview } from './BlueprintPreview'

interface Props {
  activeItemIds: string[]
}

const VOTED_KEY     = 'ft-voted-blueprints'
const CLIENT_ID_KEY = 'ft-client-id'

function getVoted(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]') as string[]) }
  catch { return new Set() }
}

function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(CLIENT_ID_KEY, id) }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

type SortKey = 'upvotes' | 'downloads' | 'created_at'

export function BlueprintsPanel({ activeItemIds }: Props) {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<'browse' | 'share'>('browse')
  const [width, setWidth] = useState(() => {
    try { return parseInt(localStorage.getItem('ft-bp-panel-w') ?? '') || 280 }
    catch { return 280 }
  })
  const [resizing, setResizing] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    const startX = e.clientX
    const startW = widthRef.current
    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(200, Math.min(600, startW + startX - ev.clientX))
      setWidth(newW)
      widthRef.current = newW
    }
    const onUp = () => {
      setResizing(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      try { localStorage.setItem('ft-bp-panel-w', String(widthRef.current)) } catch {}
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Browse
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [voted, setVoted] = useState<Set<string>>(getVoted)
  const [sort, setSort] = useState<SortKey>('upvotes')
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedBpId, setSelectedBpId] = useState<string | null>(null)
  const selectedBp = selectedBpId ? (blueprints.find(b => b.id === selectedBpId) ?? null) : null

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

  const fetchBlueprints = useCallback(async (sortKey: SortKey) => {
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
  }, [activeItemIds])

  useEffect(() => {
    if (open && tab === 'browse') fetchBlueprints(sort)
  }, [open, tab, sort, activeItemIds, fetchBlueprints])

  async function handleCopy(bp: Blueprint) {
    try {
      await navigator.clipboard.writeText(bp.blueprint_string)
      setCopied(bp.id)
      setTimeout(() => setCopied(null), 2000)
      supabase.rpc('increment_downloads', { blueprint_id: bp.id, client_id: getClientId() }).then(({ data }) => {
        if (data === true)
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

  const disabled = !formName.trim() || !formString.trim() || formItemIds.length === 0

  return (
    <>
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: open ? width : 38,
      background: '#272526',
      border: '1px solid #111',
      boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.6)',
      borderRadius: 2,
      overflow: 'hidden',
      zIndex: 100,
      transition: resizing ? 'none' : 'width 0.2s',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 100px)',
    }}>
      {/* titlebar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        padding: open ? '0 10px' : '0',
        height: 28,
        background: 'linear-gradient(180deg, #2c2a2b 0%, #252325 100%)',
        cursor: 'pointer',
        flexShrink: 0,
        borderBottom: open ? '1px solid #111' : 'none',
      }} onClick={() => setOpen(o => !o)}>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FF9F1C" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style={{ color: '#FF9F1C', fontSize: 10, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Blueprints
            </span>
            {activeItemIds.length > 0 && (
              <span style={{
                background: '#1a2a1a', border: '1px solid #22c55e33',
                borderRadius: 1, padding: '1px 5px',
                color: '#22c55e', fontSize: 9, fontFamily: 'monospace',
              }}>
                {activeItemIds.length} item{activeItemIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        <svg
          width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5a5458" strokeWidth={2}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, transition: 'transform 0.2s' }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {open && (
        <>
          {/* resize handle — left edge */}
          <div
            onMouseDown={startResize}
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              width: 5, cursor: 'col-resize', zIndex: 10,
              background: 'rgba(255,255,255,0.04)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,159,28,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          />

          {/* tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #111', flexShrink: 0, background: '#222022' }}>
            {(['browse', 'share'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '6px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t ? '#FFE6C0' : '#5a5458',
                fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700, letterSpacing: '0.1em',
                borderBottom: tab === t ? '2px solid #FF9F1C' : '2px solid transparent',
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
              {activeItemIds.length > 0 && (
                <div style={{
                  padding: '4px 10px', borderBottom: '1px solid #111',
                  color: '#5a5458', fontSize: 9, fontFamily: 'monospace', flexShrink: 0,
                  background: '#1d1c1d',
                }}>
                  Showing for: <span style={{ color: '#A19E9A' }}>{activeItemNames}</span>
                </div>
              )}

              {/* sort bar */}
              <div style={{ display: 'flex', gap: 4, padding: '5px 8px', borderBottom: '1px solid #111', flexShrink: 0, background: '#1d1c1d' }}>
                {([
                  { key: 'upvotes' as const, label: '▲ Votes' },
                  { key: 'downloads' as const, label: '↓ Copies' },
                  { key: 'created_at' as const, label: '✦ New' },
                ]).map(({ key, label }) => (
                  <button key={key} onClick={() => setSort(key)} style={{
                    flex: 1, padding: '3px 0',
                    background: sort === key ? '#1a1919' : 'none',
                    border: `1px solid ${sort === key ? '#FF9F1C44' : '#1a1919'}`,
                    borderRadius: 1, cursor: 'pointer',
                    color: sort === key ? '#FF9F1C' : '#5a5458',
                    fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700, letterSpacing: '0.05em',
                    transition: 'color 0.15s',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#5a5458', fontSize: 11, fontFamily: 'monospace' }}>Loading…</div>
              )}
              {!loading && fetchError && (
                <div style={{ padding: '12px', color: '#ef4444', fontSize: 11, fontFamily: 'monospace' }}>{fetchError}</div>
              )}
              {!loading && !fetchError && blueprints.length === 0 && (
                <div style={{ padding: '16px 12px', color: '#5a5458', fontSize: 11, fontFamily: 'monospace' }}>
                  {activeItemIds.length > 0
                    ? 'No blueprints for this item yet.'
                    : 'No blueprints yet — be the first!'}
                </div>
              )}

              {blueprints.map(bp => (
                <div key={bp.id} onClick={() => setSelectedBpId(bp.id)} style={{ padding: '8px 10px', borderBottom: '1px solid #1a1919', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0, flexWrap: 'wrap', maxWidth: 46 }}>
                      {bp.item_ids.map(id => (
                        <div key={id} style={{ width: 20, height: 20, background: '#1b1b1b', border: '1px solid #111', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)' }}>
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
                      <div style={{ color: '#FFE6C0', fontSize: 12, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bp.name}
                      </div>
                      <div style={{ color: '#5a5458', fontSize: 9, marginTop: 2, fontFamily: 'monospace' }}>
                        {bp.item_ids.map(id => recipes.find(r => r.id === id)?.name ?? id).join(', ')} · {bp.author} · {fmtDate(bp.created_at)}
                        {bp.downloads > 0 && <span style={{ color: '#FF9F1C55' }}> · {bp.downloads} cop{bp.downloads !== 1 ? 'ies' : 'y'}</span>}
                      </div>
                      {bp.description && (
                        <div style={{ color: '#6b6060', fontSize: 10, marginTop: 3, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {bp.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <BlueprintPreview blueprintString={bp.blueprint_string} />
                  </div>

                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(bp) }}
                      style={{
                        flex: 1, padding: '4px 8px',
                        background: copied === bp.id ? '#1a2a1a' : '#1b1b1b',
                        border: `1px solid ${copied === bp.id ? '#22c55e44' : '#111'}`,
                        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                        borderRadius: 1, cursor: 'pointer',
                        color: copied === bp.id ? '#22c55e' : '#A19E9A',
                        fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600, letterSpacing: '0.04em',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (copied !== bp.id) e.currentTarget.style.color = '#FFE6C0' }}
                      onMouseLeave={e => { if (copied !== bp.id) e.currentTarget.style.color = '#A19E9A' }}
                    >
                      {copied === bp.id ? '✓ Copied!' : '⧉ Copy String'}
                    </button>
                    <button
                      onClick={e => handleUpvote(e, bp)}
                      title={voted.has(bp.id) ? 'Already upvoted' : 'Upvote'}
                      style={{
                        flexShrink: 0,
                        background: voted.has(bp.id) ? '#1a2a1a' : '#1b1b1b',
                        border: `1px solid ${voted.has(bp.id) ? '#22c55e44' : '#111'}`,
                        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                        borderRadius: 1,
                        cursor: voted.has(bp.id) ? 'default' : 'pointer',
                        color: voted.has(bp.id) ? '#22c55e' : '#5a5458',
                        fontSize: 10, padding: '3px 7px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, lineHeight: 1,
                      }}
                      onMouseEnter={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#22c55e' }}
                      onMouseLeave={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#5a5458' }}
                    >
                      <span>▲</span>
                      <span style={{ fontFamily: 'monospace' }}>{bp.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}

              {!loading && (
                <button
                  onClick={() => fetchBlueprints(sort)}
                  style={{
                    width: '100%', padding: '7px', background: '#1d1c1d', border: 'none',
                    borderTop: blueprints.length > 0 ? '1px solid #111' : 'none',
                    cursor: 'pointer', color: '#5a5458', fontSize: 9,
                    fontFamily: "'Titillium Web', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    marginTop: 'auto', flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#A19E9A')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5a5458')}
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
                  <div style={{ color: '#5a5458', fontSize: 11, fontFamily: 'monospace' }}>Redirecting to browse…</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <FieldLabel>Blueprint String *</FieldLabel>
                    <textarea
                      value={formString}
                      onChange={e => setFormString(e.target.value)}
                      placeholder="Paste your Factorio blueprint string here (0e…)"
                      rows={4}
                      style={{
                        width: '100%', background: '#1b1b1b', border: '1px solid #111', borderRadius: 1,
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)',
                        color: '#FFE6C0', fontSize: 10, padding: '5px 8px', outline: 'none',
                        fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical', wordBreak: 'break-all',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#111')}
                    />
                    {formString && !formString.trim().match(/^[0-9]/) && (
                      <div style={{ color: '#FF9F1C', fontSize: 9, marginTop: 2, fontFamily: 'monospace' }}>
                        Blueprint strings start with a digit (e.g. 0e…)
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 8, position: 'relative' }}>
                    <FieldLabel>Produces Items *</FieldLabel>
                    {formItemIds.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
                        {formItemIds.map(id => {
                          const name = recipes.find(r => r.id === id)?.name ?? id
                          return (
                            <div key={id} style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#1b1b1b', border: '1px solid #111', borderRadius: 1, padding: '2px 5px',
                              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                            }}>
                              <div style={{ width: 14, height: 14, overflow: 'hidden', flexShrink: 0 }}>
                                <img src={`/icons/${id}.png`} alt="" style={{ height: 14, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }} />
                              </div>
                              <span style={{ color: '#FFE6C0', fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{name}</span>
                              <button
                                onClick={() => setFormItemIds(prev => prev.filter(x => x !== id))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a5458', fontSize: 11, padding: '0 0 0 2px', lineHeight: 1 }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#5a5458')}
                              >×</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <input
                      type="text"
                      value={formItemQuery}
                      onChange={e => { setFormItemQuery(e.target.value); setShowItemPicker(true) }}
                      onFocus={e => { setShowItemPicker(true); e.currentTarget.style.borderColor = '#FF9F1C66' }}
                      onBlur={e => { setTimeout(() => setShowItemPicker(false), 150); e.currentTarget.style.borderColor = '#111' }}
                      placeholder={formItemIds.length === 0 ? 'Search item name…' : 'Add another item…'}
                      style={{
                        width: '100%', background: '#1b1b1b', border: '1px solid #111', borderRadius: 1,
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)',
                        color: '#FFE6C0', fontSize: 11, padding: '5px 8px', outline: 'none',
                        fontFamily: "'Titillium Web', sans-serif", boxSizing: 'border-box',
                      }}
                    />
                    {showItemPicker && itemResults.length > 0 && (
                      <div style={{
                        position: 'absolute', left: 0, right: 0, top: '100%',
                        background: '#252325', border: '1px solid #111', borderRadius: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                        zIndex: 200, marginTop: 2, overflow: 'hidden',
                      }}>
                        {itemResults.map(r => (
                          <div
                            key={r.id}
                            onMouseDown={() => {
                              setFormItemIds(prev => prev.includes(r.id) ? prev : [...prev, r.id])
                              setFormItemQuery(''); setShowItemPicker(false)
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#2c2a2b')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ width: 18, height: 18, flexShrink: 0, background: '#1b1b1b', border: '1px solid #111', overflow: 'hidden' }}>
                              <img src={`/icons/${r.id}.png`} alt="" style={{ height: 18, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }} />
                            </div>
                            <span style={{ color: '#FFE6C0', fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{r.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <InputField label="Name *" value={formName} onChange={setFormName} placeholder="e.g. Inserter Factory" maxLength={80} />
                  <InputField label="Author" value={formAuthor} onChange={setFormAuthor} placeholder="Anonymous" maxLength={40} />
                  <InputField label="Description" value={formDesc} onChange={setFormDesc} placeholder="Optional notes…" maxLength={300} multiline />

                  {submitError && (
                    <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 8, fontFamily: 'monospace' }}>{submitError}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || disabled}
                    style={{
                      width: '100%', padding: '7px', marginTop: 2,
                      background: disabled ? '#1b1b1b' : '#1a2a1a',
                      border: `1px solid ${disabled ? '#111' : '#22c55e44'}`,
                      boxShadow: disabled ? 'none' : 'inset 1px 1px 0 rgba(255,255,255,0.06)',
                      borderRadius: 1,
                      cursor: (submitting || disabled) ? 'not-allowed' : 'pointer',
                      color: disabled ? '#5a5458' : '#22c55e',
                      fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
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
    {selectedBp && (
      <BlueprintModal
        bp={selectedBp}
        copied={copied}
        voted={voted}
        onClose={() => setSelectedBpId(null)}
        onCopy={handleCopy}
        onUpvote={handleUpvote}
      />
    )}
    </>
  )
}

function BlueprintModal({ bp, copied, voted, onClose, onCopy, onUpvote }: {
  bp: Blueprint
  copied: string | null
  voted: Set<string>
  onClose: () => void
  onCopy: (bp: Blueprint) => void
  onUpvote: (e: React.MouseEvent, bp: Blueprint) => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#272526',
          border: '1px solid #111',
          borderTop: '2px solid #FF9F1C',
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.45), 0 12px 40px rgba(0,0,0,0.9)',
          borderRadius: 2,
          width: 520,
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid #111',
          background: 'linear-gradient(180deg, #2c2a2b 0%, #252325 100%)',
          flexShrink: 0,
          gap: 10,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#FFE6C0', fontSize: 15, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.3 }}>
              {bp.name}
            </div>
            <div style={{ color: '#5a5458', fontSize: 10, marginTop: 3, fontFamily: 'monospace' }}>
              by {bp.author} · {fmtDate(bp.created_at)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a5458', fontSize: 20, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a5458')}
          >×</button>
        </div>

        {/* preview */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #111', flexShrink: 0, background: '#1d1c1d' }}>
          <BlueprintPreview blueprintString={bp.blueprint_string} maxW={488} maxH={380} zoomable />
        </div>

        {/* body */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* description */}
          {bp.description && (
            <div style={{ color: '#A19E9A', fontSize: 11, lineHeight: 1.65, fontFamily: 'monospace' }}>
              {bp.description}
            </div>
          )}

          {/* items produced */}
          <div>
            <ModalLabel>Produces</ModalLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {bp.item_ids.map(id => {
                const name = recipes.find(r => r.id === id)?.name ?? id
                return (
                  <div key={id} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: '#1b1b1b', border: '1px solid #111', borderRadius: 1,
                    padding: '3px 8px',
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ width: 16, height: 16, overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                      <img
                        src={`/icons/${id}.png`} alt=""
                        style={{ height: 16, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                      />
                    </div>
                    <span style={{ color: '#FFE6C0', fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* stats */}
          <div style={{ display: 'flex', gap: 20, borderTop: '1px solid #1a1919', paddingTop: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{bp.upvotes}</div>
              <ModalLabel>Upvotes</ModalLabel>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FF9F1C', fontSize: 16, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{bp.downloads}</div>
              <ModalLabel>Copies</ModalLabel>
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onCopy(bp)}
              style={{
                flex: 1, padding: '7px 10px',
                background: copied === bp.id ? '#1a2a1a' : '#1b1b1b',
                border: `1px solid ${copied === bp.id ? '#22c55e44' : '#111'}`,
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                borderRadius: 1, cursor: 'pointer',
                color: copied === bp.id ? '#22c55e' : '#A19E9A',
                fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600, letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (copied !== bp.id) e.currentTarget.style.color = '#FFE6C0' }}
              onMouseLeave={e => { if (copied !== bp.id) e.currentTarget.style.color = '#A19E9A' }}
            >
              {copied === bp.id ? '✓ Copied!' : '⧉ Copy Blueprint String'}
            </button>
            <button
              onClick={e => onUpvote(e, bp)}
              title={voted.has(bp.id) ? 'Already upvoted' : 'Upvote'}
              style={{
                flexShrink: 0,
                background: voted.has(bp.id) ? '#1a2a1a' : '#1b1b1b',
                border: `1px solid ${voted.has(bp.id) ? '#22c55e44' : '#111'}`,
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
                borderRadius: 1,
                cursor: voted.has(bp.id) ? 'default' : 'pointer',
                color: voted.has(bp.id) ? '#22c55e' : '#5a5458',
                fontSize: 11, padding: '5px 14px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#22c55e' }}
              onMouseLeave={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#5a5458' }}
            >
              ▲ <span style={{ fontFamily: 'monospace' }}>{bp.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: '#5a5458', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, marginTop: 2, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700 }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#5a5458', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700 }}>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, maxLength, multiline }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; maxLength?: number; multiline?: boolean
}) {
  const common: React.CSSProperties = {
    width: '100%', background: '#1b1b1b', border: '1px solid #111', borderRadius: 1,
    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)',
    color: '#FFE6C0', fontSize: 11, padding: '5px 8px', outline: 'none',
    fontFamily: "'Titillium Web', sans-serif", boxSizing: 'border-box', resize: 'none',
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} rows={3} style={common}
          onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
          onBlur={e => (e.currentTarget.style.borderColor = '#111')}
        />
      ) : (
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} style={common}
          onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
          onBlur={e => (e.currentTarget.style.borderColor = '#111')}
        />
      )}
    </div>
  )
}
