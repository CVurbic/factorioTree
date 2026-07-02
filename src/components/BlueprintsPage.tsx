import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { supabase, type Blueprint, type Comment } from '../lib/supabase'
import { recipes } from '../data/recipes-generated'
import { BlueprintPreview } from './BlueprintPreview'
import { UsernameModal, getUsername, clearUsername } from './UsernameGate'

// ── local storage helpers ─────────────────────────────────────────────────────

const VOTED_KEY = 'ft-voted-blueprints'
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

const MONO_FONT = "'IBM Plex Mono', monospace"

// ── blueprint type detection ──────────────────────────────────────────────────

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  for (const fmt of ['deflate', 'deflate-raw'] as CompressionFormat[]) {
    try {
      const ds = new DecompressionStream(fmt)
      const writer = ds.writable.getWriter()
      const reader = ds.readable.getReader()
      writer.write(bytes as unknown as ArrayBuffer).then(() => writer.close()).catch(() => { })
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

async function detectBlueprintType(str: string): Promise<{ type: 'blueprint' | 'blueprint_book'; count: number | null; sub_blueprint_names: string[] } | null> {
  try {
    const binary = atob(str.slice(1))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const buf = await inflate(bytes)
    const json = JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
    if (json.blueprint_book) {
      type BookEntry = { blueprint?: { label?: string }; blueprint_book?: { label?: string } }
      const book = json.blueprint_book as { blueprints?: BookEntry[] }
      const sub_blueprint_names = (book.blueprints ?? [])
        .map(b => b.blueprint?.label ?? b.blueprint_book?.label ?? '')
        .filter(Boolean)
      return { type: 'blueprint_book', count: book.blueprints?.length ?? null, sub_blueprint_names }
    }
    if (json.blueprint) return { type: 'blueprint', count: null, sub_blueprint_names: [] }
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--th-bg-well)', padding: '10px 13px' }}>
      <div style={{
        color: 'var(--th-tx-faint)', fontSize: 9, textTransform: 'uppercase',
        letterSpacing: '0.1em', marginBottom: 5, fontFamily: MONO_FONT,
      }}>
        {label}
      </div>
      <div style={{ color: 'var(--th-tx)', fontSize: 18, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif" }}>
        {value}
      </div>
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
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
          {allTags.filter(({ count }) => count > 5).map(({ tag, count }) => {
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
  const votedRef = useRef(voted)
  useEffect(() => { votedRef.current = voted }, [voted])
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
        goToBrowse()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pageState])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const tags = [...tagFilters]
    return blueprints
      .filter(bp => typeFilter === 'all' || bp.type === typeFilter)
      .filter(bp => tags.length === 0 || tags.every(t => bp.tags.includes(t)))
      .filter(bp => {
        if (!q) return true
        return (
          bp.name.toLowerCase().includes(q) ||
          bp.description?.toLowerCase().includes(q) ||
          bp.author.toLowerCase().includes(q) ||
          bp.item_ids.some(id => (recipes.find(r => r.id === id)?.name ?? id).toLowerCase().includes(q)) ||
          bp.sub_blueprint_names.some(n => { const name = n.toLowerCase(); return name.includes(q) || (name.length >= 4 && q.includes(name)) })
        )
      })
  }, [blueprints, typeFilter, tagFilters, search])

  const handleCopy = useCallback(async (bp: Blueprint) => {
    let str = bp.blueprint_string
    if (!str) {
      if (bp.string_url) {
        try {
          const res = await fetch(bp.string_url)
          str = (await res.text()).trim()
        } catch {
          if (bp.source_url) window.open(bp.source_url, '_blank')
          return
        }
      } else {
        if (bp.source_url) window.open(bp.source_url, '_blank')
        return
      }
    }
    try {
      await navigator.clipboard.writeText(str)
      setCopied(bp.id)
      setTimeout(() => setCopied(null), 2000)
      supabase.rpc('increment_downloads', { blueprint_id: bp.id, client_id: getClientId() }).then(({ data }) => {
        if (data === true)
          setBlueprints(prev => prev.map(b => b.id === bp.id ? { ...b, downloads: b.downloads + 1 } : b))
      })
    } catch {
      window.prompt('Copy this blueprint string:', str)
    }
  }, [])

  const handleUpvote = useCallback(async (e: React.MouseEvent, bp: Blueprint) => {
    e.stopPropagation()
    if (votedRef.current.has(bp.id)) return
    const { error } = await supabase.rpc('increment_upvotes', { blueprint_id: bp.id })
    if (!error) {
      const next = new Set(votedRef.current); next.add(bp.id)
      setVoted(next)
      localStorage.setItem(VOTED_KEY, JSON.stringify([...next]))
      setBlueprints(prev => prev.map(b => b.id === bp.id ? { ...b, upvotes: b.upvotes + 1 } : b))
    }
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setTagFilters(prev => { const s = new Set(prev); s.add(tag); return s })
  }, [])

  // ── detail state ─────────────────────────────────────────────────────────────
  const [selectedBp, setSelectedBp] = useState<Blueprint | null>(null)
  const [bookContents, setBookContents] = useState<Array<{ label: string; index: number }> | null>(null)
  const [previewStats, setPreviewStats] = useState<{ entityCount: number; tilesW: number; tilesH: number } | null>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [selectedBookIndex, setSelectedBookIndex] = useState(0)
  const [forceCanvas, setForceCanvas] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  function goToBrowse() {
    history.pushState({}, '', '/blueprints')
    setPageState('browse')
  }

  const openDetail = useCallback((bp: Blueprint) => {
    history.pushState({}, '', `/blueprints/${bp.id}`)
    setSelectedBp(bp)
    setComments([])
    setCommentBody('')
    setCommentError(null)
    setPreviewStats(null)
    setImageFailed(false)
    setSelectedBookIndex(0)
    setForceCanvas(false)
    setPageState('detail')
  }, [])

  const openDetailById = useCallback(async (id: string) => {
    const { data } = await supabase.from('blueprints').select('*').eq('id', id).single()
    if (data) openDetail(data as Blueprint)
  }, [openDetail])

  // browser back/forward within /blueprints/*
  useEffect(() => {
    function handler() {
      const path = window.location.pathname
      if (path === '/blueprints' || path === '/blueprints/') setPageState('browse')
      else if (/^\/blueprints\/[^/]+$/.test(path)) {
        const id = path.split('/').pop()!
        openDetailById(id)
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [openDetailById])

  // deep-link: page loaded directly at /blueprints/<id>
  useEffect(() => {
    const match = window.location.pathname.match(/^\/blueprints\/([^/]+)$/)
    if (!match) return
    openDetailById(match[1])
  }, [openDetailById])

  useEffect(() => {
    if (!selectedBp || selectedBp.type !== 'blueprint_book') { setBookContents(null); return }
    let cancelled = false
    async function decode() {
      let str = selectedBp!.blueprint_string
      if (!str && selectedBp!.string_url) {
        try { const res = await fetch(selectedBp!.string_url); str = (await res.text()).trim() } catch { return }
      }
      if (!str || cancelled) return
      try {
        const binary = atob(str.slice(1))
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
        const buf = await inflate(bytes)
        const json = JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
        const book = (json.blueprint_book as { blueprints?: Array<{ blueprint?: { label?: string }; blueprint_book?: { label?: string } }> } | undefined)
        if (!book?.blueprints || cancelled) return
        setBookContents(book.blueprints.map((item, i) => ({
          label: item.blueprint?.label ?? item.blueprint_book?.label ?? `Blueprint ${i + 1}`,
          index: i,
        })))
      } catch { /* malformed string */ }
    }
    decode()
    return () => { cancelled = true }
  }, [selectedBp])

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
  const [detectedType, setDetectedType] = useState<{ type: 'blueprint' | 'blueprint_book'; count: number | null; sub_blueprint_names: string[] } | null>(null)
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError(null)
    setImageUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const { data, error } = await supabase.storage
      .from('blueprint-images')
      .upload(`public/${crypto.randomUUID()}.${ext}`, file, { cacheControl: '3600', upsert: false, contentType: file.type })
    setImageUploading(false)
    if (error) { setImageError(error.message); return }
    const { data: urlData } = supabase.storage.from('blueprint-images').getPublicUrl(data.path)
    setFormImageUrl(urlData.publicUrl)
  }

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
      sub_blueprint_names: detectedType?.sub_blueprint_names ?? [],
      image_url: formImageUrl,
    })
    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    setSubmitted(true)
    setFormName(''); setFormDesc(''); setFormString(''); setFormItemIds([]); setFormItemQuery('')
    setDetectedType(null); setFormImageUrl(null); setImageError(null)
    setTimeout(() => { setSubmitted(false); history.pushState({}, '', '/blueprints'); setPageState('browse'); fetchBlueprints(sort) }, 1800)
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
              onClick={() => goToBrowse()}
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
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {filtered.map(bp => (
                <BrowseCard
                  key={bp.id}
                  bp={bp}
                  isCopied={copied === bp.id}
                  isVoted={voted.has(bp.id)}
                  openDetail={openDetail}
                  onCopy={handleCopy}
                  onUpvote={handleUpvote}
                  onTagClick={handleTagClick}
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

                  {/* cover image */}
                  <div style={{ marginBottom: 14 }}>
                    <FieldLabel>Cover Image (optional)</FieldLabel>
                    <label style={{ display: 'block', cursor: 'pointer' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                      {formImageUrl ? (
                        <div style={{ position: 'relative' }}>
                          <img src={formImageUrl} alt="" style={{ width: '100%', borderRadius: 1, display: 'block', maxHeight: 200, objectFit: 'cover' }} />
                          <button
                            onClick={e => { e.preventDefault(); setFormImageUrl(null) }}
                            style={{
                              position: 'absolute', top: 6, right: 6,
                              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: 2, padding: '2px 7px', cursor: 'pointer',
                              color: 'var(--th-tx-sec)', fontSize: 11, lineHeight: 1,
                            }}
                          >✕</button>
                        </div>
                      ) : imageUploading ? (
                        <div style={{
                          border: '1px dashed var(--th-br)', borderRadius: 1, padding: '20px',
                          textAlign: 'center', color: 'var(--th-tx-vmut)', fontSize: 11, fontFamily: 'monospace',
                        }}>Uploading…</div>
                      ) : (
                        <div style={{
                          border: '1px dashed var(--th-br)', borderRadius: 1, padding: '20px',
                          textAlign: 'center', color: 'var(--th-tx-vmut)', fontSize: 11,
                          fontFamily: "'Titillium Web', sans-serif",
                          transition: 'border-color 0.15s, color 0.15s',
                        }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#FF9F1C55'; el.style.color = 'var(--th-tx-sec)' }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--th-br)'; el.style.color = 'var(--th-tx-vmut)' }}
                        >
                          Click to upload a screenshot
                        </div>
                      )}
                    </label>
                    {imageError && <div style={{ color: '#ef4444', fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>{imageError}</div>}
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
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '28px 24px' }}>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(420px, 1fr) 320px',
                gap: isMobile ? 24 : 36,
              }}>

                {/* ── left: preview + primary actions ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                  <div style={{ position: 'relative' }}>
                    {selectedBp.image_url && !imageFailed && !forceCanvas ? (
                      <img
                        src={selectedBp.image_url} alt=""
                        style={{ width: '100%', borderRadius: 1, display: 'block', border: '1px solid var(--th-br)' }}
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <BlueprintPreview
                        blueprintString={selectedBp.blueprint_string ?? undefined}
                        stringUrl={selectedBp.string_url ?? undefined}
                        maxW={isMobile ? 320 : 480}
                        maxH={isMobile ? 220 : 340}
                        zoomable
                        onStats={setPreviewStats}
                        bookIndex={selectedBp.type === 'blueprint_book' ? selectedBookIndex : undefined}
                      />
                    )}
                    <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                      <TypeBadge bp={selectedBp} />
                    </div>
                    {previewStats && !(selectedBp.image_url && !imageFailed && !forceCanvas) && (
                      <div style={{
                        position: 'absolute', bottom: 8, left: 8, zIndex: 2,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(12,12,18,0.82)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2, padding: '2px 7px', backdropFilter: 'blur(6px)',
                        color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: MONO_FONT,
                      }}>
                        {previewStats.tilesW} × {previewStats.tilesH} tiles
                      </div>
                    )}
                    {forceCanvas && selectedBp.image_url && !imageFailed && (
                      <button
                        onClick={() => setForceCanvas(false)}
                        style={{
                          position: 'absolute', top: 8, right: 8, zIndex: 2,
                          background: 'rgba(12,12,18,0.82)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2, padding: '2px 7px', cursor: 'pointer', backdropFilter: 'blur(6px)',
                          color: 'var(--th-tx-vmut)', fontSize: 9, fontFamily: MONO_FONT,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#FF9F1C')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-vmut)')}
                      >
                        ← Screenshot
                      </button>
                    )}
                  </div>

                  {/* primary action */}
                  <button
                    onClick={() => handleCopy(selectedBp)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      width: '100%', padding: '13px 16px',
                      background: copied === selectedBp.id ? '#1a2a1a' : '#FF9F1C',
                      border: `1px solid ${copied === selectedBp.id ? '#22c55e66' : '#FF9F1C'}`,
                      borderRadius: 2, cursor: 'pointer',
                      color: copied === selectedBp.id ? '#22c55e' : '#1a1410',
                      fontSize: 14, fontFamily: "'Titillium Web', sans-serif", fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => { if (copied !== selectedBp.id) e.currentTarget.style.filter = 'brightness(1.08)' }}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    <span style={{ fontSize: 16 }}>{copied === selectedBp.id ? '✓' : '⧉'}</span>
                    {copied === selectedBp.id ? 'Copied!' : 'Copy Blueprint String'}
                  </button>

                  {/* secondary actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      onClick={e => handleUpvote(e, selectedBp)}
                      title={voted.has(selectedBp.id) ? 'Already upvoted' : 'Upvote'}
                      style={{
                        padding: '9px 12px',
                        background: voted.has(selectedBp.id) ? '#1a2a1a' : 'var(--th-bg-well)',
                        border: `1px solid ${voted.has(selectedBp.id) ? '#22c55e44' : 'var(--th-br)'}`,
                        borderRadius: 1, cursor: voted.has(selectedBp.id) ? 'default' : 'pointer',
                        color: voted.has(selectedBp.id) ? '#22c55e' : 'var(--th-tx-sec)',
                        fontSize: 12, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => { if (!voted.has(selectedBp.id)) e.currentTarget.style.color = '#22c55e' }}
                      onMouseLeave={e => { if (!voted.has(selectedBp.id)) e.currentTarget.style.color = 'var(--th-tx-sec)' }}
                    >
                      ▲ <span style={{ fontFamily: MONO_FONT }}>{selectedBp.upvotes} upvote{selectedBp.upvotes !== 1 ? 's' : ''}</span>
                    </button>
                    {(selectedBp.string_url || selectedBp.blueprint_string) && (
                      <a
                        href={selectedBp.string_url
                          ? `https://fbe.teoxoy.com/?source=${selectedBp.string_url}`
                          : 'https://fbe.teoxoy.com/'}
                        target="_blank" rel="noopener noreferrer"
                        onClick={!selectedBp.string_url ? e => {
                          e.preventDefault()
                          window.open('https://fbe.teoxoy.com/', '_blank')
                          handleCopy(selectedBp)
                        } : undefined}
                        style={{
                          padding: '9px 12px',
                          background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                          borderRadius: 1, cursor: 'pointer',
                          color: 'var(--th-tx-sec)', fontSize: 12,
                          fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
                          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          transition: 'color 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--th-tx)'; el.style.borderColor = 'var(--th-br-lt)' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--th-tx-sec)'; el.style.borderColor = 'var(--th-br)' }}
                      >
                        Open in FBE ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* ── right: spec panel ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ width: 6, height: 6, background: '#FF9F1C', flexShrink: 0 }} />
                      <span style={{
                        color: 'var(--th-tx-vmut)', fontSize: 9, textTransform: 'uppercase',
                        letterSpacing: '0.14em', fontFamily: MONO_FONT, fontWeight: 600,
                      }}>
                        {selectedBp.type === 'blueprint_book' ? `Blueprint · Book of ${selectedBp.blueprint_count ?? '?'}` : 'Blueprint'}
                      </span>
                    </div>
                    <h1 style={{
                      color: 'var(--th-tx)', fontSize: 22, fontWeight: 700,
                      fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.25, marginBottom: 10,
                    }}>
                      {selectedBp.name}
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 14, rowGap: 5, fontSize: 11, fontFamily: MONO_FONT }}>
                      <span style={{ color: 'var(--th-tx-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Designer</span>
                      <span style={{ color: 'var(--th-tx-sec)' }}>{selectedBp.author}</span>
                      <span style={{ color: 'var(--th-tx-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Published</span>
                      <span style={{ color: 'var(--th-tx-sec)' }}>{fmtDate(selectedBp.created_at)}</span>
                    </div>
                  </div>

                  {/* metric grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--th-br)', border: '1px solid var(--th-br)' }}>
                    <Metric label="Total Pieces" value={previewStats ? previewStats.entityCount.toLocaleString() : '—'} />
                    <Metric label="Dimensions" value={previewStats ? `${previewStats.tilesW} × ${previewStats.tilesH}` : '—'} />
                    <Metric label="Copies" value={selectedBp.downloads.toLocaleString()} />
                    <Metric label="Upvotes" value={selectedBp.upvotes.toLocaleString()} />
                  </div>

                  {/* produces */}
                  {selectedBp.item_ids.length > 0 && (
                    <div>
                      <FieldLabel>Produces</FieldLabel>
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
                    </div>
                  )}

                  {/* book contents */}
                  {selectedBp.type === 'blueprint_book' && bookContents && bookContents.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <FieldLabel>Book Contents</FieldLabel>
                        <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: MONO_FONT, textTransform: 'uppercase' }}>
                          {bookContents.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--th-br)' }}>
                        {bookContents.map(entry => {
                          const isActive = entry.index === selectedBookIndex && (forceCanvas || !selectedBp.image_url || imageFailed)
                          return (
                            <div
                              key={entry.index}
                              onClick={() => { setSelectedBookIndex(entry.index); setForceCanvas(true) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', cursor: 'pointer',
                                background: isActive ? 'rgba(255,159,28,0.1)' : 'var(--th-bg-well)',
                                borderLeft: `2px solid ${isActive ? '#FF9F1C' : 'transparent'}`,
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--th-bg-hover)' }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--th-bg-well)' }}
                            >
                              <span style={{ color: isActive ? '#FF9F1C' : 'var(--th-tx-faint)', fontFamily: MONO_FONT, fontSize: 9, minWidth: 16, textAlign: 'right', flexShrink: 0 }}>
                                {entry.index + 1}
                              </span>
                              <span style={{ flex: 1, fontSize: 11, color: isActive ? 'var(--th-tx)' : 'var(--th-tx-sec)', fontFamily: "'Titillium Web', sans-serif", fontWeight: isActive ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {entry.label}
                              </span>
                              {selectedBp.string_url && (
                                <a
                                  href={`https://fbe.teoxoy.com/?source=${selectedBp.string_url}&index=${entry.index}`}
                                  target="_blank" rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: MONO_FONT, textDecoration: 'none', flexShrink: 0 }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--th-tx-sec)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-tx-faint)')}
                                >
                                  FBE ↗
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* classifiers */}
                  {selectedBp.tags.length > 0 && (
                    <div>
                      <FieldLabel>Classifiers</FieldLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {selectedBp.tags.map(tag => (
                          <span
                            key={tag}
                            onClick={() => { setTagFilters(prev => { const s = new Set(prev); s.add(tag); return s }); goToBrowse() }}
                            style={{
                              background: 'var(--th-bg-well)', border: '1px solid var(--th-br)',
                              borderRadius: 1, padding: '3px 8px', cursor: 'pointer',
                              color: 'var(--th-tx-vmut)', fontSize: 9, textTransform: 'uppercase',
                              letterSpacing: '0.03em', fontFamily: MONO_FONT,
                              transition: 'color 0.12s, border-color 0.12s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a855f744'; (e.currentTarget as HTMLElement).style.color = '#a855f7' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--th-br)'; (e.currentTarget as HTMLElement).style.color = 'var(--th-tx-vmut)' }}
                          >{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* engineering notes */}
                  {selectedBp.description && (
                    <div>
                      <FieldLabel>Engineering Notes</FieldLabel>
                      <p style={{
                        color: 'var(--th-tx-sec)', fontSize: 12, lineHeight: 1.7, fontFamily: MONO_FONT,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                      }}>
                        {selectedBp.description}
                      </p>
                    </div>
                  )}

                  {/* source attribution */}
                  {selectedBp.source_url && selectedBp.author === 'factorioprints' && (
                    <div style={{
                      background: 'rgba(96,165,250,0.05)',
                      border: '1px solid rgba(96,165,250,0.18)',
                      borderRadius: 2, padding: '10px 13px',
                      fontSize: 11, fontFamily: MONO_FONT, color: 'var(--th-tx-vmut)',
                      lineHeight: 1.6,
                    }}>
                      This blueprint was originally shared on{' '}
                      <a
                        href={selectedBp.source_url} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >factorioprints.com ↗</a>
                      {' '}— visit the original post to see the author and full details.
                    </div>
                  )}
                </div>
              </div>

              {/* ── comments ── */}
              <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--th-br-hdr)', maxWidth: 720 }}>
                <div style={{
                  color: 'var(--th-tx-vmut)', fontSize: 9, textTransform: 'uppercase',
                  letterSpacing: '0.12em', fontFamily: "'Titillium Web', sans-serif",
                  fontWeight: 700, marginBottom: 12,
                }}>
                  Comments {comments.length > 0 && `· ${comments.length}`}
                </div>

                {commentsLoading && (
                  <div style={{ color: 'var(--th-tx-vmut)', fontSize: 10, fontFamily: MONO_FONT, marginBottom: 10 }}>Loading…</div>
                )}

                {!commentsLoading && comments.length === 0 && (
                  <div style={{ color: 'var(--th-tx-faint)', fontSize: 10, fontFamily: MONO_FONT, marginBottom: 12 }}>
                    No comments yet — share an improvement idea!
                  </div>
                )}

                {comments.map(c => (
                  <div key={c.id} style={{
                    padding: '10px 12px', marginBottom: 6,
                    borderLeft: '2px solid var(--th-br-lt)', background: 'var(--th-bg-hdr)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: 'var(--th-tx-sec)', fontSize: 11, fontWeight: 700, fontFamily: "'Titillium Web', sans-serif" }}>
                        {c.author}
                      </span>
                      <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: MONO_FONT }}>
                        {fmtDate(c.created_at)}
                      </span>
                    </div>
                    <div style={{ color: 'var(--th-tx-sec)', fontSize: 11, fontFamily: MONO_FONT, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
                      fontFamily: MONO_FONT, resize: 'vertical', marginBottom: 6,
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#FF9F1C66')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--th-br)')}
                  />
                  {commentError && (
                    <div style={{ color: '#ef4444', fontSize: 10, marginBottom: 6, fontFamily: MONO_FONT }}>{commentError}</div>
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

const BrowseCard = memo(function BrowseCard({ bp, isCopied, isVoted, openDetail, onCopy, onUpvote, onTagClick }: {
  bp: Blueprint
  isCopied: boolean
  isVoted: boolean
  openDetail: (bp: Blueprint) => void
  onCopy: (bp: Blueprint) => void
  onUpvote: (e: React.MouseEvent, bp: Blueprint) => void
  onTagClick: (tag: string) => void
}) {
  return (
    <div
      onClick={() => openDetail(bp)}
      style={{
        background: 'var(--th-bg-surf)', border: '1px solid var(--th-br-sep)',
        borderRadius: 2, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        willChange: 'transform',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,159,28,0.3)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--th-br-sep)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.985)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
    >
      {/* ── preview hero ── */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden', background: 'var(--th-bg-deep)', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
          <TypeBadge bp={bp} />
        </div>
        {bp.source_url && (
          <a
            href={bp.source_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 2,
              background: 'rgba(12,12,18,0.82)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2, padding: '2px 6px',
              color: '#60a5fa', fontSize: 9, fontFamily: 'monospace', textDecoration: 'none',
              backdropFilter: 'blur(6px)',
            }}
          >
            ↗
          </a>
        )}
        {bp.image_url ? (
          <img
            src={bp.image_url} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'radial-gradient(circle, var(--th-dot) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}>
            <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>no image</span>
          </div>
        )}
      </div>

      {/* ── card body ── */}
      <div style={{ padding: '11px 13px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* title */}
        <div style={{
          color: 'var(--th-tx)', fontSize: 13, fontWeight: 700,
          fontFamily: "'Titillium Web', sans-serif", lineHeight: 1.35,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {bp.name}
        </div>

        {/* tags */}
        {bp.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {bp.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                onClick={e => { e.stopPropagation(); onTagClick(tag) }}
                style={{
                  background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.22)',
                  borderRadius: 2, padding: '2px 7px', cursor: 'pointer',
                  color: 'var(--th-tx-sec)', fontSize: 9,
                  fontFamily: "'Titillium Web', sans-serif",
                  transition: 'color 0.12s, border-color 0.12s, background 0.12s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = '#a855f755'
                  el.style.color = '#a855f7'
                  el.style.background = 'rgba(168,85,247,0.12)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(168,85,247,0.22)'
                  el.style.color = 'var(--th-tx-sec)'
                  el.style.background = 'rgba(168,85,247,0.07)'
                }}
              >{tag}</span>
            ))}
            {bp.tags.length > 2 && (
              <span style={{ color: 'var(--th-tx-faint)', fontSize: 9, fontFamily: 'monospace', alignSelf: 'center' }}>
                +{bp.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── card footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 13px 9px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.18)',
      }}>
        <button
          onClick={e => onUpvote(e, bp)}
          title={isVoted ? 'Already upvoted' : 'Upvote'}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            background: 'none', border: 'none',
            cursor: isVoted ? 'default' : 'pointer',
            color: isVoted ? '#22c55e' : 'var(--th-tx-sec)',
            fontSize: 11, padding: '2px 0',
            fontFamily: 'monospace',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => { if (!isVoted) e.currentTarget.style.color = '#22c55e' }}
          onMouseLeave={e => { if (!isVoted) e.currentTarget.style.color = 'var(--th-tx-sec)' }}
        >
          ▲ {bp.upvotes}
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={e => { e.stopPropagation(); onCopy(bp) }}
          style={{
            padding: '4px 11px', flexShrink: 0,
            background: isCopied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isCopied ? '#22c55e33' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 2, cursor: 'pointer',
            color: isCopied ? '#22c55e' : 'var(--th-tx-sec)',
            fontSize: 10, fontFamily: "'Titillium Web', sans-serif", fontWeight: 600,
            letterSpacing: '0.04em', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!isCopied) { e.currentTarget.style.color = 'var(--th-tx)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' } }}
          onMouseLeave={e => { if (!isCopied) { e.currentTarget.style.color = 'var(--th-tx-sec)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
        >
          {isCopied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>
    </div>
  )
})
