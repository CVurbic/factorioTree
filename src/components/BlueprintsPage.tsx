import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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

// ── shared UI atoms ───────────────────────────────────────────────────────────

type SortKey = 'upvotes' | 'downloads' | 'created_at'

function TypeBadge({ bp }: { bp: Blueprint }) {
  const isBook = bp.type === 'blueprint_book'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: isBook ? 'rgba(26,26,42,0.92)' : 'rgba(20,20,28,0.92)',
      border: `1px solid ${isBook ? '#a855f755' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: 2, padding: '2px 6px',
      color: isBook ? '#a855f7' : 'var(--th-tx-vmut)',
      fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0,
      backdropFilter: 'blur(4px)',
    }}>
      {isBook ? `⊟ Book · ${bp.blueprint_count ?? '?'}` : '⊡ Print'}
    </span>
  )
}

function PostingAs({ username, onClear }: { username: string; onClear: () => void }) {
  return (
    <div style={{ fontSize: 9, color: 'var(--th-tx-vmut)', fontFamily: 'monospace', marginBottom: 10 }}>
      Posting as{' '}
      <span style={{ color: 'var(--th-tx-sec)', fontWeight: 700 }}>{username}</span>
      {' · '}
      <span style={{ color: '#FF9F1C', cursor: 'pointer' }} onClick={onClear}>change</span>
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

// ── sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  typeFilter, setTypeFilter,
  tagFilters, setTagFilters,
  allTags, isMobile, open, onClose,
}: {
  typeFilter: 'all' | 'blueprint' | 'blueprint_book'
  setTypeFilter: (v: 'all' | 'blueprint' | 'blueprint_book') => void
  tagFilters: Set<string>
  setTagFilters: React.Dispatch<React.SetStateAction<Set<string>>>
  allTags: { tag: string; count: number }[]
  isMobile: boolean
  open: boolean
  onClose: () => void
}) {
  if (isMobile && !open) return null

  const wrapStyle: React.CSSProperties = isMobile ? {
    position: 'absolute', inset: 0, zIndex: 100,
    background: 'var(--th-bg-deep)',
    display: 'flex', flexDirection: 'column',
  } : {
    width: 220, flexShrink: 0,
    background: 'var(--th-bg-hdr)',
    borderRight: '1px solid var(--th-br)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  }

  const hasFilters = typeFilter !== 'all' || tagFilters.size > 0

  return (
    <div style={wrapStyle}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 16px 11px', borderBottom: '1px solid var(--th-br)', flexShrink: 0,
      }}>
        <span style={{
          color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: "'Titillium Web', sans-serif",
          fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filters
          {hasFilters && (
            <span style={{
              background: '#FF9F1C', color: '#0d1117', borderRadius: '50%',
              width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700,
            }}>
              {(typeFilter !== 'all' ? 1 : 0) + tagFilters.size}
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {hasFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setTagFilters(new Set()) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#ef4444', fontSize: 9, fontFamily: 'monospace', padding: 0,
              }}
            >
              clear
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--th-tx-vmut)', fontSize: 16, lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Type filter */}
        <div style={{ padding: '12px 16px 14px' }}>
          <div style={{
            color: 'var(--th-tx-faint)', fontSize: 8, fontFamily: "'Titillium Web', sans-serif",
            fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Type
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'blueprint' as const, label: 'Print' },
              { key: 'blueprint_book' as const, label: 'Book' },
            ]).map(({ key, label }) => (
              <button key={key} onClick={() => setTypeFilter(key)} style={{
                flex: 1, padding: '5px 0',
                background: typeFilter === key ? '#FF9F1C' : 'var(--th-bg-well)',
                border: `1px solid ${typeFilter === key ? '#FF9F1C' : 'var(--th-br)'}`,
                borderRadius: 2, cursor: 'pointer',
                color: typeFilter === key ? '#0d1117' : 'var(--th-tx-vmut)',
                fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                letterSpacing: '0.04em', transition: 'all 0.12s',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--th-br)', margin: '0 0' }} />

        {/* Tags */}
        <div style={{ padding: '12px 0 8px' }}>
          <div style={{
            color: 'var(--th-tx-faint)', fontSize: 8, fontFamily: "'Titillium Web', sans-serif",
            fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '0 16px 8px',
          }}>
            Tags
          </div>
          {allTags.length === 0 && (
            <div style={{ padding: '4px 16px', color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: 'monospace' }}>
              No tags yet
            </div>
          )}
          {allTags.map(({ tag, count }) => {
            const active = tagFilters.has(tag)
            return (
              <div
                key={tag}
                onClick={() => setTagFilters(prev => {
                  const s = new Set(prev)
                  if (s.has(tag)) s.delete(tag); else s.add(tag)
                  return s
                })}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 16px 6px 14px',
                  cursor: 'pointer', gap: 8,
                  background: active ? 'rgba(168,85,247,0.08)' : 'transparent',
                  borderLeft: `2px solid ${active ? '#a855f7' : 'transparent'}`,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--th-bg-well)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  flex: 1, color: active ? '#a855f7' : 'var(--th-tx-sec)',
                  fontSize: 11, fontFamily: "'Titillium Web', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {tag}
                </span>
                <span style={{ color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ height: 1, background: 'var(--th-br)' }} />

        {/* Hotkeys */}
        <div style={{ padding: '12px 16px 16px' }}>
          <div style={{
            color: 'var(--th-tx-faint)', fontSize: 8, fontFamily: "'Titillium Web', sans-serif",
            fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 9,
          }}>
            Hotkeys
          </div>
          {([
            { label: 'Focus search', key: '/' },
            { label: 'Close detail', key: 'Esc' },
            { label: 'From recipe tree', key: 'B' },
          ] as const).map(({ label, key }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: "'Titillium Web', sans-serif" }}>
                {label}
              </span>
              <kbd style={{
                background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 2,
                padding: '1px 6px', color: 'var(--th-tx-sec)', fontSize: 9, fontFamily: 'monospace',
                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}>
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

type PageState = 'browse' | 'share' | 'detail'

export function BlueprintsPage({ initialSearch = '', isMobile = false }: { initialSearch?: string; isMobile?: boolean }) {
  const [pageState, setPageState] = useState<PageState>('browse')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

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

  // ── browse state ─────────────────────────────────────────────────────────────
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('upvotes')
  const [search, setSearch] = useState(initialSearch)
  const [voted, setVoted] = useState<Set<string>>(getVoted)
  const [copied, setCopied] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'blueprint' | 'blueprint_book'>('all')
  const [tagFilters, setTagFilters] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch)
  }, [initialSearch])

  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const bp of blueprints) {
      for (const tag of bp.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
  }, [blueprints])

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

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '/' && pageState === 'browse') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && pageState === 'detail') {
        setPageState('browse')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pageState])

  const filtered = blueprints
    .filter(bp => typeFilter === 'all' || bp.type === typeFilter)
    .filter(bp => tagFilters.size === 0 || [...tagFilters].every(t => bp.tags?.includes(t)))
    .filter(bp => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        bp.name.toLowerCase().includes(q) ||
        bp.description?.toLowerCase().includes(q) ||
        bp.author.toLowerCase().includes(q) ||
        bp.item_ids.some(id => (recipes.find(r => r.id === id)?.name ?? id).toLowerCase().includes(q))
      )
    })

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

  // ── detail state ─────────────────────────────────────────────────────────────
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

  // ── share state ──────────────────────────────────────────────────────────────
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

  // ── render ───────────────────────────────────────────────────────────────────

  const sortLabels: Record<SortKey, string> = {
    upvotes: '▲ Top',
    downloads: '↓ Popular',
    created_at: '✦ New',
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--th-bg-deep)', overflow: 'hidden', position: 'relative' }}>

      {/* ── sidebar (browse only) ── */}
      {pageState === 'browse' && (
        <Sidebar
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          tagFilters={tagFilters}
          setTagFilters={setTagFilters}
          allTags={allTags}
          isMobile={isMobile}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* ── main column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── topbar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderBottom: '1px solid var(--th-br)',
          background: 'var(--th-bg-deep)', flexShrink: 0, flexWrap: 'wrap', rowGap: 6,
        }}>
          {pageState !== 'browse' && (
            <button
              onClick={() => setPageState('browse')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--th-tx-vmut)', fontSize: 11, padding: '3px 0',
                fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF9F1C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
            >
              ← Back
            </button>
          )}

          {pageState === 'browse' && (
            <>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    flexShrink: 0, padding: '4px 9px',
                    background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                    borderRadius: 1, cursor: 'pointer', color: 'var(--th-tx-vmut)',
                    fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                    letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                  Filters
                </button>
              )}

              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, author, or item…"
                style={{
                  flex: 1, minWidth: 120,
                  background: 'var(--th-bg-well)', border: '1px solid var(--th-br)', borderRadius: 1,
                  boxShadow: 'var(--shadow-inset)',
                  color: 'var(--th-tx)', fontSize: 11, padding: '5px 9px', outline: 'none',
                  fontFamily: "'Titillium Web', sans-serif",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
              />

              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {(Object.keys(sortLabels) as SortKey[]).map(key => (
                  <button key={key} onClick={() => setSort(key)} style={{
                    padding: '4px 9px',
                    background: sort === key ? 'var(--th-bg-hdr)' : 'none',
                    border: `1px solid ${sort === key ? '#FF9F1C55' : 'var(--th-br-hdr)'}`,
                    borderRadius: 1, cursor: 'pointer',
                    color: sort === key ? '#FF9F1C' : 'var(--th-tx-vmut)',
                    fontSize: 9, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {sortLabels[key]}
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
                  borderRadius: 1, cursor: 'pointer', color: 'var(--th-tx-vmut)', fontSize: 12,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--th-tx-sec)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
              >
                ↻
              </button>
            </>
          )}

          {pageState === 'share' && (
            <span style={{ color: 'var(--th-tx)', fontSize: 11, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", letterSpacing: '0.08em' }}>
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
            {/* result count */}
            <div style={{ marginBottom: 12, color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: 'monospace' }}>
              {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
            </div>

            {!loading && fetchError && (
              <div style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace', padding: '16px 0' }}>
                {fetchError}
              </div>
            )}

            {!loading && !fetchError && filtered.length === 0 && (
              <div style={{ color: 'var(--th-tx-vmut)', fontSize: 11, fontFamily: 'monospace', padding: '32px 0', textAlign: 'center' }}>
                {(search || typeFilter !== 'all' || tagFilters.size > 0)
                  ? 'No blueprints match your filters.'
                  : 'No blueprints yet — be the first to share one!'}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
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
                  onTagClick={tag => setTagFilters(prev => { const s = new Set(prev); s.add(tag); return s })}
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
            <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* meta */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--th-tx)', fontSize: 18, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.3, marginBottom: 5 }}>
                    {selectedBp.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace' }}>
                      by {selectedBp.author} · {fmtDate(selectedBp.created_at)}
                    </span>
                    <TypeBadge bp={selectedBp} />
                  </div>
                </div>
                <span style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>
                  {selectedBp.downloads} cop{selectedBp.downloads !== 1 ? 'ies' : 'y'}
                </span>
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

              {/* tags */}
              {selectedBp.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selectedBp.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => { setTagFilters(prev => { const s = new Set(prev); s.add(tag); return s }); setPageState('browse') }}
                      style={{
                        background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                        borderRadius: 1, padding: '2px 7px', cursor: 'pointer',
                        color: 'var(--th-tx-vmut)', fontSize: 10,
                        fontFamily: "'Titillium Web', sans-serif",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a855f744'; (e.currentTarget as HTMLElement).style.color = '#a855f7' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--th-br)'; (e.currentTarget as HTMLElement).style.color = 'var(--th-tx-vmut)' }}
                    >{tag}</span>
                  ))}
                </div>
              )}

              {/* description */}
              {selectedBp.description && (
                <div style={{ color: 'var(--th-tx-sec)', fontSize: 12, lineHeight: 1.65, fontFamily: 'monospace', background: 'var(--th-bg-hdr)', padding: '10px 12px', borderRadius: 1, border: '1px solid var(--th-br)' }}>
                  {selectedBp.description}
                </div>
              )}

              {/* screenshot from source */}
              {selectedBp.image_url && (
                <img
                  src={selectedBp.image_url} alt=""
                  style={{ width: '100%', borderRadius: 1, display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              )}

              {/* preview */}
              <BlueprintPreview blueprintString={selectedBp.blueprint_string} maxW={720} maxH={440} zoomable />

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

              {/* source attribution */}
              {selectedBp.source_url && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--th-tx-vmut)' }}>
                  Originally from{' '}
                  <a
                    href={selectedBp.source_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#60a5fa', textDecoration: 'none' }}
                  >factorioprints.com ↗</a>
                </div>
              )}

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
                    background: 'var(--th-bg-hdr)', border: '1px solid var(--th-br)', borderRadius: 1,
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
      </div>

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

function BrowseCard({ bp, copied, voted, onOpen, onCopy, onUpvote, onTagClick }: {
  bp: Blueprint
  copied: string | null
  voted: Set<string>
  onOpen: () => void
  onCopy: (bp: Blueprint) => void
  onUpvote: (e: React.MouseEvent, bp: Blueprint) => void
  onTagClick: (tag: string) => void
}) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--th-bg-surf)', border: '1px solid var(--th-br-sep)',
        borderRadius: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF9F1C55'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--th-br-sep)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)' }}
    >
      {/* ── preview hero ── */}
      <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: 'var(--th-bg-deep)', flexShrink: 0 }}>
        {/* type badge overlay */}
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
          <TypeBadge bp={bp} />
        </div>
        {/* source link overlay */}
        {bp.source_url && (
          <a
            href={bp.source_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 2,
              background: 'rgba(20,20,28,0.88)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2, padding: '2px 6px',
              color: '#60a5fa', fontSize: 9, fontFamily: 'monospace', textDecoration: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            ↗ source
          </a>
        )}
        {bp.image_url ? (
          <img
            src={bp.image_url} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <BlueprintPreview blueprintString={bp.blueprint_string} maxW={300} maxH={170} />
        )}
      </div>

      {/* ── card body ── */}
      <div style={{ padding: '10px 12px 8px', flex: 1 }}>
        {/* title */}
        <div style={{
          color: 'var(--th-tx)', fontSize: 13, fontWeight: 700,
          fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          marginBottom: 7,
        }}>
          {bp.name}
        </div>

        {/* item icons */}
        {bp.item_ids.length > 0 && (
          <div style={{ display: 'flex', gap: 3, marginBottom: 7, flexWrap: 'wrap' }}>
            {bp.item_ids.slice(0, 6).map(id => (
              <div key={id} title={recipes.find(r => r.id === id)?.name ?? id} style={{
                width: 22, height: 22, background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                overflow: 'hidden', flexShrink: 0,
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)',
              }}>
                <img
                  src={`/icons/${id}.png`} alt=""
                  style={{ height: 22, width: 'auto', maxWidth: 'none', imageRendering: 'pixelated', display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.opacity = '0' }}
                />
              </div>
            ))}
            {bp.item_ids.length > 6 && (
              <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: 'monospace', alignSelf: 'center' }}>
                +{bp.item_ids.length - 6}
              </span>
            )}
          </div>
        )}

        {/* author + date */}
        <div style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: 'monospace', marginBottom: 6 }}>
          {bp.author} · {fmtDate(bp.created_at)}
        </div>

        {/* description */}
        {bp.description && (
          <div style={{
            color: 'var(--th-tx-mut)', fontSize: 10, lineHeight: 1.45, fontFamily: 'monospace',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: 7,
          }}>
            {bp.description}
          </div>
        )}

        {/* tags */}
        {bp.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {bp.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                onClick={e => { e.stopPropagation(); onTagClick(tag) }}
                style={{
                  background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                  borderRadius: 2, padding: '1px 6px', cursor: 'pointer',
                  color: 'var(--th-tx-vmut)', fontSize: 9,
                  fontFamily: "'Titillium Web', sans-serif",
                  transition: 'color 0.1s, border-color 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a855f766'; (e.currentTarget as HTMLElement).style.color = '#a855f7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--th-br)'; (e.currentTarget as HTMLElement).style.color = 'var(--th-tx-vmut)' }}
              >{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── card footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px 8px',
        borderTop: '1px solid var(--th-br-sep)',
        background: 'rgba(0,0,0,0.15)',
      }}>
        {/* upvote */}
        <button
          onClick={e => onUpvote(e, bp)}
          title={voted.has(bp.id) ? 'Already upvoted' : 'Upvote'}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            background: voted.has(bp.id) ? 'rgba(34,197,94,0.12)' : 'none',
            border: `1px solid ${voted.has(bp.id) ? '#22c55e33' : 'transparent'}`,
            borderRadius: 2, cursor: voted.has(bp.id) ? 'default' : 'pointer',
            color: voted.has(bp.id) ? '#22c55e' : 'var(--th-tx-vmut)',
            fontSize: 10, padding: '2px 6px',
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = '#22c55e' }}
          onMouseLeave={e => { if (!voted.has(bp.id)) e.currentTarget.style.color = 'var(--th-tx-vmut)' }}
        >
          ▲ {bp.upvotes}
        </button>

        {/* downloads */}
        <span style={{ color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
          ↓ {bp.downloads}
        </span>

        <div style={{ flex: 1 }} />

        {/* copy */}
        <button
          onClick={e => { e.stopPropagation(); onCopy(bp) }}
          style={{
            padding: '3px 10px', flexShrink: 0,
            background: copied === bp.id ? 'rgba(34,197,94,0.12)' : 'var(--th-bg-well)',
            border: `1px solid ${copied === bp.id ? '#22c55e44' : 'var(--th-br)'}`,
            borderRadius: 2, cursor: 'pointer',
            color: copied === bp.id ? '#22c55e' : 'var(--th-tx-sec)',
            fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
            letterSpacing: '0.03em', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (copied !== bp.id) e.currentTarget.style.color = 'var(--th-tx)' }}
          onMouseLeave={e => { if (copied !== bp.id) e.currentTarget.style.color = 'var(--th-tx-sec)' }}
        >
          {copied === bp.id ? '✓ Copied!' : '⧉ Copy'}
        </button>
      </div>
    </div>
  )
}
