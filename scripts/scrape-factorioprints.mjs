/**
 * Scrape blueprints from factorioprints.com via the public Firebase REST API.
 *
 * Usage:
 *   node --env-file=.env scripts/scrape-factorioprints.mjs [--limit N]
 *
 * .env must contain:
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_KEY=your-anon-or-service-role-key
 *
 * --limit N   Stop after importing N blueprints (default: no limit)
 */

import { createClient } from '@supabase/supabase-js'
import { inflateSync } from 'zlib'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? process.env.VITE_SUPABASE_KEY
const FIREBASE = 'https://facorio-blueprints.firebaseio.com'
const BATCH_SIZE = 100
const BATCH_DELAY_MS = 500
const INSERT_DELAY_MS = 80

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.')
  process.exit(1)
}

const args = process.argv.slice(2)
const limitIdx = args.indexOf('--limit')
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'factorio' } })

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function trunc(val, max) {
  if (!val) return null
  const s = String(val).trim()
  if (!s) return null
  return s.length <= max ? s : s.slice(0, max - 1) + '…'
}

function extractTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean)
  if (typeof tags === 'object') return Object.values(tags).map(String).filter(Boolean)
  return []
}

function parseBlueprint(str) {
  try {
    const buf = Buffer.from(str.slice(1), 'base64')
    let json
    try { json = JSON.parse(inflateSync(buf).toString('utf8')) }
    catch { json = JSON.parse(inflateSync(buf, { windowBits: -15 }).toString('utf8')) }
    const itemIds = new Set()
    function walk(obj) {
      for (const e of obj?.blueprint?.entities ?? []) {
        if (e.recipe) itemIds.add(e.recipe)
      }
      for (const b of obj?.blueprint_book?.blueprints ?? []) walk(b)
    }
    walk(json)
    if (json.blueprint_book) {
      return { type: 'blueprint_book', blueprint_count: json.blueprint_book.blueprints?.length ?? null, item_ids: [...itemIds] }
    }
    return { type: 'blueprint', blueprint_count: null, item_ids: [...itemIds] }
  } catch { return null }
}

async function fetchPage(cursor) {
  const fetchSize = cursor ? BATCH_SIZE + 1 : BATCH_SIZE
  let url = `${FIREBASE}/blueprints.json?orderBy=%22%24key%22&limitToFirst=${fetchSize}&print=pretty`
  if (cursor) url += `&startAt=%22${encodeURIComponent(cursor)}%22`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`)
  const data = await res.json()
  if (!data || typeof data !== 'object') return []
  let entries = Object.entries(data)
  if (cursor && entries.length > 0) entries = entries.slice(1) // cursor key already processed
  return entries
}

let totalOk = 0
let totalFail = 0
let totalSkip = 0
let cursor = null
let page = 0

console.log(`Scraping factorioprints.com — limit: ${LIMIT === Infinity ? 'none' : LIMIT}\n`)

outer: while (true) {
  page++
  let entries
  try {
    entries = await fetchPage(cursor)
  } catch (e) {
    console.error(`\nFailed to fetch page ${page}: ${e.message}`)
    break
  }
  if (entries.length === 0) break

  console.log(`Page ${page} — ${entries.length} entries`)

  for (const [id, bp] of entries) {
    const bpStr = bp.blueprintString?.trim()
    if (!bpStr) { totalSkip++; continue }

    const name = trunc(bp.title, 80)
    if (!name || name.length < 3) { totalSkip++; continue }

    const parsed = parseBlueprint(bpStr)
    if (!parsed) { totalSkip++; continue }

    const row = {
      name,
      description: trunc(bp.descriptionMarkdown, 300),
      author: 'factorioprints',
      blueprint_string: bpStr,
      item_ids: parsed.item_ids,
      type: parsed.type,
      blueprint_count: parsed.blueprint_count,
      source_url: `https://www.factorioprints.com/view/${id}`,
      image_url: bp.imageUrl ?? null,
      tags: extractTags(bp.tags),
    }

    process.stdout.write(`  ${name.slice(0, 48).padEnd(48)} … `)
    const { error } = await supabase.from('blueprints').insert(row)

    if (error) {
      if (error.code === '23505') {
        console.log('skip (already imported)')
        totalSkip++
      } else {
        console.log(`✗  ${error.message}`)
        totalFail++
      }
    } else {
      console.log('✓')
      totalOk++
    }

    if (totalOk >= LIMIT) break outer

    await sleep(INSERT_DELAY_MS)
  }

  if (entries.length < BATCH_SIZE) break // last page
  cursor = entries[entries.length - 1][0]
  console.log(`  [${totalOk} imported so far]\n`)
  await sleep(BATCH_DELAY_MS)
}

console.log(`\nDone. ${totalOk} imported, ${totalFail} failed, ${totalSkip} skipped.`)
