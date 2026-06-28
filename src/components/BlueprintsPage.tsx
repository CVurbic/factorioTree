import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, type Blueprint, type Comment } from '../lib/supabase'
import { recipes } from '../data/recipes-generated'
import { BlueprintPreview } from './BlueprintPreview'
import { UsernameModal, getUsername, clearUsername } from './UsernameGate'

// ── local storage helpers ─────────────────────────────────────────────────────

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
  } catch { return crypto.randomUUID() }
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── blueprint type detection ──────────────────────────────────────────────────

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  for (const fmt of ['deflate', 'deflate-raw'] as CompressionFormat[]) {
    try {
      const ds = new DecompressionStream(fmt)
      const writer = ds.writable.getWriter()
      const reader = ds.readable.getReader()
      writer.write(bytes as unknown as ArrayBuffer).then(() => writer.close()).catch(() => {})
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }
      const total = chunks.reduce((s, c) => s + c.length, 0)
      const buf = new Uint8Array(total)
      let off = 0
      for (const c of chunks) { buf.set(c, off); off += c.length }
      return buf
    } catch { /* try next */ }
  }
  throw new Error('inflate failed')
}

async function detectBlueprintType(str: string): Promise<{ type: 'blueprint' | 'blueprint_book'; count: number | null } | null> {
  try {
    const binary = atob(str.slice(1))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const buf = await inflate(bytes)
    const json = JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
    if (json.blueprint_book) {
      const book = json.blueprint_book as { blueprints?: unknown[] }
      return { type: 'blueprint_book', count: book.blueprints?.length ?? null }
    }
    if (json.blueprint) return { type: 'blueprint', count: null }
    return null
  } catch { return null }
}

// ── sub-components ────────────────────────────────────────────────────────────

type SortKey = 'upvotes' | 'downloads' | 'created_at'

function TypeBadge({ bp }: { bp: Blueprint }) {
  const isBook = bp.type === 'blueprint_book'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: isBook ? '#1a1a2a' : 'var(--th-bg-hdr)',
      border: `1px solid ${isBook ? '#a855f733' : 'var(--th-br-hdr)'}`,
      borderRadius: 1, padding: '1px 5px',
      color: isBook ? '#a855f7' : 'var(--th-tx-vmut)',
      fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
    }}>
      {isBook ? `Book · ${bp.blueprint_count ?? '?'}` : 'Blueprint'}
    </span>
  )
}

function PostingAs({ username, onClear }: { username: string; onClear: () => void }) {
  return (
    <div style={{ fontSize: 9, color: 'var(--th-tx-vmut)', fontFamily: 'monospace', marginBottom: 10 }}>
      Posting as{' '}
      <span style={{ color: 'var(--th-tx-sec)', fontWeight: 700 }}>{username}</span>
      {' · '}
      <span
        style={{ color: '#FF9F1C', cursor: 'pointer' }}
        onClick={onClear}
      >
        change
      </span>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: 'var(--th-tx-vmut)', fontSize: 9, textTransform: 'uppercase',
      letterSpacing: '0.1em', marginBottom: 4,
      fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
    }}>
      {children}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

type PageState = 'browse' | 'share' | 'detail'

export function BlueprintsPage() {
  const [pageState, setPageState] = useState<PageState>('browse')

  // username gate
  const [username, setUsername] = useState<string | null>(getUsername)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)

  function requireUsername(action: () => void) {
    if (getUsername()) return action()
    pendingAction.current = action
    setShowUsernameModal(true)
  }

  function handleUsernameConfirm(name: string) {
    setUsername(name)
    setShowUsernameModal(false)
    pendingAction.current?.()
    pendingAction.current = null
  }

  // ── browse state ────────────────────────────────────────────────────────────
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('upvotes')
  const [search, setSearch] = useState('')
  const [voted, setVoted] = useState<Set<string>>(getVoted)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchBlueprints = useCallback(async (sortKey: SortKey) => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .order(sortKey, { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)
    setLoading(false)
    if (error) { setFetchError(error.message); return }
    if (data) setBlueprints(data as Blueprint[])
  }, [])

  useEffect(() => {
    if (pageState === 'browse') fetchBlueprints(sort)
  }, [pageState, sort, fetchBlueprints])

  const filtered = search.trim()
    ? blueprints.filter(bp => {
        const q = search.toLowerCase()
        return (
          bp.name.toLowerCase().includes(q) ||
          bp.description?.toLowerCase().includes(q) ||
          bp.author.toLowerCase().includes(q) ||
          bp.item_ids.some(id => (recipes.find(r => r.id === id)?.name ?? id).toLowerCase().includes(q))
        )
      })
    : blueprints

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
      window.prompt('Copy this blueprint string:', bp.blueprint_string)
    }
  }

  async function handleUpvote(e: React.MouseEvent, bp: Blueprint) {
    e.stopPropagation()
    if (voted.has(bp.id)) return
    const { error } = await supabase.rpc('increment_upvotes', { blueprint_id: bp.id })
    if (!error) {
      const next = new Set(voted); next.add(bp.id)
      setVoted(next)
      localStorage.setItem(VOTED_KEY, JSON.stringify([...next]))
      setBlueprints(prev => prev.map(b => b.id === bp.id ? { ...b, upvotes: b.upvotes + 1 } : b))
    }
  }

  // ── detail state ────────────────────────────────────────────────────────────
  const [selectedBp, setSelectedBp] = useState<Blueprint | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  function openDetail(bp: Blueprint) {
    setSelectedBp(bp)
    setComments([])
    setCommentBody('')
    setCommentError(null)
    setPageState('detail')
  }

  useEffect(() => {
    if (!selectedBp || pageState !== 'detail') return
    setCommentsLoading(true)
    supabase
      .from('comments')
      .select('*')
      .eq('blueprint_id', selectedBp.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setCommentsLoading(false)
        if (data) setComments(data as Comment[])
      })
  }, [selectedBp, pageState])

  async function handlePostComment() {
    if (!commentBody.trim() || !selectedBp) return
    const author = getUsername()!
    setCommentSubmitting(true)
    setCommentError(null)
    const { data, error } = await supabase
      .from('comments')
      .insert({ blueprint_id: selectedBp.id, author, body: commentBody.trim() })
      .select()
      .single()
    setCommentSubmitting(false)
    if (error) { setCommentError(error.message); return }
    if (data) setComments(prev => [...prev, data as Comment])
    setCommentBody('')
  }

  // ── share state ─────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formString, setFormString] = useState('')
  const [formItemIds, setFormItemIds] = useState<string[]>([])
  const [formItemQuery, setFormItemQuery] = useState('')
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [detectedType, setDetectedType] = useState<{ type: 'blueprint' | 'blueprint_book'; count: number | null } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const str = formString.trim()
    if (!str.match(/^[0-9]/)) { setDetectedType(null); return }
    let cancelled = false
    detectBlueprintType(str).then(result => { if (!cancelled) setDetectedType(result) })
    return () => { cancelled = true }
  }, [formString])

  const itemResults = formItemQuery.length > 0
    ? recipes.filter(r =>
        r.name.toLowerCase().includes(formItemQuery.toLowerCase()) &&
        !formItemIds.includes(r.id),
      ).slice(0, 8)
    : []

  async function doSubmit() {
    const author = getUsername()!
    const str = formString.trim()
    if (!formName.trim() || !str || formItemIds.length === 0) return
    if (!str.match(/^[0-9]/)) { setSubmitError('Invalid blueprint string — must start with a version digit.'); return }
    setSubmitting(true)
    setSubmitError(null)
    const { error } = await supabase.from('blueprints').insert({
      name: formName.trim(),
      description: formDesc.trim() || null,
      author,
      blueprint_string: str,
      item_ids: formItemIds,
      type: detectedType?.type ?? 'blueprint',
      blueprint_count: detectedType?.count ?? null,
    })
    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    setSubmitted(true)
    setFormName(''); setFormDesc(''); setFormString(''); setFormItemIds([]); setFormItemQuery('')
    setDetectedType(null)
    setTimeout(() => { setSubmitted(false); setPageState('browse'); fetchBlueprints(sort) }, 1800)
  }

  function handleShare() {
    requireUsername(() => doSubmit())
  }

  const formDisabled = !formName.trim() || !formString.trim() || formItemIds.length === 0

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--th-bg-deep)', overflow: 'hidden' }}>

      {/* ── topbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderBottom: '1px solid var(--th-br)',
        background: 'var(--th-bg-deep)', flexShrink: 0, flexWrap: 'wrap', rowGap: 8,
      }}>
        {pageState !== 'browse' && (
          <button
            onClick={() => setPageState('browse')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--th-tx-vmut)', fontSize: 11, padding: '3px 0',
              fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
              letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4,
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF9F1C')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
          >
            ← Back
          </button>
        )}

        {pageState === 'browse' && (
          <>
            <span style={{
              color: '#FF9F1C', fontSize: 11, fontWeight: 700,
              fontFamily: "'Titillium Web', sans-serif", letterSpacing: '0.14em',
              textTransform: 'uppercase', flexShrink: 0,
            }}>
              Blueprints
            </span>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, item, author…"
              style={{
                flex: 1, minWidth: 120,
                background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                boxShadow: 'var(--shadow-inset)',
                color: 'var(--th-tx)', fontSize: 11, padding: '4px 8px', outline: 'none',
                fontFamily: "'Titillium Web', sans-serif",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
            />

            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {([
                { key: 'upvotes' as const, label: '▲ Top' },
                { key: 'downloads' as const, label: '↓ Most copied' },
                { key: 'created_at' as const, label: '✦ New' },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => setSort(key)} style={{
                  padding: '3px 8px',
                  background: sort === key ? 'var(--th-bg-hdr)' : 'none',
                  border: `1px solid ${sort === key ? '#FF9F1C44' : 'var(--th-br-hdr)'}`,
                  borderRadius: 1, cursor: 'pointer',
                  color: sort === key ? '#FF9F1C' : 'var(--th-tx-vmut)',
                  fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPageState('share')}
              style={{
                padding: '4px 12px', flexShrink: 0,
                background: '#1a2a1a', border: '1px solid #22c55e44',
                borderRadius: 1, cursor: 'pointer',
                color: '#22c55e', fontSize: 10,
                fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#22c55e88')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#22c55e44')}
            >
              + Share
            </button>

            <button
              onClick={() => fetchBlueprints(sort)}
              title="Refresh"
              style={{
                padding: '4px 8px', flexShrink: 0,
                background: 'none', border: '1px solid var(--th-br-hdr)',
                borderRadius: 1, cursor: 'pointer', color: 'var(--th-tx-vmut)', fontSize: 11,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--th-tx-sec)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
            >
              ↻
            </button>
          </>
        )}

        {pageState === 'share' && (
          <span style={{
            color: 'var(--th-tx)', fontSize: 11, fontWeight: 700,
            fontFamily: "'Titillium Web', sans-serif", letterSpacing: '0.08em',
          }}>
            Share a Blueprint
          </span>
        )}

        {pageState === 'detail' && selectedBp && (
          <span style={{
            color: 'var(--th-tx)', fontSize: 11, fontWeight: 700,
            fontFamily: "'Titillium Web', sans-serif",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {selectedBp.name}
          </span>
        )}
      </div>

      {/* ── browse ── */}
      {pageState === 'browse' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {loading && (
            <div style={{ color: 'var(--th-tx-vmut)', fontSize: 11, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
              Loading…
            </div>
          )}
          {!loading && fetchError && (
            <div style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace', padding: 20 }}>
              {fetchError}
            </div>
          )}
          {!loading && !fetchError && filtered.length === 0 && (
            <div style={{ color: 'var(--th-tx-vmut)', fontSize: 11, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
              {search ? 'No blueprints match your search.' : 'No blueprints yet — be the first to share one!'}
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 12,
          }}>
            {filtered.map(bp => (
              <BrowseCard
                key={bp.id}
                bp={bp}
                copied={copied}
                voted={voted}
                onOpen={() => openDetail(bp)}
                onCopy={handleCopy}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── share ── */}
      {pageState === 'share' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 580 }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ color: '#22c55e', fontSize: 18, marginBottom: 8 }}>✓ Shared!</div>
                <div style={{ color: 'var(--th-tx-vmut)', fontSize: 11, fontFamily: 'monospace' }}>Returning to gallery…</div>
              </div>
            ) : (
              <>
                {/* blueprint string */}
                <div style={{ marginBottom: 14 }}>
                  <FieldLabel>Blueprint String *</FieldLabel>
                  <textarea
                    value={formString}
                    onChange={e => setFormString(e.target.value)}
                    placeholder="Paste your Factorio blueprint or book string here (0e…)"
                    rows={5}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                      boxShadow: 'var(--shadow-inset)',
                      color: 'var(--th-tx)', fontSize: 10, padding: '7px 10px', outline: 'none',
                      fontFamily: 'monospace', resize: 'vertical', wordBreak: 'break-all',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                  />
                  {/* detected type badge */}
                  {formString.trim() && (
                    <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {detectedType ? (
                        <>
                          <span style={{ color: '#22c55e', fontSize: 9, fontFamily: 'monospace' }}>✓ Valid</span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: detectedType.type === 'blueprint_book' ? '#1a1a2a' : 'var(--th-bg-hdr)',
                            border: `1px solid ${detectedType.type === 'blueprint_book' ? '#a855f733' : 'var(--th-br-hdr)'}`,
                            borderRadius: 1, padding: '1px 6px',
                            color: detectedType.type === 'blueprint_book' ? '#a855f7' : 'var(--th-tx-vmut)',
                            fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            {detectedType.type === 'blueprint_book'
                              ? `Book · ${detectedType.count ?? '?'} blueprints`
                              : 'Blueprint'}
                          </span>
                        </>
                      ) : formString.trim().match(/^[0-9]/) ? (
                        <span style={{ color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: 'monospace' }}>Detecting…</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: 9, fontFamily: 'monospace' }}>
                          Must start with a version digit (0…)
                        </span>
                      )}
                    </div>
                  )}
                  {/* live preview */}
                  {formString.trim().match(/^[0-9]/) && detectedType && (
                    <div style={{ marginTop: 8 }}>
                      <BlueprintPreview blueprintString={formString.trim()} maxW={580} maxH={200} />
                    </div>
                  )}
                </div>

                {/* name */}
                <div style={{ marginBottom: 14 }}>
                  <FieldLabel>Name *</FieldLabel>
                  <input
                    type="text" value={formName} onChange={e => setFormName(e.target.value)}
                    maxLength={80} placeholder="e.g. Compact Science Pack Setup"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                      boxShadow: 'var(--shadow-inset)',
                      color: 'var(--th-tx)', fontSize: 12, padding: '6px 10px', outline: 'none',
                      fontFamily: "'Titillium Web', sans-serif",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                  />
                </div>

                {/* description */}
                <div style={{ marginBottom: 14 }}>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    maxLength={500} rows={3}
                    placeholder="Optional — what does this produce, any tips?"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                      boxShadow: 'var(--shadow-inset)',
                      color: 'var(--th-tx)', fontSize: 11, padding: '6px 10px', outline: 'none',
                      fontFamily: 'monospace', resize: 'vertical',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                  />
                </div>

                {/* item tags */}
                <div style={{ marginBottom: 14, position: 'relative' }}>
                  <FieldLabel>Produces Items * (tag what this makes)</FieldLabel>
                  {formItemIds.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      {formItemIds.map(id => {
                        const name = recipes.find(r => r.id === id)?.name ?? id
                        return (
                          <div key={id} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1, padding: '2px 5px',
                          }}>
                            <div style={{ width: 14, height: 14, overflow: 'hidden', flexShrink: 0 }}>
                              <img src={`/icons/${id}.png`} alt="" style={{ height: 14, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }} />
                            </div>
                            <span style={{ color: 'var(--th-tx)', fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{name}</span>
                            <button
                              onClick={() => setFormItemIds(prev => prev.filter(x => x !== id))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--th-tx-vmut)', fontSize: 12, padding: '0 0 0 2px', lineHeight: 1 }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
                            >×</button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <input
                    type="text" value={formItemQuery}
                    onChange={e => { setFormItemQuery(e.target.value); setShowItemPicker(true) }}
                    onFocus={() => setShowItemPicker(true)}
                    onBlur={() => setTimeout(() => setShowItemPicker(false), 150)}
                    placeholder={formItemIds.length === 0 ? 'Search item name…' : 'Add another item…'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                      boxShadow: 'var(--shadow-inset)',
                      color: 'var(--th-tx)', fontSize: 11, padding: '6px 10px', outline: 'none',
                      fontFamily: "'Titillium Web', sans-serif",
                    }}
                    onFocusCapture={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                    onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                  />
                  {showItemPicker && itemResults.length > 0 && (
                    <div style={{
                      position: 'absolute', left: 0, right: 0, top: '100%',
                      background: 'var(--th-bg-surf)', border: '1px solid var(--th-br)', borderRadius: 1,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.6)', zIndex: 200, marginTop: 2, overflow: 'hidden',
                    }}>
                      {itemResults.map(r => (
                        <div
                          key={r.id}
                          onMouseDown={() => {
                            setFormItemIds(prev => prev.includes(r.id) ? prev : [...prev, r.id])
                            setFormItemQuery(''); setShowItemPicker(false)
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--th-bg-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 18, height: 18, flexShrink: 0, background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', overflow: 'hidden' }}>
                            <img src={`/icons/${r.id}.png`} alt="" style={{ height: 18, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }} />
                          </div>
                          <span style={{ color: 'var(--th-tx)', fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{r.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* posting as */}
                {username
                  ? <PostingAs username={username} onClear={() => { clearUsername(); setUsername(null) }} />
                  : <div style={{ color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: 'monospace', marginBottom: 10 }}>
                      You'll choose a display name before sharing.
                    </div>
                }

                {submitError && (
                  <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 10, fontFamily: 'monospace' }}>{submitError}</div>
                )}

                <button
                  onClick={handleShare}
                  disabled={submitting || formDisabled}
                  style={{
                    width: '100%', padding: '8px',
                    background: formDisabled ? 'var(--th-bg-well)' : '#1a2a1a',
                    border: `1px solid ${formDisabled ? '#111' : '#22c55e44'}`,
                    borderRadius: 1, cursor: (submitting || formDisabled) ? 'not-allowed' : 'pointer',
                    color: formDisabled ? 'var(--th-tx-vmut)' : '#22c55e',
                    fontSize: 12, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  {submitting ? 'Sharing…' : 'Share Blueprint'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── detail ── */}
      {pageState === 'detail' && selectedBp && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* meta */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--th-tx)', fontSize: 17, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.3, marginBottom: 4 }}>
                  {selectedBp.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace' }}>
                    by {selectedBp.author} · {fmtDate(selectedBp.created_at)}
                  </span>
                  <TypeBadge bp={selectedBp} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                <span style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace' }}>
                  {selectedBp.downloads} cop{selectedBp.downloads !== 1 ? 'ies' : 'y'}
                </span>
              </div>
            </div>

            {/* item icons */}
            {selectedBp.item_ids.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {selectedBp.item_ids.map(id => {
                  const name = recipes.find(r => r.id === id)?.name ?? id
                  return (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1, padding: '3px 8px',
                    }}>
                      <div style={{ width: 16, height: 16, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={`/icons/${id}.png`} alt="" style={{ height: 16, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }} />
                      </div>
                      <span style={{ color: 'var(--th-tx)', fontSize: 11, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600 }}>{name}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* description */}
            {selectedBp.description && (
              <div style={{ color: 'var(--th-tx-sec)', fontSize: 12, lineHeight: 1.65, fontFamily: 'monospace', background: 'var(--th-bg-hdr)', padding: '10px 12px', borderRadius: 1, border: '1px solid var(--th-br)' }}>
                {selectedBp.description}
              </div>
            )}

            {/* preview */}
            <BlueprintPreview blueprintString={selectedBp.blueprint_string} maxW={680} maxH={400} zoomable />

            {/* stats + copy + upvote */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleCopy(selectedBp)}
                style={{
                  flex: 1, padding: '8px 12px',
                  background: copied === selectedBp.id ? '#1a2a1a' : 'var(--th-bg-well)',
                  border: `1px solid ${copied === selectedBp.id ? '#22c55e44' : '#111'}`,
                  borderRadius: 1, cursor: 'pointer',
                  color: copied === selectedBp.id ? '#22c55e' : 'var(--th-tx-sec)',
                  fontSize: 12, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (copied !== selectedBp.id) e.currentTarget.style.color = 'var(--th-tx)' }}
                onMouseLeave={e => { if (copied !== selectedBp.id) e.currentTarget.style.color = 'var(--th-tx-sec)' }}
              >
                {copied === selectedBp.id ? '✓ Copied!' : '⧉ Copy Blueprint String'}
              </button>
              <button
                onClick={e => handleUpvote(e, selectedBp)}
                title={voted.has(selectedBp.id) ? 'Already upvoted' : 'Upvote'}
                style={{
                  flexShrink: 0, padding: '8px 16px',
                  background: voted.has(selectedBp.id) ? '#1a2a1a' : 'var(--th-bg-well)',
                  border: `1px solid ${voted.has(selectedBp.id) ? '#22c55e44' : '#111'}`,
                  borderRadius: 1, cursor: voted.has(selectedBp.id) ? 'default' : 'pointer',
                  color: voted.has(selectedBp.id) ? '#22c55e' : 'var(--th-tx-vmut)',
                  fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { if (!voted.has(selectedBp.id)) e.currentTarget.style.color = '#22c55e' }}
                onMouseLeave={e => { if (!voted.has(selectedBp.id)) e.currentTarget.style.color = 'var(--th-tx-vmut)' }}
              >
                ▲ <span style={{ fontFamily: 'monospace' }}>{selectedBp.upvotes}</span>
              </button>
            </div>

            {/* ── comments ── */}
            <div>
              <div style={{
                color: 'var(--th-tx-vmut)', fontSize: 9, textTransform: 'uppercase',
                letterSpacing: '0.12em', fontFamily: "'Titillium Web', sans-serif",
                fontWeight: 700, marginBottom: 10, paddingBottom: 6,
                borderBottom: '1px solid var(--th-br-hdr)',
              }}>
                Comments {comments.length > 0 && `· ${comments.length}`}
              </div>

              {commentsLoading && (
                <div style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace', marginBottom: 10 }}>Loading…</div>
              )}

              {!commentsLoading && comments.length === 0 && (
                <div style={{ color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: 'monospace', marginBottom: 12 }}>
                  No comments yet — share an improvement idea!
                </div>
              )}

              {comments.map(c => (
                <div key={c.id} style={{
                  padding: '8px 10px', marginBottom: 6,
                  background: 'var(--th-bg-hdr)', border: '1px solid var(--th-br)',
                  borderRadius: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: 'var(--th-tx-sec)', fontSize: 11, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif" }}>
                      {c.author}
                    </span>
                    <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: 'monospace' }}>
                      {fmtDate(c.created_at)}
                    </span>
                  </div>
                  <div style={{ color: 'var(--th-tx-sec)', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.body}
                  </div>
                </div>
              ))}

              {/* comment form */}
              <div style={{ marginTop: 10 }}>
                {username && <PostingAs username={username} onClear={() => { clearUsername(); setUsername(null) }} />}
                <textarea
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                  placeholder="Share an improvement idea or tip…"
                  maxLength={500}
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                    boxShadow: 'var(--shadow-inset)',
                    color: 'var(--th-tx)', fontSize: 11, padding: '7px 10px', outline: 'none',
                    fontFamily: 'monospace', resize: 'vertical', marginBottom: 6,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                />
                {commentError && (
                  <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 6, fontFamily: 'monospace' }}>{commentError}</div>
                )}
                <button
                  onClick={() => requireUsername(() => handlePostComment())}
                  disabled={commentSubmitting || !commentBody.trim()}
                  style={{
                    padding: '6px 16px',
                    background: !commentBody.trim() ? 'var(--th-bg-well)' : '#1a1a2a',
                    border: `1px solid ${!commentBody.trim() ? '#111' : '#FF9F1C44'}`,
                    borderRadius: 1,
                    cursor: (commentSubmitting || !commentBody.trim()) ? 'not-allowed' : 'pointer',
                    color: !commentBody.trim() ? 'var(--th-tx-vmut)' : '#FF9F1C',
                    fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  {commentSubmitting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* username modal */}
      {showUsernameModal && (
        <UsernameModal
          onConfirm={handleUsernameConfirm}
          onCancel={() => { setShowUsernameModal(false); pendingAction.current = null }}
        />
      )}
    </div>
  )
}

// ── browse card ───────────────────────────────────────────────────────────────

function BrowseCard({ bp, copied, voted, onOpen, onCopy, onUpvote }: {
  bp: Blueprint
  copied: string | null
  voted: Set<string>
  onOpen: () => void
  onCopy: (bp: Blueprint) => void
  onUpvote: (e: React.MouseEvent, bp: Blueprint) => void
}) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--th-bg-surf)', border: '1px solid var(--th-br-sep)',
        borderTop: '2px solid #FF9F1C22', borderRadius: 2,
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.4)',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--th-br-sep)')}
    >
      {/* card header */}
      <div style={{ padding: '10px 12px 8px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {/* item icons */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0, flexWrap: 'wrap', maxWidth: 50 }}>
          {bp.item_ids.slice(0, 4).map(id => (
            <div key={id} style={{ width: 20, height: 20, background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)' }}>
              <img
                src={`/icons/${id}.png`} alt=""
                title={recipes.find(r => r.id === id)?.name ?? id}
                style={{ height: 20, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.opacity = '0' }}
              />
            </div>
          ))}
        </div>

        {/* name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: 'var(--th-tx)', fontSize: 12, fontWeight: 700,
            fontFamily: "'Titillium Web', sans-serif",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 3,
          }}>
            {bp.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: 'monospace' }}>
              {bp.author} · {fmtDate(bp.created_at)}
            </span>
            <TypeBadge bp={bp} />
          </div>
        </div>

        {/* upvote */}
        <button
          onClick={e => onUpvote(e, bp)}
          title={voted.has(bp.id) ? 'Already upvoted' : 'Upvote'}
          style={{
            flexShrink: 0,
            background: voted.has(bp.id) ? '#1a2a1a' : 'none',
            border: `1px solid ${voted.has(bp.id) ? '#22c55e44' : 'transparent'}`,
            borderRadius: 1, cursor: voted.has(bp.id) ? 'default' : 'pointer',
            color: voted.has(bp.id) ? '#22c55e' : 'var(--th-tx-vmut)',
            fontSize: 9, padding: '3px 5px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, lineHeight: 1,
          }}
          onMouseEnter={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#22c55e' }}
          onMouseLeave={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = 'var(--th-tx-vmut)' }}
        >
          <span>▲</span>
          <span style={{ fontFamily: 'monospace' }}>{bp.upvotes}</span>
        </button>
      </div>

      {/* description */}
      {bp.description && (
        <div style={{
          color: 'var(--th-tx-mut)', fontSize: 10, lineHeight: 1.45, fontFamily: 'monospace',
          padding: '0 12px 8px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {bp.description}
        </div>
      )}

      {/* preview */}
      <div style={{ padding: '0 12px 8px' }}>
        <BlueprintPreview blueprintString={bp.blueprint_string} maxW={276} maxH={160} />
      </div>

      {/* copy button */}
      <div style={{ padding: '0 12px 10px' }}>
        <button
          onClick={e => { e.stopPropagation(); onCopy(bp) }}
          style={{
            width: '100%', padding: '5px 8px',
            background: copied === bp.id ? '#1a2a1a' : 'var(--th-bg-well)',
            border: `1px solid ${copied === bp.id ? '#22c55e44' : '#111'}`,
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.04)',
            borderRadius: 1, cursor: 'pointer',
            color: copied === bp.id ? '#22c55e' : 'var(--th-tx-sec)',
            fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
            letterSpacing: '0.04em', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (copied !== bp.id) e.currentTarget.style.color = 'var(--th-tx)' }}
          onMouseLeave={e => { if (copied !== bp.id) e.currentTarget.style.color = 'var(--th-tx-sec)' }}
        >
          {copied === bp.id ? '✓ Copied!' : '⧉ Copy String'}
        </button>
      </div>
    </div>
  )
}
